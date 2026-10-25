import { useLocalStorage } from "../hooks/useLocalStorage";

const reactions=[{emoji:"👏",label:"Well written"},{emoji:"💡",label:"Creative idea"},{emoji:"❤️",label:"Moving"},{emoji:"✨",label:"Vivid"}];

export default function ReactionBar({submissionId,enabled,onRecognition}:{submissionId:string;enabled:boolean;onRecognition:(total:number)=>void}) {
  const [all,setAll]=useLocalStorage<Record<string,Record<string,{count:number;selected:boolean}>>>("storyforge-gallery-reactions",{});
  const current=all[submissionId]||{};
  const total=Object.values(current).reduce((sum,item)=>sum+item.count,0);
  const toggle=(emoji:string)=>{if(!enabled)return;const item=current[emoji]||{count:0,selected:false};const nextItem={count:Math.max(0,item.count+(item.selected?-1:1)),selected:!item.selected};const next={...current,[emoji]:nextItem};setAll({...all,[submissionId]:next});onRecognition(Object.values(next).reduce((sum,value)=>sum+value.count,0))};
  return <div className="reaction-bar"><span>PEER RECOGNITION · 同伴认可 <b>{total}</b></span><div>{reactions.map(item=>{const state=current[item.emoji]||{count:0,selected:false};return <button key={item.emoji} title={item.label} aria-label={item.label} className={state.selected?"selected":""} disabled={!enabled} onClick={()=>toggle(item.emoji)}><b>{item.emoji}</b><span>{state.count}</span></button>})}<button className="sticker-coming" disabled title="Coming soon">＋ 表情包</button></div>{!enabled&&<small>{submissionId.startsWith("own-") ? "不能给自己的作品点赞。" : "提交续写后即可参与同伴认可。"}</small>}</div>;
}
