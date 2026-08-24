import { Body, Controller, Post, StreamableFile } from "@nestjs/common";
import { ReportsService } from "./reports.service";
import { ExportReportDto } from "./dto/export-report.dto";

@Controller('reports')
export class ReportController {
  constructor(
    private readonly reportService: ReportsService
  ) { }

  @Post('export')
  async export(@Body() dto: ExportReportDto): Promise<StreamableFile> {
    const { buffer, contentType, filename } = await this.reportService.export(dto);
    return new StreamableFile(buffer, {
      type: contentType,
      disposition: `attachment; filename="${filename}"`,
      length: buffer.length,
    })
  }
}