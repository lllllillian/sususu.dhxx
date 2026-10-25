import { ArrowRight, Check, LoaderCircle, RefreshCw, Sparkles } from "lucide-react";
import { useState } from "react";

export type LanguageReview = {
  summary_zh: string;
  issues: { type: string; original: string; suggestion: string; reason_zh: string }[];
  corrected_text: string;
};

export default function GalleryAIReview({ content, savedReview, onReviewed }: { content: string; savedReview: LanguageReview | null; onReviewed: (review: LanguageReview) => void }) {
  const [review, setReview] = useState<LanguageReview | null>(savedReview);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const runReview = async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/writing/language-review", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content }) });
      const data = await response.json() as LanguageReview & { error?: string };
      if (!response.ok) throw new Error(response.status === 404 ? "AI 检查服务尚未启动，请重新启动 StoryForge 后再试。" : data.error || "AI 检查失败，请稍后重试。");
      setReview(data);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "AI 检查失败，请稍后重试。"); }
    finally { setLoading(false); }
  };
  if (!review) return <section className="gallery-ai-gate"><div className="gallery-ai-gate__icon"><Sparkles/></div><div><span>AI LANGUAGE CHECK · 展示前检查</span><h4>先检查语言，再进入匿名展廊</h4><p>AI 将检查时态、语法、用词、拼写和标点，不改变你的情节与表达意图。检查结果仅作为修改建议。</p>{error&&<p className="form-error">{error}</p>}<button disabled={loading} onClick={runReview}>{loading?<><LoaderCircle className="ocr-spinner"/>正在检查作文…</>:<><Sparkles/>开始 AI 语言检查</>}</button></div></section>;
  return <section className="gallery-ai-review"><header><div><span>AI LANGUAGE CHECK · 修改建议</span><h4>{review.issues.length ? `发现 ${review.issues.length} 处值得检查的语言问题` : "没有发现明显语言错误"}</h4><p>{review.summary_zh}</p></div><button onClick={runReview} disabled={loading}><RefreshCw/>重新检查</button></header>{review.issues.length>0&&<div className="language-issues">{review.issues.map((issue,index)=><article key={`${issue.original}-${index}`}><b>{issue.type}</b><div><del>{issue.original}</del><ArrowRight/><ins>{issue.suggestion}</ins></div><p>{issue.reason_zh}</p></article>)}</div>}<div className="corrected-preview"><span>AI 建议修订稿</span><p>{review.corrected_text}</p></div><div className="review-confirm"><p>AI 也可能判断有误，请核对后选择用于匿名展示的版本。</p><div><button onClick={()=>onReviewed({...review,corrected_text:content})}>保留我的原稿</button><button className="use-correction" onClick={()=>onReviewed(review)}><Check/>采用修订稿并进入展廊</button></div></div></section>;
}
