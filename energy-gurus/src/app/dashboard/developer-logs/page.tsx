import { redirect } from "next/navigation";
import { getUserRole } from "@/lib/roles";
import { getDeveloperLogs } from "@/lib/actions/developer-logs-actions";
import { DeveloperLogsClient } from "@/components/dashboard/developer-logs-client";

export const dynamic = "force-dynamic";

export default async function DeveloperLogsPage() {
  const userRole = await getUserRole();

  if (userRole !== "super-admin" && userRole !== "admin") {
    redirect("/dashboard");
  }

  const initialData = await getDeveloperLogs({
    timeframe: "7d",
    logType: "all",
    page: 1,
    limit: 50,
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <DeveloperLogsClient initialData={initialData as any} />
    </div>
  );
}
