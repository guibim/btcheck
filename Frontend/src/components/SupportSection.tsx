import lightningQR from "@/assets/lightning-qr.jpeg";
import { useApp } from "@/contexts/AppContext";

const SupportSection = () => {
  const { t } = useApp();

  return (
    <section className="border-b border-border bg-card/50">
      <div className="container py-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
            {t("support_title")}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            {t("support_subtitle")}
          </p>
          <div className="flex justify-center">
            <img 
              src={lightningQR} 
              alt="QR Code Lightning para doações" 
              className="w-full max-w-[200px] rounded-lg border border-border"
            />
          </div>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>
              Agradecimentos especiais ao{" "}
              <a 
                href="https://www.youtube.com/@ClarezaDigital" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Gabriel Vedovelli (Clareza Digital)
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SupportSection;
