import { Send } from "lucide-react";
import { useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { AnonymousComment } from "../types/gallery";

const countWords = (value: string) => value.trim() ? value.trim().split(/\s+/).length : 0;

export default function AnonymousFeedbackForm({ submissionId, enabled, onGoToWriting }: { submissionId: string; enabled: boolean; onGoToWriting: () => void }) {
  const [comments, setComments] = useLocalStorage<AnonymousComment[]>("storyforge-comments", []);
  const [praise, setPraise] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!enabled) return <div className="feedback-locked"><strong>请先提交自己的续写</strong><p>Submit your own continuation before leaving anonymous feedback.</p><button type="button" onClick={onGoToWriting}>Go to Independent Writing · 去完成自主续写</button></div>;

  const submit = () => {
    if (countWords(praise) < 10 || countWords(suggestion) < 10) { setError("Each response needs at least 10 English words."); return; }
    setComments([...comments, { id: `comment-${Date.now()}`, submissionId, anonymousName: `Reader ${String(comments.length + 1).padStart(2, "0")}`, praise, suggestion, status: "visible", createdAt: new Date().toISOString() }]);
    setPraise(""); setSuggestion(""); setError(""); setSuccess(true);
  };

  return <div className="feedback-form"><span>TRANSFER & CREATE · 迁移创新</span><ol><li>Read another continuation</li><li>Identify one effective expression</li><li>Give one specific suggestion</li></ol><label>One thing that works well<textarea value={praise} onChange={event => setPraise(event.target.value)} placeholder="I was impressed by..."/></label><label>One suggestion for improvement<textarea value={suggestion} onChange={event => setSuggestion(event.target.value)} placeholder="You could make the turning point clearer by..."/></label>{error && <p className="form-error">{error}</p>}{success && <p className="submit-success">Anonymous feedback submitted successfully.</p>}<button onClick={submit}><Send/> Submit anonymously</button></div>;
}
