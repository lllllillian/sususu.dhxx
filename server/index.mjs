import http from "node:http";
import { spawn } from "node:child_process";

const port = Number(process.env.PORT || process.env.API_PORT || 3001);
const baseUrl = (process.env.ARK_API_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3").replace(/\/$/, "");
const model = process.env.ARK_VIDEO_MODEL || "doubao-seedance-2-5-260628";
const ocrModel = process.env.ARK_OCR_MODEL || "doubao-seed-1-6-vision-250815";
const writingModel = process.env.ARK_WRITING_MODEL || "doubao-pro-32k-240615";
const tasks = new Map();
const fallbackWords = Object.fromEntries([
  ["disappointment", "失望"], ["anxiously", "焦虑地"], ["restore", "修复；恢复"], ["christmas", "圣诞节"], ["approached", "靠近；接近"], ["contents", "里面的东西；内容物"], ["revealing", "揭示；显露"], ["routine", "日常的；例行的"], ["inspection", "检查；视察"], ["maintenance", "维护；养护"], ["shoulder", "（道路）路肩"], ["spilled", "洒出；溢出"], ["wrapping", "包装纸；包装"], ["carefully", "小心地"], ["headquarters", "总部"], ["reports", "报告"], ["detailed", "详细的"], ["security", "安全；保密"], ["inquiries", "询问；查询"], ["crucial", "至关重要的"], ["grandchildren", "孙子女"], ["gifts", "礼物"]
].map(([word, chinese]) => [word, { word, phonetic: "", meanings: [{ partOfSpeech: "词义", definitions: [{ definition: chinese }] }] }]));

function json(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  response.end(JSON.stringify(body));
}

async function readBody(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 12_000_000) throw new Error("上传图片过大，请拍摄或选择更小的图片。");
  }
  return body ? JSON.parse(body) : {};
}

async function ark(path, options = {}) {
  if (!process.env.ARK_API_KEY) throw new Error("ARK_API_KEY 未配置，请在服务端 .env 中设置。");
  const url = `${baseUrl}${path}`;
  const headers = { Authorization: `Bearer ${process.env.ARK_API_KEY}`, "Content-Type": "application/json", ...(options.headers || {}) };
  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.error?.message || data?.message || `火山方舟请求失败（${response.status}）`);
    return data;
  } catch (error) {
    if (!(error instanceof TypeError) || process.platform !== "win32") throw error;
    return arkViaPowerShell(url, options.method || "GET", headers, options.body || "");
  }
}

function arkViaPowerShell(url, method, headers, body) {
  const script = "$request=[Console]::In.ReadToEnd()|ConvertFrom-Json;$headers=@{};$request.headers.psobject.Properties|ForEach-Object{$headers[$_.Name]=$_.Value};try{$response=Invoke-WebRequest -Uri $request.url -Method $request.method -Headers $headers -ContentType 'application/json' -Body $request.body -TimeoutSec 90 -SkipHttpErrorCheck;[Console]::Out.Write(($response.StatusCode.ToString()+[Environment]::NewLine+$response.Content))}catch{[Console]::Error.Write($_.Exception.Message);exit 1}";
  return new Promise((resolve, reject) => {
    const child = spawn("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", script], { windowsHide: true });
    let stdout = ""; let stderr = "";
    child.stdout.on("data", chunk => stdout += chunk);
    child.stderr.on("data", chunk => stderr += chunk);
    child.on("error", reject);
    child.on("close", code => {
      if (code !== 0) return reject(new Error(stderr || "无法连接火山方舟服务。"));
      const separator = stdout.indexOf("\n");
      const status = Number(stdout.slice(0, separator).trim());
      const data = JSON.parse(stdout.slice(separator + 1) || "{}");
      if (status < 200 || status >= 300) return reject(new Error(data?.error?.message || data?.message || `火山方舟请求失败（${status}）`));
      resolve(data);
    });
    child.stdin.end(JSON.stringify({ url, method, headers, body }));
  });
}

function normalizeTask(data) {
  return data?.id || data?.task_id || data?.taskId || data?.data?.id;
}

function normalizeStatus(data) {
  const status = data?.status || data?.data?.status || data?.task_status || "queued";
  const phase = typeof status === "string" ? status.toLowerCase() : String(status?.phase || status?.status || "queued").toLowerCase();
  const videoUrl = data?.content?.video_url || data?.content?.videoUrl || data?.data?.content?.video_url || data?.video_url || data?.output?.video_url;
  return { phase, videoUrl, raw: data };
}

function normalizeResponseText(data) {
  if (typeof data?.output_text === "string") return data.output_text;
  const blocks = Array.isArray(data?.output) ? data.output.flatMap(item => item?.content || []) : [];
  return blocks.map(item => item?.text || item?.output_text || "").filter(Boolean).join("\n");
}

function parseJsonText(text) {
  const cleaned = text.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
  return JSON.parse(cleaned);
}

function localLanguageReview(content) {
  const rules = [
    { pattern: /\b(Yesterday|Last\s+(?:night|week|Christmas)|Then|Finally),?([^.!?]*?)\b(drive|go|come|see|find|say|tell|think|feel|give|take|run|begin)\b/gi, type: "时态", replace: match => match.replace(/\bdrive\b/i,"drove").replace(/\bgo\b/i,"went").replace(/\bcome\b/i,"came").replace(/\bsee\b/i,"saw").replace(/\bfind\b/i,"found").replace(/\bsay\b/i,"said").replace(/\btell\b/i,"told").replace(/\bthink\b/i,"thought").replace(/\bfeel\b/i,"felt").replace(/\bgive\b/i,"gave").replace(/\btake\b/i,"took").replace(/\brun\b/i,"ran").replace(/\bbegin\b/i,"began"), reason: "故事叙述发生在过去，动词应使用一般过去时。" },
    { pattern: /\b(he|she|it|Carlile|Jack|Matt)\s+(were|have|do)\b/gi, type: "语法", replace: match => match.replace(/\bwere\b/i,"was").replace(/\bhave\b/i,"has").replace(/\bdo\b/i,"does"), reason: "第三人称单数需要与谓语动词保持一致。" },
    { pattern: /\b(the\s+gifts|they|we|the\s+workers)\s+was\b/gi, type: "语法", replace: match => match.replace(/\bwas\b/i,"were"), reason: "复数主语应搭配 were。" },
    { pattern: /\b(very|so|felt|was|were)\s+worry\b/gi, type: "用词", replace: match => match.replace(/\bworry\b/i,"worried"), reason: "这里需要形容词 worried 表示人物感到担心。" },
    { pattern: /\bcouldn't\s+help\s+but\s+(\w+ing)\b/gi, type: "语法", replace: match => match.replace(/ing\b/i,""), reason: "couldn't help but 后接动词原形。" },
    { pattern: /\brecieve\b/gi, type: "拼写", replace: () => "receive", reason: "receive 的正确拼写遵循 ei 结构。" },
  ];
  const issues = [];
  let corrected = content;
  for (const rule of rules) {
    corrected = corrected.replace(rule.pattern, match => {
      const suggestion = rule.replace(match);
      if (suggestion !== match && issues.length < 8) issues.push({ type: rule.type, original: match, suggestion, reason_zh: rule.reason });
      return suggestion;
    });
  }
  return { summary_zh: issues.length ? "AI 服务暂不可用，已使用本地语言规则完成基础检查；请重点核对以下位置。" : "AI 服务暂不可用，本地基础检查未发现明显错误，仍建议由教师进一步确认。", issues, corrected_text: corrected, fallback: true };
}

function localExpressionExtraction(content) {
  const sentences = content.match(/[^.!?]+[.!?]+/g)?.map(item => item.trim()) || [];
  const candidates = [];
  const patterns = [
    /\b(?:couldn't help but|could not help but)\s+[^,.!?]+/gi,
    /\b(?:at that moment|to one's relief|with a sense of|burst into tears|take a deep breath|come to one's rescue|without hesitation)\b/gi,
    /\b(?:his|her|their)\s+(?:heart|eyes|face|hands?)\s+[^,.!?]+/gi,
  ];
  for (const pattern of patterns) for (const match of content.matchAll(pattern)) candidates.push({ category: "phrase", expression: match[0].trim(), translationZh: "适合描写人物动作或情感的表达", example: sentences.find(sentence => sentence.includes(match[0])) || match[0] });
  for (const sentence of sentences.filter(item => item.split(/\s+/).length >= 10).sort((a,b)=>b.length-a.length).slice(0,3)) candidates.push({ category: "sentence", expression: sentence, translationZh: "结构完整、具有续写表达价值的句子", example: sentence });
  const unique = [...new Map(candidates.map(item => [item.expression.toLowerCase(), item])).values()].slice(0,5);
  return { summary_zh: unique.length ? "已从作文中提取可复用的表达，请确认后加入班级语料库。" : "暂未发现适合独立收录的表达，可以尝试增加动作、情感或环境描写。", expressions: unique, fallback: true };
}

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === "OPTIONS") return json(response, 204, {});
    if (request.method === "GET" && request.url === "/health") return json(response, 200, { status: "ok", service: "storyforge-api" });
    if (request.method === "POST" && request.url === "/api/writing/ocr") {
      const body = await readBody(request);
      const image = String(body.image || "");
      if (!/^data:image\/(jpeg|png|webp);base64,/.test(image)) return json(response, 400, { error: "请上传 JPG、PNG 或 WebP 图片。" });
      const result = await ark("/responses", { method: "POST", body: JSON.stringify({
        model: ocrModel,
        input: [{ role: "user", content: [
          { type: "input_text", text: "Transcribe only the student's handwritten or printed English continuation from this photo. Preserve paragraph breaks, capitalization, punctuation, and original spelling. Ignore page headers, printed instructions, scores, teacher comments, crossed-out words, and unrelated objects. Do not correct, translate, explain, or add markdown. If no English essay is visible, return exactly: NO_ESSAY_FOUND" },
          { type: "input_image", image_url: image },
        ] }],
      }) });
      const text = normalizeResponseText(result).trim();
      if (!text || text === "NO_ESSAY_FOUND") return json(response, 422, { error: "没有识别到清晰的英文作文，请重新拍摄。" });
      return json(response, 200, { text });
    }
    if (request.method === "POST" && request.url === "/api/writing/language-review") {
      const body = await readBody(request);
      const content = String(body.content || "").trim();
      if (content.length < 40) return json(response, 400, { error: "作文内容太短，暂时无法进行语言检查。" });
      try {
        const result = await ark("/chat/completions", { method: "POST", body: JSON.stringify({
          model: writingModel,
          messages: [{ role: "user", content: `You are a supportive English writing tutor for Chinese senior-high students. Review the continuation below only for tense, grammar, word usage, spelling, and punctuation. Preserve the student's plot, voice, paragraph structure, and intended meaning. Do not rewrite for style unless needed to fix an error. Return strict JSON only with this schema: {"summary_zh":"one short Chinese summary","issues":[{"type":"时态|语法|用词|拼写|标点","original":"exact short excerpt","suggestion":"corrected excerpt","reason_zh":"concise Chinese explanation"}],"corrected_text":"the full minimally corrected essay"}. Return at most 8 important issues. If there are no clear errors, return an empty issues array and keep corrected_text unchanged.\n\nSTUDENT ESSAY:\n${content}` }],
          temperature: 0.1,
        }) });
        const review = parseJsonText(result?.choices?.[0]?.message?.content || "");
        if (!Array.isArray(review?.issues) || typeof review?.corrected_text !== "string") throw new Error("AI 返回的检查结果格式不正确，请重试。");
        return json(response, 200, review);
      } catch (error) {
        console.error("AI language review unavailable:", error instanceof Error ? error.message : error);
        return json(response, 200, localLanguageReview(content));
      }
    }
    if (request.method === "POST" && request.url === "/api/writing/extract-expressions") {
      const body = await readBody(request);
      const content = String(body.content || "").trim();
      if (content.length < 40) return json(response, 400, { error: "作文内容太短，暂时无法提取表达。" });
      try {
        const result = await ark("/chat/completions", { method: "POST", body: JSON.stringify({ model: writingModel, messages: [{ role: "user", content: `Extract 3-5 genuinely reusable English expressions from this Chinese senior-high student's continuation. Prefer vivid action, emotion, setting, transition, or complete sentence patterns. Do not select erroneous language. Return strict JSON only: {"summary_zh":"short Chinese summary","expressions":[{"category":"word|phrase|sentence","expression":"exact expression","translationZh":"concise Chinese meaning or function","example":"exact sentence from the essay containing it"}]}.\n\nESSAY:\n${content}` }], temperature: 0.1 }) });
        const extraction = parseJsonText(result?.choices?.[0]?.message?.content || "");
        if (!Array.isArray(extraction?.expressions)) throw new Error("AI 返回格式不正确。");
        return json(response, 200, extraction);
      } catch (error) {
        console.error("AI expression extraction unavailable:", error instanceof Error ? error.message : error);
        return json(response, 200, localExpressionExtraction(content));
      }
    }
    if (request.method === "POST" && request.url === "/api/video/generate") {
      const body = await readBody(request);
      const prompt = String(body.prompt || "").trim();
      if (!prompt) return json(response, 400, { error: "请输入视频提示词。" });
      const result = await ark("/contents/generations/tasks", { method: "POST", body: JSON.stringify({ model, content: [{ type: "text", text: prompt }] }) });
      const taskId = normalizeTask(result);
      if (!taskId) throw new Error("火山方舟没有返回 task_id。");
      tasks.set(taskId, { createdAt: Date.now() });
      return json(response, 202, { task_id: taskId, status: "queued" });
    }
    const dictionaryMatch = request.url?.match(/^\/api\/dictionary\/([^/?]+)$/);
    if (request.method === "GET" && dictionaryMatch) {
      const word = decodeURIComponent(dictionaryMatch[1]).toLowerCase();
      try { const dictionaryResponse = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`); if (!dictionaryResponse.ok) throw new Error("not found"); return json(response, 200, await dictionaryResponse.json()); } catch { return fallbackWords[word] ? json(response, 200, [fallbackWords[word]]) : json(response, 404, { error: "暂时查不到这个词，请检查网络后重试。" }); }
    }
    const match = request.url?.match(/^\/api\/video\/status\/([^/?]+)$/);
    if (request.method === "GET" && match) {
      const taskId = decodeURIComponent(match[1]);
      const result = await ark(`/contents/generations/tasks/${encodeURIComponent(taskId)}`, { method: "GET" });
      const normalized = normalizeStatus(result);
      return json(response, 200, { task_id: taskId, status: normalized.phase, video_url: normalized.videoUrl || null });
    }
    json(response, 404, { error: "Not found" });
  } catch (error) {
    json(response, 500, { error: error instanceof Error ? error.message : "服务端发生未知错误。" });
  }
});

server.listen(port, "0.0.0.0", () => console.log(`Seedance API server listening on http://localhost:${port}`));
