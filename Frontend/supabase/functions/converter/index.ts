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
    
    // Taxa BRL/USD aproximada (pode ser substituída por API real)
    const usdToBrl = 4.92;
    const brl = usd * usdToBrl;

    console.log(`Conversão: ${btcAmount} BTC = ${usd} USD = ${brl} BRL`);

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
