/// <reference types="https://deno.land/x/types/index.d.ts" />
// @ts-nocheck - Deno types not available in IDE
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface PriceAlert {
    id: string;
    user_id: string;
    peptide_name: string;
    target_price: number;
    is_active: boolean;
    profiles?: { email: string };
}

interface PriceData {
    price: string;
}

Deno.serve(async (_req: Request) => {
    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Get all active alerts
        const { data: alerts, error: alertsError } = await supabase
            .from('price_alerts')
            .select('*, profiles(email)')
            .eq('is_active', true)

        if (alertsError) throw alertsError

        const results: Array<{
            user: string;
            peptide: string;
            alertPrice: number;
            currentPrice: number;
            status: string;
        }> = []

        // 2. For each alert, check current price
        for (const alert of (alerts as PriceAlert[])) {
            const { data: currentPriceData } = await supabase
                .rpc('get_peptide_prices', { p_peptide_slug: alert.peptide_name.toLowerCase() })

            if (currentPriceData && currentPriceData.length > 0) {
                const bestPrice = Math.min(...(currentPriceData as PriceData[]).map((p: PriceData) => parseFloat(p.price)))

                if (bestPrice <= alert.target_price) {
                    results.push({
                        user: alert.user_id,
                        peptide: alert.peptide_name,
                        alertPrice: alert.target_price,
                        currentPrice: bestPrice,
                        status: 'triggered'
                    })

                    await supabase
                        .from('price_alerts')
                        .update({ last_triggered_at: new Date().toISOString() })
                        .eq('id', alert.id)
                }
            }
        }

        return new Response(
            JSON.stringify(results),
            { headers: { "Content-Type": "application/json" } },
        )
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return new Response(
            JSON.stringify({ error: message }),
            { headers: { "Content-Type": "application/json" }, status: 400 },
        )
    }
})
