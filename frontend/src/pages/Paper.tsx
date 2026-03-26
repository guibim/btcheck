import { Download, ArrowLeft, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";

const Paper = () => {
  const { language, t } = useApp();
  const navigate = useNavigate();

  const base = import.meta.env.BASE_URL;
  const pdfFile = language === "en" ? "bitcoin.pdf" : "bitcoin_pt_br.pdf";
  const pdfUrl  = `${base}${pdfFile}`;

  return (
    <div className="flex flex-col h-screen bg-background">

      {/* Barra superior */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background/95 backdrop-blur z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("paper_back")}
          </Button>

          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">{t("paper_title")}</span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {language === "en" ? "English" : "Português"}
            </span>
          </div>
        </div>

        <a
          href={pdfUrl}
          download={pdfFile}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">{t("paper_download")}</span>
        </a>
      </div>

      {/* PDF embed */}
      <div className="flex-1 relative">
        <iframe
          src={pdfUrl}
          title={t("paper_title")}
          className="absolute inset-0 w-full h-full border-0"
        />

        {/* Fallback para browsers que não suportam iframe de PDF */}
        <noscript>
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
            <FileText className="h-16 w-16 text-primary" />
            <p className="text-muted-foreground">{t("paper_fallback")}</p>
            <a
              href={pdfUrl}
              download
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition"
            >
              <Download className="h-4 w-4" />
              {t("paper_download")}
            </a>
          </div>
        </noscript>
      </div>

    </div>
  );
};

export default Paper;
