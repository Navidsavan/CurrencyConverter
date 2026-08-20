import { NextRequest, NextResponse } from 'next/server';
import { currencyService } from '@/lib/currency/currency.service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const customKey =
      searchParams.get('apikey') || request.headers.get('x-api-key') || undefined;

    const statusInfo = await currencyService.getStatus(customKey);

    return NextResponse.json({
      success: true,
      ...statusInfo,
    });
  } catch (error) {
    console.error('Error in /api/status:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch status.',
      },
      { status: 500 }
    );
  }
}
