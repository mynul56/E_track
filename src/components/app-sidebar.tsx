"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, ClipboardPaste, Flag, FolderKanban, LayoutDashboard, LogIn, Trophy, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Global Dashboard", icon: LayoutDashboard },
  { href: "/teams", label: "Teams", icon: Users },
  { href: "/projects/proj-atlas", label: "Projects", icon: FolderKanban },
  { href: "/blockers", label: "Blockers", icon: Flag },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/teams/team-alpha-prime/employees/emp-jihad/paste-update", label: "Paste Update", icon: ClipboardPaste },
];

export function AppSidebar() {
  const currentPath = usePathname();

  return (
    <aside className="panel-glow sticky top-0 hidden h-screen w-76 shrink-0 border-r border-sidebar-border bg-sidebar/85 px-5 py-6 backdrop-blur-xl lg:block">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">E Track</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-sidebar-foreground">Project Intelligence</h1>
        </div>
        <Badge className="bg-primary/20 text-primary hover:bg-primary/20">Admin</Badge>
      </div>

      <nav className="mt-8 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.href || currentPath.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Operational Focus</p>
        <p className="mt-2">Watch missing updates, deadline risk, and repeated blockers before they snowball.</p>
      </div>

      <Link
        href="/login"
        className="mt-4 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-sidebar-foreground/70 transition hover:bg-sidebar-accent hover:text-sidebar-foreground"
      >
        <LogIn className="h-4 w-4" />
        <span>Login</span>
      </Link>
    </aside>
  );
}
