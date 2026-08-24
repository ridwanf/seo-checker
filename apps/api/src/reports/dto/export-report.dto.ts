import { IsIn, IsNotEmpty, IsObject, IsOptional, IsUrl } from 'class-validator';

export class ExportReportDto {
  @IsUrl({}, { message: 'Invalid URL format' })
  @IsNotEmpty({ message: 'URL is required' })
  url!: string;

  @IsIn(['pdf', 'csv', 'json'], { message: 'Format must be "pdf", "csv", or "json"' })
  format!: 'pdf' | 'csv' | 'json';

  /**
  * Opsional: kalau client kirim hasil audit yang sudah ada,
  * dipakai langsung tanpa re-crawl. Tanpa @Type/@ValidateNested,
  * isi object dibiarkan apa adanya (cocok untuk whitelist pipe).
  */
  @IsOptional()
  @IsObject({ message: 'report must be an object' })
  report?: Record<string, unknown>;
}
