import { useState } from "react";
import { Mail, CheckCircle, AlertCircle, Globe } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useApp } from "@/contexts/AppContext";
import { API_URL } from "@/lib/constants";

type Lang   = "pt-BR" | "en";
type Status = "idle" | "loading" | "success" | "error";

const Newsletter = () => {
  const { t, language } = useApp();
  const [email,  setEmail]  = useState("");
  const [lang,   setLang]   = useState<Lang>(language);
  const [status, setStatus] = useState<Status>("idle");
  const [errMsg, setErrMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    if (!API_URL) {
      setErrMsg(t("newsletter_error_generic"));
      setStatus("error");
      return;
    }
    setStatus("loading");
    setErrMsg("");

    try {
      const res = await fetch(`${API_URL}/subscribe`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim().toLowerCase(), lang }),
      });

      if (res.status === 201) {
        setStatus("success");
        setEmail("");
      } else {
        const data = await res.json().catch(() => ({}));
        setErrMsg(data.detail || t("newsletter_error_generic"));
        setStatus("error");
      }
    } catch {
      setErrMsg(t("newsletter_error_generic"));
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-12 md:py-20">
        <div className="mx-auto max-w-2xl">

          {/* Hero */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
                <Mail className="w-8 h-8" />
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "#f7931a" }}>
              {t("newsletter_title")}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("newsletter_description")}
            </p>
            <p className="mt-2 text-muted-foreground">
              {t("newsletter_schedule_prefix")}{" "}
              <strong className="text-foreground">{t("newsletter_schedule_highlight")}</strong>.
            </p>
          </div>

          {/* Form card */}
          <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
            {status === "success" ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-500" />
                <h2 className="text-xl font-semibold text-foreground">
                  {t("newsletter_success_title")}
                </h2>
                <p className="text-muted-foreground">{t("newsletter_success_body")}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t("newsletter_email_label")}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("newsletter_email_placeholder")}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                  />
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <Globe className="inline w-4 h-4 mr-1 -mt-0.5" />
                    {t("newsletter_lang_label")}
                  </label>
                  <div className="flex gap-3">
                    {(["pt-BR", "en"] as Lang[]).map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setLang(l)}
                        className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                          lang === l
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-muted-foreground hover:border-primary/40"
                        }`}
                      >
                        {l === "pt-BR" ? t("newsletter_lang_pt") : t("newsletter_lang_en")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Error */}
                {status === "error" && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {errMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
                >
                  {status === "loading" ? t("newsletter_submitting") : t("newsletter_submit")}
                </button>

                <p className="text-center text-xs text-muted-foreground">
                  {t("newsletter_already_label")}{" "}
                  <a href="unsubscribe" className="underline hover:text-foreground transition">
                    {t("newsletter_unsub_link")}
                  </a>
                </p>
              </form>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Newsletter;
