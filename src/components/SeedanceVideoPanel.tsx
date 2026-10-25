import { LoaderCircle, Play, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const POLL_INTERVAL = 4000;

export default function SeedanceVideoPanel({ defaultPrompt = "A cinematic storybook continuation with expressive characters, warm natural light, smooth camera movement" }: { defaultPrompt?: string }) {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [taskId, setTaskId] = useState("");
  const [status, setStatus] = useState("idle");
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!taskId || !["queued", "running"].includes(status)) return;
    const timer = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/video/status/${encodeURIComponent(taskId)}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "查询视频状态失败。");
        setStatus(data.status || "running");
        if (data.video_url) { setVideoUrl(data.video_url); setStatus("succeeded"); }
        if (["failed", "cancelled"].includes(data.status)) setError("视频生成失败，请修改提示词后重试。");
      } catch (cause) { setStatus("failed"); setError(cause instanceof Error ? cause.message : "查询任务失败。"); }
    }, POLL_INTERVAL);
    return () => window.clearInterval(timer);
  }, [taskId, status]);

  const generate = async () => {
    setError(""); setVideoUrl(""); setStatus("submitting");
    try {
      const response = await fetch("/api/video/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "创建视频任务失败。");
      setTaskId(data.task_id); setStatus("queued");
    } catch (cause) { setStatus("failed"); setError(cause instanceof Error ? cause.message : "创建视频任务失败。"); }
  };

  return <section className="seedance-panel"><header><div><span>SEEDANCE 2.5 · VIDEO GENERATION</span><h3>把续写变成一段故事视频</h3><p>服务端安全调用火山方舟，浏览器只接收任务状态和视频结果。</p></div><Sparkles/></header><label><span>视频提示词</span><textarea value={prompt} onChange={event => setPrompt(event.target.value)} placeholder="描述人物、动作、场景、镜头和氛围…" /></label><button className="seedance-generate" onClick={generate} disabled={!prompt.trim() || ["submitting", "queued", "running"].includes(status)}>{["submitting", "queued", "running"].includes(status) ? <LoaderCircle className="seedance-spin"/> : <Play size={17}/>} {status === "queued" || status === "running" ? "正在生成…" : "生成 Seedance 视频"}</button>{status !== "idle" && <p className={`seedance-status seedance-status--${status}`}>{status === "submitting" ? "正在提交任务…" : status === "queued" ? `任务已创建（${taskId}），等待生成…` : status === "running" ? "视频生成中，请稍候…" : status === "succeeded" ? "视频生成成功" : "生成失败"}</p>}{error && <p className="seedance-error">{error}</p>}{videoUrl && <video className="seedance-video" src={videoUrl} controls playsInline />}</section>;
}
