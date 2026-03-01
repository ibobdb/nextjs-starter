import { 
  ServerCrash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";

export default async function UnavailablePage({
  searchParams,
}: {
  searchParams: Promise<{ module?: string }>;
}) {
  const params = await searchParams;
  const moduleName = params.module || "This module";

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="bg-destructive/10 p-6 rounded-full mb-6 ring-8 ring-destructive/5">
        <ServerCrash className="h-16 w-16 text-destructive" />
      </div>
      
      <h1 className="text-3xl font-bold tracking-tight mb-3">Module Offline</h1>
      <p className="text-muted-foreground max-w-[500px] mb-8">
        We're sorry, but <strong>{moduleName}</strong> is currently disabled or undergoing maintenance. 
        Please contact your system administrator or try again later.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild size="lg" className="font-semibold">
          <Link href="/dashboard/default">
            Return to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
