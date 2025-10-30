import { Sun, Moon, Globe } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logoBtcheck from "@/assets/logo-btcheck.png";

const Header = () => {
  const { language, theme, setLanguage, setTheme, t } = useApp();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={logoBtcheck} alt="btcheck logo" className="h-8 w-8" />
          <div>
            <h1 className="text-xl font-bold text-primary">{t("header_title")}</h1>
            <p className="text-xs text-muted-foreground">{t("header_subtitle")}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
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
            className="h-9 w-9"
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
