export interface GallerySubmission { id:string; storyId:number; anonymousName:string; content:string; tags:string[]; approved:boolean; isCurrentStudent?:boolean; createdAt:string; }
export interface AnonymousComment { id:string; submissionId:string; anonymousName:string; praise:string; suggestion:string; status:"visible"|"reported"|"hidden"; createdAt:string; }
