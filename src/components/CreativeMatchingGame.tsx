import { Check, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";

export interface MatchingGameData {
  tasks: string[];
  strategies: string[];
  answers: number[];
}

const colors = ["#b44b3e", "#2b7f6b", "#4d72b8", "#9b6a31"];

export default function CreativeMatchingGame({ storyId, data, awardFlower }: { storyId:number; data:MatchingGameData; awardFlower:(id:string)=>boolean }) {
  const [selectedTask,setSelectedTask]=useState<number|null>(null);
  const [matches,setMatches]=useState<Record<number,number>>({});
  const [message,setMessage]=useState("Choose a writing task, then choose its creative strategy.");
  const [attempted,setAttempted]=useState<number|null>(null);
  const score=Object.keys(matches).length*10;
  const rows=useMemo(()=>data.tasks.map((_,index)=>({from:index,to:matches[index]})).filter(row=>row.to!==undefined),[data.tasks,matches]);

  const chooseStrategy=(strategyIndex:number)=>{
    if(selectedTask===null){setMessage("Choose a task in Column A first.");return}
    if(matches[selectedTask]!==undefined)return;
    setAttempted(strategyIndex);
    if(data.answers[selectedTask]===strategyIndex){
      setMatches({...matches,[selectedTask]:strategyIndex});
      const fresh=awardFlower(`matching-${storyId}-${selectedTask}`);
      setMessage(fresh?"Nice shot! Correct match. You earned one red flower.":"Correct match. This flower was already collected.");
      setSelectedTask(null);setAttempted(null);
    }else setMessage("Not quite. Compare the writing goal with the strategy and try again.");
  };
  const reset=()=>{setSelectedTask(null);setMatches({});setAttempted(null);setMessage("Choose a writing task, then choose its creative strategy.")};

  return <section className="matching-game"><header><div><span>CREATIVE MATCHING · 连线闯关</span><h3>Writing Inspiration Match</h3><p>Match four writing tasks with creative strategies. One strategy is extra.</p></div><div className="matching-score"><strong>{score}</strong><span>/ 40 points</span></div></header><div className="matching-board"><div className="matching-column"><b>COLUMN A · WRITING TASKS</b>{data.tasks.map((task,index)=><button key={task} className={`${selectedTask===index?"selected":""} ${matches[index]!==undefined?"matched":""}`} onClick={()=>matches[index]===undefined&&setSelectedTask(index)}><i style={{background:matches[index]!==undefined?colors[index]:undefined}}>{index+1}</i><span>{task}</span>{matches[index]!==undefined&&<Check/>}</button>)}</div><svg className="matching-lines" viewBox="0 0 120 420" preserveAspectRatio="none" aria-hidden="true">{rows.map(row=><path key={row.from} d={`M 0 ${70+row.from*82} C 45 ${70+row.from*82}, 75 ${70+(row.to||0)*82}, 120 ${70+(row.to||0)*82}`} stroke={colors[row.from]} strokeWidth="4" fill="none"/>)}</svg><div className="matching-column"><b>COLUMN B · CREATIVE STRATEGIES</b>{data.strategies.map((strategy,index)=>{const matchedTask=Object.keys(matches).find(key=>matches[Number(key)]===index);return <button key={strategy} className={`${matchedTask!==undefined?"matched":""} ${attempted===index?"wrong":""}`} onClick={()=>chooseStrategy(index)}><i style={{background:matchedTask!==undefined?colors[Number(matchedTask)]:undefined}}>{String.fromCharCode(65+index)}</i><span>{strategy}</span></button>})}</div></div><div className={`matching-message ${score===40?"complete":""}`}><p>{score===40?"Perfect! You are a Creative Master. All four links are correct.":message}</p><button onClick={reset}><RotateCcw/> Try again</button></div></section>;
}
