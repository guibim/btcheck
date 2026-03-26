import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchCurrentFng, fetchFngHistory } from "@/services/fearGreedService";
import { 
  getFngColor, 
  getFngBand, 
  formatFngDate, 
  formatFngDateShort,
  getFngBands,
  FngData 
} from "@/lib/fearGreedUtils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ExternalLink, RefreshCw } from "lucide-react";

const FALLBACK_IMAGE = "https://alternative.me/crypto/fear-and-greed-index.png";
const ITEMS_PER_PAGE = 20;

/**
 * Fear & Greed Index detailed page
 * Shows current value, chart, legend, and history table
 */
const FearAndGreed = () => {
  const { t } = useApp();
  const [current, setCurrent] = useState<FngData | null>(null);
  const [history, setHistory] = useState<FngData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(false);

    try {
      const [currentData, historyData] = await Promise.all([
        fetchCurrentFng(),
        fetchFngHistory(),
      ]);

      if (currentData) {
        setCurrent(currentData);
      }

      if (historyData && historyData.length > 0) {
        setHistory(historyData);
        setError(false);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare chart data (reverse to show oldest to newest)
  const chartData = [...history]
    .reverse()
    .map((item) => ({
      date: formatFngDateShort(item.timestamp),
      value: parseInt(item.value),
      fullDate: formatFngDate(item.timestamp),
      classification: getFngBand(parseInt(item.value)),
    }));

  // Paginate table data
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedHistory = history.slice(startIndex, endIndex);
  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);

  const bands = getFngBands();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-8 animate-fadeIn">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Current Value */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl text-primary flex items-center gap-2">
                🧠 {t("fear_greed_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="text-center space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-4 w-48 mx-auto" />
                </div>
              ) : error || !current ? (
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    API temporarily unavailable
                  </p>
                  <img
                    src={FALLBACK_IMAGE}
                    alt="Fear & Greed Index"
                    className="mx-auto max-w-full h-auto rounded-lg"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadData}
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </Button>
                </div>
              ) : (
                <>
                  <div className="text-center space-y-2">
                    <div className="text-5xl font-bold">
                      <span style={{ color: getFngColor(parseInt(current.value)) }}>
                        {current.value}
                      </span>
                    </div>
                    <div className="text-2xl font-semibold">
                      <span style={{ color: getFngColor(parseInt(current.value)) }}>
                        {getFngBand(parseInt(current.value))}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Updated: {formatFngDate(current.timestamp)}
                    </p>
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap justify-center gap-3 pt-4">
                    {bands.map((band) => (
                      <div
                        key={band.label}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span
                          className="inline-flex h-3 w-3 rounded-full"
                          style={{ backgroundColor: band.color }}
                        />
                        <span className="text-foreground">
                          {band.label} ({band.min}–{band.max})
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Chart */}
          {!error && history.length > 0 && (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg text-foreground flex items-center gap-2">
                  📈 {t("fear_greed_chart")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      domain={[0, 100]}
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number, name: string, props: any) => [
                        `${value} - ${props.payload.classification}`,
                        "Index"
                      ]}
                      labelFormatter={(label: string, payload: any) => 
                        payload?.[0]?.payload?.fullDate || label
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#f7931a"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* History Table */}
          {!error && history.length > 0 && (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg text-foreground flex items-center gap-2">
                  📅 {t("fear_greed_history")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-4 text-sm font-semibold text-foreground">
                          Date
                        </th>
                        <th className="text-center py-2 px-4 text-sm font-semibold text-foreground">
                          Value
                        </th>
                        <th className="text-left py-2 px-4 text-sm font-semibold text-foreground">
                          Classification
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedHistory.map((item) => {
                        const value = parseInt(item.value);
                        const color = getFngColor(value);
                        const band = getFngBand(value);

                        return (
                          <tr
                            key={item.timestamp}
                            className="border-b border-border/50 hover:bg-accent/50"
                          >
                            <td className="py-2 px-4 text-sm text-muted-foreground">
                              {formatFngDate(item.timestamp)}
                            </td>
                            <td className="py-2 px-4 text-center">
                              <span
                                className="text-sm font-semibold"
                                style={{ color }}
                              >
                                {value}
                              </span>
                            </td>
                            <td className="py-2 px-4">
                              <span
                                className="text-sm font-medium"
                                style={{ color }}
                              >
                                {band}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Attribution */}
          <Card className="border-border/50 bg-accent/20">
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground text-center">
                Data:{" "}
                <a
                  href="https://alternative.me/crypto/fear-and-greed-index/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  alternative.me (Crypto Fear & Greed Index)
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FearAndGreed;
