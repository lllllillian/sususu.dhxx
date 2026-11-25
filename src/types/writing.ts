export type FeedbackDecision = "" | "accept" | "question" | "rewrite";
export interface StudentSelfAssessmentData { connection:boolean; openings:boolean; description:boolean; language:boolean; theme:boolean; strongestPart:string; improvement:string; feedbackDecision:FeedbackDecision; }
export interface StudentDraft { id:string; storyId:number; content:string; wordCount:number; selectedClues:string[]; selectedDecision:string; status:"draft"|"submitted"; updatedAt:string; submittedAt?:string; selfAssessment:StudentSelfAssessmentData; }
export interface ModelEssay { storyId:number; title:string; content:string; annotations:{type:"connection"|"action"|"emotion"|"turning-point"|"theme"; sentence:string; noteZh:string}[]; }
