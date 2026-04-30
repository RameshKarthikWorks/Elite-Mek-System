import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuthStore } from "@/lib/store/auth";
import logoUrl from "@/assets/elite-mek-logo.png";
import {
  LayoutDashboard,
  Users,
  HardHat,
  MapPin,
  Building2,
  Truck,
  ClipboardList,
  ShoppingCart,
  PackageSearch,
  FileText,
  Banknote,
  CalendarCheck,
  CalendarOff,
  Flag,
  Bell,
  Settings,
  BarChart3,
  LogOut,
  ChevronDown,
  Menu,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { 
  Sidebar as ShadcnSidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarProvider,
  useSidebar
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const NAVIGATION_GROUPS = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, href: "/" },
    ]
  },
  {
    label: "Projects & Sites",
    items: [
      { name: "Projects", icon: HardHat, href: "/projects" },
      { name: "Sites", icon: MapPin, href: "/sites" },
      { name: "Work Orders", icon: ClipboardList, href: "/work-orders" },
      { name: "Milestones", icon: Flag, href: "/milestones" },
    ]
  },
  {
    label: "Procurement & Inventory",
    items: [
      { name: "Vendors", icon: Truck, href: "/vendors" },
      { name: "Purchase Orders", icon: ShoppingCart, href: "/purchase-orders" },
      { name: "Inventory", icon: PackageSearch, href: "/inventory" },
    ]
  },
  {
    label: "Finance",
    items: [
      { name: "Customers", icon: Building2, href: "/customers" },
      { name: "Invoices", icon: FileText, href: "/invoices" },
      { name: "Petty Cash", icon: Banknote, href: "/petty-cash" },
    ]
  },
  {
    label: "HR",
    items: [
      { name: "Employees", icon: Users, href: "/employees" },
      { name: "Attendance", icon: CalendarCheck, href: "/attendance" },
      { name: "Leave", icon: CalendarOff, href: "/leave" },
    ]
  },
  {
    label: "System",
    items: [
      { name: "Reminders", icon: Bell, href: "/reminders" },
      { name: "Reports", icon: BarChart3, href: "/reports" },
      { name: "Settings", icon: Settings, href: "/settings" },
    ]
  }
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuthStore();
  const { state, toggleSidebar } = useSidebar();
  
  if (!user) return null;

  return (
    <ShadcnSidebar collapsible="icon" className="border-r shadow-sm">
      <SidebarHeader className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <img src={logoUrl} alt="Elite Mek" className="w-8 h-8 object-contain shrink-0" />
          {state === "expanded" && (
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight whitespace-nowrap">ELITE MEK</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest whitespace-nowrap">Engineering</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {NAVIGATION_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={location === item.href || (location.startsWith(item.href) && item.href !== '/')}
                      tooltip={item.name}
                    >
                      <Link href={item.href}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="w-full justify-start data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <Avatar className="w-8 h-8 rounded-lg shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary rounded-lg">{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start overflow-hidden ml-2 flex-1">
                    <span className="text-sm font-medium truncate w-full text-left">{user.name}</span>
                    <span className="text-xs text-muted-foreground truncate w-full text-left">{user.role}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 ml-auto shrink-0" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </ShadcnSidebar>
  );
}
