import { NextRequest, NextResponse } from 'next/server';
import { currencyService } from '@/lib/currency/currency.service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const base = searchParams.get('base') || searchParams.get('base_currency') || 'USD';
    const customKey =
      searchParams.get('apikey') || request.headers.get('x-api-key') || undefined;

    const result = await currencyService.getLatestRates(base, customKey);

    return NextResponse.json({
      success: true,
      base: base.toUpperCase(),
      rates: result.rates,
      source: result.source,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in /api/rates/latest:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch rates.',
      },
      { status: 500 }
    );
  }
}
