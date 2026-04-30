import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuthStore } from "@/lib/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bell, Search, Menu, LogOut, Settings } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { CommandPalette } from "./CommandPalette";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useSidebar();
  const [cmdOpen, setCmdOpen] = useState(false);

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6 shadow-sm">
      <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>

      <div className="flex-1">
        <Button
          variant="outline"
          className="relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-64 lg:w-96"
          onClick={() => setCmdOpen(true)}
        >
          <Search className="mr-2 h-4 w-4" />
          <span className="hidden lg:inline-flex">Search everywhere...</span>
          <span className="inline-flex lg:hidden">Search...</span>
          <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
        <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
      </div>

      <div className="flex items-center gap-4">
        <Badge variant="outline" className="hidden sm:inline-flex bg-primary/5 text-primary border-primary/20">
          {user.role}
        </Badge>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive" />
              <span className="sr-only">Notifications</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80">
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold text-sm">Notifications</h3>
              <div className="text-sm text-muted-foreground py-2 text-center border-y">
                No new notifications
              </div>
              <Button variant="ghost" className="w-full text-xs" size="sm">View all</Button>
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings"><Settings className="mr-2 h-4 w-4" />Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
