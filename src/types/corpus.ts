export type CorpusCategory="word"|"phrase"|"sentence";
export interface CorpusEntry { id:string; category:CorpusCategory; expression:string; translationZh:string; example:string; source:"teacher"|"approved-student-work"|"student-pending"; saved:boolean; }
