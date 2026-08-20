import { NextRequest, NextResponse } from 'next/server';
import { currencyService } from '@/lib/currency/currency.service';
import { ConversionRequest } from '@/lib/currency/currency.types';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ConversionRequest;
    const apiKey =
      body.apiKey || request.headers.get('x-api-key') || undefined;

    if (!body.from || !body.to) {
      return NextResponse.json(
        { success: false, error: 'Both "from" and "to" currency codes are required.' },
        { status: 400 }
      );
    }

    if (body.amount === undefined || isNaN(Number(body.amount)) || Number(body.amount) < 0) {
      return NextResponse.json(
        { success: false, error: 'Valid non-negative amount is required.' },
        { status: 400 }
      );
    }

    // Validate date format if provided (YYYY-MM-DD)
    if (body.date && !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
      return NextResponse.json(
        { success: false, error: 'Historical date must be in YYYY-MM-DD format.' },
        { status: 400 }
      );
    }

    const conversionResult = await currencyService.convert({
      from: body.from,
      to: body.to,
      amount: Number(body.amount),
      date: body.date,
      apiKey,
    });

    return NextResponse.json({
      success: true,
      data: conversionResult,
    });
  } catch (error) {
    console.error('Error in /api/convert (POST):', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Conversion failed.',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const amountStr = searchParams.get('amount');
    const date = searchParams.get('date') || undefined;
    const customKey =
      searchParams.get('apikey') || request.headers.get('x-api-key') || undefined;

    if (!from || !to) {
      return NextResponse.json(
        { success: false, error: 'Both "from" and "to" currency parameters are required.' },
        { status: 400 }
      );
    }

    const amount = amountStr ? Number(amountStr) : 1;

    const conversionResult = await currencyService.convert({
      from,
      to,
      amount,
      date,
      apiKey: customKey,
    });

    return NextResponse.json({
      success: true,
      data: conversionResult,
    });
  } catch (error) {
    console.error('Error in /api/convert (GET):', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Conversion failed.',
      },
      { status: 500 }
    );
  }
}
