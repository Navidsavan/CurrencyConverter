import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Length, Matches } from 'class-validator';

export class ConvertCurrencyDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 4)
  fromCurrency: string;

  @IsNotEmpty()
  @IsString()
  @Length(3, 4)
  toCurrency: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be formatted as YYYY-MM-DD' })
  date?: string;

  @IsOptional()
  @IsString()
  customApiKey?: string;
}
