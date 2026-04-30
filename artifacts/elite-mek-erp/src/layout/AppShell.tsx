import { ReactNode } from "react";
import { useLocation } from "wouter";
import { useAuthStore } from "@/lib/store/auth";
import { AppSidebar } from "./Sidebar";
import { Header } from "./Header";
import { SidebarProvider } from "@/components/ui/sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useAuthStore();
  const [location, setLocation] = useLocation();

  if (!user) {
    if (location !== "/login") {
      setLocation("/login");
    }
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-muted/20 flex text-foreground">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
