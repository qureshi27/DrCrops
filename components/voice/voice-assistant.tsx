"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, MessageCircle, X, Loader2, Volume2, VolumeX, Sparkles, Send } from "lucide-react";
import { useLocale } from "@/lib/i18n/store";
import { LOCALES, type Locale } from "@/lib/i18n/languages";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; text: string };

const STT_LOCALE: Record<Locale, string> = {
  en: "en-US",
  ur: "ur-PK",
  pa: "pa-PK",
  sd: "sd-PK",
  ps: "ps-AF",
  skr: "ur-PK" // browser fallback; Saraiki STT is rare
};

const PROMPT_PLACEHOLDER: Record<Locale, string> = {
  en: "Ask about your crop, weather, or fertilizer…",
  ur: "اپنی فصل، موسم یا کھاد کے بارے میں پوچھیں…",
  pa: "اپنی فصل بارے پُچھو…",
  sd: "پنهنجي فصل بابت پُڇو…",
  ps: "د خپلې فصلې په اړه پوښتنه وکړئ…",
  skr: "اپݨیں فصل بارے پُچھو…"
};

const BUTTON_LABEL: Record<Locale, string> = {
  en: "Ask Dr Crops",
  ur: "ڈاکٹر کراپس سے پوچھیں",
  pa: "ڈاکٹر کراپس کولوں پُچھو",
  sd: "ڊاڪٽر ڪراپس کان پُڇو",
  ps: "د ډاکټر کراپس څخه وپوښتئ",
  skr: "ڈاکٹر کراپس کولوں پُچھو"
};

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}

export function VoiceAssistant() {
  const locale = useLocale((s) => s.locale);
  const localeInfo = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [muteVoice, setMuteVoice] = useState(false);
  const [sttSupported, setSttSupported] = useState(true);
  const recogRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const Speech =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;
    if (!Speech) {
      setSttSupported(false);
      return;
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  function startListening() {
    const Speech =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Speech) {
      setSttSupported(false);
      return;
    }
    try {
      const recog = new Speech();
      recog.lang = STT_LOCALE[locale];
      recog.continuous = false;
      recog.interimResults = true;

      recog.onresult = (event: any) => {
        let interim = "";
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const r = event.results[i];
          if (r.isFinal) final += r[0].transcript;
          else interim += r[0].transcript;
        }
        setDraft(final || interim);
      };
      recog.onerror = (e: any) => {
        console.warn("STT error", e?.error);
        setListening(false);
      };
      recog.onend = () => {
        setListening(false);
      };
      recog.start();
      recogRef.current = recog;
      setListening(true);
    } catch (e) {
      console.warn("STT init failed", e);
      setSttSupported(false);
    }
  }

  function stopListening() {
    try {
      recogRef.current?.stop();
    } catch {}
    setListening(false);
  }

  function speak(text: string) {
    if (muteVoice) return;
    if (!("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = STT_LOCALE[locale];
      u.rate = 1.0;
      u.pitch = 1.0;
      window.speechSynthesis.speak(u);
    } catch {}
  }

  async function send() {
    const text = draft.trim();
    if (!text || thinking) return;
    const nextMessages: Msg[] = [...messages, { role: "user", text }];
    setMessages(nextMessages);
    setDraft("");
    setThinking(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang: locale,
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.text
          }))
        })
      });
      const json = await res.json();
      const reply: string =
        typeof json?.reply === "string" && json.reply.trim()
          ? json.reply.trim()
          : "Sorry — I couldn't answer that just now. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
      speak(reply);
    } catch (err) {
      console.error("chat failed", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Network problem — please try again in a moment."
        }
      ]);
    } finally {
      setThinking(false);
    }
  }

  return (
    <>
      {/* Floating launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed z-50 bottom-6 right-6 inline-flex items-center gap-2 rounded-pill px-5 py-3 text-sm font-semibold bg-gradient-to-r from-accent to-accent-glow text-black shadow-glow-cyan hover:brightness-110 transition group"
          aria-label="Open voice assistant"
        >
          <span className="relative grid place-items-center size-7 rounded-full bg-black/20">
            <Mic className="size-4" />
            <span className="absolute inset-0 rounded-full ring-2 ring-black/30 animate-pulse-glow" />
          </span>
          <span dir={localeInfo.dir}>{BUTTON_LABEL[locale]}</span>
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed z-50 bottom-6 right-6 left-6 sm:left-auto sm:w-[420px] card-elevated shadow-card border border-line overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-bg-surface">
            <div className="flex items-center gap-2">
              <span className="grid place-items-center size-7 rounded-md bg-gradient-to-br from-accent to-accent-glow text-black">
                <Sparkles className="size-3.5" strokeWidth={2.5} />
              </span>
              <div>
                <p className="text-sm font-semibold leading-tight">Dr Crops</p>
                <p className="text-[10px] text-ink-dim">
                  {localeInfo.label} · voice + chat
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMuteVoice((v) => !v)}
                className="rounded-md p-1.5 hover:bg-white/5 text-ink-muted"
                title={muteVoice ? "Unmute voice replies" : "Mute voice replies"}
              >
                {muteVoice ? (
                  <VolumeX className="size-4" />
                ) : (
                  <Volume2 className="size-4" />
                )}
              </button>
              <button
                onClick={() => {
                  stopListening();
                  setOpen(false);
                }}
                className="rounded-md p-1.5 hover:bg-white/5 text-ink-muted"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Conversation */}
          <div
            ref={scrollRef}
            className="max-h-[55vh] min-h-[200px] overflow-y-auto p-4 space-y-3"
          >
            {messages.length === 0 && !thinking && (
              <div className="text-center text-ink-dim py-6">
                <MessageCircle className="size-8 mx-auto opacity-60" />
                <p
                  dir={localeInfo.dir}
                  className="mt-3 text-sm text-ink-muted leading-relaxed"
                >
                  {locale === "en"
                    ? "Tap the microphone and ask anything about your crop, soil, pests, weather or fertilizer."
                    : locale === "ur"
                    ? "مائیک پر ٹیپ کریں اور اپنی فصل، مٹی، کیڑے، موسم یا کھاد کے بارے میں کچھ بھی پوچھیں۔"
                    : locale === "pa"
                    ? "مائیک تے ٹیپ کرو تے اپنی فصل بارے کجھ وی پُچھو۔"
                    : locale === "sd"
                    ? "مائڪ تي ٽيپ ڪريو ۽ پنهنجي فصل بابت پُڇو."
                    : locale === "ps"
                    ? "مایکروفون باندې ټک وکړئ او د خپلې فصلې په اړه څه وپوښتئ."
                    : "مائیک تے ٹیپ کرو تے اپݨیں فصل بارے کجھ وی پُچھو۔"}
                </p>
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "flex",
                  m.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  dir={localeInfo.dir}
                  className={cn(
                    "max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed",
                    m.role === "user"
                      ? "bg-accent text-white"
                      : "bg-bg-elevated text-ink border border-line"
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex justify-start">
                <div className="bg-bg-elevated border border-line rounded-lg px-3.5 py-2.5 text-sm text-ink-muted inline-flex items-center gap-2">
                  <Loader2 className="size-3.5 animate-spin" />
                  …
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-line p-3 bg-bg-surface">
            <div className="flex items-end gap-2">
              <button
                onClick={listening ? stopListening : startListening}
                disabled={!sttSupported}
                className={cn(
                  "shrink-0 grid place-items-center size-11 rounded-pill transition relative",
                  listening
                    ? "bg-red-500 text-white shadow-lg"
                    : "bg-gradient-to-r from-accent to-accent-glow text-black hover:brightness-110",
                  !sttSupported && "opacity-40 cursor-not-allowed"
                )}
                title={
                  !sttSupported
                    ? "Voice input not supported in this browser"
                    : listening
                    ? "Stop"
                    : "Hold to speak"
                }
              >
                {listening ? (
                  <>
                    <MicOff className="size-5" />
                    <span className="absolute inset-0 rounded-pill ring-4 ring-red-500/30 animate-pulse-glow" />
                  </>
                ) : (
                  <Mic className="size-5" />
                )}
              </button>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder={PROMPT_PLACEHOLDER[locale]}
                dir={localeInfo.dir}
                rows={1}
                className="flex-1 resize-none bg-bg-elevated border border-line rounded-md px-3 py-2.5 text-sm text-ink placeholder:text-ink-dim focus:outline-none focus:border-accent/60 max-h-28"
              />
              <button
                onClick={send}
                disabled={!draft.trim() || thinking}
                className="shrink-0 grid place-items-center size-11 rounded-pill bg-white/10 hover:bg-white/15 text-ink disabled:opacity-40 transition"
                aria-label="Send"
              >
                <Send className="size-4" />
              </button>
            </div>
            {!sttSupported && (
              <p className="mt-2 text-[11px] text-ink-dim">
                Voice input is not supported in this browser. You can still type.
                Use Chrome or Edge on Android/desktop for the best experience.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
