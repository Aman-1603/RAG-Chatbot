import { useState, useRef, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:5000";

interface Message {
  role: "user" | "bot";
  text: string;
  time: string;
}

function getTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TypewriterText({
  text,
  isLatest,
}: {
  text: string;
  isLatest: boolean;
}) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isLatest) {
      setDisplayed(text);
      setDone(true);
      return;
    }
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setDone(true);
      }
    }, 15); // speed — lower = faster
    return () => clearInterval(interval);
  }, [text, isLatest]);

  return (
    <span>
      {displayed}
      {!done && (
        <span
          style={{
            display: "inline-block",
            width: "2px",
            height: "14px",
            background: "#a78bfa",
            marginLeft: "2px",
            verticalAlign: "middle",
            animation: "pulse 0.8s infinite",
          }}
        />
      )}
    </span>
  );
}

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const uploadPDF = async () => {
    if (!file) return;
    setUploading(true);
    setUploadStatus("indexing");
    setProgress(0);

    // Fake progress bar
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) {
          clearInterval(interval);
          return 90;
        }
        return p + Math.random() * 15;
      });
    }, 400);

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(`${API}/upload`, formData);
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        setUploadStatus("done");
        setProgress(0);
      }, 600);
    } catch {
      clearInterval(interval);
      setUploadStatus("error");
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const askQuestion = async () => {
    if (!question.trim()) return;
    const q = question;
    setMessages((prev) => [
      ...prev,
      { role: "user", text: q, time: getTime() },
    ]);
    setQuestion("");
    setLoading(true);
    try {
      const res = await axios.post(`${API}/ask`, { question: q });
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: res.data.answer, time: getTime() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "❌ Something went wrong!", time: getTime() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        background:
          "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        fontFamily: "'Segoe UI', sans-serif",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Animated orbs */}
      <div
        style={{
          position: "fixed",
          top: "-150px",
          left: "-150px",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(120,80,255,0.25), transparent)",
          filter: "blur(80px)",
          pointerEvents: "none",
          animation: "float1 8s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "-150px",
          right: "-150px",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,200,255,0.15), transparent)",
          filter: "blur(100px)",
          pointerEvents: "none",
          animation: "float2 10s ease-in-out infinite",
        }}
      />

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes float1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(60px,80px)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-80px,-60px)} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes progressShimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.15);border-radius:2px}
        input::placeholder{color:rgba(255,255,255,0.3)}
        @media(max-width:768px){
          .sidebar{ position: fixed !important; z-index: 100; height: 100vh; transform: translateX(-100%); transition: transform 0.3s !important; }
          .sidebar.open{ transform: translateX(0) !important; }
          .overlay{ display: block !important; }
        }
      `}</style>

      {/* Mobile overlay */}
      <div
        className="overlay"
        onClick={() => setSidebarOpen(false)}
        style={{
          display: "none",
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 99,
        }}
      />

      {/* ── SIDEBAR ── */}
      <div
        className={`sidebar ${sidebarOpen ? "open" : ""}`}
        style={{
          width: "300px",
          flexShrink: 0,
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          flexDirection: "column",
          padding: "24px 20px",
          gap: "24px",
          transition: "width 0.3s",
          zIndex: 10,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              flexShrink: 0,
            }}
          >
            🧠
          </div>
          <div>
            <div style={{ color: "#fff", fontWeight: "700", fontSize: "16px" }}>
              RAG Chatbot
            </div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>
              by Aman Ansari
            </div>
          </div>
        </div>

        {/* Upload section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Document
          </div>

          {/* Drop zone */}
          <label
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              border: `2px dashed ${file ? "rgba(124,58,237,0.6)" : "rgba(255,255,255,0.12)"}`,
              borderRadius: "16px",
              padding: "20px 12px",
              cursor: "pointer",
              background: file
                ? "rgba(124,58,237,0.08)"
                : "rgba(255,255,255,0.02)",
              transition: "all 0.3s",
            }}
          >
            <input
              type="file"
              accept=".pdf"
              style={{ display: "none" }}
              onChange={(e) => {
                setFile(e.target.files?.[0] || null);
                setUploadStatus("");
              }}
            />
            <span style={{ fontSize: "24px" }}>{file ? "📄" : "☁️"}</span>
            <span
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "11px",
                textAlign: "center",
                lineHeight: "1.4",
              }}
            >
              {file ? file.name : "Click to upload PDF"}
            </span>
          </label>

          {/* Progress bar */}
          {uploading && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span
                  style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px" }}
                >
                  Indexing...
                </span>
                <span style={{ color: "#a78bfa", fontSize: "11px" }}>
                  {Math.round(progress)}%
                </span>
              </div>
              <div
                style={{
                  height: "4px",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "2px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${progress}%`,
                    background:
                      "linear-gradient(90deg, #7c3aed, #3b82f6, #7c3aed)",
                    backgroundSize: "200% auto",
                    borderRadius: "2px",
                    transition: "width 0.4s ease",
                    animation: "progressShimmer 1.5s linear infinite",
                  }}
                />
              </div>
            </div>
          )}

          {/* Status messages */}
          {uploadStatus === "done" && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "10px",
                background: "rgba(0,255,136,0.08)",
                border: "1px solid rgba(0,255,136,0.25)",
                color: "#00ff88",
                fontSize: "12px",
              }}
            >
              ✅ Document indexed successfully!
            </div>
          )}
          {uploadStatus === "error" && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "10px",
                background: "rgba(255,80,80,0.08)",
                border: "1px solid rgba(255,80,80,0.25)",
                color: "#ff5050",
                fontSize: "12px",
              }}
            >
              ❌ Upload failed. Try again.
            </div>
          )}

          <button
            onClick={uploadPDF}
            disabled={uploading || !file}
            style={{
              padding: "11px",
              borderRadius: "12px",
              border: "none",
              background:
                !file || uploading
                  ? "rgba(255,255,255,0.08)"
                  : "linear-gradient(135deg, #7c3aed, #3b82f6)",
              color: !file || uploading ? "rgba(255,255,255,0.3)" : "#fff",
              fontWeight: "600",
              fontSize: "13px",
              cursor: !file || uploading ? "not-allowed" : "pointer",
              transition: "all 0.3s",
            }}
          >
            {uploading ? "Indexing..." : "Upload & Index"}
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "rgba(255,255,255,0.08)" }} />

        {/* Tech stack */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Powered By
          </div>
          {[
            { icon: "🤖", label: "LLaMA 3.3 70B", sub: "via Groq" },
            { icon: "🗄️", label: "ChromaDB", sub: "Vector Store" },
            { icon: "🔢", label: "MiniLM-L6", sub: "Embeddings" },
            { icon: "⚡", label: "FastAPI + Express", sub: "Backend" },
          ].map((t) => (
            <div
              key={t.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 10px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span style={{ fontSize: "16px" }}>{t.icon}</span>
              <div>
                <div
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                >
                  {t.label}
                </div>
                <div
                  style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px" }}
                >
                  {t.sub}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom badge */}
        <div style={{ marginTop: "auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 12px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#00ff88",
                boxShadow: "0 0 8px #00ff88",
                animation: "pulse 2s infinite",
              }}
            />
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px" }}>
              AI Powered • RAG Technology
            </span>
          </div>
        </div>
      </div>

      {/* ── MAIN CHAT ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            background: "rgba(255,255,255,0.02)",
            backdropFilter: "blur(10px)",
          }}
        >
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              padding: "6px 10px",
              color: "#fff",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            ☰
          </button>

          <div>
            <div style={{ color: "#fff", fontWeight: "600", fontSize: "15px" }}>
              Chat with your Document
            </div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>
              {uploadStatus === "done"
                ? "📄 Document ready"
                : "Upload a PDF to get started"}
            </div>
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
            {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
              <div
                key={c}
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: c,
                }}
              />
            ))}
          </div>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {messages.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
                opacity: 0.6,
                marginTop: "80px",
              }}
            >
              <div style={{ fontSize: "56px" }}>💬</div>
              <div
                style={{ color: "#fff", fontWeight: "600", fontSize: "18px" }}
              >
                Start a conversation
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "14px",
                  textAlign: "center",
                  maxWidth: "300px",
                }}
              >
                Upload a PDF from the sidebar, then ask anything about it
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: msg.role === "user" ? "row-reverse" : "row",
                  gap: "12px",
                  alignItems: "flex-start",
                  animation: "fadeInUp 0.3s ease-out",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    flexShrink: 0,
                    background:
                      msg.role === "user"
                        ? "linear-gradient(135deg, #7c3aed, #3b82f6)"
                        : "linear-gradient(135deg, #0ea5e9, #6366f1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                  }}
                >
                  {msg.role === "user" ? "🧑" : "🤖"}
                </div>
                <div
                  style={{
                    maxWidth: "70%",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                      flexDirection:
                        msg.role === "user" ? "row-reverse" : "row",
                    }}
                  >
                    <span
                      style={{
                        color: "rgba(255,255,255,0.7)",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {msg.role === "user" ? "Aman Ansari" : "RAG AI"}
                    </span>
                    <span
                      style={{
                        color: "rgba(255,255,255,0.3)",
                        fontSize: "11px",
                      }}
                    >
                      {msg.time}
                    </span>
                  </div>
                  <div
                    style={{
                      padding: "14px 18px",
                      borderRadius: "16px",
                      borderTopRightRadius:
                        msg.role === "user" ? "4px" : "16px",
                      borderTopLeftRadius: msg.role === "bot" ? "4px" : "16px",
                      background:
                        msg.role === "user"
                          ? "linear-gradient(135deg, #7c3aed, #3b82f6)"
                          : "rgba(255,255,255,0.06)",
                      border:
                        msg.role === "bot"
                          ? "1px solid rgba(255,255,255,0.1)"
                          : "none",
                      color: "#fff",
                      fontSize: "14px",
                      lineHeight: "1.7",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    {msg.role === "bot" ? (
                      <TypewriterText
                        text={msg.text}
                        isLatest={i === messages.length - 1}
                      />
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Typing indicator */}
          {loading && (
            <div
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
                animation: "fadeInUp 0.3s ease-out",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                }}
              >
                🤖
              </div>
              <div>
                <div
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "12px",
                    marginBottom: "6px",
                  }}
                >
                  RAG AI
                </div>
                <div
                  style={{
                    padding: "14px 18px",
                    borderRadius: "16px",
                    borderTopLeftRadius: "4px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    display: "flex",
                    gap: "6px",
                    alignItems: "center",
                  }}
                >
                  {[0, 0.2, 0.4].map((d, i) => (
                    <div
                      key={i}
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        background: "#a78bfa",
                        animation: `pulse 1s ${d}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.02)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "16px",
              padding: "10px 10px 10px 20px",
              backdropFilter: "blur(10px)",
            }}
          >
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && askQuestion()}
              placeholder="Ask anything about your document..."
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: "14px",
                outline: "none",
              }}
            />
            <button
              onClick={askQuestion}
              disabled={loading}
              style={{
                padding: "10px 24px",
                borderRadius: "12px",
                border: "none",
                background: loading
                  ? "rgba(255,255,255,0.08)"
                  : "linear-gradient(135deg, #7c3aed, #3b82f6)",
                color: loading ? "rgba(255,255,255,0.3)" : "#fff",
                fontWeight: "600",
                fontSize: "14px",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.3s",
                whiteSpace: "nowrap",
              }}
            >
              {loading ? "..." : "Send ➤"}
            </button>
          </div>
          <div
            style={{
              textAlign: "center",
              marginTop: "8px",
              color: "rgba(255,255,255,0.2)",
              fontSize: "11px",
            }}
          >
            Powered by Aman Ansari • RAG Technology
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
