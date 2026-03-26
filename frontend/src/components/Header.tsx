import { Sun, Moon, Globe, Mail, Home, FileText } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logoBtcheck from "@/assets/logo-btcheck.png";
import { FearGreedBadge } from "@/components/FearGreedBadge";

const Header = () => {
  const { language, theme, setLanguage, setTheme, t } = useApp();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container">
        <div className="flex flex-col md:flex-row md:h-16 md:items-center md:justify-between py-3 md:py-0 gap-3 md:gap-0">
          {/* Logo and Title Section */}
          <div className="flex items-center gap-2">
            <img src={logoBtcheck} alt="btcheck logo" className="h-8 w-8 flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-primary">{t("header_title")}</h1>
              <p className="text-xs text-muted-foreground">{t("header_subtitle")}</p>
            </div>
          </div>

          {/* Actions Section */}
          <div className="flex items-center justify-between md:justify-end gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="h-9 w-9 text-primary hover:text-primary/90 hover:bg-primary/10 flex-shrink-0"
                title="Home"
              >
                <Home className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/paper")}
                className="h-9 gap-1.5 px-3 text-muted-foreground hover:text-foreground flex-shrink-0"
                title={t("paper_button")}
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline text-xs font-medium">{t("paper_button")}</span>
              </Button>

              <div className="flex-shrink-0">
                <FearGreedBadge />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/newsletter")}
                className="h-9 w-9 flex-shrink-0"
                title={t("newsletter_button")}
              >
                <Mail className="h-5 w-5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0">
                    <Globe className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover z-[100]">
                  <DropdownMenuItem onClick={() => setLanguage("pt-BR")} className="cursor-pointer">
                    🇧🇷 Português {language === "pt-BR" && "✓"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage("en")} className="cursor-pointer">
                    🇺🇸 English {language === "en" && "✓"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="h-9 w-9 flex-shrink-0"
              >
                {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
