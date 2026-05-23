import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  Check,
  ChevronRight,
  Code2,
  DatabaseZap,
  FileSearch,
  Fingerprint,
  Gauge,
  Image,
  KeyRound,
  Layers3,
  LockKeyhole,
  MessageSquareText,
  Network,
  Play,
  PlugZap,
  Radar,
  Send,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  UsersRound,
  Workflow,
  type LucideIcon,
} from "lucide-react";

type Feature = {
  title: string;
  description: string;
  icon: LucideIcon;
  tone: string;
};

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

type ServerHealth = {
  status: string;
  provider: string;
  model: string;
  authRequired: boolean;
  storedApiKeys: number;
  cachedAnswers: number;
  localKeygenEnabled: boolean;
};

type ApiKeyRecord = {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
};

const arms: Feature[] = [
  {
    title: "Chat Assistant",
    description: "Talk with your private AI through a focused console built for serious work.",
    icon: MessageSquareText,
    tone: "from-cyan/25 to-violet/15",
  },
  {
    title: "Code Helper",
    description: "Plan architecture, debug issues, explain systems, and generate production-ready code.",
    icon: Code2,
    tone: "from-violet/25 to-fuchsia-500/10",
  },
  {
    title: "Research Agent",
    description: "Gather sources, compare claims, and turn scattered context into useful answers.",
    icon: Radar,
    tone: "from-mint/20 to-cyan/10",
  },
  {
    title: "File Analyzer",
    description: "Summarize PDFs, inspect spreadsheets, extract signals, and map messy documents.",
    icon: FileSearch,
    tone: "from-amber-300/20 to-cyan/10",
  },
  {
    title: "Workflow Automator",
    description: "Chain repeatable tasks across tools with triggers, approvals, and live status.",
    icon: Workflow,
    tone: "from-rose-400/20 to-violet/10",
  },
  {
    title: "Image Ideation",
    description: "Explore creative directions, art prompts, moodboards, and visual concepts.",
    icon: Image,
    tone: "from-sky-300/20 to-emerald-300/10",
  },
  {
    title: "Private Memory",
    description: "Add knowledge later through files and retrieval without changing the base model first.",
    icon: UsersRound,
    tone: "from-emerald-300/20 to-violet/10",
  },
  {
    title: "AI-to-AI API",
    description: "Let another assistant call Octopus through a private authenticated endpoint.",
    icon: DatabaseZap,
    tone: "from-cyan/20 to-amber-200/10",
  },
];

const trustCards: Feature[] = [
  {
    title: "Private By Default",
    description: "Octopus is designed for your own AI, your own keys, and your own model provider.",
    icon: LockKeyhole,
    tone: "from-cyan/20 to-transparent",
  },
  {
    title: "Local Model Ready",
    description: "Run with Ollama on your machine or switch to an OpenAI-compatible provider later.",
    icon: Gauge,
    tone: "from-mint/20 to-transparent",
  },
  {
    title: "API Key Gate",
    description: "Protect machine-to-machine access with `Authorization: Bearer YOUR_KEY`.",
    icon: Fingerprint,
    tone: "from-violet/20 to-transparent",
  },
  {
    title: "Responsible Control",
    description: "Keep human review and clear system instructions before adding real automations.",
    icon: ShieldCheck,
    tone: "from-amber-300/20 to-transparent",
  },
];

const navItems = [
  ["Chat", "chat"],
  ["Features", "features"],
  ["Demo", "demo"],
  ["API", "developers"],
  ["Security", "security"],
];

const initialMessages: ChatMessage[] = [
  {
    role: "assistant",
    content: "Octopus is ready. Ask me anything.",
  },
];

function App() {
  return (
    <div className="min-h-screen overflow-hidden bg-ink text-white antialiased">
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(120deg,#05070d_0%,#071424_42%,#0b0820_70%,#05070d_100%)]" />
      <div className="fixed inset-0 -z-10 bg-radial-grid bg-[length:26px_26px] opacity-[0.14]" />
      <div className="fixed inset-x-0 top-0 -z-10 h-[720px] bg-[radial-gradient(ellipse_at_top,rgba(53,216,255,0.18),transparent_56%),radial-gradient(ellipse_at_78%_24%,rgba(124,60,255,0.16),transparent_48%)]" />
      <Header />
      <main>
        <Hero />
        <PrivateChat />
        <FeatureGrid />
        <ProductDemo />
        <DeveloperSection />
        <TrustSection />
        <FullAccessSection />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/72 backdrop-blur-xl">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8"
      >
        <a href="#" className="flex items-center gap-3" aria-label="Octopus home">
          <OctopusLogo className="h-10 w-10" />
          <span className="text-lg font-semibold">Octopus</span>
        </a>
        <div className="hidden items-center gap-7 md:flex">
          {navItems.map(([item, id]) => (
            <a key={id} href={`#${id}`} className="text-sm text-white/68 transition hover:text-white">
              {item}
            </a>
          ))}
        </div>
        <a
          href="#chat"
          className="hidden rounded-lg border border-white/12 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white shadow-glow transition hover:border-cyan/45 hover:bg-cyan/10 sm:inline-flex"
        >
          Open console
        </a>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24 lg:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_0.9fr]">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex max-w-full items-center gap-2 rounded-lg border border-cyan/25 bg-cyan/10 px-3 py-2 text-sm text-cyan">
            <Sparkles aria-hidden className="h-4 w-4 shrink-0" />
            <span className="min-w-0 truncate">Private AI console. Full access. No pricing tiers.</span>
          </div>
          <h1 className="text-4xl font-semibold leading-[1.04] sm:text-5xl lg:text-6xl">
            Meet Octopus, your adaptive AI workspace
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            Octopus is being shaped as your private AI control room: chat with a local or hosted
            model, expose a secure API for another AI, and later add knowledge training through
            your own files.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#chat"
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-cyan hover:text-ink focus:outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-2 focus:ring-offset-ink"
            >
              Chat with Octopus
              <ArrowRight aria-hidden className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </a>
            <a
              href="#developers"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-white transition hover:border-violet/60 hover:bg-violet/15 focus:outline-none focus:ring-2 focus:ring-violet focus:ring-offset-2 focus:ring-offset-ink"
            >
              Pair your AI
              <ChevronRight aria-hidden className="h-4 w-4" />
            </a>
          </div>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-3 text-sm text-slate-300">
            <Metric value="Full" label="access mode" />
            <Metric value="1" label="private owner" />
            <Metric value="API" label="AI pairing" />
          </div>
        </div>
        <HeroChatPanel />
      </div>
    </section>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4 shadow-glow">
      <p className="text-xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs uppercase text-slate-400">{label}</p>
    </div>
  );
}

function HeroChatPanel() {
  const messages = [
    {
      role: "Your AI",
      text: "Ask Octopus for a secure answer about this project state.",
    },
    {
      role: "Octopus",
      text: "I can answer through the private API, using your selected model and your workspace instructions.",
    },
  ];

  return (
    <div className="relative" aria-label="Octopus assistant preview">
      <div className="absolute -inset-1 rounded-lg bg-[linear-gradient(135deg,rgba(53,216,255,0.42),rgba(124,60,255,0.26),rgba(100,255,216,0.18))] opacity-70 blur-xl" />
      <div className="relative overflow-hidden rounded-lg border border-white/14 bg-[#08101d]/88 shadow-2xl shadow-black/50 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <OctopusLogo className="h-9 w-9" compact />
            <div>
              <p className="font-semibold">Octopus Console</p>
              <p className="text-xs text-slate-400">Private model gateway</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-mint/20 bg-mint/10 px-3 py-1.5 text-xs text-mint">
            <span className="h-1.5 w-1.5 rounded-full bg-mint shadow-[0_0_10px_rgba(100,255,216,0.9)]" />
            Ready
          </div>
        </div>
        <div className="space-y-4 p-5">
          {messages.map((message) => (
            <div
              key={message.role}
              className={`max-w-[92%] rounded-lg border p-4 ${
                message.role === "Your AI"
                  ? "ml-auto border-cyan/20 bg-cyan/10"
                  : "border-white/10 bg-white/[0.055]"
              }`}
            >
              <p className="mb-2 text-xs font-medium text-slate-400">{message.role}</p>
              <p className="text-sm leading-6 text-slate-100">{message.text}</p>
            </div>
          ))}
          <div className="rounded-lg border border-white/10 bg-black/24 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <BrainCircuit aria-hidden className="h-4 w-4 text-cyan" />
                Intelligence routing
              </div>
              <span className="rounded-lg bg-violet/15 px-2 py-1 text-xs text-violet-200">
                API enabled
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {["Chat", "Code", "Files", "Workflow"].map((item, index) => (
                <div key={item} className="rounded-lg border border-white/8 bg-white/[0.04] p-3">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="text-slate-300">{item}</span>
                    <span className="text-cyan">{78 + index * 5}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#35d8ff,#7c3cff,#64ffd8)]"
                      style={{ width: `${78 + index * 5}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-cyan/10 text-cyan">
              <KeyRound aria-hidden className="h-4 w-4" />
            </div>
            <p className="min-w-0 flex-1 text-sm text-slate-300">
              Pairing endpoint: <span className="text-slate-100">POST /api/octopus</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrivateChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [apiKey, setApiKey] = useState(() =>
    typeof window === "undefined" ? "" : localStorage.getItem("octopus_api_key") ?? "",
  );
  const [health, setHealth] = useState<ServerHealth | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/health", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: ServerHealth) => setHealth(data))
      .catch(() =>
        setHealth({
          status: "frontend-only",
          provider: "not connected",
          model: "backend offline",
          authRequired: false,
          storedApiKeys: 0,
          cachedAnswers: 0,
          localKeygenEnabled: false,
        }),
      );

    return () => controller.abort();
  }, []);

  const visibleMessages = useMemo(() => messages.filter((message) => message.role !== "system"), [messages]);

  function saveApiKey(value: string) {
    setApiKey(value);
    if (typeof window !== "undefined") {
      if (value.trim()) {
        localStorage.setItem("octopus_api_key", value.trim());
      } else {
        localStorage.removeItem("octopus_api_key");
      }
    }
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = input.trim();
    if (!content || isSending) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey.trim() ? { Authorization: `Bearer ${apiKey.trim()}` } : {}),
        },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error ?? "Octopus could not answer.");
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.answer ?? data.message?.content ?? "Octopus returned an empty answer.",
        },
      ]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "The Octopus backend is not reachable yet.";
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: `I could not reach the private model gateway. ${errorMessage}`,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section id="chat" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <div>
          <SectionHeader
            align="left"
            eyebrow="Private chat"
            title="Talk to Octopus directly"
            description="This console calls your own backend. Connect it to Ollama for local private chat, or point it at any OpenAI-compatible model provider when you are ready."
          />
          <div className="mt-8 grid gap-3">
            <StatusCard
              icon={Gauge}
              label="Gateway"
              value={health?.status ?? "checking"}
              detail={`${health?.provider ?? "loading"} - ${health?.model ?? "loading"}`}
            />
            <StatusCard
              icon={KeyRound}
              label="Access"
              value={health?.authRequired ? "API key required" : "local open mode"}
              detail={`${health?.storedApiKeys ?? 0} generated keys stored locally.`}
            />
            <StatusCard
              icon={DatabaseZap}
              label="Answer storage"
              value={`${health?.cachedAnswers ?? 0} cached answers`}
              detail="Private memory is active in the background."
            />
          </div>
        </div>
        <div className="overflow-hidden rounded-lg border border-white/12 bg-[#07101d]/90 shadow-2xl shadow-black/40">
          <div className="flex flex-col gap-4 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <OctopusLogo className="h-10 w-10" compact />
              <div>
                <h3 className="font-semibold">Private Octopus Chat</h3>
                <p className="text-sm text-slate-500">Messages go through `/api/chat`</p>
              </div>
            </div>
            <input
              aria-label="Octopus API key"
              className="min-h-11 w-full rounded-lg border border-white/10 bg-black/24 px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan/50 sm:w-64"
              onChange={(event) => saveApiKey(event.target.value)}
              placeholder="API key, optional locally"
              type="password"
              value={apiKey}
            />
          </div>
          <div className="flex h-[520px] flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
              {visibleMessages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`max-w-[92%] rounded-lg border p-4 ${
                    message.role === "user"
                      ? "ml-auto border-cyan/20 bg-cyan/10"
                      : "border-white/10 bg-white/[0.055]"
                  }`}
                >
                  <p className="mb-2 text-xs font-medium text-slate-500">
                    {message.role === "user" ? "You" : "Octopus"}
                  </p>
                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-100">{message.content}</p>
                </div>
              ))}
              {isSending && (
                <div className="max-w-[92%] rounded-lg border border-white/10 bg-white/[0.055] p-4">
                  <p className="text-sm text-slate-300">Octopus is thinking...</p>
                </div>
              )}
            </div>
            <form className="border-t border-white/10 p-4" onSubmit={sendMessage}>
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="sr-only" htmlFor="octopus-message">
                  Message Octopus
                </label>
                <textarea
                  className="min-h-24 flex-1 resize-none rounded-lg border border-white/10 bg-black/24 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan/50"
                  id="octopus-message"
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask Octopus something..."
                  value={input}
                />
                <button
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-cyan disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSending || !input.trim()}
                  type="submit"
                >
                  <Send aria-hidden className="h-4 w-4" />
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatusCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-cyan/10 text-cyan">
          <Icon aria-hidden className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase text-slate-500">{label}</p>
          <p className="truncate font-semibold">{value}</p>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-400">{detail}</p>
    </div>
  );
}

function FeatureGrid() {
  return (
    <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Eight AI arms"
          title="A private workspace for every mode of thinking"
          description="Octopus routes work to the right capability, keeps context connected, and exposes a private API so your own AI can ask it for help."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {arms.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;

  return (
    <article className="group rounded-lg border border-white/10 bg-white/[0.045] p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan/35 hover:bg-white/[0.075] hover:shadow-glow">
      <div
        className={`mb-5 grid h-11 w-11 place-items-center rounded-lg bg-gradient-to-br ${feature.tone} ring-1 ring-white/10`}
      >
        <Icon aria-hidden className="h-5 w-5 text-white" />
      </div>
      <h3 className="text-base font-semibold">{feature.title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-400">{feature.description}</p>
    </article>
  );
}

function ProductDemo() {
  const tasks = [
    ["Pair private AI client", "API", "Ready"],
    ["Connect local model", "Ollama", "Optional"],
    ["Add file knowledge", "Training", "Next"],
  ];

  return (
    <section id="demo" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Product demo"
          title="One private surface for chat, tools, and AI handoffs"
          description="The dashboard keeps conversations, API status, connected tools, and training plans visible without pretending there are fake paid tiers."
        />
        <div className="mt-12 overflow-hidden rounded-lg border border-white/12 bg-[#07101d]/90 shadow-2xl shadow-black/40">
          <div className="grid min-h-[680px] lg:grid-cols-[230px_1fr_330px]">
            <aside className="border-b border-white/10 bg-black/24 p-4 lg:border-b-0 lg:border-r">
              <div className="mb-7 flex items-center gap-3">
                <OctopusLogo className="h-9 w-9" compact />
                <div>
                  <p className="text-sm font-semibold">Octopus</p>
                  <p className="text-xs text-slate-500">Private workspace</p>
                </div>
              </div>
              <div className="space-y-1" aria-label="Dashboard navigation">
                {[
                  ["Console", Bot],
                  ["Projects", Layers3],
                  ["Automations", Workflow],
                  ["Knowledge", Network],
                  ["Integrations", PlugZap],
                ].map(([label, Icon], index) => {
                  const NavIcon = Icon as LucideIcon;
                  return (
                    <button
                      key={label as string}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                        index === 0
                          ? "border border-cyan/20 bg-cyan/10 text-white"
                          : "text-slate-400 hover:bg-white/[0.055] hover:text-white"
                      }`}
                      type="button"
                    >
                      <NavIcon aria-hidden className="h-4 w-4 shrink-0" />
                      <span className="min-w-0 truncate">{label as string}</span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-8 rounded-lg border border-white/10 bg-white/[0.045] p-4">
                <p className="text-xs uppercase text-slate-500">Access mode</p>
                <p className="mt-2 text-2xl font-semibold">Full</p>
                <div className="mt-3 h-2 rounded-full bg-white/10">
                  <div className="h-full w-full rounded-full bg-[linear-gradient(90deg,#35d8ff,#64ffd8)]" />
                </div>
              </div>
            </aside>
            <div className="flex min-w-0 flex-col border-b border-white/10 lg:border-b-0 lg:border-r">
              <div className="flex flex-col gap-4 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-400">Active project</p>
                  <h3 className="mt-1 text-xl font-semibold">Private AI bridge</h3>
                </div>
                <a
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-cyan"
                  href="#developers"
                >
                  <Play aria-hidden className="h-4 w-4" />
                  View API
                </a>
              </div>
              <div className="flex-1 space-y-4 p-4 sm:p-6">
                <ChatBubble
                  label="Your AI"
                  text="I need a second brain for project memory, files, and tool decisions."
                />
                <ChatBubble
                  label="Octopus"
                  text="Send me a signed request through /api/octopus. I will answer with the configured model and keep the response structured for machine use."
                  assistant
                />
                <div className="grid gap-3 sm:grid-cols-3">
                  {["Private chat", "AI endpoint", "Knowledge training"].map((item, index) => (
                    <div key={item} className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-medium">{item}</span>
                        <span className="text-xs text-cyan">{index === 2 ? "Next" : "Ready"}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(90deg,#7c3cff,#35d8ff)]"
                          style={{ width: `${index === 2 ? 38 : 94}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <h4 className="font-semibold">Recent tasks</h4>
                    <span className="text-xs text-slate-500">Private queue</span>
                  </div>
                  <div className="space-y-2">
                    {tasks.map(([name, type, status]) => (
                      <div
                        key={name}
                        className="grid gap-2 rounded-lg border border-white/8 bg-white/[0.035] p-3 text-sm sm:grid-cols-[1fr_90px_80px] sm:items-center"
                      >
                        <span className="min-w-0 text-slate-200">{name}</span>
                        <span className="text-slate-500">{type}</span>
                        <span className="text-cyan">{status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <aside className="space-y-4 bg-black/18 p-4 sm:p-6">
              <DashboardPanel title="Connected tools">
                <div className="grid grid-cols-2 gap-3">
                  {["Ollama", "GitHub", "Files", "Webhooks"].map((tool) => (
                    <div key={tool} className="rounded-lg border border-white/10 bg-white/[0.045] p-3">
                      <div className="mb-2 grid h-7 w-7 place-items-center rounded-lg bg-cyan/10 text-cyan">
                        <PlugZap aria-hidden className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-medium">{tool}</p>
                      <p className="mt-1 text-xs text-slate-500">Supported</p>
                    </div>
                  ))}
                </div>
              </DashboardPanel>
              <DashboardPanel title="Status">
                <div className="space-y-3">
                  {[
                    ["Chat route", "Ready", "text-mint"],
                    ["AI pairing", "Ready", "text-cyan"],
                    ["Training data", "Planned", "text-amber-200"],
                  ].map(([name, status, color]) => (
                    <div key={name} className="flex items-center justify-between rounded-lg bg-white/[0.04] p-3">
                      <span className="text-sm text-slate-300">{name}</span>
                      <span className={`text-xs ${color}`}>{status}</span>
                    </div>
                  ))}
                </div>
              </DashboardPanel>
              <DashboardPanel title="Training note">
                <p className="text-sm leading-6 text-slate-400">
                  Start with retrieval from your files. Fine-tuning can come later if Octopus needs a
                  permanent style or domain behavior.
                </p>
              </DashboardPanel>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}

function ChatBubble({
  label,
  text,
  assistant = false,
}: {
  label: string;
  text: string;
  assistant?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        assistant ? "border-cyan/20 bg-cyan/10" : "border-white/10 bg-white/[0.045]"
      }`}
    >
      <p className="mb-2 text-xs font-medium text-slate-500">{label}</p>
      <p className="text-sm leading-6 text-slate-200">{text}</p>
    </div>
  );
}

function DashboardPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
      <h4 className="mb-4 font-semibold">{title}</h4>
      {children}
    </section>
  );
}

function DeveloperSection() {
  return (
    <section id="developers" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <SectionHeader
              align="left"
              eyebrow="AI pairing API"
              title="Let your AI ask Octopus for answers"
              description="When you publish the project, create a private Octopus key. Your other AI can call Octopus with that key and receive cached or model-backed answers."
            />
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                ["POST /api/chat", "Browser chat route for the private console."],
                ["POST /api/octopus", "Machine-to-machine route for your AI client."],
                ["POST /api/keys", "Create hashed keys for private AI clients."],
                ["Answer cache", "Repeated questions can skip Ollama and return stored answers."],
              ].map(([title, body]) => (
                <div key={title} className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-white/12 bg-[#050914] p-4 shadow-violet">
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <TerminalSquare aria-hidden className="h-4 w-4 text-cyan" />
                your-ai-to-octopus.ts
              </div>
              <span className="rounded-lg bg-mint/10 px-2 py-1 text-xs text-mint">Private API</span>
            </div>
            <pre className="overflow-x-auto rounded-lg bg-black/40 p-4 text-sm leading-7 text-slate-300">
              <code>{`const response = await fetch("https://your-domain.com/api/octopus", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer YOUR_OCTOPUS_KEY"
  },
  body: JSON.stringify({
    message: "Octopus, review this plan for risks.",
    metadata: { caller: "my-private-ai" }
  })
});

const octopus = await response.json();
console.log(octopus.answer);`}</code>
            </pre>
          </div>
        </div>
        <KeyManager />
      </div>
    </section>
  );
}

function KeyManager() {
  const [adminKey, setAdminKey] = useState(() =>
    typeof window === "undefined" ? "" : localStorage.getItem("octopus_admin_key") ?? "",
  );
  const [keyName, setKeyName] = useState("my-private-ai");
  const [generatedKey, setGeneratedKey] = useState("");
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [status, setStatus] = useState("Create an Octopus key, then paste it into your AI client.");
  const [isWorking, setIsWorking] = useState(false);

  function saveAdminKey(value: string) {
    setAdminKey(value);
    if (typeof window !== "undefined") {
      if (value.trim()) {
        localStorage.setItem("octopus_admin_key", value.trim());
      } else {
        localStorage.removeItem("octopus_admin_key");
      }
    }
  }

  async function loadKeys() {
    setIsWorking(true);
    try {
      const response = await fetch("/api/keys", {
        headers: adminKey.trim() ? { Authorization: `Bearer ${adminKey.trim()}` } : {},
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error ?? "Could not load keys.");
      }
      setKeys(data.keys ?? []);
      setStatus("Key vault loaded.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not load keys.");
    } finally {
      setIsWorking(false);
    }
  }

  async function createKey(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsWorking(true);
    setGeneratedKey("");

    try {
      const response = await fetch("/api/keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(adminKey.trim() ? { Authorization: `Bearer ${adminKey.trim()}` } : {}),
        },
        body: JSON.stringify({ name: keyName }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error ?? "Could not create key.");
      }
      setGeneratedKey(data.key);
      setKeys((current) => [data.record, ...current]);
      setStatus("Key created. It is shown once, so keep it in your AI settings.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not create key.");
    } finally {
      setIsWorking(false);
    }
  }

  function useGeneratedKeyInChat() {
    if (!generatedKey || typeof window === "undefined") return;
    localStorage.setItem("octopus_api_key", generatedKey);
    setStatus("Generated key saved for the Octopus chat input. Refresh if the chat field is already open.");
  }

  async function deleteKey(id: string, name: string) {
    const shouldDelete =
      typeof window === "undefined" || window.confirm(`Delete the Octopus key for "${name}"?`);

    if (!shouldDelete) return;

    setIsWorking(true);

    try {
      const response = await fetch(`/api/keys/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: adminKey.trim() ? { Authorization: `Bearer ${adminKey.trim()}` } : {},
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.removed) {
        throw new Error(data?.error ?? "Could not delete key.");
      }
      setKeys((current) => current.filter((key) => key.id !== id));
      setStatus(`Deleted key "${name}".`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not delete key.");
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <div className="mt-8 rounded-lg border border-white/12 bg-white/[0.045] p-5">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-cyan/10 text-cyan">
              <KeyRound aria-hidden className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">Octopus Key Manager</h3>
              <p className="text-sm text-slate-500">Generate keys for AI-to-AI pairing.</p>
            </div>
          </div>
          <p className="text-sm leading-6 text-slate-400">
            Locally, key creation is allowed from your own machine. Before publishing, set
            `OCTOPUS_ADMIN_KEY` so only you can create or revoke keys.
          </p>
        </div>
        <div className="space-y-4">
          <form className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]" onSubmit={createKey}>
            <input
              className="min-h-11 rounded-lg border border-white/10 bg-black/24 px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan/50"
              onChange={(event) => saveAdminKey(event.target.value)}
              placeholder="Admin key, optional locally"
              type="password"
              value={adminKey}
            />
            <input
              className="min-h-11 rounded-lg border border-white/10 bg-black/24 px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan/50"
              onChange={(event) => setKeyName(event.target.value)}
              placeholder="Key name"
              value={keyName}
            />
            <button
              className="min-h-11 rounded-lg bg-white px-4 text-sm font-semibold text-ink transition hover:bg-cyan disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isWorking}
              type="submit"
            >
              Create key
            </button>
          </form>
          {generatedKey && (
            <div className="rounded-lg border border-mint/20 bg-mint/10 p-4">
              <p className="text-xs uppercase text-mint">New key</p>
              <p className="mt-2 break-all font-mono text-sm text-white">{generatedKey}</p>
              <button
                className="mt-3 rounded-lg border border-white/12 px-3 py-2 text-xs font-semibold text-white transition hover:border-cyan/45 hover:bg-cyan/10"
                onClick={useGeneratedKeyInChat}
                type="button"
              >
                Use in chat
              </button>
            </div>
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-400">{status}</p>
            <button
              className="rounded-lg border border-white/12 px-3 py-2 text-xs font-semibold text-white transition hover:border-cyan/45 hover:bg-cyan/10 disabled:opacity-60"
              disabled={isWorking}
              onClick={loadKeys}
              type="button"
            >
              Refresh keys
            </button>
          </div>
          {keys.length > 0 && (
            <div className="space-y-2">
              {keys.slice(0, 4).map((key) => (
                <div
                  key={key.id}
                  className="grid gap-2 rounded-lg border border-white/10 bg-black/20 p-3 text-sm sm:grid-cols-[1fr_130px_80px_auto] sm:items-center"
                >
                  <span className="min-w-0 truncate text-slate-200">{key.name}</span>
                  <span className="font-mono text-slate-500">{key.prefix}</span>
                  <span className="text-cyan">{key.lastUsedAt ? "Used" : "New"}</span>
                  <button
                    className="rounded-lg border border-red-300/20 px-3 py-2 text-xs font-semibold text-red-200 transition hover:border-red-300/45 hover:bg-red-400/10 disabled:opacity-60"
                    disabled={isWorking}
                    onClick={() => deleteKey(key.id, key.name)}
                    type="button"
                  >
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TrustSection() {
  return (
    <section id="security" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Security and trust"
          title="Private first, because this is for your AI"
          description="The app now assumes one full-access owner, optional API key protection, and model provider settings kept outside GitHub in environment variables."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {trustCards.map((card) => (
            <FeatureCard key={card.title} feature={card} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FullAccessSection() {
  return (
    <section id="access" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 rounded-lg border border-white/12 bg-[linear-gradient(135deg,rgba(53,216,255,0.12),rgba(124,60,255,0.12),rgba(255,255,255,0.035))] p-6 shadow-glow lg:grid-cols-[0.86fr_1.14fr] lg:p-8">
          <div>
            <p className="text-sm font-semibold uppercase text-cyan">No plans</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
              One private workspace. Everything included.
            </h2>
            <p className="mt-4 leading-7 text-slate-300">
              Octopus is not selling Free, Pro, Team, or Enterprise tiers anymore. The product is a
              private full-access layer for you and the AI systems you choose to connect.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Full access", "No pricing cards, no feature gates, no fake upgrades."],
              ["Private keys", "Keep API keys in environment variables, never in GitHub."],
              ["Chat included", "The console can talk to your configured model provider."],
              ["Train carefully", "Add RAG and memory first, then consider fine-tuning only if needed."],
            ].map(([title, body]) => (
              <div key={title} className="rounded-lg border border-white/10 bg-black/20 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Check aria-hidden className="h-4 w-4 text-mint" />
                  <h3 className="font-semibold">{title}</h3>
                </div>
                <p className="text-sm leading-6 text-slate-400">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-lg border border-white/12 bg-[linear-gradient(135deg,rgba(53,216,255,0.16),rgba(124,60,255,0.14),rgba(255,255,255,0.045))] p-8 shadow-glow sm:p-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase text-cyan">Private AI layer</p>
            <h2 className="text-3xl font-semibold sm:text-4xl">Build faster with Octopus.</h2>
            <p className="mt-4 max-w-2xl leading-7 text-slate-300">
              Chat directly, connect your own AI through the API, and grow into file knowledge when
              the core conversation loop feels right.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="#chat"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-cyan"
            >
              Open console
              <ArrowRight aria-hidden className="h-4 w-4" />
            </a>
            <a
              href="#developers"
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/15 bg-white/[0.055] px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan/45 hover:bg-cyan/10"
            >
              Pair your AI
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <OctopusLogo className="h-8 w-8" compact />
          <span>Octopus Private AI Platform</span>
        </div>
        <p>One mind. Eight arms of intelligence.</p>
      </div>
    </footer>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className="text-sm font-semibold uppercase text-cyan">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-slate-400">{description}</p>
    </div>
  );
}

function OctopusLogo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Octopus abstract logo"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="64" height="64" rx="14" fill="url(#logo-bg)" />
      <path
        d="M32 14c9 0 15 6.5 15 14.4 0 5.8-3.5 10.9-8.5 13.3 2.1 5.8 6.6 8 11.6 7.1"
        stroke="url(#logo-stroke)"
        strokeLinecap="round"
        strokeWidth="4.6"
      />
      <path
        d="M32 14c-9 0-15 6.5-15 14.4 0 5.8 3.5 10.9 8.5 13.3-2.1 5.8-6.6 8-11.6 7.1"
        stroke="url(#logo-stroke)"
        strokeLinecap="round"
        strokeWidth="4.6"
      />
      <path
        d="M25 47c-2.7 5.2-7.3 7-12 5.4M39 47c2.7 5.2 7.3 7 12 5.4M32 45v10"
        stroke="white"
        strokeLinecap="round"
        strokeOpacity="0.92"
        strokeWidth="3.2"
      />
      {!compact && (
        <path
          d="M15 33c-5.5.2-8.8-2-9.5-6.8M49 33c5.5.2 8.8-2 9.5-6.8"
          stroke="#35D8FF"
          strokeLinecap="round"
          strokeOpacity="0.75"
          strokeWidth="2.8"
        />
      )}
      <circle cx="25" cy="30" r="2.2" fill="white" />
      <circle cx="39" cy="30" r="2.2" fill="white" />
      <circle cx="32" cy="36" r="3.2" fill="#64FFD8" />
      <circle cx="32" cy="27" r="1.8" fill="#35D8FF" />
      <defs>
        <linearGradient id="logo-bg" x1="8" x2="56" y1="6" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#101A2A" />
          <stop offset="0.46" stopColor="#111033" />
          <stop offset="1" stopColor="#031821" />
        </linearGradient>
        <linearGradient
          id="logo-stroke"
          x1="13"
          x2="51"
          y1="12"
          y2="53"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="0.46" stopColor="#35D8FF" />
          <stop offset="1" stopColor="#7C3CFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default App;
