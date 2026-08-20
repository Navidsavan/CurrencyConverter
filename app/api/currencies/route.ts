import { NextRequest, NextResponse } from 'next/server';
import { currencyService } from '@/lib/currency/currency.service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const customKey =
      searchParams.get('apikey') || request.headers.get('x-api-key') || undefined;

    const result = await currencyService.getCurrencies(customKey);

    return NextResponse.json({
      success: true,
      data: result.currencies,
      source: result.source,
      count: Object.keys(result.currencies).length,
    });
  } catch (error) {
    console.error('Error in /api/currencies:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
