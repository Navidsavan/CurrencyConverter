import { NextRequest, NextResponse } from 'next/server';
import { currencyService } from '@/lib/currency/currency.service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const base = searchParams.get('base') || searchParams.get('base_currency') || 'USD';
    const customKey =
      searchParams.get('apikey') || request.headers.get('x-api-key') || undefined;

    if (!date) {
      return NextResponse.json(
        { success: false, error: 'Date parameter (YYYY-MM-DD) is required.' },
        { status: 400 }
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format. Expected YYYY-MM-DD.' },
        { status: 400 }
      );
    }

    const result = await currencyService.getHistoricalRates(date, base, customKey);

    return NextResponse.json({
      success: true,
      date: result.date,
      base: base.toUpperCase(),
      rates: result.rates,
      source: result.source,
    });
  } catch (error) {
    console.error('Error in /api/rates/historical:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch historical rates.',
      },
      { status: 500 }
    );
  }
}
