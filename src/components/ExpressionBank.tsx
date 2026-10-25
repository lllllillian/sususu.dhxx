import { Bookmark, Check, ChevronDown, ChevronUp, LoaderCircle, Search, Send, Sparkles, Upload, X } from "lucide-react";
import { useMemo, useState } from "react";
import { corpusEntries } from "../data/corpusEntries";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { CorpusCategory, CorpusEntry } from "../types/corpus";
import type { StudentDraft } from "../types/writing";

const categories: ["all" | CorpusCategory, string][] = [["all", "All"], ["word", "Words · 单词"], ["phrase", "Phrases · 短语"], ["sentence", "Sentences · 句子"]];

type ExtractedExpression = { category: CorpusCategory; expression: string; translationZh: string; example: string };

export default function ExpressionBank({ onClose, draft }: { onClose: () => void; draft: StudentDraft | null }) {
  const [category, setCategory] = useState<"all" | CorpusCategory>("all");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useLocalStorage<string[]>("storyforge-saved-expressions", []);
  const [submissions, setSubmissions] = useLocalStorage<CorpusEntry[]>("storyforge-student-expression-submissions", []);
  const [formOpen, setFormOpen] = useState(false);
  const [extractOpen, setExtractOpen] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState<ExtractedExpression[]>([]);
  const [selectedExtracted, setSelectedExtracted] = useState<number[]>([]);
  const [form, setForm] = useState({ category: "word" as CorpusCategory, expression: "", translationZh: "", example: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const entries = useMemo(() => [...submissions, ...corpusEntries].filter(item => (category === "all" || item.category === category) && `${item.expression} ${item.translationZh} ${item.example}`.toLowerCase().includes(query.toLowerCase())), [category, query, submissions]);
  const submit = () => {
    setError(""); setMessage("");
    if (form.expression.trim().length < 2 || form.translationZh.trim().length < 1 || form.example.trim().length < 8) { setError("请完整填写英文表达、中文释义和英文例句，例句至少 8 个字符。"); return; }
    const entry: CorpusEntry = { id: `student-${Date.now()}`, category: form.category, expression: form.expression.trim(), translationZh: form.translationZh.trim(), example: form.example.trim(), source: "student-pending", saved: false };
    setSubmissions([entry, ...submissions]); setForm({ category: "word", expression: "", translationZh: "", example: "" }); setMessage("投稿成功，已进入待教师审核区。");
  };
  const extractFromDraft = async () => {
    if (!draft?.content.trim()) { setError("请先在“自主续写”中完成或导入作文，再使用 AI 提取。"); return; }
    setExtracting(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/writing/extract-expressions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: draft.content }) });
      const data = await response.json() as { expressions?: ExtractedExpression[]; error?: string };
      if (!response.ok || !data.expressions) throw new Error(data.error || "表达提取失败，请稍后重试。");
      setExtracted(data.expressions); setSelectedExtracted(data.expressions.map((_,index)=>index));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "表达提取失败，请稍后重试。"); }
    finally { setExtracting(false); }
  };
  const addExtracted = () => {
    const selected = extracted.filter((_,index)=>selectedExtracted.includes(index)).map((item,index):CorpusEntry=>({ id:`ai-${Date.now()}-${index}`, ...item, source:"student-pending", saved:false }));
    if (!selected.length) { setError("请至少选择一条表达。 "); return; }
    setSubmissions([...selected,...submissions]); setMessage(`已提交 ${selected.length} 条表达，进入教师审核区。`); setExtracted([]); setSelectedExtracted([]);
  };
  const sourceLabel = (source: CorpusEntry["source"]) => source === "teacher" ? "Teacher selected" : source === "approved-student-work" ? "Approved student work" : "Pending review · 待审核";
  return <div className="corpus-panel"><header><div><span>CLASS EXPRESSION BANK · {String(entries.length).padStart(2,"0")}</span><h2>班级语料库</h2><p>学生可以主动分享好表达，也可以从自己的续写中智能提取。</p></div><button onClick={onClose} aria-label="关闭"><X/></button></header><div className="corpus-entry-methods"><section className={`corpus-contribute ${formOpen ? "open" : ""}`}><button className="corpus-contribute__toggle" onClick={() => setFormOpen(value => !value)}><span><Upload/><b>学生自主投稿</b><small>分享阅读或学习中发现的好表达</small></span>{formOpen ? <ChevronUp/> : <ChevronDown/>}</button>{formOpen && <div className="corpus-contribute__form"><label><span>表达类型</span><select value={form.category} onChange={event => setForm({ ...form, category: event.target.value as CorpusCategory })}><option value="word">单词 Word</option><option value="phrase">短语 Phrase</option><option value="sentence">句子 Sentence</option></select></label><label><span>英文表达</span><input value={form.expression} onChange={event => setForm({ ...form, expression: event.target.value })} placeholder="例如：come to one's rescue"/></label><label><span>中文释义</span><input value={form.translationZh} onChange={event => setForm({ ...form, translationZh: event.target.value })} placeholder="例如：前来营救某人"/></label><label className="corpus-contribute__example"><span>英文例句</span><textarea value={form.example} onChange={event => setForm({ ...form, example: event.target.value })} placeholder="请写一个能体现该表达用法的完整英文句子。"/></label><div className="corpus-contribute__actions"><p>投稿后标记为“待审核”，教师通过后进入班级精选。</p><button onClick={submit}><Send/>提交表达</button></div></div>}</section><section className={`corpus-extract ${extractOpen?"open":""}`}><button className="corpus-extract__toggle" onClick={()=>setExtractOpen(value=>!value)}><span><Sparkles/><b>从我的续写提取</b><small>{draft?.content?`读取当前作文 · ${draft.wordCount} 词`:"完成自主续写后即可使用"}</small></span>{extractOpen?<ChevronUp/>:<ChevronDown/>}</button>{extractOpen&&<div className="corpus-extract__body">{!extracted.length?<div className="extract-empty"><p>AI 会寻找值得复用的动作、情感、环境和衔接表达，不会自动发布。</p><button disabled={extracting||!draft?.content} onClick={extractFromDraft}>{extracting?<><LoaderCircle className="ocr-spinner"/>正在阅读作文…</>:<><Sparkles/>开始提取好表达</>}</button></div>:<><div className="extracted-list">{extracted.map((item,index)=><label key={`${item.expression}-${index}`}><input type="checkbox" checked={selectedExtracted.includes(index)} onChange={()=>setSelectedExtracted(selectedExtracted.includes(index)?selectedExtracted.filter(value=>value!==index):[...selectedExtracted,index])}/><div><span>{item.category}</span><strong>{item.expression}</strong><p>{item.translationZh}</p><small>{item.example}</small></div></label>)}</div><button className="add-extracted" onClick={addExtracted}><Check/>将选中表达提交审核</button></>}</div>}</section></div>{error && <p className="form-error corpus-message">{error}</p>}{message && <p className="submit-success corpus-message">{message}</p>}<label className="corpus-search"><Search/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search English expressions..."/></label><div className="corpus-categories">{categories.map(([value, label]) => <button key={value} className={category === value ? "active" : ""} onClick={() => setCategory(value)}>{label}</button>)}</div>{entries.length ? <div className="corpus-list">{entries.map(item => <article key={item.id} className={item.source === "student-pending" ? "pending" : ""}><div><span>{item.category}</span><small>{sourceLabel(item.source)}</small></div><h3>{item.expression}</h3><p>{item.translationZh}</p><blockquote>{item.example}</blockquote><button className={saved.includes(item.id) ? "saved" : ""} onClick={() => setSaved(saved.includes(item.id) ? saved.filter(id => id !== item.id) : [...saved, item.id])}><Bookmark/>{saved.includes(item.id) ? "Saved" : "Save"}</button></article>)}</div> : <div className="empty-gallery"><h4>No expressions found.</h4><p>Try a different keyword or category.</p></div>}</div>;
}
