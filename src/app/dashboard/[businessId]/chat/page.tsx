"use client";

import { useState, useRef, useEffect } from "react";
import { useBusinessContext } from "@/components/dashboard/BusinessProvider";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const { business } = useBusinessContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const coachName =
    business?.coach_name || "AI Coach";
  const primaryColor =
    (business?.brand as { colors?: { primary?: string } })?.colors?.primary ||
    "#6366f1";

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || streaming || !business) return;

    const userMessage = input.trim();
    setInput("");
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
        // Remove the empty assistant placeholder
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
      // Remove empty assistant placeholder if error
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
  }

  if (!business) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, #8b5cf6)` }}
          >
            {coachName.charAt(0)}
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">{coachName}</h1>
            <p className="text-zinc-500 text-xs">
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
              style={{ background: `linear-gradient(135deg, ${primaryColor}, #8b5cf6)` }}
            >
              {coachName.charAt(0)}
            </div>
            <h2 className="text-white text-lg font-semibold mb-2">
              Meet {coachName}
            </h2>
            <p className="text-zinc-500 text-sm max-w-md leading-relaxed">
              Your AI business coach knows everything about{" "}
              <strong className="text-zinc-300">{business.name}</strong> — your
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
                  className="px-3 py-2 rounded-lg text-xs text-zinc-400 border border-white/5 hover:border-white/10 hover:text-zinc-300 transition"
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
                style={{ background: `linear-gradient(135deg, ${primaryColor}, #8b5cf6)` }}
              >
                {coachName.charAt(0)}
              </div>
            )}
            <div
              className={`max-w-xl rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-brand-600/20 text-white border border-brand-600/20"
                  : "bg-surface-light text-zinc-300 border border-white/5"
              }`}
            >
              {msg.content ||
                (streaming && i === messages.length - 1 ? (
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 rounded-full bg-zinc-600 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 rounded-full bg-zinc-600 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 rounded-full bg-zinc-600 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                ) : null)}
            </div>
          </div>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-4 sm:mx-6 mb-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
          {error}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="p-4 border-t border-white/5 shrink-0"
      >
        <div className="flex gap-3 max-w-4xl mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask ${coachName} anything...`}
            className="flex-1 px-5 py-3 rounded-xl bg-surface-light border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500 transition placeholder-zinc-600"
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            className="btn-primary px-6 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
