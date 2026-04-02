import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Kanban,
  UserCheck,
  DollarSign,
  Image,
  ClipboardList,
  UserCog,
  MessageCircle,
  Settings,
  X,
  ChevronDown,
  ChevronRight,
  Building2,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    testId: "nav-dashboard",
  },
  {
    label: "Comercial",
    icon: Kanban,
    testId: "nav-comercial",
    children: [
      { label: "Leads", href: "/comercial/leads", testId: "nav-leads" },
      { label: "Pipeline", href: "/comercial/pipeline", testId: "nav-pipeline" },
    ],
  },
  {
    label: "Clientes",
    icon: Users,
    href: "/clientes",
    testId: "nav-clientes",
  },
  {
    label: "Financeiro",
    icon: DollarSign,
    href: "/financeiro",
    testId: "nav-financeiro",
  },
  {
    label: "Conteúdo",
    icon: Image,
    href: "/conteudo",
    testId: "nav-conteudo",
  },
  {
    label: "Operacional",
    icon: ClipboardList,
    href: "/operacional",
    testId: "nav-operacional",
  },
  {
    label: "RH",
    icon: UserCog,
    href: "/rh",
    testId: "nav-rh",
  },
  {
    label: "WhatsApp",
    icon: MessageCircle,
    href: "/whatsapp",
    testId: "nav-whatsapp",
  },
  {
    label: "Configurações",
    icon: Settings,
    href: "/configuracoes",
    testId: "nav-configuracoes",
  },
];

function NavItem({ item, onClose }) {
  const [open, setOpen] = useState(true);

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            "nav-item w-full",
          )}
          data-testid={item.testId}
        >
          <item.icon size={18} strokeWidth={1.75} className="shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          <span className="transition-transform duration-200" style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}>
            <ChevronDown size={14} strokeWidth={1.75} />
          </span>
        </button>

        {open && (
          <div className="mt-0.5 ml-4 pl-3 border-l border-border space-y-0.5">
            {item.children.map((child) => (
              <NavLink
                key={child.href}
                to={child.href}
                onClick={onClose}
                data-testid={child.testId}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                    isActive
                      ? "nav-item-active"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground font-medium"
                  )
                }
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.href}
      onClick={onClose}
      data-testid={item.testId}
      className={({ isActive }) =>
        cn("nav-item", isActive && "nav-item-active")
      }
    >
      <item.icon size={18} strokeWidth={1.75} className="shrink-0" />
      <span>{item.label}</span>
    </NavLink>
  );
}

export default function Sidebar({ onClose }) {
  return (
    <div className="flex flex-col h-full" style={{ background: "hsl(var(--sidebar-bg))" }}>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-5 shrink-0 border-b border-border">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(252 100% 60%))" }}
          >
            <Building2 size={16} strokeWidth={2} className="text-white" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-heading font-bold text-sm tracking-tight text-foreground">AgênciaOS</span>
            <span className="text-[10px] text-muted-foreground font-medium">Painel de Gestão</span>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted transition-colors md:hidden"
            data-testid="sidebar-close"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto scrollbar-hidden">
        {navItems.map((item) => (
          <NavItem key={item.testId} item={item} onClose={onClose} />
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-border shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-xs text-muted-foreground font-medium">v2.0 — Tudo operacional</p>
        </div>
      </div>
    </div>
  );
}
