import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module";
import { ReportController } from "./reports.controller";
import { ReportsService } from "./reports.service";

@Module({
  imports: [AuditModule],
  controllers: [ReportController],
  providers: [ReportsService]
})

export class ReportsModule { }