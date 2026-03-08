import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, KeyRound, Users, CheckCircle2, Github, Activity, Lock, Database, Cog } from "lucide-react";
import meta from "@/config/meta";

export default function WelcomePage() {
  return (
    <div className="flex h-screen flex-col bg-background font-sans overflow-hidden">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-6 lg:px-12">
          <div className="flex items-center gap-2">
            <Image src="/favicon.png" alt="Logo" width={20} height={20} className="object-contain" />
            <span className="font-bold tracking-tight text-xl">DB Studio</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="https://github.com/ibobdb/nextjs-starter" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              <Github className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative flex flex-col justify-center">
        {/* Custom Background Decoration */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_0%,rgba(var(--primary),0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_0%,rgba(var(--primary),0.07),rgba(0,0,0,0))]"></div>
        
        <div className="container mx-auto px-6 lg:px-12">
          {/* Hero Section Split Layout */}
          <section className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center py-10 lg:py-0 h-full">
            
            {/* Left Content */}
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left z-10">
              <Badge variant="outline" className="mb-8 rounded-full px-4 py-1.5 border-primary/20 bg-primary/5 text-primary">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                DB Studio Control Panel v{meta.version}
              </Badge>

              <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-4 leading-[1.1]">
                Manage Access with <br className="hidden lg:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-primary/70">Complete Certainty</span>
              </h1>

              <p className="max-w-2xl text-base text-muted-foreground mb-8 leading-relaxed">
                DB Studio is a production-ready dashboard engineered for granular security. Empower your team with strict Role-Based Access Control, passkey authentication, and real-time audit logs natively integrated out of the box.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Link href="/login" className="w-full sm:w-auto">
                  <Button className="rounded-full h-12 px-8 text-sm font-semibold w-full shadow-md hover:shadow-lg transition-all cursor-pointer group">
                    Live Demo
                  </Button>
                </Link>
                <Link href="https://docs.ibobdb.com" target="_blank" className="w-full sm:w-auto">
                  <Button variant="outline" className="rounded-full h-12 px-8 text-sm font-semibold w-full border-2 hover:bg-muted/50 cursor-pointer gap-2">
                    Documentation
                  </Button>
                </Link>
              </div>

              {/* Quick Feature Chips */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-12 text-sm text-muted-foreground max-w-2xl">
                <div className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-green-500" /> Layered RBAC</div>
                <div className="h-1 w-1 rounded-full bg-border hidden sm:block"></div>
                <div className="flex items-center gap-1.5"><KeyRound className="h-4 w-4 text-primary" /> WebAuthn & 2FA</div>
                <div className="h-1 w-1 rounded-full bg-border hidden sm:block"></div>
                <div className="flex items-center gap-1.5"><Activity className="h-4 w-4 text-amber-500" /> Real-time SSE</div>
                <div className="h-1 w-1 rounded-full bg-border hidden md:block"></div>
                <div className="flex items-center gap-1.5"><Lock className="h-4 w-4 text-rose-500" /> API Guard</div>
                <div className="h-1 w-1 rounded-full bg-border hidden sm:block"></div>
                <div className="flex items-center gap-1.5"><Database className="h-4 w-4 text-slate-500" /> System Audit Logs</div>
                <div className="h-1 w-1 rounded-full bg-border hidden lg:block"></div>
                <div className="flex items-center gap-1.5"><Cog className="h-4 w-4 text-blue-500" /> Background Tasks</div>
              </div>
            </div>

            {/* Right Visual Showcase / Mock UI */}
            <div className="relative w-full max-w-xl mx-auto lg:max-w-none lg:mx-0 lg:translate-x-4">
              <div className="relative rounded-2xl border border-border/50 bg-background/50 p-2 backdrop-blur-sm shadow-2xl xl:scale-105 xl:origin-center transform-gpu transition-transform hover:scale-[1.02] duration-500">
                <div className="absolute -left-10 -top-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse duration-10000"></div>
                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10 scale-150"></div>
                
                <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
                  {/* Mock Browser Header */}
                  <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-3">
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-red-400"></div>
                      <div className="h-3 w-3 rounded-full bg-amber-400"></div>
                      <div className="h-3 w-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="mx-auto flex h-6 w-1/2 items-center justify-center text-xs text-muted-foreground bg-background rounded-md shadow-sm">
                      <ShieldCheck className="h-3 w-3 mr-1.5 text-primary" /> Access Control
                    </div>
                  </div>
                  
                  {/* Mock Content */}
                  <div className="flex grid-cols-5 flex-col sm:grid">
                    {/* Mock Sidebar */}
                    <div className="col-span-2 border-r bg-muted/20 p-4 hidden sm:block h-full">
                      <div className="space-y-1">
                        <div className="h-[34px] rounded flex items-center px-2 text-sm text-foreground bg-primary/10 font-medium border border-primary/20 shadow-sm"><ShieldCheck className="mr-2 h-4 w-4 text-primary"/> Roles Selection</div>
                        <div className="h-8 rounded flex items-center px-2 text-sm text-muted-foreground"><Users className="mr-2 h-4 w-4 opacity-50"/> Staff Database</div>
                        <div className="h-8 rounded flex items-center px-2 text-sm text-muted-foreground"><KeyRound className="mr-2 h-4 w-4 opacity-50"/> Credentials</div>
                      </div>
                      
                      <div className="mt-8">
                        <div className="text-[10px] font-bold uppercase text-muted-foreground mb-2 px-2 tracking-wider">Active Modules</div>
                        <div className="flex flex-wrap gap-1 px-2">
                          <span className="h-1.5 w-6 rounded-full bg-blue-500/50"></span>
                          <span className="h-1.5 w-4 rounded-full bg-primary/50"></span>
                          <span className="h-1.5 w-8 rounded-full bg-green-500/50"></span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Mock Main Area */}
                    <div className="col-span-3 p-5 sm:p-6 bg-background">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <h3 className="text-base font-bold flex items-center gap-2">Senior Developer <Badge className="bg-primary hover:bg-primary/90 rounded px-1.5 py-0 text-[10px] uppercase h-5">Rank 2</Badge></h3>
                          <p className="text-xs text-muted-foreground">Engineering team access</p>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {[
                          { module: 'Source Code', perms: ['Read', 'Write'], active: true },
                          { module: 'Production DB', perms: ['Read'], active: true },
                          { module: 'Billing & Settings', perms: ['None'], active: false }
                        ].map((item, i) => (
                          <div key={i} className={`flex items-center justify-between rounded-lg border p-3 ${item.active ? 'bg-background shadow-xs border-primary/20 hover:border-primary/40 transition-colors' : 'bg-muted/30 text-muted-foreground'}`}>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className={`h-4 w-4 ${item.active ? 'text-primary' : 'text-muted-foreground/40'}`} />
                              <span className="font-semibold text-xs">{item.module}</span>
                            </div>
                            <div className="flex gap-1.5">
                              {item.perms.map((p, j) => (
                                <span key={j} className={`rounded px-1.5 py-0.5 text-[9px] font-mono border uppercase tracking-widest ${item.active ? 'border-primary/20 bg-primary/5 text-primary font-bold' : 'border-border'}`}>{p}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6 flex justify-end">
                        <div className="h-8 w-24 bg-primary rounded-md shadow flex items-center justify-center opacity-90"><span className="h-1.5 w-12 bg-white/40 rounded-full"></span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background py-6 flex-shrink-0">
        <div className="container mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Image src="/favicon.png" alt="Logo" width={16} height={16} className="object-contain grayscale opacity-70" />
            <span className="text-sm font-medium">DB Studio</span>
            <span className="text-[10px] font-mono border border-border bg-muted/30 rounded-full px-2 py-0.5 ml-1">v{meta.version}</span>
          </div>
          <p className="text-sm text-muted-foreground text-center md:text-right">
            © {new Date().getFullYear()} DB Studio. Built by <Link href="https://github.com/ibobdb" target="_blank" className="font-medium hover:text-foreground transition-colors underline underline-offset-4">ibobdb</Link>.
          </p>
        </div>
      </footer>
    </div>
  );
}
