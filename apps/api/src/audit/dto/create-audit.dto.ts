import { IsUrl, IsNotEmpty } from 'class-validator';

export class CreateAuditDto {
  @IsUrl({}, { message: 'Invalid URL format' })
  @IsNotEmpty({ message: 'URL is required' })
  url!: string;
}
