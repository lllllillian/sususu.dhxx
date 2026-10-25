import type { StudentDraft } from "../types/writing";
import SeedanceVideoPanel from "./SeedanceVideoPanel";

export default function StoryAnimationStudio({ draft, storyTitle }: { draft: StudentDraft; storyTitle: string; coverImage: string }) {
  return <SeedanceVideoPanel defaultPrompt={`${storyTitle}. ${draft.content}`} />;
}
