import { SectionCards } from './_component/section-card';
import { ChartAreaInteractive } from './_component/chart';
export default function DefaultDashboardPage() {
  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <SectionCards />
      <ChartAreaInteractive />
    </div>
  );
}
