"use client"

import useSWR from "swr"
import { DataLoader } from "@/components/common/data-loader"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { statsApi } from "@/services/ts-worker/api/stats"

const chartConfig = {
  itemsCreated: {
    label: "Items Found",
    color: "var(--chart-1)",
  },
  runCount: {
    label: "Runs",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

const fetchGrowth = () => statsApi.getGrowthMetrics().then((res) => {
  if (res.success && res.data?.summary) {
    return res.data.summary
      .map((item, index) => ({
        name: item.source.name,
        itemsCreated: item._sum.itemsCreated,
        fill: COLORS[index % COLORS.length],
      }))
      .sort((a, b) => b.itemsCreated - a.itemsCreated);
  }
  throw new Error('Failed to fetch growth metrics');
});

export default function WorkerGrowth() {
  const { data, isLoading } = useSWR('ts-worker/stats/growth', fetchGrowth, {
    // refreshInterval: 60_000,      // refresh every 60s (less critical than health)
    revalidateOnFocus: false,
    dedupingInterval: 30_000,
  });

  if (isLoading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Source Performance</CardTitle>
          <CardDescription>Total items discovered per source</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <DataLoader isLoading={true} skeletonVariant="card" skeletonProps={{ className: "w-full" }} />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Source Performance</CardTitle>
        <CardDescription>Total items discovered per source</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{
              left: 20,
              right: 20
            }}
          >
            <CartesianGrid horizontal={false} strokeOpacity={0.2} />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={100}
              fontSize={12}
            />
            <XAxis dataKey="itemsCreated" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="itemsCreated" layout="vertical" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}