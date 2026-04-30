import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { HardHat, Users, MapPin, Truck, Building2, ClipboardList, ShoppingCart, PackageSearch, FileText, Banknote, CalendarCheck, CalendarOff, Flag, Bell, Settings, BarChart3 } from "lucide-react";

export function CommandPalette({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const runCommand = (command: () => void) => {
    onOpenChange(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Projects & Sites">
          <CommandItem onSelect={() => runCommand(() => setLocation("/projects"))}><HardHat className="mr-2 h-4 w-4" />Projects</CommandItem>
          <CommandItem onSelect={() => runCommand(() => setLocation("/sites"))}><MapPin className="mr-2 h-4 w-4" />Sites</CommandItem>
          <CommandItem onSelect={() => runCommand(() => setLocation("/work-orders"))}><ClipboardList className="mr-2 h-4 w-4" />Work Orders</CommandItem>
          <CommandItem onSelect={() => runCommand(() => setLocation("/milestones"))}><Flag className="mr-2 h-4 w-4" />Milestones</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Procurement & Inventory">
          <CommandItem onSelect={() => runCommand(() => setLocation("/vendors"))}><Truck className="mr-2 h-4 w-4" />Vendors</CommandItem>
          <CommandItem onSelect={() => runCommand(() => setLocation("/purchase-orders"))}><ShoppingCart className="mr-2 h-4 w-4" />Purchase Orders</CommandItem>
          <CommandItem onSelect={() => runCommand(() => setLocation("/inventory"))}><PackageSearch className="mr-2 h-4 w-4" />Inventory</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Finance">
          <CommandItem onSelect={() => runCommand(() => setLocation("/customers"))}><Building2 className="mr-2 h-4 w-4" />Customers</CommandItem>
          <CommandItem onSelect={() => runCommand(() => setLocation("/invoices"))}><FileText className="mr-2 h-4 w-4" />Invoices</CommandItem>
          <CommandItem onSelect={() => runCommand(() => setLocation("/petty-cash"))}><Banknote className="mr-2 h-4 w-4" />Petty Cash</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="HR">
          <CommandItem onSelect={() => runCommand(() => setLocation("/employees"))}><Users className="mr-2 h-4 w-4" />Employees</CommandItem>
          <CommandItem onSelect={() => runCommand(() => setLocation("/attendance"))}><CalendarCheck className="mr-2 h-4 w-4" />Attendance</CommandItem>
          <CommandItem onSelect={() => runCommand(() => setLocation("/leave"))}><CalendarOff className="mr-2 h-4 w-4" />Leave</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="System">
          <CommandItem onSelect={() => runCommand(() => setLocation("/reminders"))}><Bell className="mr-2 h-4 w-4" />Reminders</CommandItem>
          <CommandItem onSelect={() => runCommand(() => setLocation("/reports"))}><BarChart3 className="mr-2 h-4 w-4" />Reports</CommandItem>
          <CommandItem onSelect={() => runCommand(() => setLocation("/settings"))}><Settings className="mr-2 h-4 w-4" />Settings</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
