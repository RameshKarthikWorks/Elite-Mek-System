import { useLocalStorage } from "./index";
import { useAuditLog } from "../audit";
import { useAuthStore } from "./auth";

export function useCrudStore<T extends { id: string }>(key: string, initialData: T[], moduleName: string) {
  const [data, setData] = useLocalStorage<T[]>(`elitemek_${key}`, initialData);
  const { addLog } = useAuditLog();
  const { user } = useAuthStore();

  const get = (id: string) => data.find((item) => item.id === id);

  const list = () => data;

  const create = (item: Omit<T, "id"> & { id?: string }) => {
    const newItem = { ...item, id: item.id || crypto.randomUUID() } as T;
    setData((prev) => [newItem, ...prev]);
    if (user) addLog(user.id, user.name, moduleName, "CREATE", `Created ${moduleName} record ${newItem.id}`);
    return newItem;
  };

  const update = (id: string, updates: Partial<T>) => {
    setData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
    if (user) addLog(user.id, user.name, moduleName, "UPDATE", `Updated ${moduleName} record ${id}`);
  };

  const remove = (id: string) => {
    setData((prev) => prev.filter((item) => item.id !== id));
    if (user) addLog(user.id, user.name, moduleName, "DELETE", `Deleted ${moduleName} record ${id}`);
  };

  return { data, get, list, create, update, remove };
}

// Seed data for all required entities
export const SEED_PROJECTS = [
  { id: "p1", name: "Marina Bay Tower HVAC Retrofit", customerId: "c1", status: "Active", progress: 65, value: 1250000, start: "2023-01-10", end: "2024-05-20", manager: "PM User" },
  { id: "p2", name: "Downtown Commercial Electrical", customerId: "c2", status: "Planning", progress: 10, value: 450000, start: "2024-02-01", end: "2024-10-15", manager: "PM User" },
  { id: "p3", name: "Tech Park Plumbing Upgrade", customerId: "c3", status: "Completed", progress: 100, value: 850000, start: "2022-06-15", end: "2023-11-30", manager: "Admin User" },
];

export const SEED_SITES = [
  { id: "s1", projectId: "p1", location: "Marina Bay", supervisor: "Site Engineer" },
  { id: "s2", projectId: "p2", location: "Downtown Sq", supervisor: "Site Engineer" },
];

export const SEED_CUSTOMERS = [
  { id: "c1", company: "Marina Corp", contact: "Alice Smith", gstin: "29AB123", billing: "Marina Bay Area" },
  { id: "c2", company: "Downtown Builders", contact: "Bob Jones", gstin: "29AB456", billing: "Downtown Sq" },
];

export const SEED_VENDORS = [
  { id: "v1", name: "Electra Supply", category: "Electrical", paymentTerms: "Net 30", rating: 4.5 },
  { id: "v2", name: "Pipe & Co", category: "Plumbing", paymentTerms: "Net 15", rating: 4.8 },
];

export const SEED_WORK_ORDERS = [
  { id: "w1", projectId: "p1", siteId: "s1", assignedTo: "Site Engineer", status: "Open", priority: "High" },
  { id: "w2", projectId: "p2", siteId: "s2", assignedTo: "Site Engineer", status: "InProgress", priority: "Medium" },
];

export const SEED_PURCHASE_ORDERS = [
  { id: "po1", vendorId: "v1", total: 25000, status: "Approved", items: 5, date: "2023-10-15" },
  { id: "po2", vendorId: "v2", total: 12500, status: "Draft", items: 2, date: "2023-11-01" }
];

export const SEED_INVENTORY = [
  { id: "i1", name: "Copper Pipe 15mm", category: "Plumbing", unit: "meters", quantity: 450, reorderLevel: 100, location: "Main Warehouse" },
  { id: "i2", name: "Circuit Breaker 32A", category: "Electrical", unit: "pieces", quantity: 45, reorderLevel: 50, location: "Site A" },
  { id: "i3", name: "HVAC Ducting Alum", category: "Mechanical", unit: "meters", quantity: 120, reorderLevel: 200, location: "Main Warehouse" },
];

export const SEED_EMPLOYEES = [
  { id: "e1", name: "John Doe", department: "Engineering", role: "Site Engineer", contact: "1234567890", joinDate: "2022-01-15", status: "Active" },
  { id: "e2", name: "Jane Smith", department: "Management", role: "Project Manager", contact: "0987654321", joinDate: "2021-06-01", status: "Active" },
];

export const SEED_INVOICES = [
  { id: "inv1", customerId: "c1", total: 150000, status: "Paid", date: "2023-12-01" },
  { id: "inv2", customerId: "c2", total: 75000, status: "Overdue", date: "2023-11-15" },
];

export const SEED_PETTY_CASH = [
  { id: "pc1", date: "2023-11-10", voucherNo: "V-1001", head: "Travel", type: "out", amount: 1500, balance: 8500 },
  { id: "pc2", date: "2023-11-12", voucherNo: "V-1002", head: "Office Supplies", type: "out", amount: 450, balance: 8050 },
];

export const SEED_ATTENDANCE = [
  { id: "a1", employeeId: "e1", date: "2023-12-01", status: "Present" },
  { id: "a2", employeeId: "e2", date: "2023-12-01", status: "Present" },
];

export const SEED_LEAVES = [
  { id: "l1", employeeId: "e1", type: "Sick Leave", startDate: "2023-12-10", endDate: "2023-12-11", reason: "Fever", status: "Approved" },
];

export const SEED_MILESTONES = [
  { id: "m1", projectId: "p1", name: "Phase 1 Ducting", targetDate: "2023-11-30", progress: 100, status: "Completed" },
  { id: "m2", projectId: "p1", name: "Phase 2 Electrical", targetDate: "2023-12-15", progress: 40, status: "InProgress" },
];

export const SEED_REMINDERS = [
  { id: "r1", title: "PO #102 Approval", dueDate: "2023-12-05", status: "Pending", priority: "High" },
  { id: "r2", title: "Invoice #INV-45 Overdue", dueDate: "2023-12-01", status: "Pending", priority: "High" },
];
