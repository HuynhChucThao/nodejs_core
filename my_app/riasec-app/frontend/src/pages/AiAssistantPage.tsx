import React, { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, User as UserIcon } from "lucide-react";
import { aiApi } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { ChatMessage } from "../types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AiAssistantPageProps {
  initialContext?: {
    jobName?: string;
    riasecCode?: string;
  };
}

const STARTER_PROMPTS = [
  "I have a RIA personality code, what majors should I study?",
  "What are the required skills to become a Software Engineer?",
  "How can I develop leadership skills in the Enterprising type?",
  "What are the key differences between Realistic (R) and Investigative (I)?",
];

export const AiAssistantPage: React.FC<AiAssistantPageProps> = ({
  initialContext,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial welcome message
    let welcomeText = `Hello ${user?.name || "there"}! I am your RIASEC AI Career Advisor. I can help answer questions about personality types, recommend fields of study, and guide you toward ideal career pathways.`;

    if (initialContext?.jobName) {
      welcomeText = `I see you are interested in **${initialContext.jobName}** (RIASEC Code: ${initialContext.riasecCode || ""}). Would you like to explore learning roadmaps, required skills, or career opportunities for this role?`;
    } else if (initialContext?.riasecCode) {
      welcomeText = `Congratulations on completing the RIASEC assessment with result code **${initialContext.riasecCode}**! I can help you analyze matching career paths and strengths for this personality type.`;
    }

    setMessages([
      {
        id: "welcome",
        sender: "assistant",
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  }, [initialContext, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText.trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputText("");
    setLoading(true);

    try {
      const res = await aiApi.chat(text, {
        userRiasec: initialContext?.riasecCode,
        currentOccupation: initialContext?.jobName,
      });

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: res.reply || "Sorry, I am unable to process your request at the moment.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.warn(
        "Backend AI offline, using smart rule-based guidance fallback:",
        err,
      );
      const fallbackReply = generateSmartFallbackReply(text, initialContext);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "assistant",
          text: fallbackReply,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  function generateSmartFallbackReply(
    query: string,
    ctx?: { jobName?: string; riasecCode?: string },
  ): string {
    const q = query.toLowerCase();
    if (
      q.includes("ria") ||
      (ctx?.riasecCode && ctx.riasecCode.includes("R"))
    ) {
      return `The **RIA (Realistic - Investigative - Artistic)** personality code is a powerful combination of practical engineering aptitude, analytical thinking, and creative problem-solving!\n\n**Top Recommended Career Fields:**\n1. Software Engineer / AI Developer\n2. Architecture & Urban Design\n3. Mechatronics / Robotics Engineer\n4. Digital Product Designer (UI/UX)\n\n**Advice:** Focus on honing both your logical technical foundations and creative design sensibility to build innovative, user-friendly solutions!`;
    }
    if (
      q.includes("engineer") ||
      q.includes("software") ||
      q.includes("tech") ||
      q.includes("kỹ sư")
    ) {
      return `To pursue a career in **Software Engineering / Information Technology**, here is what to prepare:\n- **Core Knowledge:** Programming (JavaScript/TypeScript, Python, Java), Data Structures & Algorithms, Databases (SQL, NoSQL).\n- **Soft Skills:** Problem-solving mindset, continuous learning, and teamwork.\n- **Pathway:** Start by building hands-on projects (Fullstack Web/Mobile Apps) similar to this RIASEC platform!`;
    }
    return `Thank you for your question! Guided by the RIASEC framework, we recommend balancing your natural interests, learning strengths, and current job market demand. Which field would you like to explore deeper?`;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 150px)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          paddingBottom: 12,
          borderBottom: "1px solid var(--border-color)",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--primary-teal), #00C4D4)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "var(--shadow-teal)",
          }}
        >
          <Bot size={22} />
        </div>
        <div>
          <h2
            style={{
              fontSize: "1.1rem",
              fontWeight: 800,
              fontFamily: "var(--font-heading)",
            }}
          >
            AI Career Advisor
          </h2>
          <span
            style={{
              fontSize: "0.75rem",
              color: "#10B981",
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#10B981",
              }}
            />
            Online 24/7
          </span>
        </div>
      </div>

      {/* Suggested prompts if few messages */}
      {messages.length <= 2 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            marginBottom: 12,
          }}
        >
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Sparkles size={12} color="var(--primary-teal)" /> Suggested quick questions:
          </span>
          <div
            style={{
              display: "flex",
              gap: 6,
              overflowX: "auto",
              paddingBottom: 4,
              scrollbarWidth: "none",
            }}
          >
            {STARTER_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                className="filter-chip"
                style={{ fontSize: "0.76rem", padding: "6px 12px" }}
                onClick={() => handleSend(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div
        className="chat-messages"
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <div
              key={msg.id}
              style={{
                display: "flex",
                gap: 8,
                alignSelf: isUser ? "flex-end" : "flex-start",
                maxWidth: "85%",
                flexDirection: isUser ? "row-reverse" : "row",
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: isUser
                    ? "var(--primary-blue)"
                    : "var(--primary-teal)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 4,
                }}
              >
                {isUser ? <UserIcon size={16} /> : <Bot size={16} />}
              </div>

              <div>
                <div
                  className={`message-bubble ${isUser ? "user" : "assistant"}`}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.text}
                  </ReactMarkdown>
                </div>
                <div
                  style={{
                    fontSize: "0.68rem",
                    color: "var(--text-muted)",
                    marginTop: 2,
                    textAlign: isUser ? "right" : "left",
                    padding: "0 4px",
                  }}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div style={{ display: "flex", gap: 8, alignSelf: "flex-start" }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "var(--primary-teal)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Bot size={16} />
            </div>
            <div
              className="message-bubble assistant"
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <span
                className="pulse-dot"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "var(--primary-teal)",
                }}
              />
              <span
                className="pulse-dot"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "var(--primary-teal)",
                  animationDelay: "0.2s",
                }}
              />
              <span
                className="pulse-dot"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "var(--primary-teal)",
                  animationDelay: "0.4s",
                }}
              />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="chat-input-bar">
        <input
          type="text"
          className="chat-input"
          placeholder="Type your career guidance question..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          disabled={loading}
        />
        <button
          className="btn-send"
          onClick={() => handleSend()}
          disabled={!inputText.trim() || loading}
          style={{ opacity: !inputText.trim() || loading ? 0.6 : 1 }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};
