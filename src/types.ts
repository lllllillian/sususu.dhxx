export interface StoryScene {
  id: string;
  title: string;
  narration: string;
  setting: string;
  characterAction: string;
  emotion: string;
  visualPrompt: string;
  duration: number;
}

export interface StoryboardSource {
  storyId: number;
  storyTitle: string;
  storyLabel: string;
  image: string;
  accent: string;
  draft: string;
}
