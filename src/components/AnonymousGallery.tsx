import { useState } from "react";
import { Award, Flower2, GraduationCap } from "lucide-react";
import { gallerySubmissions } from "../data/gallerySubmissions";
import type { GallerySubmission } from "../types/gallery";
import type { StudentDraft } from "../types/writing";
import GalleryStory from "./GalleryStory";
import GalleryAIReview, { type LanguageReview } from "./GalleryAIReview";
import { useLocalStorage } from "../hooks/useLocalStorage";

const tags = ["All", "Natural connection", "Vivid description", "Creative turning point", "Strong ending"];

export default function AnonymousGallery({ storyId, draft, onGoToWriting, awardFlowers }: { storyId: number; draft: StudentDraft | null; onGoToWriting: () => void; awardFlowers: (id: string, amount?: number) => boolean }) {
  const [storyFilter, setStoryFilter] = useState<number | "all">(storyId);
  const [tag, setTag] = useState("All");
  const [teacherMode, setTeacherMode] = useState(false);
  const [reviews, setReviews] = useLocalStorage<Record<string, LanguageReview>>("storyforge-gallery-language-reviews", {});
  const reviewKey = draft ? `${draft.id}-${draft.updatedAt}` : "";
  const completedReview = reviewKey ? reviews[reviewKey] : null;
  const own: GallerySubmission | null = draft?.status === "submitted" && completedReview ? { id: `own-${draft.storyId}`, storyId: draft.storyId, anonymousName: "Writer 01", content: completedReview.corrected_text, tags: ["Natural connection"], approved: true, isCurrentStudent: true, createdAt: draft.submittedAt || draft.updatedAt } : null;
  const source = own ? [own, ...gallerySubmissions] : gallerySubmissions;
  const approved = source.filter(item => item.approved && (storyFilter === "all" || item.storyId === storyFilter) && (tag === "All" || item.tags.includes(tag)));

  return <div className="gallery"><header className="gallery-heading"><div><span>ANONYMOUS GALLERY · 匿名作品展廊</span><h3>Read, notice and respond</h3><p>作品先获得 AI 语言反馈，确认后再匿名展示；不设置分数排名。</p></div><button className={teacherMode ? "teacher-mode active" : "teacher-mode"} onClick={() => setTeacherMode(value => !value)}><GraduationCap size={18}/>{teacherMode ? "退出教师推荐" : "进入教师推荐"}</button></header>{draft?.status === "submitted"&&!completedReview&&<GalleryAIReview content={draft.content} savedReview={null} onReviewed={review=>setReviews({...reviews,[reviewKey]:review})}/>}<section className="flower-rules"><div><Flower2/><strong>小红花获得规则</strong></div><p><span><b>＋1</b> 同伴认可达到 3 次</span><span><b>＋1</b> 同伴认可达到 8 次</span><span><b>＋2</b> 获得教师推荐</span></p><small><Award size={14}/> 每个作品的每档奖励只发放一次；不能给自己的作品点赞。</small></section><div className="gallery-filters"><select value={storyFilter} onChange={event => setStoryFilter(event.target.value === "all" ? "all" : Number(event.target.value))}><option value="all">All stories</option><option value="1">Story 01</option><option value="2">Story 02</option><option value="3">Story 03</option></select><div>{tags.map(item => <button key={item} className={tag === item ? "active" : ""} onClick={() => setTag(item)}>{item}</button>)}</div></div>{approved.length ? <div className="gallery-list">{approved.map(item => <GalleryStory key={item.id} submission={item} canComment={draft?.status === "submitted"} onGoToWriting={onGoToWriting} teacherMode={teacherMode} awardFlowers={awardFlowers}/>)}</div> : <div className="empty-gallery"><h4>No approved stories yet.</h4><p>Try another story or filter.</p></div>}</div>;
}
