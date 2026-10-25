import { Award, Check, Flag } from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { AnonymousComment, GallerySubmission } from "../types/gallery";
import AnonymousFeedbackForm from "./AnonymousFeedbackForm";
import ReactionBar from "./ReactionBar";

export default function GalleryStory({ submission, canComment, comments, onSubmitComment, onReportComment, onGoToWriting, teacherMode, awardFlowers }: { submission: GallerySubmission; canComment: boolean; comments: AnonymousComment[]; onSubmitComment: (submissionId: string, praise: string, suggestion: string) => void; onReportComment: (id: string) => void; onGoToWriting: () => void; teacherMode: boolean; awardFlowers: (id: string, amount?: number) => boolean }) {
  const [recommendations, setRecommendations] = useLocalStorage<Record<string, boolean>>("storyforge-teacher-recommendations", {});
  const visible = comments.filter(item => item.submissionId === submission.id && item.status === "visible");
  const recommended=Boolean(recommendations[submission.id]);
  const recognize=(total:number)=>{if(total>=3)awardFlowers(`gallery-peer-${submission.id}-3`);if(total>=8)awardFlowers(`gallery-peer-${submission.id}-8`)};
  const recommend=()=>{if(!teacherMode||recommended)return;setRecommendations({...recommendations,[submission.id]:true});awardFlowers(`gallery-teacher-${submission.id}`,2)};
  return <article className={`gallery-story ${recommended?"is-recommended":""}`}><header><div><span>{submission.anonymousName}</span>{submission.isCurrentStudent && <b>Your work</b>}{recommended&&<em><Award size={14}/> 教师推荐</em>}</div><small>{submission.createdAt}</small></header>{teacherMode&&<button className="recommend-button" disabled={recommended} onClick={recommend}>{recommended?<><Check size={16}/> 已推荐 · 已奖励 2 朵</>:<><Award size={16}/> 推荐为优秀作品 · 奖励 2 朵</>}</button>}<p>{submission.content}</p><div className="gallery-tags">{submission.tags.map(tag => <span key={tag}>{tag}</span>)}</div><ReactionBar submissionId={submission.id} enabled={canComment&&!submission.isCurrentStudent} onRecognition={recognize}/><section className="peer-feedback-list"><header><strong>同伴评价 · Peer Feedback</strong><span>{visible.length} 条</span></header>{visible.length ? visible.map(comment => <blockquote key={comment.id}><strong>{comment.anonymousName}</strong><p><b>亮点：</b>{comment.praise}</p><p><b>建议：</b>{comment.suggestion}</p><button onClick={() => onReportComment(comment.id)}><Flag/> Report</button></blockquote>) : <p className="peer-feedback-empty">还没有同伴评价，完成互评后会显示在这里。</p>}</section>{!submission.isCurrentStudent&&<AnonymousFeedbackForm enabled={canComment} onGoToWriting={onGoToWriting} onSubmit={(praise, suggestion) => onSubmitComment(submission.id, praise, suggestion)}/>}</article>;
}
