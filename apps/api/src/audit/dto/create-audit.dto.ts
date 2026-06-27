import { IsUrl } from 'class-validator';

export class CreateAuditDto {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsUrl({
    require_protocol: true,
  })
  url!: string;
}
