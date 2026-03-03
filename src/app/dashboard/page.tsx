'use client';

import { 
  ShieldCheck, 
  Users, 
  Settings, 
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardOverviewPage() {
  const features = [
    {
      title: "User Management",
      description: "Manage users, profiles, and account settings.",
      icon: Users,
      link: "/dashboard/users",
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "Role-Based Access",
      description: "Fine-grained control over permissions and roles.",
      icon: ShieldCheck,
      link: "/dashboard/access",
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    },
    {
      title: "System Config",
      description: "Dynamic configuration updated in real-time.",
      icon: Settings,
      link: "/dashboard/settings/system",
      color: "text-orange-500",
      bg: "bg-orange-500/10"
    },
    {
      title: "Documentation",
      description: "Learn how to extend this starter kit.",
      icon: BookOpen,
      link: "https://github.com",
      color: "text-green-500",
      bg: "bg-green-500/10"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Welcome to DBStudio
        </h1>
        <p className="text-lg text-muted-foreground">
          Your modern, secure, and extensible Next.js starter kit.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <Card key={feature.title} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className={`p-3 rounded-xl w-fit ${feature.bg} ${feature.color} mb-3`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" size="sm" className="group/btn gap-2 p-0 hover:bg-transparent" asChild>
                <Link href={feature.link}>
                  Explore <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden relative">
        <CardHeader className="pb-0">
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Follow these steps to customize your new dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">1</span>
                Update Branding
              </h4>
              <p className="text-sm text-muted-foreground ml-8">
                Change the company name, logo, and theme in the system settings.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">2</span>
                Configure Roles
              </h4>
              <p className="text-sm text-muted-foreground ml-8">
                Define your application permissions and map them to roles.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
