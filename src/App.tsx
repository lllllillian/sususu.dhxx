import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, ClipboardCheck, Database, Flower2, GraduationCap, Menu, PenLine, Search, Sparkles, Users, X } from "lucide-react";
import IndependentWriting from "./components/IndependentWriting";
import ModelEssayPanel from "./components/ModelEssayPanel";
import AnonymousGallery from "./components/AnonymousGallery";
import ExpressionBank from "./components/ExpressionBank";
import type { StudentDraft } from "./types/writing";
import CreativeMatchingGame, { type MatchingGameData } from "./components/CreativeMatchingGame";
import { useLocalStorage } from "./hooks/useLocalStorage";
import WordLookupText from "./components/WordLookupText";
import pixelCompanionBlack from "./assets/pixel-companion-black.jpg";
import pixelCompanionPink from "./assets/pixel-companion-pink.jpg";
import pixelCompanionBlackCutout from "./assets/pixel-companion-black-cutout.png";
import pixelCompanionPinkCutout from "./assets/pixel-companion-pink-cutout.png";
import studentRoleCutout from "./assets/student-role-cutout.png";
import teacherRoleCutout from "./assets/teacher-role-cutout.png";

type Story = {
  id: number; version: number; label: string; title: string; subtitle: string; image: string; accent: string;
  paragraphs: string[]; clues: string[]; checks: string[]; core: string; map: string[]; prompts: string[];
  mapLabels?: string[]; writingOpenings?: [string, string]; matching?: MatchingGameData;
  quiz: { question: string; options: string[]; answer: number; explanation: string }[];
  decisions: [string, string];
};

const stories: Story[] = [
  {
    id: 1, version: 2, label: "圣诞礼物", title: "The Lost Christmas Gifts", subtitle: "两位公路养护工人发现遗失的圣诞礼物，并努力让它们及时回到家人手中。",
    image: "https://images.unsplash.com/photo-1483664852095-d6cc6870702d?auto=format&fit=crop&w=1600&q=85", accent: "#b44b3e",
    paragraphs: ["Last Christmas Eve, as the cold wind blew across U.S. Highway 2 near Leavenworth, Devitt Kane and Eric Ramey, two highway maintenance workers with the Washington State Department of Transportation (WSDOT), were making their routine inspection. Kane caught sight of a broken trash bag lying on the shoulder. As they approached, the contents spilled out, revealing tennis shoes and toys bursting from gift wrapping.", "Kane and Ramey carefully loaded the bag into their truck and drove back to headquarters. They searched through reports but found no match. They then turned to social media. For security, Kane wrote a detailed Facebook post but left out the names on the gift tags. He remembered how excited he had been as a child on Christmas.", "By 5 p.m., Kane was packing up with disappointment. He asked the night crew to watch for inquiries because the gifts could mean the world to a family. Around 9 p.m., the office phone rang. David Carlile, a grandfather, had lost a crucial trash bag filled with children's Christmas gifts. The workers told him they might have found it and arranged to meet him."],
    clues: ["broken trash bag", "gift-wrapped shoes and toys", "routine inspection truck", "Facebook post with hidden names", "9 p.m. phone call", "Christmas tree lights"], checks: ["Explain how Carlile may have lost the bag.", "Develop Carlile's worry, guilt and growing hope.", "Confirm ownership through the gifts or name tags.", "Echo the kindness and warmth of Christmas Eve."],
    core: "Highway workers find and return lost Christmas gifts on Christmas Eve.",
    mapLabels: ["NEED · 人物需要", "DIFFICULTIES · 困难", "SOLUTIONS · 解决方法", "DENOUEMENT · 结局", "ECHO & GROWTH · 首尾呼应 / 升华"],
    map: ["", "", "", "", ""],
    prompts: ["What might Carlile remember while driving to the meeting point?", "How can his actions reveal both guilt and hope?", "Which detail can confirm the bag belongs to his family?", "How can the ending echo the cold Christmas Eve but create emotional warmth?"],
    decisions: ["Check the gifts together to confirm ownership", "Listen to Carlile tell how he lost the bag"],
    writingOpenings: ["As Carlile drove towards the meeting point, he couldn’t help but think about the incident.", "Finally, when Carlile pulled into the WSDOT parking lot, he saw two men waiting beside a familiar-looking bag."],
    quiz: [{question:"Which clue creates the strongest sense of time pressure?",options:["The broken trash bag","The cold wind on Christmas Eve","The clock striking 5 p.m.","The highway shoulder"],answer:2,explanation:"The specific time shows that Christmas Eve is passing and the gifts must be returned soon."},{question:"Which clue best reflects the workers’ kindness and carefulness?",options:["The WSDOT truck","The Facebook post with hidden names","The night crew shift","The routine inspection"],answer:1,explanation:"They actively search for the owner while protecting the family's private information."},{question:"Which clue is the key turning point of the whole story?",options:["The tennis shoes in the bag","The spilled gift wrapping","The phone call at around 9 p.m.","The broken trash bag"],answer:2,explanation:"Carlile's call connects the lost gifts with their owner and makes the reunion possible."},{question:"What narrative role does the Christmas Eve setting play?",options:["It explains why the workers were on the highway","It makes the gifts more meaningful and the matter more urgent","It shows why the bag broke","It tells readers where the bag was lost"],answer:1,explanation:"Christmas Eve increases both the emotional value of the gifts and the urgency of returning them."}]
  },
  {
    id: 2, version: 3, label: "潮水围困", title: "Trapped by the Rising Tide", subtitle: "兄弟俩偷偷留在海滩玩耍，却被不断上涨的潮水困在一小片陆地上。",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=85", accent: "#2b7f6b",
    paragraphs: ["My brother Jack and I went to visit my aunt, who lived very near the beach. I was fifteen and Jack was five. On our way back, we decided to walk along the beach instead of taking a taxi. We did not tell our aunt because she might refuse.", "We played happily on the sand, making castles, collecting shells, splashing water and laughing. Time passed quickly. The tide was coming in, but we were unaware of it. When it began to get dark, we found that water had covered the way ahead and had also reached the shore behind us. We were trapped on a small dry patch surrounded by water.", "Our only hope was a tall wall with huge rocks nearby. Climbing over it could take us to the road. I tried to get Jack across first, but we slipped and fell from the rock into the water. He cried in pain and fear. I realized we could never cross the wall on our own. Only outside help could save us as the water kept rising."],
    clues: ["sand castles and sea shells", "rising tide around the dry land", "patrolling lifeguard", "tall wall with huge rocks", "slipping into the water", "mobile phone"],
    checks: ["Show how the rescuers hear the children's cries.", "Keep Jack's safety and the rising tide urgent.", "Use a believable rescue method involving the wall or rope.", "End with responsibility, safety or strangers' kindness."],
    core: "Two young brothers secretly playing on the beach get trapped by the rising tide and cannot escape on their own.",
    mapLabels: ["NEED · 人物需要", "DIFFICULTIES · 困难", "SOLUTIONS · 解决方法", "DENOUEMENT · 结局", "ECHO & GROWTH · 首尾呼应 / 升华"], map:["","","","",""],
    prompts: ["Who could reasonably hear their cries near the beach?", "Which rescue action should happen first to protect five-year-old Jack?", "How can the narrator show responsibility as the elder brother?", "What lesson can echo their secret decision at the beginning?"],
    decisions: ["Keep shouting and wait patiently for rescuers", "Try to climb the rocky wall again"],
    writingOpenings: ["In despair, we shouted for help, and a miracle happened.", "After saying thanks again and again to the two men, we returned home."],
    matching:{tasks:["Rescuer Role Innovation","Emotion & Detail Innovation","Theme & Lesson Innovation","Ending Plot Innovation"],strategies:["Design layered emotions and delicate body details.","Create a unique rescuer with a reasonable reason for being there.","Use a traditional go-home-and-apologize ending only.","Explore sibling responsibility or strangers' kindness.","Design an unexpected but logical ending."],answers:[1,0,3,4]},
    quiz:[{question:"Why did the two children get trapped on the beach?",options:["They lost their taxi","They were absorbed in playing and missed the rising tide","A lifeguard closed the beach","Jack wanted to swim"],answer:1,explanation:"They were having so much fun that they failed to notice the tide surrounding the dry land."},{question:"What was their only way to escape at first?",options:["Call their aunt","Wait for a boat","Climb over the tall wall and rocks","Swim across the tide"],answer:2,explanation:"The wall could lead them to the road, so it first appeared to be their only escape route."},{question:"What happened when they tried to escape?",options:["They found a ladder","They slipped from the rock into the water","They reached the road","A fisherman caught them"],answer:1,explanation:"The narrator tried to lift Jack over the wall, but they slipped and fell into the water."},{question:"What was the only possible way to save them in the end?",options:["Outside help responding to their cries","Building another sandcastle","Waiting silently","Walking through the water"],answer:0,explanation:"The failed climb proves they cannot escape alone; the paragraph starter also promises a miracle from outside."}]
  },
  {
    id: 3, version: 3, label: "篱笆上的钉孔", title: "Holes in the Fence", subtitle: "Matt 用钉钉子的办法控制脾气，却发现愤怒留下的伤痕并不会轻易消失。",
    image: "https://images.unsplash.com/photo-1473445361085-b9a07f55608b?auto=format&fit=crop&w=1600&q=85", accent: "#4d72b8",
    paragraphs: ["Matt was a nice enough boy, but sometimes he became very angry. When things did not go his way, he shouted at people. His parents warned him to control his temper, and Matt noticed that more and more friends at school were avoiding him. He did not want to lose them, but his anger built up like a volcano until he erupted.", "One Saturday, his father brought home a new hammer and a bag of shiny nails. He told Matt to hammer a nail into the wooden fence every time he became angry. Matt thought the idea was strange, but he agreed to try it.", "Each time Matt lost his temper, he hammered another nail into the fence. Soon the task became boring, and keeping track of every angry moment was tiring. Surprisingly, Matt became less and less angry. He discovered that controlling his temper was easier than remembering every outburst and hammering another nail."],
    clues:["hammer and shiny nails","wooden fence","friends avoiding Matt","broken toy car","volcano-like temper","school punishment note"],
    checks:["Continue the father's lesson after Matt controls his temper.","Make the remaining holes carry an important meaning.","Show Matt taking responsibility for hurtful words.","End with repair, friendship and personal growth."],
    core:"A bad-tempered boy drives friends away, and his wise father uses nails and a fence to help him control his temper.",
    mapLabels:["NEED · 人物需要","DIFFICULTIES · 困难","SOLUTIONS · 解决方法","DENOUEMENT · 结局","ECHO & GROWTH · 首尾呼应 / 升华"],map:["","","","",""],
    prompts:["Why might removing a nail not fully repair the fence?","What could Matt do to repair both the fence and his friendships?","Which action can show that Matt truly accepts responsibility?","How can the holes become a metaphor in the ending?"],
    decisions:["Ask his father about the meaning of the holes","Try to pull all the nails out on his own"],
    writingOpenings:["After a week of not hammering the nails, he proudly went and told his dad.","Matt became concerned about the holes that remained after removing the nails."],
    matching:{tasks:["Character Growth Innovation","Detail & Emotion Innovation","Theme Sublimation Innovation","Ending Plot Innovation"],strategies:["Use the holes as a metaphor for damaged relationships.","Describe Matt's inner struggle and small changes.","Focus only on Matt's daily play.","Create a scene where Matt reconciles with his friends.","Let Matt share the method with classmates."],answers:[1,3,0,4]},
    quiz:[{question:"Why were Matt's friends avoiding him?",options:["He moved away","His angry outbursts pushed them away","He broke the fence","His father punished them"],answer:1,explanation:"Matt shouted and screamed when things did not go his way, which hurt his friendships."},{question:"What did Matt's father bring from the hardware store?",options:["A toy car","A paintbrush","A hammer and shiny nails","A school note"],answer:2,explanation:"The hammer and nails become the physical tool for making Matt notice each angry outburst."},{question:"What must Matt do whenever he gets angry?",options:["Hammer a nail into the fence","Write to a friend","Remove a nail","Paint the fence"],answer:0,explanation:"His father asks him to connect every loss of temper with one visible nail in the fence."},{question:"What unexpected change did Matt notice?",options:["His friends fixed the fence","He became less angry and controlled his temper more easily","The nails disappeared","His father became angry"],answer:1,explanation:"The tiring task helped him realize that controlling anger was easier than recording every outburst."}]
  }
];

const stages = ["语篇理解", "线索挑战", "自主续写", "范文参考", "匿名展廊"] as const;

export default function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [questOpen, setQuestOpen] = useState(false);
  const [questProgress, setQuestProgress] = useLocalStorage<string[]>("storyforge-quest-progress", []);
  const [victoryLevel, setVictoryLevel] = useState<number | null>(null);
  const [libraryView, setLibraryView] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);
  const [stage, setStage] = useState<(typeof stages)[number]>("语篇理解");
  const [checked, setChecked] = useState<boolean[]>([false, false, false, false]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [accountView, setAccountView] = useState<"record" | "drafts" | null>(null);
  const [loading, setLoading] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);
  const [currentDraft, setCurrentDraft] = useState<StudentDraft | null>(null);
  const [flowers,setFlowers]=useLocalStorage<number>("storyforge-red-flowers",0);
  const [awarded,setAwarded]=useLocalStorage<string[]>("storyforge-awarded-activities",[]);
  const [flowerPop,setFlowerPop]=useState(false);
  const story = stories[storyIndex];
  const stageIndex = stages.indexOf(stage);
  const questKey = (index: number) => `${story.id}-${index}`;
  const completedLevels = stages.map((_, index) => questProgress.includes(questKey(index)));
  const completeQuest = (index: number) => {
    const key = questKey(index);
    if (!questProgress.includes(key)) setQuestProgress([...questProgress, key]);
    setVictoryLevel(index);
  };
  const openQuest = (index: number) => {
    if (index > 0 && !completedLevels[index - 1]) return;
    setStage(stages[index]);
    setQuestOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const progress = Math.round((checked.filter(Boolean).length / checked.length) * 100);
  const awardFlower=(id:string,amount=1)=>{if(awarded.includes(id))return false;setAwarded([...awarded,id]);setFlowers(flowers+amount);setFlowerPop(true);window.setTimeout(()=>setFlowerPop(false),900);return true};

  useEffect(() => {
    setChecked([false, false, false, false]);
    setStage("语篇理解"); setPromptIndex(0);
    try { setCurrentDraft(JSON.parse(localStorage.getItem(`storyforge-draft-v${story.version}-${story.id}`) || "null")); } catch { setCurrentDraft(null); }
  }, [storyIndex]);

  const switchStory = (next: number) => {
    setLoading(true);
    window.setTimeout(() => { setStoryIndex((next + stories.length) % stories.length); setLoading(false); }, 420);
  };

  const selectStory = (index: number) => {
    setStoryIndex(index);
    setLibraryView(false);
    window.setTimeout(() => document.querySelector("#workshop")?.scrollIntoView({ behavior: "smooth" }), 0);
  };

  const switchStage = (nextStage: (typeof stages)[number]) => setStage(nextStage);

  const content = useMemo(() => {
    if (stage === "语篇理解") return <Reading story={story} checked={checked} setChecked={setChecked} prompt={story.prompts[promptIndex % story.prompts.length]} nextPrompt={() => setPromptIndex(v => v + 1)} awardFlower={awardFlower} />;
    if (stage === "线索挑战") return <ClueGame story={story} awardFlower={awardFlower} onGoToWriting={() => setStage("自主续写")} onComplete={() => completeQuest(1)} />;
    if (stage === "自主续写") return <IndependentWriting story={story} writingOpenings={story.writingOpenings} onDraftChange={setCurrentDraft} onGoToGallery={() => setStage("匿名展廊")} />;
    if (stage === "范文参考") return <><ModelEssayPanel storyId={story.id} draft={currentDraft} /><QuestCompleteButton label="完成范文研读" onComplete={() => completeQuest(3)} /></>;
    return <><AnonymousGallery storyId={story.id} draft={currentDraft} onGoToWriting={() => setStage("自主续写")} awardFlowers={awardFlower} /><QuestCompleteButton label="完成作品分享" onComplete={() => completeQuest(4)} /></>;
  }, [stage, story, checked, promptIndex, currentDraft,flowers,awarded,questProgress]);

  useEffect(() => {
    if (role === "student" && questOpen && stageIndex === 0 && checked.every(Boolean) && !completedLevels[0]) completeQuest(0);
  }, [checked, role, questOpen, stageIndex]);

  useEffect(() => {
    if (role === "student" && questOpen && stageIndex === 2 && currentDraft?.status === "submitted" && !completedLevels[2]) completeQuest(2);
  }, [currentDraft?.status, role, questOpen, stageIndex]);

  if (!hasStarted) return <><WordLookupText text="" /><StartScreen onStart={selectedRole => { setRole(selectedRole); setHasStarted(true); }} /></>;

  if (role === "teacher") return <TeacherWorkspace onSwitchRole={() => setRole("student")} onOpenCorpus={() => setLibraryOpen(true)} corpusOpen={libraryOpen} closeCorpus={() => setLibraryOpen(false)} draft={currentDraft} />;

  if (libraryView) return <StoryLibrary onBack={() => setLibraryView(false)} onSelect={selectStory} />;

  return <div className="app retro-student" style={{"--accent": story.accent} as React.CSSProperties}>
    <header className="site-header">
      <a className="brand" href="#top" aria-label="StoryForge 首页"><span>Story</span>Forge<small>写作工坊</small></a>
      <nav className="desktop-nav"><button onClick={() => { setQuestOpen(false); setLibraryView(false); }}>关卡地图</button><button onClick={() => setLibraryView(true)}>语篇</button><button onClick={() => setLibraryOpen(true)}>班级表达库</button></nav>
      <div className="header-actions"><button className="role-switch" onClick={() => setRole("teacher")}><GraduationCap size={17}/> 教师端</button><div className={`flower-balance ${flowerPop?"pop":""}`} title="完成挑战、获得同伴认可或教师推荐，都可以获得小红花"><Flower2/><strong>{flowers}</strong><span>小红花</span></div><button className="icon-btn" aria-label="搜索"><Search size={19}/></button><button className="profile" onClick={() => setMenuOpen(v=>!v)}>Susu <ChevronDown size={16}/></button><button className="menu-btn" onClick={() => setMenuOpen(true)} aria-label="打开菜单"><Menu/></button></div>
      {menuOpen && <div className="profile-menu"><button onClick={()=>{setLibraryView(true);setMenuOpen(false)}}>浏览语篇</button><button onClick={()=>{setAccountView("record");setMenuOpen(false)}}>我的学习记录</button><button onClick={()=>{setAccountView("drafts");setMenuOpen(false)}}>草稿箱</button><button onClick={()=>setMenuOpen(false)}>关闭菜单</button></div>}
    </header>

    <main id="top">
      {!questOpen ? <StudentQuestMap stages={stages} completed={completedLevels} onSelect={openQuest} /> : <section className="workshop workshop--direct quest-page retro-desktop" id="workshop">
        <aside className="story-aside">
          <button className="quest-back" onClick={() => setQuestOpen(false)}>← 返回关卡地图</button>
          <span className="eyebrow">CONTINUATION WRITING</span><h2>{story.title}</h2><p>{story.subtitle}</p>
          <div className="quest-page__badge"><span>LEVEL {stageIndex + 1} / {stages.length}</span><strong>{stage}</strong><small>{progress}% 当前任务进度</small></div>
          <div className="story-controls"><button onClick={()=>switchStory(storyIndex-1)} aria-label="上一篇"><ArrowLeft/></button><span>0{story.id} / 03</span><button onClick={()=>switchStory(storyIndex+1)} aria-label="下一篇"><ArrowRight/></button></div>
        </aside>
        <div className={`activity-panel retro-window ${loading?"is-loading":""}`}>
          {loading ? <div className="loading"><span/><p>正在翻到下一篇语篇…</p></div> : <>
            <div className="retro-titlebar"><span>StoryForge.exe — Mission {String(stageIndex + 1).padStart(2,"0")}</span><div><i>_</i><i>□</i><i>×</i></div></div>
            <div className="retro-menubar"><span>File</span><span>Edit</span><span>View</span><span>Quest</span><span>Help</span></div>
            <div className="quest-page__header"><span>MISSION {String(stageIndex + 1).padStart(2,"0")}</span><strong>{stage}</strong><small>完成本关任务后将解锁 Victory 奖励与下一关。</small></div>
            {content}
          </>}
        </div>
      </section>}
    </main>

    <footer><div className="brand"><span>Story</span>Forge</div><p>让阅读留下证据，让续写拥有方向。</p><button onClick={()=>setLibraryOpen(true)}>打开班级表达库 <ArrowRight size={16}/></button></footer>

    {libraryOpen && <div className="modal-backdrop corpus-backdrop" onMouseDown={()=>setLibraryOpen(false)}><section className="modal corpus-modal" onMouseDown={e=>e.stopPropagation()}><ExpressionBank onClose={()=>setLibraryOpen(false)} draft={currentDraft}/></section></div>}
    {accountView && <div className="modal-backdrop" onMouseDown={()=>setAccountView(null)}><section className="modal account-modal" onMouseDown={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setAccountView(null)} aria-label="关闭"><X/></button>{accountView === "record" ? <><span className="eyebrow">LEARNING RECORD</span><h2>我的学习记录</h2><div className="record-summary"><div><strong>3</strong><span>已读语篇</span></div><div><strong>68%</strong><span>平均完成度</span></div><div><strong>7</strong><span>收藏表达</span></div></div><div className="account-list">{stories.map((item,index)=><button key={item.id} onClick={()=>{switchStory(index);setAccountView(null);document.querySelector("#workshop")?.scrollIntoView({behavior:"smooth"})}}><span>0{item.id}</span><div><strong>{item.label}</strong><small>{index===0?"学习中 · 40%":"尚未开始"}</small></div><ArrowRight size={18}/></button>)}</div></> : <><span className="eyebrow">MY DRAFTS</span><h2>草稿箱</h2><div className="account-list"><button onClick={()=>{switchStory(0);switchStage("自主续写");setAccountView(null)}}><span>01</span><div><strong>The Lantern at the Station</strong><small>续写草稿 · 刚刚编辑</small></div><ArrowRight size={18}/></button><div className="empty-draft"><PenLine/><p>其余语篇还没有草稿</p><small>进入自主续写后，草稿会自动保存。</small></div></div></>}</section></div>}
    {victoryLevel !== null && <VictoryOverlay level={victoryLevel} onContinue={() => { const next = victoryLevel + 1; setVictoryLevel(null); if (next < stages.length) { setStage(stages[next]); setQuestOpen(true); } else { setQuestOpen(false); } window.scrollTo({ top: 0, behavior: "smooth" }); }} onMap={() => { setVictoryLevel(null); setQuestOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }} onSeedance={() => { setVictoryLevel(null); setStage("自主续写"); setQuestOpen(true); window.setTimeout(() => document.querySelector(".seedance-panel")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120); }} />}
  </div>;
}

function StoryLibrary({ onBack, onSelect }: { onBack: () => void; onSelect: (index: number) => void }) {
  return <main className="story-library">
    <header className="story-library__header"><button onClick={onBack}>← 返回学习主页</button><div className="brand"><span>Story</span>Forge<small>语篇库</small></div><span>03 STORIES · 02 THEMES</span></header>
    <section className="story-library__intro"><p>STORY LIBRARY</p><h1>From Reading<em>to Writing.</em></h1><span>选择一篇语篇，开始你的阅读与续写之旅。</span></section>
    <section className="story-library__group"><div className="story-library__label"><span>01</span><div><p>人与社会</p><h2>Social connections</h2><small>善意、责任与人与人之间的温暖联结</small></div></div><div className="library-cards library-cards--single"><StoryCard story={stories[0]} onSelect={() => onSelect(0)} /></div></section>
    <section className="story-library__group"><div className="story-library__label"><span>02</span><div><p>人与自我</p><h2>Self and growth</h2><small>困境、选择与成长中的自我发现</small></div></div><div className="library-cards"><StoryCard story={stories[1]} onSelect={() => onSelect(1)} /><StoryCard story={stories[2]} onSelect={() => onSelect(2)} /></div></section>
  </main>;
}

function StoryCard({ story, onSelect }: { story: Story; onSelect: () => void }) {
  return <button className="library-card" onClick={onSelect} style={{ "--card-accent": story.accent } as React.CSSProperties}>
    <img src={story.image} alt={story.label} />
    <span className="library-card__number">0{story.id}</span>
    <div><span>CONTINUATION WRITING</span><h3>{story.label}</h3><p>{story.title}</p><strong>进入语篇 <ArrowRight size={16}/></strong></div>
  </button>;
}

function StartScreen({ onStart }: { onStart: (role: "student" | "teacher") => void }) {
  return <main className="start-screen start-screen--y2k">
    <div className="y2k-sky" aria-hidden="true"><i/><i/><i/><i/></div>
    <header className="y2k-header"><strong>STORYFORGE<span>.edu</span></strong><span>READ · IMAGINE · CONTINUE</span></header>
    <nav className="y2k-nav" aria-label="身份入口">
      <button onClick={() => onStart("student")}><img src={studentRoleCutout} alt="正在读写的学生"/><b>学生端</b><small>Student</small></button>
      <button onClick={() => onStart("teacher")}><img src={teacherRoleCutout} alt="正在工作的教师"/><b>教师端</b><small>Teacher</small></button>
    </nav>
    <section className="y2k-stage">
      <div className="y2k-sticker"><b>01</b><span>选择身份</span></div>
      <div className="y2k-logo"><span>STORY</span><strong>FORGE</strong><small>CONTINUATION WRITING</small></div>
      <div className="y2k-monitor">
        <div className="y2k-monitor__screen"><span>StoryForge.exe</span><div><h1>Read deeply.<br/><em>Write beyond.</em></h1><p>阅读证据 · 续写挑战 · 多元评价</p></div></div>
        <div className="y2k-monitor__controls"><i/><i/><i/><i/><b/></div>
        <div className="y2k-monitor__neck"/><div className="y2k-monitor__base"/>
      </div>
    </section>
    <div className="role-entry role-entry--y2k">
      <button className="role-entry__student" onClick={() => onStart("student")}><span className="role-entry__avatars"><img src={pixelCompanionBlackCutout} alt="学生闯关角色一"/><img src={pixelCompanionPinkCutout} alt="学生闯关角色二"/></span><b>开始学生闯关</b><small>解锁阅读、推理、写作与分享</small><ArrowRight size={20}/></button>
      <button className="role-entry__teacher" onClick={() => onStart("teacher")}><GraduationCap/><b>进入教师工作台</b><small>组织任务、审核语料并校准评价</small><ArrowRight size={20}/></button>
    </div>
    <div className="y2k-footer"><span>© 2000—2026 STORYFORGE</span><span>Best viewed with imagination ★</span></div>
  </main>;
}

function StudentQuestMap({ stages: questStages, completed, onSelect }: { stages: typeof stages; completed: boolean[]; onSelect: (index: number) => void }) {
  const labels = ["阅读营地", "线索密林", "续写工坊", "范文塔楼", "作品广场"];
  const landmarks = ["⛺", "🌲", "✎", "🏰", "★"];
  return <section className="quest-map retro-desktop" aria-label="学生闯关地图">
    <div className="quest-map__window retro-window"><div className="retro-titlebar"><span>My Story Journey</span><div><i>_</i><i>□</i><i>×</i></div></div><div className="retro-menubar"><span>File</span><span>Edit</span><span>View</span><span>Mission</span><span>Help</span></div>
    <div className="quest-map__intro"><span>STUDENT QUEST · 学生闯关模式</span><h1>故事岛探险地图</h1><p>从海边码头出发，沿着线索小径解锁五个读后续写任务。</p></div>
    <div className="quest-map__viewport">
      <div className="quest-island" aria-label="故事岛五关任务路线">
        <div className="quest-island__waterfall waterfall--left"/><div className="quest-island__waterfall waterfall--right"/>
        <div className="quest-island__river"/><div className="quest-island__lake"/><div className="quest-island__bridge">▤</div>
        <div className="quest-island__trees trees--one">♣♣♣</div><div className="quest-island__trees trees--two">♣♣</div><div className="quest-island__trees trees--three">♣♣♣</div>
        <svg className="quest-route" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M51 92 C34 86 26 77 31 67 S67 64 68 52 S34 47 39 35 S64 30 52 17"/></svg>
        <span className="quest-island__start">⚓ START</span>
        {questStages.map((item,index)=>{const unlocked=index===0||completed[index-1];return <button key={item} disabled={!unlocked} className={`quest-node quest-node--${index+1} ${completed[index]?"complete":""} ${unlocked&&!completed[index]?"current":""}`} onClick={()=>onSelect(index)} aria-label={`${labels[index]}：${unlocked?item:"尚未解锁"}`}><span className="quest-node__landmark">{landmarks[index]}</span><i>{completed[index]?<Check size={16}/>:unlocked?index+1:"🔒"}</i><span className="quest-node__label"><strong>{labels[index]}</strong><small>{unlocked?item:"完成上一关后解锁"}</small></span>{unlocked&&!completed[index]&&<span className="quest-map__companions"><span><img src={pixelCompanionBlack} alt="像素学习搭档一"/></span><span><img src={pixelCompanionPink} alt="像素学习搭档二"/></span></span>}</button>})}
      </div>
      <aside className="quest-map__legend"><b>MAP LEGEND</b><span><i className="legend-current"/>当前任务</span><span><i className="legend-complete"/>已经通关</span><span><i className="legend-locked"/>等待解锁</span></aside>
    </div>
    <div className="retro-statusbar"><span>Ready</span><span>{completed.filter(Boolean).length} / {questStages.length} missions cleared</span></div></div>
  </section>;
}

function QuestCompleteButton({ label, onComplete }: { label: string; onComplete: () => void }) {
  return <div className="quest-complete"><span>READY TO CLEAR?</span><h3>确认你已经完成本关学习任务</h3><button onClick={onComplete}><Sparkles size={17}/>{label}并领取奖励</button></div>;
}

function VictoryOverlay({ level, onContinue, onMap, onSeedance }: { level: number; onContinue: () => void; onMap: () => void; onSeedance: () => void }) {
  const rewards = ["阅读证据徽章", "线索侦探徽章", "独立写作者徽章", "范文观察者徽章", "故事分享者徽章"];
  const hasNext = level < stages.length - 1;
  return <div className="victory-overlay" role="dialog" aria-modal="true"><div className="victory-confetti" aria-hidden="true">{Array.from({length:18},(_,index)=><i key={index}/>)}</div><section className="victory-card retro-window"><div className="retro-titlebar"><span>Victory.exe</span><div><i>×</i></div></div><span className="victory-label">VICTORY!</span><div className="victory-avatars"><img src={pixelCompanionBlackCutout} alt="正在跳舞庆祝的像素学习搭档一"/><b>★</b><img src={pixelCompanionPinkCutout} alt="正在跳舞庆祝的像素学习搭档二"/></div><p>LEVEL {level + 1} CLEARED</p><h2>{rewards[level]}已解锁</h2><small>{hasNext ? `下一关「${stages[level + 1]}」现在可以进入。` : "全部关卡完成，故事旅程圆满通关！"}</small>{level === 2 && <div className="seedance-reward"><Sparkles/><div><b>BONUS REWARD</b><strong>Seedance 故事动画工坊已解锁</strong><span>把你的续写变成一段有镜头、有动作的故事视频。</span></div><button onClick={onSeedance}>立即领取</button></div>}<div className="victory-actions"><button className="victory-primary" onClick={onContinue}>{hasNext ? <>进入下一关 <ArrowRight size={18}/></> : "完成全部旅程"}</button><button onClick={onMap}>返回关卡地图</button></div></section></div>;
}

function TeacherWorkspace({ onSwitchRole, onOpenCorpus, corpusOpen, closeCorpus, draft }: { onSwitchRole: () => void; onOpenCorpus: () => void; corpusOpen: boolean; closeCorpus: () => void; draft: StudentDraft | null }) {
  const [activePanel, setActivePanel] = useState<"assessment" | "review" | "progress" | "gallery" | null>(null);
  const [galleryDecision, setGalleryDecision] = useState<"recommended" | "returned" | null>(null);
  const [teacherFeedback, setTeacherFeedback] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  return <div className="teacher-app">
    <header className="teacher-header"><div className="brand"><span>Story</span>Forge<small>教师工作台</small></div><nav><button onClick={onOpenCorpus}><Database size={17}/>班级语料库</button><button className="role-switch role-switch--student" onClick={onSwitchRole}><Users size={17}/>切换学生端</button></nav></header>
    <main className="teacher-workspace">
      <section className="teacher-hero"><div><span>CLASSROOM MANAGEMENT</span><h1>Teacher<br/>Workspace</h1><p>在这里管理班级语料、写作反馈与学习进度，清楚掌握每一项课堂任务。</p></div><div className="teacher-summary"><div><strong>34</strong><span>班级学生</span></div><div><strong>07</strong><span>待审核表达</span></div><div><strong>12</strong><span>待评价作品</span></div></div></section>
      <section className="teacher-grid">
        <article><span><Database/>01</span><h2>语料审核</h2><p>审核学生自主投稿与AI提取的候选表达，确认语境、准确性和迁移价值。</p><button onClick={onOpenCorpus}>打开审核区 <ArrowRight size={16}/></button></article>
        <article><span><ClipboardCheck/>02</span><h2>评价校准</h2><p>区分AI语言检查、学生自评、同伴反馈与教师高阶评价的职责。</p><button onClick={() => setActivePanel("assessment")}>查看评价流程 <ArrowRight size={16}/></button></article>
        <article><span><Users/>03</span><h2>学习进度</h2><p>关注学生是否完成阅读、线索推理、自主续写、修改与作品分享。</p><button onClick={() => setActivePanel("progress")}>查看班级进度 <ArrowRight size={16}/></button></article>
      </section>
      <section className="teacher-review"><header><div><span>REVIEW QUEUE</span><h2>今日待处理</h2></div><small>点击记录进入对应审核环节</small></header><div><button onClick={onOpenCorpus}><b>语料候选</b><span>“Her heart pounding, she took a hesitant step...”</span><em>去审核 <ArrowRight size={14}/></em></button><button onClick={() => { setFeedbackSubmitted(false); setActivePanel("review"); }}><b>教师评价</b><span>The Lost Christmas Gifts · Writer 01</span><em>去反馈 <ArrowRight size={14}/></em></button><button onClick={() => { setGalleryDecision(null); setActivePanel("gallery"); }}><b>展廊推荐</b><span>Holes in the Fence · Writer 08</span><em>去确认 <ArrowRight size={14}/></em></button></div></section>
    </main>
    {corpusOpen && <div className="modal-backdrop corpus-backdrop" onMouseDown={closeCorpus}><section className="modal corpus-modal" onMouseDown={event=>event.stopPropagation()}><ExpressionBank onClose={closeCorpus} draft={draft}/></section></div>}
    {activePanel && <div className="modal-backdrop teacher-tool-backdrop" onMouseDown={() => setActivePanel(null)}><section className="teacher-tool-modal" onMouseDown={event => event.stopPropagation()}><header><div><span>{activePanel === "assessment" ? "ASSESSMENT WORKFLOW" : activePanel === "review" ? "TEACHER FEEDBACK" : activePanel === "progress" ? "CLASS PROGRESS" : "GALLERY REVIEW"}</span><h2>{activePanel === "assessment" ? "评价流程" : activePanel === "review" ? "作文评价" : activePanel === "progress" ? "班级学习进度" : "展廊作品确认"}</h2></div><button onClick={() => setActivePanel(null)} aria-label="关闭"><X/></button></header>{activePanel === "assessment" ? <div className="assessment-flow"><article><b>01</b><div><strong>AI语言检查</strong><p>定位拼写、语法与表达问题，并给出修改理由。</p></div></article><article><b>02</b><div><strong>学生审辨</strong><p>判断建议是否必要、是否保留原意，并选择接受、拒绝或重写。</p></div></article><article><b>03</b><div><strong>同伴反馈</strong><p>从情节连贯、人物行为与阅读体验提供具体建议。</p></div></article><article><b>04</b><div><strong>教师评价</strong><p>关注立意、逻辑、语篇质量与后续学习方向。</p></div></article></div> : activePanel === "review" ? <div className="teacher-feedback-form"><FullTeacherSubmission draft={draft}/><div className="feedback-checks"><label><input type="checkbox"/> 情节与原文线索连贯</label><label><input type="checkbox"/> 人物行为符合语境</label><label><input type="checkbox"/> 两段衔接自然完整</label><label><input type="checkbox"/> 语言表达准确得体</label></div><label className="feedback-comment"><span>教师评语</span><textarea value={teacherFeedback} onChange={event => setTeacherFeedback(event.target.value)} placeholder="写下具体、可操作的修改建议……"/></label>{feedbackSubmitted ? <strong className="gallery-review-result">教师评语已提交，学生端将收到修改建议。</strong> : <div className="feedback-actions"><button onClick={() => setTeacherFeedback("")}>清空</button><button disabled={!teacherFeedback.trim()} onClick={() => setFeedbackSubmitted(true)}>提交评语</button></div>}</div> : activePanel === "progress" ? <div className="class-progress"><div><span>语篇理解</span><i><b style={{width:"91%"}}/></i><strong>31 / 34</strong></div><div><span>线索挑战</span><i><b style={{width:"79%"}}/></i><strong>27 / 34</strong></div><div><span>自主续写</span><i><b style={{width:"68%"}}/></i><strong>23 / 34</strong></div><div><span>范文参考</span><i><b style={{width:"53%"}}/></i><strong>18 / 34</strong></div><div><span>匿名展廊</span><i><b style={{width:"35%"}}/></i><strong>12 / 34</strong></div></div> : <div className="gallery-review-panel"><span>WRITER 08 · HOLES IN THE FENCE</span><blockquote>“Looking at the small holes left in the fence, Matt finally understood that angry words could leave marks even after an apology.”</blockquote><p>确认作品是否逻辑连贯、表达得体，并适合作为班级互评范例。</p>{galleryDecision ? <strong className="gallery-review-result">{galleryDecision === "recommended" ? "已推荐至匿名展廊" : "已退回修改，并保留教师建议"}</strong> : <div><button onClick={() => setGalleryDecision("returned")}>退回修改</button><button onClick={() => setGalleryDecision("recommended")}>确认推荐</button></div>}</div>}</section></div>}
  </div>;
}

function FullTeacherSubmission({ draft }: { draft: StudentDraft | null }) {
  const fallback = `As Carlile drove towards the meeting point, he couldn't help but think about the incident. Earlier that day, he had placed the bag of Christmas gifts beside the other luggage, believing that everything had been loaded safely. Only after arriving home did he realize that the most important bag was missing. His grandchildren's expectant faces came into his mind, filling him with guilt. When the WSDOT office called, worry finally gave way to hope. He drove through the cold night as quickly and carefully as he could, praying that the gifts in the workers' office were really his.\n\nFinally, when Carlile pulled into the WSDOT parking lot, he saw two men waiting beside a familiar-looking bag. He hurried forward and correctly named the children written on the gift tags. Kane opened the bag, and the sight of the carefully wrapped shoes and toys brought tears to Carlile's eyes. He thanked the two workers again and again, promising to secure every bag before his next journey. Watching him drive away, Kane and Ramey smiled. The winter night was still cold, but their kindness had made Christmas Eve feel warm and bright.`;
  const content = draft?.status === "submitted" && draft.content.trim() ? draft.content.trim() : fallback;
  const paragraphs = content.split(/\n\s*\n/).filter(Boolean);
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  return <div className="feedback-submission"><header><span>WRITER 01 · THE LOST CHRISTMAS GIFTS</span><strong>{wordCount} words · {draft?.status === "submitted" ? "学生提交稿" : "完整示例稿"}</strong></header><article>{paragraphs.map((paragraph,index)=><section key={`${index}-${paragraph.slice(0,12)}`}><b>Paragraph {index+1}</b><p>{paragraph}</p></section>)}</article></div>;
}

function Reading({story,checked,setChecked,prompt,nextPrompt,awardFlower}:{story:Story;checked:boolean[];setChecked:(v:boolean[])=>void;prompt:string;nextPrompt:()=>void;awardFlower:(id:string)=>boolean}) {
  const clueChecks = [
    ["01", "核心人物", "锁定段首句中的人称，所有行为与情感都围绕主角展开。"],
    ["02", "逻辑链条", "拆解动词、转折与因果，接上前文已经发生的事件。"],
    ["03", "时空细节", "确认时间、地点和事件短语，回应原文的矛盾与情感。"],
  ];
  return <div className="reading-stage"><div className="reading-layout"><article className="passage"><div className="section-title"><BookOpen/><div><span>LEARNING & UNDERSTANDING</span><h3>Close Reading</h3><small>研读语篇：留意人物目标、冲突和反常细节。</small></div></div>{story.paragraphs.map((p,i)=><p key={i}>{p}</p>)}<div className="clue-guide"><div className="clue-guide__intro"><span>THREE ANCHORS</span><strong>先拆段首句，再理解原文</strong><small>用三个维度检查续写是否紧扣原文。</small></div><div className="clue-guide__items">{clueChecks.map(([number,title,description])=><div key={number}><b>{number}</b><div><strong>{title}</strong><p>{description}</p></div></div>)}</div></div></article><aside className="reading-tools"><div className="tool-card"><span>APPLY & PRACTICE</span><h3>What must the continuation keep?</h3><small>难词提示：continuation = 续写；urgent = 紧迫的</small>{story.checks.map((item,i)=><label key={item}><input type="checkbox" checked={checked[i]} onChange={()=>setChecked(checked.map((v,n)=>n===i?!v:v))}/><span>{item}</span></label>)}</div><div className="prompt-card"><Sparkles/><span>TRANSFER & CREATE</span><h3>One guiding question</h3><p>{prompt}</p><button onClick={nextPrompt}>Another question</button></div></aside></div>{story.matching&&<CreativeMatchingGame storyId={story.id} data={story.matching} awardFlower={awardFlower}/>}</div>;
}

function ClueGame({story,awardFlower,onGoToWriting,onComplete}:{story:Story;awardFlower:(id:string)=>boolean;onGoToWriting:()=>void;onComplete:()=>void}) {
  const questions=story.quiz.slice(0,3);
  const levels=["情境线索","因果推理","关键转折"];
  const writingTips=["找出续写中必须回应的原文细节。","沿着原文因果关系安排后续行动。","让关键事件推动人物判断和情感变化。"];
  const [questionIndex,setQuestionIndex]=useState(0);
  const [choice,setChoice]=useState<number|null>(null);
  const [wrongChoice,setWrongChoice]=useState<number|null>(null);
  const [finished,setFinished]=useState(false);
  const question=questions[questionIndex];
  const choose=(index:number)=>{if(choice!==null)return;if(index===question.answer){setChoice(index);setWrongChoice(null)}else{setWrongChoice(index)}};
  const next=()=>{if(questionIndex===questions.length-1){awardFlower(`clue-challenge-${story.id}`);setFinished(true);onComplete();return}setQuestionIndex(v=>v+1);setChoice(null);setWrongChoice(null)};
  const restart=()=>{setQuestionIndex(0);setChoice(null);setWrongChoice(null);setFinished(false)};
  if(finished)return <div className="game-finish"><div className="star-burst">✿</div><span>CLUE CHALLENGE COMPLETE</span><h3>三条续写线索已解锁</h3><div className="clue-discoveries"><p><Check size={17}/>关键线索：回应原文的重要细节</p><p><Check size={17}/>合理转折：让情节自然向前发展</p><p><Check size={17}/>人物情感：用具体描写呈现变化</p></div><p>整组挑战完成，小红花已存入奖励账户。</p><div className="game-finish__actions"><button onClick={restart}>重新挑战</button><button className="dark-button" onClick={onGoToWriting}>带着提示去写作 <ArrowRight size={17}/></button></div></div>;
  return <div className="clue-game"><div className="game-top"><div><span>CLUE DETECTIVE · 续写推理</span><h3>{levels[questionIndex]}</h3><p>第 {questionIndex+1} 关，共 {questions.length} 关</p></div><div className="challenge-count"><strong>{questionIndex+1}</strong><span>/ {questions.length}</span></div></div><div className="game-progress"><b style={{width:`${((questionIndex+1)/questions.length)*100}%`}}/></div><p className="question-number">{levels[questionIndex]} · THINK FOR WRITING</p><h4>{question.question}</h4><div className="game-options">{question.options.map((option,index)=><button key={option} disabled={choice!==null} className={index===choice?"correct":index===wrongChoice?"wrong":""} onClick={()=>choose(index)}><span>{String.fromCharCode(65+index)}</span>{option}{index===choice&&<Check size={18}/>}</button>)}</div>{wrongChoice!==null&&choice===null&&<div className="game-feedback try"><strong>这个选项还不能最好地支持续写</strong><p>回到原文的人物、时间和因果关系，再选择一次。</p></div>}{choice!==null&&<div className="game-feedback good"><div><strong>推理成立，可以用于续写</strong><p>{question.explanation}</p><small>写作迁移：{writingTips[questionIndex]}</small></div><button onClick={next}>{questionIndex===questions.length-1?"完成挑战":"下一关"}<ArrowRight size={16}/></button></div>}</div>;
}
