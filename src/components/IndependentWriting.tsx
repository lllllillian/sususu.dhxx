import { ArrowRight, Camera, Check, Film, ImageUp, LoaderCircle, LockKeyhole, Save, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { StudentDraft } from "../types/writing";
import StudentSelfAssessment from "./StudentSelfAssessment";
import AIWritingFeedback from "./AIWritingFeedback";
import StoryAnimationStudio from "./StoryAnimationStudio";
import WordCounter, { countWords } from "./WordCounter";
import { apiUrl } from "../lib/api";

type StorySummary = { id: number; version: number; title: string; label: string; image: string; accent: string };

export default function IndependentWriting({ story, writingOpenings, onDraftChange, onGoToGallery }: { story: StorySummary; writingOpenings?: [string, string]; onDraftChange?: (draft: StudentDraft) => void; onGoToGallery: () => void }) {
  const empty: StudentDraft = { id: `draft-v${story.version}-${story.id}`, storyId: story.id, content: "", wordCount: 0, selectedClues: [], selectedDecision: "", status: "draft", updatedAt: new Date().toISOString(), selfAssessment: { connection: false, description: false, ending: false } };
  const [draft, setDraft] = useLocalStorage<StudentDraft>(`storyforge-draft-v${story.version}-${story.id}`, empty);
  const [message, setMessage] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [photo, setPhoto] = useState("");
  const [recognizedText, setRecognizedText] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState("");
  const cameraInput = useRef<HTMLInputElement>(null);
  const uploadInput = useRef<HTMLInputElement>(null);
  useEffect(() => { onDraftChange?.(draft); }, [draft, onDraftChange]);
  const update = (content: string) => setDraft({ ...draft, content, wordCount: countWords(content), status: "draft", updatedAt: new Date().toISOString() });
  const submit = () => { const wordCount = countWords(draft.content); if (wordCount < 120) return setMessage("Write at least 120 English words before submitting."); if (!Object.values(draft.selfAssessment).every(Boolean)) return setMessage("Complete your student self-assessment first."); setDraft({ ...draft, wordCount, status: "submitted", submittedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }); setMessage("Your continuation has been submitted successfully."); };
  const preparePhoto = async (file?: File) => {
    if (!file) return;
    setOcrError(""); setRecognizedText("");
    try {
      const source = await createImageBitmap(file);
      const scale = Math.min(1, 1800 / Math.max(source.width, source.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(source.width * scale); canvas.height = Math.round(source.height * scale);
      canvas.getContext("2d")?.drawImage(source, 0, 0, canvas.width, canvas.height);
      setPhoto(canvas.toDataURL("image/jpeg", .86)); source.close();
    } catch { setOcrError("无法读取这张图片，请改用 JPG 或 PNG 格式。"); }
  };
  const recognizePhoto = async () => {
    if (!photo) return;
    setOcrLoading(true); setOcrError("");
    try {
      const response = await fetch(apiUrl("/api/writing/ocr"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: photo }) });
      const data = await response.json() as { text?: string; error?: string };
      if (!response.ok || !data.text) throw new Error(data.error || "识别失败，请稍后重试。");
      setRecognizedText(data.text);
    } catch (error) { setOcrError(error instanceof Error ? error.message : "识别失败，请稍后重试。"); }
    finally { setOcrLoading(false); }
  };
  const closePhotoImport = () => { setPhoto(""); setRecognizedText(""); setOcrError(""); setOcrLoading(false); };
  const importText = (mode: "replace" | "append") => { update(mode === "append" && draft.content.trim() ? `${draft.content.trim()}\n\n${recognizedText.trim()}` : recognizedText.trim()); setMessage("照片文字已导入，请检查识别结果后再提交。"); closePhotoImport(); };
  return <div className="independent-writing">
    <header><span>INDEPENDENT WRITING · 自主续写</span><h3>Continue the story in your own voice</h3><p>直接输入，或拍照识别纸上的英文作文。建议约 150 词。</p></header>
    {writingOpenings && <div className="required-openings"><span>REQUIRED PARAGRAPH OPENINGS · 指定段首句</span><p><b>Paragraph 1</b>{writingOpenings[0]}</p><p><b>Paragraph 2</b>{writingOpenings[1]}</p></div>}
    <div className="photo-writing-tools"><div><Camera/><span><strong>纸笔写好了？</strong><small>拍照识别后仍可手动校对</small></span></div><div><button onClick={()=>cameraInput.current?.click()}><Camera/> 拍照识别</button><button onClick={()=>uploadInput.current?.click()}><ImageUp/> 上传图片</button></div><input ref={cameraInput} type="file" accept="image/*" capture="environment" onChange={event=>{preparePhoto(event.target.files?.[0]);event.currentTarget.value=""}}/><input ref={uploadInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={event=>{preparePhoto(event.target.files?.[0]);event.currentTarget.value=""}}/></div>
    <WordCounter value={draft.content}/><textarea value={draft.content} onChange={event => update(event.target.value)} placeholder="Write your English continuation here..."/><div className="writing-evidence"><span>Autosaved</span></div><StudentSelfAssessment value={draft.selfAssessment} onChange={selfAssessment => setDraft({ ...draft, selfAssessment })}/>{message && <p className={draft.status === "submitted" ? "submit-success" : "form-error"}>{message}</p>}<div className="writing-actions"><button onClick={() => { setDraft({ ...draft, updatedAt: new Date().toISOString() }); setMessage("Draft saved."); }}><Save/> Save draft</button><button className="submit-writing" onClick={submit}><Check/> Submit writing</button>{draft.status === "submitted" && <><button className="generate-feedback" onClick={() => setShowFeedback(true)}><Sparkles/> Generate AI feedback</button><button className="go-gallery-review" onClick={onGoToGallery}>进入展廊并检查 <ArrowRight/></button></>}</div>{showFeedback && draft.status === "submitted" && <AIWritingFeedback draft={draft} onClose={() => setShowFeedback(false)}/>} {draft.status === "submitted" ? <StoryAnimationStudio draft={draft} storyTitle={story.title} coverImage={story.image}/> : <section className="animation-locked"><div className="animation-locked__icon"><Film/><LockKeyhole/></div><div><span>STORY ANIMATION · 写后奖励</span><h3>Submit to unlock your animated story</h3><p>完成自评并正式提交后，可以把你的英文续写拆成场景、编辑画面提示词并播放故事动画。</p></div></section>}
    {photo&&<div className="photo-ocr-backdrop"><section className="photo-ocr-dialog"><header><div><span>PHOTO TO TEXT · 作文识别</span><h3>{recognizedText?"校对识别结果":"确认照片清晰度"}</h3></div><button onClick={closePhotoImport} aria-label="关闭"><X/></button></header><div className="photo-ocr-content"><img src={photo} alt="待识别的作文照片"/>{recognizedText?<textarea value={recognizedText} onChange={event=>setRecognizedText(event.target.value)} aria-label="识别出的作文内容"/>:<div className="photo-ocr-guide"><strong>拍照小提示</strong><p>保持纸张平整、光线均匀，尽量只拍作文区域，避免阴影和反光。</p>{ocrError&&<p className="form-error">{ocrError}</p>}<button className="dark-button" disabled={ocrLoading} onClick={recognizePhoto}>{ocrLoading?<><LoaderCircle className="ocr-spinner"/>正在识别…</>:<><Sparkles/>开始识别文字</>}</button></div>}</div>{recognizedText&&<footer><span>请先检查拼写、标点和段落，再导入正文。</span><div><button onClick={()=>importText("append")}>追加到正文</button><button className="dark-button" onClick={()=>importText("replace")}>替换正文</button></div></footer>}</section></div>}
  </div>;
}
