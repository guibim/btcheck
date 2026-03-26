import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MailX, CheckCircle, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useApp } from "@/contexts/AppContext";
import { API_URL } from "@/lib/constants";

type Status = "idle" | "loading" | "success" | "error";

const Unsubscribe = () => {
  const { t } = useApp();
  const [searchParams] = useSearchParams();
  const [email,  setEmail]  = useState("");
  const [status, setStatus] = useState<Status>("idle");

  // Via link do e-mail (?token=xxx) → cancela automaticamente
  useEffect(() => {
    const token = searchParams.get("token");
    if (!token || !API_URL) return;

    setStatus("loading");
    fetch(`${API_URL}/unsubscribe`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ token }),
    })
      .then((r) => setStatus(r.ok ? "success" : "error"))
      .catch(() => setStatus("error"));
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !API_URL) return;
    setStatus("loading");

    try {
      const res = await fetch(`${API_URL}/unsubscribe`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-12 md:py-20">
        <div className="mx-auto max-w-md text-center">

          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 text-destructive">
              <MailX className="w-8 h-8" />
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-3 text-foreground">
            {t("unsubscribe_title")}
          </h1>

          <div className="mt-8 rounded-2xl border border-border bg-card p-8 shadow-lg">
            {status === "loading" && (
              <p className="text-muted-foreground">{t("unsubscribe_submitting")}</p>
            )}

            {status === "success" && (
              <div className="flex flex-col items-center gap-3 py-2">
                <CheckCircle className="w-10 h-10 text-green-500" />
                <p className="font-medium text-foreground">{t("unsubscribe_success")}</p>
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col items-center gap-3 py-2">
                <AlertCircle className="w-10 h-10 text-destructive" />
                <p className="text-sm text-muted-foreground">{t("unsubscribe_error")}</p>
              </div>
            )}

            {status === "idle" && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  {t("unsubscribe_description")}
                </p>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2 text-left">
                    {t("unsubscribe_email_label")}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@email.com"
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!API_URL}
                  className="w-full rounded-lg border border-destructive/50 bg-destructive/10 px-6 py-3 font-semibold text-destructive transition hover:bg-destructive/20 disabled:opacity-60"
                >
                  {t("unsubscribe_submit")}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Unsubscribe;
