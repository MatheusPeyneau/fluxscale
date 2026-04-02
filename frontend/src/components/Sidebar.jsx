import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { useState } from "react";

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
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          data-testid={item.testId}
        >
          <item.icon size={18} className="shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {open && (
          <div className="ml-6 mt-0.5 space-y-0.5">
            {item.children.map((child) => (
              <NavLink
                key={child.href}
                to={child.href}
                onClick={onClose}
                data-testid={child.testId}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
        cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )
      }
    >
      <item.icon size={18} className="shrink-0" />
      <span>{item.label}</span>
    </NavLink>
  );
}

export default function Sidebar({ onClose }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-bold">A</span>
          </div>
          <span className="font-semibold text-sm">AgênciaOS</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-muted transition-colors md:hidden"
            data-testid="sidebar-close"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem key={item.testId} item={item} onClose={onClose} />
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border shrink-0">
        <p className="text-xs text-muted-foreground text-center">AgênciaOS v2.0</p>
      </div>
    </div>
  );
}
