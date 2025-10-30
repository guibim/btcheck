import Header from "@/components/Header";
import SupportSection from "@/components/SupportSection";
import PriceSection from "@/components/PriceSection";
import BTCConverter from "@/components/BTCConverter";
import NewsSection from "@/components/NewsSection";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/contexts/AppContext";

const Index = () => {
  const { t } = useApp();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <section className="container py-12 md:py-16 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            {t("hero_title")} <span className="text-primary">{t("hero_title_highlight")}</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            {t("hero_subtitle")}
          </p>
        </section>

        <div className="container pb-12">
          <Tabs defaultValue="cotacao" className="w-full">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="cotacao">{t("tab_quote_news")}</TabsTrigger>
              <TabsTrigger value="apoie">{t("tab_support")}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="cotacao" className="space-y-8">
              <PriceSection />
              <BTCConverter />
              <NewsSection />
            </TabsContent>
            
            <TabsContent value="apoie">
              <SupportSection />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
