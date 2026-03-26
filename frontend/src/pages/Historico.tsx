import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useApp } from "@/contexts/AppContext";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon, TrendingUp, TrendingDown } from "lucide-react";
import { fetchBinanceHistory, fetchPriceForDate, type DailyPrice } from "@/services/binanceService";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type PeriodFilter = 7 | 30 | 90;

const Historico = () => {
  const { t } = useApp();
  const [period, setPeriod] = useState<PeriodFilter>(30);
  const [data, setData] = useState<DailyPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [datePrice, setDatePrice] = useState<number | null>(null);
  const [dateLoading, setDateLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const prices = await fetchBinanceHistory(period);
      setData(prices);
    } catch (err) {
      setError("Erro ao carregar dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = async (date: Date | undefined) => {
    setSelectedDate(date);
    if (!date) {
      setDatePrice(null);
      return;
    }

    setDateLoading(true);
    try {
      const price = await fetchPriceForDate(date);
      setDatePrice(price);
    } catch (err) {
      setDatePrice(null);
    } finally {
      setDateLoading(false);
    }
  };

  // Reverse data for chart (oldest to newest, left to right)
  const chartDataReversed = [...data].reverse();
  
  const chartData = {
    labels: chartDataReversed.map(d => format(d.date, "dd/MM", { locale: ptBR })),
    datasets: [
      {
        label: 'BTC/USDT',
        data: chartDataReversed.map(d => d.price),
        borderColor: '#3b82f6', // Blue-500 - high contrast
        backgroundColor: 'rgba(59, 130, 246, 0.1)', // Blue with transparency
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#000000',
        bodyColor: '#000000',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context: any) => `$${context.parsed.y.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          color: '#6b7280', // Gray-500
          callback: (value: any) => `$${value.toLocaleString('en-US')}`,
        },
        grid: {
          color: 'rgba(229, 231, 235, 0.3)', // Light gray grid
        },
      },
      x: {
        ticks: {
          color: '#6b7280', // Gray-500
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-12 md:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              📈 {t("history_title")}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t("history_description")}
            </p>
          </div>

          {/* Calendar Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Consultar Data Específica</CardTitle>
              <CardDescription>
                Selecione uma data para ver a cotação de fechamento (23:59 UTC)
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-6 items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full md:w-[280px] justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => date > new Date() || date < new Date("2010-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {dateLoading && <Skeleton className="h-12 w-48" />}
              
              {!dateLoading && datePrice !== null && (
                <div className="text-center md:text-left">
                  <p className="text-sm text-muted-foreground">Cotação de Fechamento</p>
                  <p className="text-2xl font-bold text-primary">
                    ${datePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              )}

              {!dateLoading && selectedDate && datePrice === null && (
                <p className="text-sm text-destructive">Dados não disponíveis para esta data</p>
              )}
            </CardContent>
          </Card>

          {/* Filters */}
          <div className="flex gap-2 mb-6 flex-wrap">
            <Button
              variant={period === 7 ? "default" : "outline"}
              onClick={() => setPeriod(7)}
            >
              Últimos 7 dias
            </Button>
            <Button
              variant={period === 30 ? "default" : "outline"}
              onClick={() => setPeriod(30)}
            >
              Últimos 30 dias
            </Button>
            <Button
              variant={period === 90 ? "default" : "outline"}
              onClick={() => setPeriod(90)}
            >
              Últimos 90 dias
            </Button>
          </div>

          {/* Chart */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Gráfico de Cotação</CardTitle>
              <CardDescription>BTC/USDT - Últimos {period} dias</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : error ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-destructive">{error}</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                  <div className="h-[300px] md:h-[400px]">
                    <Line data={chartData} options={chartOptions} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Cotações</CardTitle>
              <CardDescription>1 cotação por dia (fechamento às 23:59 UTC)</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : error ? (
                <p className="text-center text-destructive py-8">{error}</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-right">Cotação</TableHead>
                        <TableHead className="text-right">Variação</TableHead>
                        <TableHead className="text-center">Tendência</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {format(item.date, "dd/MM/yyyy", { locale: ptBR })}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.change !== undefined && (
                              <span className={item.change >= 0 ? "text-green-500" : "text-red-500"}>
                                {item.change >= 0 ? "+" : ""}
                                {item.changePercent?.toFixed(2)}%
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {item.change !== undefined && (
                              item.change >= 0 ? (
                                <TrendingUp className="inline h-5 w-5 text-green-500" />
                              ) : (
                                <TrendingDown className="inline h-5 w-5 text-red-500" />
                              )
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Historico;
