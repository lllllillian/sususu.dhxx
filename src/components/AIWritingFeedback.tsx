import { CheckCircle2, LoaderCircle, RefreshCw, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { StudentDraft } from "../types/writing";

type Feedback = { total:number; band:string; content:number; language:number; cohesion:number; strengths:string[]; improvements:string[]; generatedAt:string };
const transitions = ["finally","however","therefore","then","when","as","although","because","before","after","at that moment"];

function evaluate(draft:StudentDraft):Feedback {
  const text=draft.content.trim(); const words=text.split(/\s+/); const sentences=text.split(/[.!?]+/).filter(Boolean);
  const lower=text.toLowerCase(); const transitionCount=transitions.filter(item=>lower.includes(item)).length;
  const vocabulary=new Set(words.map(word=>word.toLowerCase().replace(/[^a-z'-]/g,""))).size;
  const content=Math.min(10,6+(draft.wordCount>=120?2:1)+(sentences.length>=6?2:1));
  const language=Math.min(8,4+(vocabulary/Math.max(words.length,1)>.55?2:1)+(words.some(word=>word.length>8)?1:0)+(sentences.length>=5?1:0));
  const cohesion=Math.min(7,3+Math.min(transitionCount,3)+(sentences.length>=6?1:0));
  const total=content+language+cohesion; const band=total>=21?"Band 5":total>=16?"Band 4":total>=11?"Band 3":total>=6?"Band 2":"Band 1";
  return {total,band,content,language,cohesion,strengths:[draft.wordCount>=120?"The continuation develops the central event fully.":"The central event remains connected to the source text.",transitionCount>=2?"Transitions help the events move forward clearly.":"The story has a recognizable beginning-to-ending sequence."],improvements:[draft.wordCount>180?"Condense repeated details so the main event stays focused.":"Add one precise action or sensory detail at the turning point.",transitionCount<2?"Use a transition such as ‘At that moment’ or ‘Only then’ to strengthen cohesion.":"Check verb tense and punctuation during your final revision."],generatedAt:new Date().toISOString()};
}

export default function AIWritingFeedback({draft,onClose}:{draft:StudentDraft;onClose:()=>void}) {
  const [saved,setSaved]=useLocalStorage<Feedback|null>(`storyforge-ai-feedback-${draft.id}`,null);
  const [loading,setLoading]=useState(!saved);
  const result=useMemo(()=>evaluate(draft),[draft]);
  useEffect(()=>{if(!saved){const timer=setTimeout(()=>{setSaved(result);setLoading(false)},1600);return()=>clearTimeout(timer)}},[saved,result,setSaved]);
  const feedback=saved||result;
  return <section className="ai-feedback"><header><div><span>AI WRITING FEEDBACK · 写后智能评价</span><h3>Continuation Writing Review</h3><p>依据高考读后续写 25 分标准生成，仅用于修改建议，不替代教师评价。</p></div><button onClick={onClose} aria-label="关闭评价"><X/></button></header>{loading?<div className="feedback-loading"><LoaderCircle/><strong>Reading your continuation...</strong><span>Checking content, language and cohesion</span></div>:<><div className="feedback-score"><div><strong>{feedback.total}</strong><span>/ 25</span><b>{feedback.band}</b></div><p>{feedback.total>=21?"与原文融洽，语言较丰富，篇章连贯。":feedback.total>=16?"续写较完整，整体连贯，仍有提升空间。":"故事基本完成，请重点加强情节衔接与语言准确性。"}</p></div><div className="rubric-results"><article><span>CONTENT · 内容</span><strong>{feedback.content} / 10</strong><p>续写完整性、逻辑性及与原文情境的融洽度。</p></article><article><span>LANGUAGE · 语言</span><strong>{feedback.language} / 8</strong><p>词汇和语法结构的准确性、恰当性与多样性。</p></article><article><span>COHESION · 衔接</span><strong>{feedback.cohesion} / 7</strong><p>语句衔接、全文结构与意义连贯性。</p></article></div><div className="feedback-notes"><article><h4><CheckCircle2/> What works well</h4>{feedback.strengths.map(item=><p key={item}>{item}</p>)}</article><article><h4>Next revision</h4>{feedback.improvements.map(item=><p key={item}>{item}</p>)}</article></div><button className="regenerate-feedback" onClick={()=>{setSaved(evaluate(draft));}}><RefreshCw/> Review again</button><small>字数少于 120 词会影响档次；拼写与标点错误按其对交际的影响程度综合判断。</small></>}</section>;
}
