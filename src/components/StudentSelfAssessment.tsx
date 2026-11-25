import type { StudentSelfAssessmentData } from "../types/writing";

type CheckKey = "connection" | "openings" | "description" | "language" | "theme";
const dimensions: { title:string; titleZh:string; items:{ key:CheckKey; en:string; zh:string }[] }[] = [
  { title:"Content Coherence", titleZh:"内容衔接", items:[
    { key:"connection", en:"My continuation follows the characters, conflict and clues in the source text.", zh:"续写承接了原文的人物、矛盾与伏笔。" },
    { key:"openings", en:"Each paragraph develops naturally from its given opening sentence.", zh:"两段内容都从所给段首句自然展开。" },
  ] },
  { title:"Language & Description", titleZh:"语言与描写", items:[
    { key:"description", en:"I used actions, feelings, dialogue or setting details to show the scene.", zh:"我用动作、心理、对话或环境细节呈现画面。" },
    { key:"language", en:"My tense, grammar and word choice are appropriate for the story.", zh:"时态、语法和用词符合故事语境。" },
  ] },
  { title:"Theme & Creation", titleZh:"主题与创作", items:[
    { key:"theme", en:"My ending resolves the conflict and responds to the story theme.", zh:"结尾解决了矛盾，并回应了故事主题。" },
  ] },
];

export default function StudentSelfAssessment({ value, onChange }:{ value:StudentSelfAssessmentData; onChange:(value:StudentSelfAssessmentData)=>void }) {
  const legacy = value as StudentSelfAssessmentData & { ending?:boolean };
  const current:StudentSelfAssessmentData = { connection:Boolean(value?.connection), openings:Boolean(value?.openings), description:Boolean(value?.description), language:Boolean(value?.language), theme:Boolean(value?.theme ?? legacy?.ending), strongestPart:value?.strongestPart ?? "", improvement:value?.improvement ?? "", feedbackDecision:value?.feedbackDecision ?? "" };
  return <fieldset className="self-assessment">
    <legend>STUDENT SELF-ASSESSMENT · 学生自评</legend>
    <header><strong>Check your work before submitting</strong><span>提交前，请用证据审视自己的续写。</span></header>
    <div className="self-assessment__grid">{dimensions.map(dimension=><section key={dimension.title}>
      <h4>{dimension.title}<small>{dimension.titleZh}</small></h4>
      {dimension.items.map(item=><label key={item.key} className={current[item.key]?"checked":""}><input type="checkbox" checked={current[item.key]} onChange={()=>onChange({...current,[item.key]:!current[item.key]})}/><span><b>{item.en}</b><small>{item.zh}</small></span></label>)}
    </section>)}</div>
    <section className="self-assessment__reflection"><h4>Reflection & Revision <small>反思与修改</small></h4>
      <label><span>My strongest part is... <small>我最满意的部分是……</small></span><textarea value={current.strongestPart} onChange={event=>onChange({...current,strongestPart:event.target.value})} placeholder="Name one strength and give a brief reason."/></label>
      <label><span>One part I still need to improve is... <small>我还需要改进的部分是……</small></span><textarea value={current.improvement} onChange={event=>onChange({...current,improvement:event.target.value})} placeholder="Locate one specific problem to revise."/></label>
    </section>
    <section className="self-assessment__decision"><div><h4>After receiving feedback... <small>收到反馈后</small></h4><p>I will judge whether the suggestion is necessary, preserves my meaning and fits the context.</p></div><select value={current.feedbackDecision} onChange={event=>onChange({...current,feedbackDecision:event.target.value as StudentSelfAssessmentData["feedbackDecision"]})} aria-label="Feedback decision"><option value="">Decide after reading feedback · 阅读反馈后再决定</option><option value="accept">Accept it · 接受建议</option><option value="question">Question or reject it · 质疑或拒绝</option><option value="rewrite">Rewrite it myself · 自主改写</option></select></section>
    <footer>Self-assessment helps you identify strengths, locate problems and make revision decisions before peer and teacher feedback.</footer>
  </fieldset>;
}
