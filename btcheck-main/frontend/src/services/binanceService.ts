export interface BinanceKline {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
  quoteAssetVolume: string;
  numberOfTrades: number;
  takerBuyBaseAssetVolume: string;
  takerBuyQuoteAssetVolume: string;
}

export interface DailyPrice {
  date: Date;
  price: number;
  change?: number;
  changePercent?: number;
}

export async function fetchBinanceHistory(days: number): Promise<DailyPrice[]> {
  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&limit=${days}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch data from Binance');
    }
    
    const data = await response.json();
    
    const prices: DailyPrice[] = data.map((kline: any) => ({
      date: new Date(kline[6]), // closeTime
      price: parseFloat(kline[4]), // close price
    }));
    
    // Calculate changes
    for (let i = prices.length - 1; i > 0; i--) {
      const current = prices[i];
      const previous = prices[i - 1];
      current.change = current.price - previous.price;
      current.changePercent = (current.change / previous.price) * 100;
    }
    
    return prices.reverse(); // Most recent first
  } catch (error) {
    console.error('Error fetching Binance data:', error);
    throw error;
  }
}

export async function fetchPriceForDate(date: Date): Promise<number | null> {
  try {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);
    
    const response = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&startTime=${startOfDay.getTime()}&endTime=${endOfDay.getTime()}&limit=1`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch data from Binance');
    }
    
    const data = await response.json();
    
    if (data.length === 0) {
      return null;
    }
    
    return parseFloat(data[0][4]); // close price
  } catch (error) {
    console.error('Error fetching price for date:', error);
    return null;
  }
}
