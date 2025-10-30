const Footer = () => {
  return (
    <footer className="border-t border-border/40 bg-card/50 py-8">
      <div className="container">
        <div className="flex flex-col items-center gap-2 text-center">
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
