import type { CorpusEntry,CorpusCategory } from "../types/corpus";
const rows:[CorpusCategory,string,string,string][]=[
  ["word","disappointment","失望","His heart ached at the thought of his grandchildren's disappointment."],
  ["word","anxiously","焦虑地","The children looked anxiously at the ever-rising water."],
  ["word","restore","修复；恢复","Matt hoped that he could restore his friendships."],
  ["phrase","go out of one's way to help","特意尽力帮助","The workers went out of their way to find the family."],
  ["phrase","come to one's rescue","前来营救某人","Two fishermen came to the children's rescue."],
  ["phrase","lose one's temper","发脾气","Matt regretted the times he had lost his temper."],
  ["sentence","His breath caught as he recognized the names on the tags.","当他认出标签上的名字时，他屏住了呼吸。","His breath caught as he recognized the names on the tags."],
  ["sentence","Their determination gave us hope when we thought all was lost.","当我们以为一切无望时，他们的坚定给了我们希望。","Their determination gave us hope when we thought all was lost."],
  ["sentence","Anger could leave a wound that people remembered for a long time.","愤怒会留下人们长久记得的伤痕。","Anger could leave a wound that people remembered for a long time."]
];
export const corpusEntries:CorpusEntry[]=rows.map((row,index)=>({id:`c${index+1}`,category:row[0],expression:row[1],translationZh:row[2],example:row[3],source:index>5?"approved-student-work":"teacher",saved:false}));
