import { Volume2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type DictionaryEntry = { word: string; phonetic?: string; phonetics?: { text?: string; audio?: string }[]; meanings?: { partOfSpeech: string; definitions: { definition: string; example?: string }[] }[] };

const globalLookup = () => {
  if (typeof document === "undefined" || (window as Window & { __storyforgeLookup?: boolean }).__storyforgeLookup) return;
  (window as Window & { __storyforgeLookup?: boolean }).__storyforgeLookup = true;
  let popup: HTMLDivElement | null = null;
  const close = () => { popup?.remove(); popup = null; };
  document.addEventListener("click", async event => {
    const target = event.target as HTMLElement;
    const passage = target.closest(".passage") as HTMLElement | null;
    if (!passage || target.closest("button, textarea, input, .word-lookup-popover")) { if (!target.closest(".word-lookup-popover")) close(); return; }
    const point = event as MouseEvent;
    const range = document.caretRangeFromPoint?.(point.clientX, point.clientY);
    const position = document.caretPositionFromPoint?.(point.clientX, point.clientY);
    const node = range?.startContainer || position?.offsetNode;
    if (!node || node.nodeType !== Node.TEXT_NODE) return;
    const value = node.textContent || ""; const offset = range?.startOffset ?? position?.offset ?? 0; const match = value.slice(0, offset).match(/[A-Za-z][A-Za-z'-]*$/); const tail = value.slice(offset).match(/^[A-Za-z][A-Za-z'-]*/); const word = `${match?.[0] || ""}${tail?.[0] || ""}`.replace(/[’']/g, "");
    if (word.length < 2) return;
    close(); popup = document.createElement("div"); popup.className = "word-lookup-popover word-lookup-global"; popup.textContent = "正在查词…"; document.body.appendChild(popup); popup.style.left = `${Math.min(point.clientX + 10, window.innerWidth - 330)}px`; popup.style.top = `${Math.min(point.clientY + 12, window.innerHeight - 220)}px`;
    try { const response = await fetch(`/api/dictionary/${encodeURIComponent(word.toLowerCase())}`); if (!response.ok) throw new Error("暂时查不到这个词。"); const data = await response.json() as DictionaryEntry[]; const item = data[0]; popup.innerHTML = `<button class="word-lookup-global-close">×</button><div class="word-lookup-head"><strong>${item.word}</strong><small>${item.phonetic || item.phonetics?.find(value => value.text)?.text || ""}</small></div>${item.meanings?.slice(0, 2).map(meaning => `<div class="word-lookup-meaning"><b>${meaning.partOfSpeech}</b><p>${meaning.definitions[0]?.definition || ""}</p></div>`).join("") || ""}`; popup.querySelector("button")?.addEventListener("click", close); } catch (error) { if (popup) popup.innerHTML = `<button class="word-lookup-global-close">×</button><p class="word-lookup-error">${error instanceof Error ? error.message : "查词失败，请稍后再试。"}</p>`; popup.querySelector("button")?.addEventListener("click", close); }
  });
};
globalLookup();

export default function WordLookupText({ text }: { text: string }) {
  const [selected, setSelected] = useState(""); const [entry, setEntry] = useState<DictionaryEntry | null>(null); const [loading, setLoading] = useState(false); const [error, setError] = useState(""); const cache = useRef<Record<string, DictionaryEntry>>({});
  const lookup = async (word: string) => { const normalized = word.toLowerCase(); setSelected(normalized); setError(""); if (cache.current[normalized]) { setEntry(cache.current[normalized]); return; } setLoading(true); setEntry(null); try { const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(normalized)}`); if (!response.ok) throw new Error("暂时查不到这个词。"); const data = await response.json() as DictionaryEntry[]; cache.current[normalized] = data[0]; setEntry(data[0]); } catch (cause) { setError(cause instanceof Error ? cause.message : "查词失败，请稍后再试。"); } finally { setLoading(false); } };
  useEffect(() => { const close = () => { setSelected(""); setEntry(null); setError(""); }; document.addEventListener("click", close); return () => document.removeEventListener("click", close); }, []);
  return <>{text.split(/(\b[A-Za-z][A-Za-z'-]*\b)/g).map((part, index) => /^[A-Za-z]/.test(part) ? <span key={`${part}-${index}`} className="lookup-word" onClick={event => { event.stopPropagation(); lookup(part.replace(/[’']/g, "")); }}>{part}</span> : part)}{selected && <aside className="word-lookup-popover" onClick={event => event.stopPropagation()}><button className="word-lookup-close" onClick={() => { setSelected(""); setEntry(null); }}><X size={15}/></button>{loading ? <p>正在查词…</p> : error ? <p className="word-lookup-error">{error}</p> : entry ? <><div className="word-lookup-head"><strong>{entry.word}</strong><small>{entry.phonetic || entry.phonetics?.find(item => item.text)?.text}</small>{entry.phonetics?.find(item => item.audio)?.audio && <button onClick={() => new Audio(entry.phonetics?.find(item => item.audio)?.audio).play()} aria-label="播放发音"><Volume2 size={16}/></button>}</div>{entry.meanings?.slice(0, 2).map(meaning => <div className="word-lookup-meaning" key={meaning.partOfSpeech}><b>{meaning.partOfSpeech}</b><p>{meaning.definitions[0]?.definition}</p>{meaning.definitions[0]?.example && <small>{meaning.definitions[0].example}</small>}</div>)}</> : null}</aside>}</>;
}
