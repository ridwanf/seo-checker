import { auditService } from "@/services/audit.service";
import { useAuditStore } from "@/stores/audit.store";
import { useMutation } from "@tanstack/react-query";

export function useAudit() {
  const { setReport, setLoading, setError, setAnalyzedUrl } = useAuditStore();

  return useMutation({
    mutationFn: (url: string) => auditService.analyze(url),
    onMutate: (url) => {
      setLoading(true);
      setAnalyzedUrl(url);
    },
    onSuccess: (report) => {
      setReport(report);
    },
    onError: (error: Error) => {
      setError(error.message || "An error occurred during the audit.");
    }
  })
}