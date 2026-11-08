import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, LoaderCircle, MessageCircle, Send, X } from "lucide-react";
import { apiUrl } from "../lib/api";

type ChatMessage = { role: "user" | "assistant"; content: string };

const welcome: ChatMessage = { role: "assistant", content: "各位同学们假期好呀，我是你们的 AI 读后续写智能伴学。有任何关于情节理解和写作构思的问题都可以来问我～" };

export default function CozeWebChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([welcome]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [messages, loading]);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const content = input.trim();
    if (!content || loading) return;
    const nextMessages = [...messages, { role: "user" as const, content }];
    setMessages(nextMessages); setInput(""); setError(""); setLoading(true);
    try {
      const response = await fetch(apiUrl("/api/coze/chat"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: nextMessages.slice(-10) }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || typeof data.answer !== "string") throw new Error(data.error || "智能体暂时无法回答，请稍后重试。");
      setMessages(current => [...current, { role: "assistant", content: data.answer }]);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "智能体暂时无法回答，请稍后重试。"); }
    finally { setLoading(false); }
  };
  return <div className="story-chat">{open && <section className="story-chat__panel" aria-label="读后续写分析专家"><header><div><Bot/><strong>读后续写分析专家</strong></div><button onClick={() => setOpen(false)} aria-label="关闭智能体"><X/></button></header><div className="story-chat__messages"><div className="story-chat__intro"><Bot/><h3>读后续写语篇分析专家</h3><p>围绕情节理解、人物动机和写作构思与你一起思考。</p></div>{messages.map((message, index) => <p className={`story-chat__message story-chat__message--${message.role}`} key={`${message.role}-${index}`}>{message.content}</p>)}{loading && <p className="story-chat__thinking"><LoaderCircle/> 正在思考…</p>}{error && <p className="story-chat__error">{error}</p>}<div ref={endRef}/></div><form onSubmit={submit}><textarea value={input} onChange={event => setInput(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} placeholder="输入你的问题……" rows={2}/><button disabled={!input.trim() || loading} aria-label="发送"><Send/></button></form><small>AI 生成内容仅供学习参考，请保留自己的判断。</small></section>}<button className="story-chat__launcher" onClick={() => setOpen(value => !value)} aria-label="打开读后续写分析专家">{open ? <X/> : <MessageCircle/>}</button></div>;
}
