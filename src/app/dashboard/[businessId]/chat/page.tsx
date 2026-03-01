"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useBusinessContext } from "@/components/dashboard/BusinessProvider";
import { T, CTA_GRAD, glassCard } from "@/lib/design-tokens";

interface Message {
  role: "user" | "assistant";
  content: string;
}

/* -- Lightweight markdown renderer for coach messages -- */
function FormattedMessage({ content }: { content: string }) {
  // Process inline formatting: **bold**, *italic*, `code`, [links](url)
  function inlineFormat(text: string): React.ReactNode[] {
    const parts: React.ReactNode[] = [];
    // Regex order matters — **bold** before *italic*
    const re = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[(.+?)\]\((.+?)\))/g;
    let lastIdx = 0;
    let match;
    let key = 0;

    while ((match = re.exec(text)) !== null) {
      if (match.index > lastIdx) {
        parts.push(text.slice(lastIdx, match.index));
      }
      if (match[2]) {
        // **bold**
        parts.push(<strong key={key++} style={{ color: T.text, fontWeight: 600 }}>{match[2]}</strong>);
      } else if (match[3]) {
        // *italic*
        parts.push(<em key={key++}>{match[3]}</em>);
      } else if (match[4]) {
        // `code`
        parts.push(
          <code key={key++} style={{ background: "rgba(255,255,255,0.06)", padding: "1px 5px", borderRadius: 4, fontSize: "0.85em", fontFamily: T.mono }}>
            {match[4]}
          </code>
        );
      } else if (match[5] && match[6]) {
        // [link](url)
        parts.push(
          <a key={key++} href={match[6]} target="_blank" rel="noopener noreferrer" style={{ color: T.purpleLight, textDecoration: "underline" }}>
            {match[5]}
          </a>
        );
      }
      lastIdx = match.index + match[0].length;
    }
    if (lastIdx < text.length) {
      parts.push(text.slice(lastIdx));
    }
    return parts.length > 0 ? parts : [text];
  }

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Headers: ## or ###
    if (/^#{1,3}\s/.test(line)) {
      const level = (line.match(/^#+/) || [""])[0].length;
      const text = line.replace(/^#+\s*/, "");
      const style: React.CSSProperties = {
        color: T.text,
        fontWeight: 700,
        fontSize: level === 1 ? "1.1em" : level === 2 ? "1em" : "0.95em",
        marginTop: i > 0 ? 12 : 0,
        marginBottom: 4,
      };
      elements.push(<div key={i} style={style}>{inlineFormat(text)}</div>);
      i++;
      continue;
    }

    // Unordered list: collect consecutive - or * lines
    if (/^[-\u2022]\s/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^[-\u2022]\s/.test(lines[i])) {
        items.push(<li key={i} style={{ marginBottom: 2 }}>{inlineFormat(lines[i].replace(/^[-\u2022]\s*/, ""))}</li>);
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} style={{ margin: "6px 0", paddingLeft: 20, listStyleType: "disc" }}>
          {items}
        </ul>
      );
      continue;
    }

    // Ordered list: collect consecutive 1. 2. lines
    if (/^\d+[.)]\s/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\d+[.)]\s/.test(lines[i])) {
        items.push(<li key={i} style={{ marginBottom: 2 }}>{inlineFormat(lines[i].replace(/^\d+[.)]\s*/, ""))}</li>);
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} style={{ margin: "6px 0", paddingLeft: 20, listStyleType: "decimal" }}>
          {items}
        </ol>
      );
      continue;
    }

    // Empty line -> spacer
    if (!line.trim()) {
      elements.push(<div key={i} style={{ height: 8 }} />);
      i++;
      continue;
    }

    // Regular paragraph line
    elements.push(<div key={i}>{inlineFormat(line)}</div>);
    i++;
  }

  return <>{elements}</>;
}

export default function ChatPage() {
  const { business } = useBusinessContext();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autoSentRef = useRef(false);

  const coachName =
    business?.coach_name || "AI Coach";

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim() || !business) return;

    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setStreaming(true);

    // Add placeholder for assistant response
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: business.id,
          message: userMessage,
        }),
      });

      if (res.status === 429) {
        const data = await res.json();
        setError(data.message);
        setMessages((prev) => prev.slice(0, -1));
        setStreaming(false);
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No reader");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);

          if (data === "[DONE]") break;

          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last && last.role === "assistant") {
                  updated[updated.length - 1] = {
                    ...last,
                    content: last.content + parsed.text,
                  };
                }
                return updated;
              });
            }
          } catch {
            // Skip malformed chunks
          }
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && !last.content) {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setStreaming(false);
      inputRef.current?.focus();
    }
  }, [business]);

  // Load chat history on mount
  useEffect(() => {
    if (!business) return;

    async function loadHistory() {
      try {
        const res = await fetch(
          `/api/chat/history?businessId=${business!.id}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.messages?.length > 0) {
            setMessages(data.messages);
          }
        }
      } catch {
        // History load is optional, continue without it
      }
    }
    loadHistory();
  }, [business]);

  // Auto-send message from query param (e.g. from onboarding upsell)
  useEffect(() => {
    if (!business || autoSentRef.current) return;
    const msg = searchParams.get("msg");
    if (msg) {
      autoSentRef.current = true;
      // Small delay to let history load first
      const timer = setTimeout(() => sendMessage(msg), 800);
      return () => clearTimeout(timer);
    }
  }, [business, searchParams, sendMessage]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || streaming) return;
    const userMessage = input.trim();
    setInput("");
    sendMessage(userMessage);
  }

  if (!business) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-8 h-8 rounded-full animate-spin" style={{ border: `2px solid ${T.purple}`, borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="p-4 sm:p-6 shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ background: CTA_GRAD }}
          >
            {coachName.charAt(0)}
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: T.text, fontFamily: T.h }}>{coachName}</h1>
            <p className="text-xs" style={{ color: T.text3 }}>
              Your AI business coach for {business.name}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4"
              style={{ background: CTA_GRAD }}
            >
              {coachName.charAt(0)}
            </div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: T.text, fontFamily: T.h }}>
              Meet {coachName}
            </h2>
            <p className="text-sm max-w-md leading-relaxed" style={{ color: T.text3 }}>
              Your AI business coach knows everything about{" "}
              <strong style={{ color: T.text2 }}>{business.name}</strong> — your
              products, audience, pricing, and launch progress. Ask anything.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {[
                "What should I work on next?",
                "Help me write a cold email",
                "Review my pricing strategy",
                "Create a social media post",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                    inputRef.current?.focus();
                  }}
                  className="px-3 py-2 rounded-lg text-xs transition"
                  style={{
                    color: T.text2,
                    border: `1px solid ${T.border}`,
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
          >
            {msg.role === "assistant" && (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ background: CTA_GRAD }}
              >
                {coachName.charAt(0)}
              </div>
            )}
            <div
              className="max-w-xl rounded-xl px-4 py-3 text-sm leading-relaxed"
              style={
                msg.role === "user"
                  ? {
                      background: "rgba(123,57,252,0.15)",
                      color: T.text,
                      border: "1px solid rgba(123,57,252,0.20)",
                      whiteSpace: "pre-wrap" as const,
                    }
                  : {
                      ...glassCard,
                      color: T.text2,
                    }
              }
            >
              {msg.content ? (
                msg.role === "assistant" ? (
                  <FormattedMessage content={msg.content} />
                ) : (
                  msg.content
                )
              ) : (
                streaming && i === messages.length - 1 ? (
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ backgroundColor: T.text3, animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ backgroundColor: T.text3, animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ backgroundColor: T.text3, animationDelay: "300ms" }}
                    />
                  </div>
                ) : null
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div
          className="mx-4 sm:mx-6 mb-2 p-3 rounded-lg text-sm"
          style={{
            background: "rgba(245,158,11,0.10)",
            border: "1px solid rgba(245,158,11,0.20)",
            color: T.gold,
          }}
        >
          {error}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="p-4 shrink-0"
        style={{ borderTop: `1px solid ${T.border}` }}
      >
        <div className="flex gap-3 max-w-4xl mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask ${coachName} anything...`}
            className="flex-1 px-5 py-3 rounded-xl text-sm focus:outline-none transition"
            style={{
              background: T.glass,
              border: `1px solid ${T.border}`,
              color: T.text,
              backdropFilter: "blur(12px)",
            }}
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            className="px-6 py-3 rounded-xl text-sm font-semibold disabled:opacity-50"
            style={{ background: CTA_GRAD, color: "#fff" }}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
