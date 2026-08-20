import { IsNotEmpty, IsNumber, IsOptional, IsString, Length, Matches, Min } from 'class-validator';

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
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be formatted as YYYY-MM-DD' })
  date?: string;

  @IsOptional()
  @IsString()
  customApiKey?: string;
}
