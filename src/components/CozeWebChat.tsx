import { useEffect } from "react";
import { apiUrl } from "../lib/api";

const sdkUrl = "https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.20/libs/cn/index.js";
const botId = "7702454619649884160";

type CozeWebChatClient = {
  destroy?: () => void;
};

type CozeWindow = Window & {
  CozeWebSDK?: {
    WebChatClient: new (options: unknown) => CozeWebChatClient;
  };
};

async function requestToken() {
  const response = await fetch(apiUrl("/api/coze/web-token"));
  const data = await response.json().catch(() => ({}));
  if (!response.ok || typeof data.token !== "string") {
    throw new Error(data.error || "Coze 聊天令牌获取失败。");
  }
  return data.token;
}

function loadSdk() {
  const currentWindow = window as CozeWindow;
  if (currentWindow.CozeWebSDK) return Promise.resolve();
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${sdkUrl}"]`);
  if (existing) {
    return new Promise<void>((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Coze Web SDK 加载失败。")), { once: true });
    });
  }
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = sdkUrl;
    script.async = true;
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("Coze Web SDK 加载失败。")), { once: true });
    document.body.appendChild(script);
  });
}

export default function CozeWebChat() {
  useEffect(() => {
    let cancelled = false;
    let client: CozeWebChatClient | undefined;

    Promise.all([loadSdk(), requestToken()])
      .then(([, token]) => {
        const sdk = (window as CozeWindow).CozeWebSDK;
        if (cancelled || !sdk) return;
        client = new sdk.WebChatClient({
          config: { bot_id: botId },
          componentProps: { title: "读后续写分析专家" },
          auth: {
            type: "token",
            token,
            onRefreshToken: requestToken,
          },
        });
      })
      .catch(error => console.warn("Coze 悬浮智能体暂未启用：", error));

    return () => {
      cancelled = true;
      client?.destroy?.();
    };
  }, []);

  return null;
}
