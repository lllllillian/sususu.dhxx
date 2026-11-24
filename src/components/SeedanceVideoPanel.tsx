import { Clapperboard, LoaderCircle, Play, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { apiUrl } from "../lib/api";
import "./SeedanceVideoPanel.css";

const POLL_INTERVAL = 4000;

function sentencesOf(source: string) {
  return source.replace(/\s+/g, " ").trim().match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map(item => item.trim()).filter(Boolean) || [];
}

function splitEvenly<T>(items: T[], count: number) {
  return Array.from({ length: count }, (_, index) => items.slice(Math.floor(index * items.length / count), Math.floor((index + 1) * items.length / count)));
}

function buildStoryboard(source: string) {
  const sentences = sentencesOf(source);
  if (sentences.length < 2) return source.trim();
  const scenes = splitEvenly(sentences, Math.min(4, sentences.length));
  return ["Create a coherent cinematic story with the same characters, clothing and setting throughout.", ...scenes.map((scene, index) => `Scene ${index + 1}: ${scene.join(" ")}`), "Use clear actions, emotional facial expressions, smooth transitions, warm storybook lighting, natural camera movement, no subtitles and no on-screen text."].join("\n");
}

function buildClipPrompts(source: string, count: number) {
  if (count === 1) return [source];
  const clean = source.replace(/^Create a coherent cinematic story.*$/gim, "").replace(/^Use clear actions.*$/gim, "");
  const groups = splitEvenly(sentencesOf(clean), count);
  return groups.map((group, index) => [`Part ${index + 1} of ${count} in one continuous story. Keep exactly the same characters, ages, faces, clothing, props, location, visual style and lighting as the other parts.`, group.join(" "), index === 0 ? "Establish the characters and begin the action." : index === count - 1 ? "Continue naturally from the previous part and complete the emotional ending." : "Continue naturally from the previous part and end on an action that leads into the next part.", "Cinematic storybook style, expressive actions and faces, smooth camera movement, no subtitles, no on-screen text."].join("\n"));
}

export default function SeedanceVideoPanel({ defaultPrompt = "A cinematic storybook continuation with expressive characters, warm natural light, smooth camera movement" }: { defaultPrompt?: string }) {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [totalDuration, setTotalDuration] = useState(30);
  const [taskIds, setTaskIds] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [currentClip, setCurrentClip] = useState(0);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!taskIds.length || status !== "running") return;
    const timer = window.setInterval(async () => {
      try {
        const results = await Promise.all(taskIds.map(async taskId => {
          const response = await fetch(apiUrl(`/api/video/status/${encodeURIComponent(taskId)}`));
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || "查询视频状态失败。");
          return data;
        }));
        const nextStatuses = results.map(item => item.video_url ? "succeeded" : item.status || "running");
        setStatuses(nextStatuses);
        setVideoUrls(results.map(item => item.video_url || ""));
        const failed = results.find(item => ["failed", "cancelled"].includes(item.status));
        if (failed) { setStatus("failed"); setError(failed.error || "有一个分镜生成失败，请重新生成。"); }
        else if (results.every(item => item.video_url)) { setStatus("succeeded"); setCurrentClip(0); }
      } catch (cause) { setStatus("failed"); setError(cause instanceof Error ? cause.message : "查询任务失败。"); }
    }, POLL_INTERVAL);
    return () => window.clearInterval(timer);
  }, [taskIds, status]);

  useEffect(() => {
    if (status === "succeeded" && videoUrls[currentClip]) videoRef.current?.play().catch(() => undefined);
  }, [currentClip, status, videoUrls]);

  const generate = async () => {
    setError(""); setVideoUrls([]); setTaskIds([]); setStatuses([]); setCurrentClip(0); setStatus("submitting");
    try {
      const clipPrompts = buildClipPrompts(prompt, totalDuration / 10);
      const created = await Promise.all(clipPrompts.map(async clipPrompt => {
        const response = await fetch(apiUrl("/api/video/generate"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: clipPrompt, duration: 10 }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "创建视频任务失败。");
        return data.task_id as string;
      }));
      setTaskIds(created); setStatuses(created.map(() => "queued")); setStatus("running");
    } catch (cause) { setStatus("failed"); setError(cause instanceof Error ? cause.message : "创建视频任务失败。"); }
  };

  const busy = ["submitting", "running"].includes(status);
  const readyCount = statuses.filter(item => item === "succeeded").length;
  const onClipEnded = () => { if (currentClip < videoUrls.length - 1) setCurrentClip(value => value + 1); };

  return <section className="seedance-panel"><header><div><span>SEEDANCE 2.5 · VIDEO GENERATION</span><h3>把续写变成一段故事视频</h3><p>AI把续写拆成连续分镜，并按顺序自动播放为完整故事。</p></div><Sparkles/></header><label><span>故事与分镜提示词</span><textarea value={prompt} onChange={event => setPrompt(event.target.value)} placeholder="描述人物、动作、场景、镜头和氛围…" /></label><div className="seedance-controls"><button type="button" className="seedance-storyboard" onClick={() => setPrompt(buildStoryboard(prompt))} disabled={!prompt.trim() || busy}><Clapperboard size={17}/>整理故事分镜</button><fieldset><legend>故事总时长</legend>{[10,30].map(seconds => <button type="button" key={seconds} className={totalDuration === seconds ? "active" : ""} onClick={() => setTotalDuration(seconds)} disabled={busy}>{seconds}秒</button>)}</fieldset></div>{totalDuration === 30 && <p className="seedance-cost-note">30秒模式将生成3个连续的10秒分镜，会消耗3次视频生成额度。</p>}<button className="seedance-generate" onClick={generate} disabled={!prompt.trim() || busy}>{busy ? <LoaderCircle className="seedance-spin"/> : <Play size={17}/>} {status === "running" ? `正在生成分镜 ${readyCount}/${taskIds.length}…` : `生成 ${totalDuration} 秒故事视频`}</button>{status !== "idle" && <p className={`seedance-status seedance-status--${status}`}>{status === "submitting" ? "正在提交分镜任务…" : status === "running" ? `${taskIds.length}个分镜正在并行生成，已完成${readyCount}个…` : status === "succeeded" ? `故事视频已完成，共${videoUrls.length}段，连续播放约${totalDuration}秒。` : "生成失败"}</p>}{error && <p className="seedance-error">{error}</p>}{status === "succeeded" && videoUrls[currentClip] && <div className="seedance-player"><div><strong>连续故事播放</strong><span>分镜 {currentClip + 1} / {videoUrls.length}</span></div><video ref={videoRef} className="seedance-video" key={videoUrls[currentClip]} src={videoUrls[currentClip]} controls playsInline onEnded={onClipEnded}/><nav>{videoUrls.map((_, index) => <button key={index} className={currentClip === index ? "active" : ""} onClick={() => setCurrentClip(index)}>分镜 {index + 1}</button>)}</nav></div>}</section>;
}
