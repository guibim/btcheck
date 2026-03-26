import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const navigate = useNavigate();

  const handleSupportClick = () => {
    navigate("/?tab=apoie");
    // Scroll to top to ensure user sees the tabs
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-border/40 bg-card/50 py-8">
      <div className="container">
        <div className="flex flex-col items-center gap-4 text-center">
          <Button 
            onClick={handleSupportClick}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Apoie o Projeto
          </Button>
          
          <p className="text-sm text-muted-foreground">
            btcheck — dados automatizados • Desenvolvido por{" "}
            <a 
              href="https://github.com/guibim" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Guilherme Bim
            </a>
            {" "}• Powered by GitHub Pages & Neon • Data provided by:{" "}
            <a 
              href="https://www.coingecko.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              CoinGecko
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
