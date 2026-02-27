"use client";

import { useState } from "react";

interface Message {
  role: "user" | "ai";
  text: string;
}

const INITIAL_MESSAGES: Message[] = [
  { role: "ai", text: "Hey Ron! I'm your AI business manager. I've been keeping an eye on things. A few updates:\n\n• Your blog post \"5 Tips for First-Time Sellers\" is getting great traction — 1,247 views this week.\n• I noticed a competitor dropped their prices by 15%. Want me to analyze whether we should adjust?\n• Your TikTok ad is performing well with a 2.8x ROAS.\n\nWhat would you like to work on?" },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Great question! Based on your current data, I'd recommend focusing on SEO content this week. Your organic traffic is growing 18% month-over-month, and I've identified 3 new keyword opportunities that could boost it further.",
        "I've analyzed the competitor's pricing strategy. Their 15% drop seems like a short-term promotion, not a permanent change. I'd recommend holding your prices steady and instead running a value-focused ad highlighting your unique benefits.",
        "Looking at your ad performance, TikTok is outperforming Meta on impressions but Meta has a higher conversion rate. I'd suggest shifting 20% of your TikTok budget to Meta retargeting campaigns for better ROI.",
        "Your store's conversion rate has been climbing steadily. The product page redesign I suggested last week seems to be working. I'll generate a detailed A/B test report by tomorrow.",
      ];
      const aiReply = responses[Math.floor(Math.random() * responses.length)];
      setMessages((prev) => [...prev, { role: "ai", text: aiReply }]);
      setLoading(false);
    }, 1500);
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="p-6 border-b border-white/5">
        <h1 className="text-xl font-bold text-white">AI Business Manager</h1>
        <p className="text-zinc-500 text-sm">Chat with your AI to manage content, ads, analytics, and strategy.</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "ai" && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                AI
              </div>
            )}
            <div className={`max-w-xl rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === "user"
                ? "bg-brand-600/20 text-white border border-brand-600/20"
                : "bg-surface-light text-zinc-300 border border-white/5"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              AI
            </div>
            <div className="bg-surface-light border border-white/5 rounded-xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-white/5">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your AI business manager anything..."
            className="flex-1 px-5 py-3 rounded-xl bg-surface-light border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500 transition placeholder-zinc-600"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn-primary px-6 py-3 rounded-xl text-sm font-semibold text-white"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
