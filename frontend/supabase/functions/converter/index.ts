import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const btcAmount = parseFloat(url.searchParams.get('btc') || '0');

    if (isNaN(btcAmount) || btcAmount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Valor BTC inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar cotação atual
    const priceResponse = await fetch('https://guibim.github.io/btcheck/btc_price.json');
    if (!priceResponse.ok) {
      throw new Error('Erro ao buscar cotação');
    }

    const priceData = await priceResponse.json();
    const btcUsd = priceData.btc_usd;

    // Calcular conversões
const usd = btcAmount * btcUsd;

// Buscar taxa de câmbio USD → BRL em tempo real (Frankfurter)
let usdToBrl = 5.30; // valor padrão caso API falhe

try {
  const fxRes = await fetch("https://api.frankfurter.app/latest?from=USD&to=BRL");
  if (fxRes.ok) {
    const fxData = await fxRes.json();
    if (fxData?.rates?.BRL) {
      usdToBrl = fxData.rates.BRL;
      console.log(`Taxa real USD→BRL obtida: ${usdToBrl} (${fxData.date})`);
    }
  } else {
    console.warn("Falha ao buscar taxa Frankfurter, usando taxa fixa de fallback.");
  }
} catch (err) {
  console.warn("Erro ao conectar à Frankfurter API, usando taxa fixa:", err);
}

// Converter USD → BRL
const brl = usd * usdToBrl;

console.log(`Conversão: ${btcAmount} BTC = ${usd.toFixed(2)} USD = ${brl.toFixed(2)} BRL`);

    return new Response(
      JSON.stringify({
        btc: btcAmount,
        usd: parseFloat(usd.toFixed(2)),
        brl: parseFloat(brl.toFixed(2))
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Erro no conversor:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || 'Erro ao converter' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
