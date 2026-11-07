import { LoaderCircle, RefreshCw, Sparkles } from "lucide-react";
import { useState } from "react";
import { apiUrl } from "../lib/api";

export default function CozeReadingAnalysis({ title, paragraphs }: { title: string; paragraphs: string[] }) {
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyze = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(apiUrl("/api/reading/analyze"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content: paragraphs.join("\n\n") }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "语篇分析失败，请稍后重试。");
      setAnalysis(data.analysis || "智能体暂未返回分析结果。");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "语篇分析失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  };

  return <section className="coze-reading-analysis">
    <header><div><span>COZE AGENT · AI 语篇分析</span><h3>读后续写语篇分析专家</h3><p>先独立阅读，再用智能体的判断标准核对人物、冲突、线索与续写方向。</p></div><Sparkles/></header>
    {!analysis && <button onClick={analyze} disabled={loading}>{loading ? <><LoaderCircle className="coze-spinner"/>智能体正在分析语篇…</> : <><Sparkles/>调用 Coze 智能体分析</>}</button>}
    {error && <p className="coze-analysis-error">{error}</p>}
    {analysis && <div className="coze-analysis-result"><div><strong>分析结果</strong><button onClick={analyze} disabled={loading}><RefreshCw/>重新分析</button></div><p>{analysis}</p></div>}
    <small>AI 结果用于辅助思考；学生仍需回到原文证据作出判断。</small>
  </section>;
}
