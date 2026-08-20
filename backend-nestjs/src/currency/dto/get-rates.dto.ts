import { IsOptional, IsString, Matches } from 'class-validator';

export class GetLatestRatesDto {
  @IsOptional()
  @IsString()
  baseCurrency?: string;

  @IsOptional()
  @IsString()
  currencies?: string;

  @IsOptional()
  @IsString()
  customApiKey?: string;
}

export class GetHistoricalRatesDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be formatted as YYYY-MM-DD' })
  date: string;

  @IsOptional()
  @IsString()
  baseCurrency?: string;

  @IsOptional()
  @IsString()
  currencies?: string;

  @IsOptional()
  @IsString()
  customApiKey?: string;
}
