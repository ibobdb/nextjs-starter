import { PageHeader } from '@/components/common/page-header';
import { StatCard } from '@/components/common/stat-card';
import { OverviewChart } from '@/components/dashboard/overview-chart';
import { RecentSales } from '@/components/dashboard/recent-sales';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, CreditCard, DollarSign, Users } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of your platform today."
      />

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value="$45,231.89"
          icon={DollarSign}
          trend={{ value: 20.1, label: 'from last month' }}
        />
        <StatCard
          title="Subscriptions"
          value="+2350"
          icon={Users}
          trend={{ value: 180.1, label: 'from last month' }}
        />
        <StatCard
          title="Sales"
          value="+12,234"
          icon={CreditCard}
          trend={{ value: 19, label: 'from last month' }}
        />
        <StatCard
          title="Active Now"
          value="+573"
          icon={Activity}
          trend={{ value: 201, label: 'since last hour' }}
        />
      </div>

      {/* Charts & Lists */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              Monthly revenue graph for the current year.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart />
          </CardContent>
        </Card>

        <Card className="col-span-3 bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>
              You made 265 sales this month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentSales />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
