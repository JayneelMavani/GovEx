"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import {
  Menu,
  X,
  LogOut,
  Shield,
  Home,
  Scale,
  FileSearch,
  Settings,
  ChevronDown,
  AlertCircle,
  AlertTriangle,
  ScrollText,
  SearchCheck,
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/compare", label: "Party Comparison", icon: Scale },
];

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const userRole = (session?.user as { role?: string } | undefined)?.role;

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-xs">
      {/* Top Disclaimer Banner */}
      <div className="bg-slate-900 text-slate-100 dark:bg-slate-950 dark:text-slate-200 py-1.5 px-4 text-center text-xs tracking-wide">
        <div className="mx-auto max-w-7xl flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <AlertCircle className="w-3 h-3 text-amber-400" />
            OFFICIAL DISCLAIMER
          </span>
          <span className="font-medium text-slate-300">
            GovEx presents evidence, not political judgement.
          </span>
        </div>
      </div>

      {/* Transparent Blur Gradient Divider - Reduced by 25% */}
      <div className="relative w-full h-[1px] overflow-visible opacity-75">
        {/* Ambient diffuse glow */}
        <div className="absolute inset-x-0 -top-1 h-2.5 bg-gradient-to-r from-transparent via-blue-500/25 dark:via-blue-400/30 to-transparent blur-sm pointer-events-none" />
        {/* Soft focused glow */}
        <div className="absolute inset-x-0 -top-0.5 h-1.5 bg-gradient-to-r from-transparent via-blue-400/45 dark:via-blue-300/45 to-transparent blur-xs pointer-events-none" />
        {/* Crisp gradient separator line */}
        <div className="relative h-[1px] w-full bg-gradient-to-r from-transparent via-blue-500/70 dark:via-blue-400/70 to-transparent" />
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0" aria-label="GovEx Home">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground font-black text-xl shadow-xs transition-transform duration-200 group-hover:scale-105">
              G
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-foreground leading-none">
                Gov<span className="text-blue-600 dark:text-blue-400">Ex</span>
              </span>
              <span className="text-[11px] font-medium text-muted-foreground tracking-wide mt-1">
                Evidence-Based Manifesto Tracker
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden md:flex items-center gap-1.5 absolute left-1/2 -translate-x-1/2" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}

            {(userRole === "RESEARCHER" || userRole === "ADMIN") && (
              <Link
                href="/researcher"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  pathname === "/researcher"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <FileSearch className="w-4 h-4" />
                Researcher Portal
              </Link>
            )}

            {userRole === "ADMIN" && (
              <Link
                href="/admin"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  pathname.startsWith("/admin")
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Settings className="w-4 h-4" />
                Admin Console
              </Link>
            )}
          </nav>

          {/* Right side authentication & actions */}
          <div className="flex items-center gap-3 shrink-0">
            {session?.user ? (
              <div className="hidden md:flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 h-9 pl-2 pr-3 rounded-full border-border">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                          {session.user.name?.slice(0, 2).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-semibold max-w-[120px] truncate">
                        {session.user.name}
                      </span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 uppercase font-bold">
                        {userRole}
                      </Badge>
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <div className="p-2">
                      <p className="text-xs font-medium text-foreground">{session.user.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{session.user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    {userRole === "ADMIN" && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer gap-2">
                          <Settings className="w-4 h-4 text-muted-foreground" />
                          Admin Console
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {(userRole === "RESEARCHER" || userRole === "ADMIN") && (
                      <DropdownMenuItem asChild>
                        <Link href="/researcher" className="cursor-pointer gap-2">
                          <FileSearch className="w-4 h-4 text-muted-foreground" />
                          Researcher Portal
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="cursor-pointer text-destructive focus:text-destructive gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button asChild variant="outline" size="sm" className="hidden md:inline-flex">
                <Link href="/login">
                  Login
                </Link>
              </Button>
            )}

            {/* Mobile menu trigger */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-4 space-y-2 shadow-lg animate-in slide-in-from-top-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}

          {(userRole === "RESEARCHER" || userRole === "ADMIN") && (
            <Link
              href="/researcher"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                pathname === "/researcher"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <FileSearch className="w-4 h-4" />
              Researcher Portal
            </Link>
          )}

          {userRole === "ADMIN" && (
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                pathname.startsWith("/admin")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Settings className="w-4 h-4" />
              Admin Console
            </Link>
          )}

          <div className="pt-2 border-t border-border">
            {session?.user ? (
              <div className="space-y-2">
                <div className="px-3.5 py-1 text-xs text-muted-foreground">
                  Signed in as <span className="font-semibold text-foreground">{session.user.name}</span> ({userRole})
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full justify-center gap-2"
                  onClick={() => {
                    setMobileOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button asChild variant="default" size="sm" className="w-full justify-center">
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  Login
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-slate-900 text-slate-200 mt-auto">
      {/* Top Footer Banner */}
      <div className="border-b border-slate-800 bg-slate-950/70 py-4 px-4 text-center">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-sm">
          <Badge variant="outline" className="text-amber-400 border-amber-400/40 bg-amber-400/10 text-xs px-2 py-0.5 inline-flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>MANDATORY NOTICE</span>
          </Badge>
          <span className="font-medium text-slate-300">
            GovEx presents evidence, not political judgement.
          </span>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 text-white font-extrabold text-lg">
                G
              </div>
              <span className="text-xl font-bold tracking-tight text-white">GovEx</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Open civic evidence infrastructure converting manifesto promises into verifiable, traceable records of democratic accountability.
            </p>
          </div>

          {/* Chain Model */}
          <div className="space-y-3 md:col-span-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Evidence Chain Model</h4>
            <div className="text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-slate-300">
                <ScrollText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Promise (Verbatim manifesto text)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <SearchCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Verification (Methodology)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <FileCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>Evidence (Documentary artifacts)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Source (High, Med, Supporting Tier)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Implementation Status</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 md:col-span-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Platform Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                  <Home className="w-3.5 h-3.5 text-slate-400" />
                  <span>Home Overview</span>
                </Link>
              </li>
              <li>
                <Link href="/compare" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                  <Scale className="w-3.5 h-3.5 text-slate-400" />
                  <span>Party Comparison Matrix</span>
                </Link>
              </li>
              <li>
                <Link href="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  <span>Researcher / Admin Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Standards & Rigor */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-1.5">
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Verification Rigor</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Promises marked <span className="text-emerald-400 font-semibold">Implemented</span> or <span className="text-amber-400 font-semibold">Partially Implemented</span> strictly require verified <span className="text-white font-semibold">High Tier</span> primary government sources.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-6 pb-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} GovEx Project. Civic tech for verifiable governance.</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 font-medium">GovEx presents evidence, not political judgement.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
