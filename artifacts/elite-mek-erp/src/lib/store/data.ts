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

export const SEED_PAYROLL = [
  { id: "pay1", month: "2025-04", employeeId: "e1", basicSalary: 45000, hra: 13500, transport: 3000, medical: 1500, pf: 5400, esi: 1125, advance: 0, otHours: 12, otRate: 250, otAmount: 3000, gross: 63000, netSalary: 59475, status: "Paid" },
  { id: "pay2", month: "2025-04", employeeId: "e2", basicSalary: 60000, hra: 18000, transport: 4000, medical: 2000, pf: 7200, esi: 0, advance: 5000, otHours: 0, otRate: 300, otAmount: 0, gross: 84000, netSalary: 71800, status: "Draft" },
  { id: "pay3", month: "2025-03", employeeId: "e1", basicSalary: 45000, hra: 13500, transport: 3000, medical: 1500, pf: 5400, esi: 1125, advance: 0, otHours: 5, otRate: 250, otAmount: 1250, gross: 63000, netSalary: 57725, status: "Paid" },
  { id: "pay4", month: "2025-03", employeeId: "e2", basicSalary: 60000, hra: 18000, transport: 4000, medical: 2000, pf: 7200, esi: 0, advance: 0, otHours: 0, otRate: 300, otAmount: 0, gross: 84000, netSalary: 76800, status: "Paid" },
  { id: "pay5", month: "2025-02", employeeId: "e1", basicSalary: 45000, hra: 13500, transport: 3000, medical: 1500, pf: 5400, esi: 1125, advance: 1000, otHours: 10, otRate: 250, otAmount: 2500, gross: 63000, netSalary: 57975, status: "Paid" },
  { id: "pay6", month: "2025-02", employeeId: "e2", basicSalary: 60000, hra: 18000, transport: 4000, medical: 2000, pf: 7200, esi: 0, advance: 0, otHours: 0, otRate: 300, otAmount: 0, gross: 84000, netSalary: 76800, status: "Paid" },
];

export const SEED_TENDERS = [
  { id: "TEN-001", clientName: "City Corporation", boqRef: "BOQ-001", estimatedCost: 1500000, marginPercent: 15, marginAmount: 225000, sellingPrice: 1725000, submissionDate: "2024-05-15", status: "Submitted" },
  { id: "TEN-002", clientName: "State Metro Rail", boqRef: "BOQ-002", estimatedCost: 4500000, marginPercent: 12, marginAmount: 540000, sellingPrice: 5040000, submissionDate: "2024-06-20", status: "Won" },
  { id: "TEN-003", clientName: "Tech Park Developers", boqRef: "BOQ-003", estimatedCost: 850000, marginPercent: 20, marginAmount: 170000, sellingPrice: 1020000, submissionDate: "2024-07-10", status: "Draft" },
  { id: "TEN-004", clientName: "Hospital Group", boqRef: "BOQ-004", estimatedCost: 2100000, marginPercent: 18, marginAmount: 378000, sellingPrice: 2478000, submissionDate: "2024-04-05", status: "Lost" },
  { id: "TEN-005", clientName: "University Campus", boqRef: "BOQ-005", estimatedCost: 3200000, marginPercent: 15, marginAmount: 480000, sellingPrice: 3680000, submissionDate: "2024-08-01", status: "Cancelled" },
];

export const SEED_BOQ = [
  { id: "BOQ-001", title: "Electrical Package A", projectId: "p1", revision: "0", totalAmount: 150000, status: "Approved", items: [{ name: "Cable 2.5 sqmm", unit: "Coil", qty: 50, rate: 1200, amount: 60000 }, { name: "Switch 10A", unit: "Nos", qty: 200, rate: 450, amount: 90000 }] },
  { id: "BOQ-002", title: "Plumbing Package B", projectId: "p2", revision: "1", totalAmount: 250000, status: "Draft", items: [{ name: "PVC Pipe 1 inch", unit: "Mtr", qty: 500, rate: 200, amount: 100000 }, { name: "Gate Valve 1 inch", unit: "Nos", qty: 50, rate: 3000, amount: 150000 }] },
  { id: "BOQ-003", title: "HVAC Package C", projectId: "p3", revision: "0", totalAmount: 850000, status: "Revised", items: [{ name: "AC Unit 2 Ton", unit: "Nos", qty: 10, rate: 45000, amount: 450000 }, { name: "Ducting", unit: "SqM", qty: 400, rate: 1000, amount: 400000 }] },
  { id: "BOQ-004", title: "Fire Fighting Package D", projectId: "p1", revision: "2", totalAmount: 320000, status: "Approved", items: [{ name: "Fire Extinguisher", unit: "Nos", qty: 40, rate: 3500, amount: 140000 }, { name: "Sprinkler Head", unit: "Nos", qty: 200, rate: 900, amount: 180000 }] },
];

export const SEED_INVENTORY_MOVEMENTS = [
  { id: "MOV-001", itemId: "i1", fromLocation: "Main Warehouse", toLocation: "Site A", quantity: 50, movementDate: "2023-11-01", movementType: "Issue", issuedBy: "Store Keeper", receivedBy: "Site Engineer", remarks: "For Phase 1" },
  { id: "MOV-002", itemId: "i2", fromLocation: "Vendor", toLocation: "Main Warehouse", quantity: 100, movementDate: "2023-11-05", movementType: "Receipt", issuedBy: "Vendor", receivedBy: "Store Keeper", remarks: "PO-102 Delivery" },
  { id: "MOV-003", itemId: "i1", fromLocation: "Site A", toLocation: "Site B", quantity: 20, movementDate: "2023-11-10", movementType: "Transfer", issuedBy: "Site Engineer", receivedBy: "Site Engineer B", remarks: "Urgent Requirement" },
  { id: "MOV-004", itemId: "i3", fromLocation: "Site B", toLocation: "Main Warehouse", quantity: 5, movementDate: "2023-11-15", movementType: "Return", issuedBy: "Site Engineer B", receivedBy: "Store Keeper", remarks: "Excess Material" },
  { id: "MOV-005", itemId: "i2", fromLocation: "Main Warehouse", toLocation: "Site A", quantity: 30, movementDate: "2023-11-20", movementType: "Issue", issuedBy: "Store Keeper", receivedBy: "Site Engineer", remarks: "For Phase 2" },
  { id: "MOV-006", itemId: "i3", fromLocation: "Main Warehouse", toLocation: "Site B", quantity: 40, movementDate: "2023-11-25", movementType: "Issue", issuedBy: "Store Keeper", receivedBy: "Site Engineer B", remarks: "For Phase 1" },
  { id: "MOV-007", itemId: "i1", fromLocation: "Vendor", toLocation: "Main Warehouse", quantity: 200, movementDate: "2023-12-01", movementType: "Receipt", issuedBy: "Vendor", receivedBy: "Store Keeper", remarks: "PO-105 Delivery" },
  { id: "MOV-008", itemId: "i2", fromLocation: "Site A", toLocation: "Main Warehouse", quantity: 10, movementDate: "2023-12-05", movementType: "Return", issuedBy: "Site Engineer", receivedBy: "Store Keeper", remarks: "Damaged Material" },
];

export const SEED_ASSETS = [
  { id: "AST-001", assetName: "Welding Machine A", category: "Plant & Machinery", assignedTo: "e1", purchaseDate: "2022-01-15", purchaseValue: 45000, warrantyExpiry: "2024-01-15", maintenanceDueDate: "2024-06-15", status: "Active", siteLocation: "Site A" },
  { id: "AST-002", assetName: "Generator 5KVA", category: "Plant & Machinery", assignedTo: "e2", purchaseDate: "2021-06-20", purchaseValue: 85000, warrantyExpiry: "2023-06-20", maintenanceDueDate: "2023-12-20", status: "Under Maintenance", siteLocation: "Main Warehouse" },
  { id: "AST-003", assetName: "Laptop Dell Pro", category: "IT Equipment", assignedTo: "e1", purchaseDate: "2023-03-10", purchaseValue: 65000, warrantyExpiry: "2026-03-10", maintenanceDueDate: "2024-03-10", status: "Active", siteLocation: "Head Office" },
  { id: "AST-004", assetName: "Delivery Van", category: "Vehicle", assignedTo: "e2", purchaseDate: "2020-11-05", purchaseValue: 450000, warrantyExpiry: "2023-11-05", maintenanceDueDate: "2024-05-05", status: "Active", siteLocation: "Head Office" },
  { id: "AST-005", assetName: "Drilling Machine B", category: "Tools", assignedTo: "e1", purchaseDate: "2022-08-15", purchaseValue: 15000, warrantyExpiry: "2023-08-15", maintenanceDueDate: "2024-02-15", status: "Active", siteLocation: "Site B" },
  { id: "AST-006", assetName: "Office Desk Set", category: "Furniture", assignedTo: "e2", purchaseDate: "2021-02-10", purchaseValue: 25000, warrantyExpiry: "2022-02-10", maintenanceDueDate: "2024-01-10", status: "Disposed", siteLocation: "Head Office" },
  { id: "AST-007", assetName: "Grinding Machine", category: "Tools", assignedTo: "e1", purchaseDate: "2023-05-20", purchaseValue: 12000, warrantyExpiry: "2024-05-20", maintenanceDueDate: "2024-11-20", status: "Lost", siteLocation: "Site A" },
  { id: "AST-008", assetName: "Laptop Lenovo", category: "IT Equipment", assignedTo: "e2", purchaseDate: "2023-07-15", purchaseValue: 55000, warrantyExpiry: "2026-07-15", maintenanceDueDate: "2024-07-15", status: "Active", siteLocation: "Site B" },
];

export const SEED_EXPENSES = [
  { id: "EXP-001", expenseType: "Travel", projectId: "p1", amount: 2500, expenseDate: "2023-11-05", paidBy: "e1", approvalStatus: "Approved", remarks: "Site visit" },
  { id: "EXP-002", expenseType: "Material", projectId: "p2", amount: 15000, expenseDate: "2023-11-10", paidBy: "e2", approvalStatus: "Pending", remarks: "Urgent purchase" },
  { id: "EXP-003", expenseType: "Accommodation", projectId: "p1", amount: 4500, expenseDate: "2023-11-15", paidBy: "e1", approvalStatus: "Reimbursed", remarks: "Hotel stay" },
  { id: "EXP-004", expenseType: "Food", projectId: "p3", amount: 800, expenseDate: "2023-11-20", paidBy: "e2", approvalStatus: "Approved", teamLunch: true, remarks: "Team lunch" },
  { id: "EXP-005", expenseType: "Fuel", projectId: "p1", amount: 1200, expenseDate: "2023-11-25", paidBy: "e1", approvalStatus: "Rejected", remarks: "Fuel for van" },
  { id: "EXP-006", expenseType: "Other", projectId: "p2", amount: 500, expenseDate: "2023-12-01", paidBy: "e2", approvalStatus: "Pending", remarks: "Stationery" },
  { id: "EXP-007", expenseType: "Travel", projectId: "p3", amount: 3000, expenseDate: "2023-12-05", paidBy: "e1", approvalStatus: "Approved", remarks: "Client meeting" },
  { id: "EXP-008", expenseType: "Material", projectId: "p1", amount: 25000, expenseDate: "2023-12-10", paidBy: "e2", approvalStatus: "Pending", remarks: "Spare parts" },
  { id: "EXP-009", expenseType: "Accommodation", projectId: "p2", amount: 5000, expenseDate: "2023-12-15", paidBy: "e1", approvalStatus: "Approved", remarks: "Hotel stay" },
  { id: "EXP-010", expenseType: "Food", projectId: "p3", amount: 1000, expenseDate: "2023-12-20", paidBy: "e2", approvalStatus: "Reimbursed", remarks: "Client dinner" },
];

export const SEED_REVENUE = [
  { id: "REV-001", customerId: "c1", projectId: "p1", invoiceNumber: "INV-001", invoiceAmount: 150000, receivedAmount: 150000, balance: 0, paymentDate: "2023-11-10", status: "Collected" },
  { id: "REV-002", customerId: "c2", projectId: "p2", invoiceNumber: "INV-002", invoiceAmount: 75000, receivedAmount: 25000, balance: 50000, paymentDate: "2023-11-20", status: "Partial" },
  { id: "REV-003", customerId: "c3", projectId: "p3", invoiceNumber: "INV-003", invoiceAmount: 250000, receivedAmount: 0, balance: 250000, paymentDate: null, status: "Pending" },
  { id: "REV-004", customerId: "c1", projectId: "p1", invoiceNumber: "INV-004", invoiceAmount: 100000, receivedAmount: 100000, balance: 0, paymentDate: "2023-12-05", status: "Collected" },
  { id: "REV-005", customerId: "c2", projectId: "p2", invoiceNumber: "INV-005", invoiceAmount: 50000, receivedAmount: 20000, balance: 30000, paymentDate: "2023-12-15", status: "Partial" },
  { id: "REV-006", customerId: "c3", projectId: "p3", invoiceNumber: "INV-006", invoiceAmount: 300000, receivedAmount: 0, balance: 300000, paymentDate: null, status: "Pending" },
];

export const SEED_PAYMENTS = [
  { id: "PAY-001", referenceType: "Invoice", referenceNumber: "INV-001", partyName: "Marina Corp", amount: 150000, paymentDate: "2023-11-10", mode: "NEFT", status: "Completed", remarks: "Full payment" },
  { id: "PAY-002", referenceType: "PO", referenceNumber: "PO-102", partyName: "Electra Supply", amount: 25000, paymentDate: "2023-11-15", mode: "Cheque", status: "Completed", remarks: "Advance payment" },
  { id: "PAY-003", referenceType: "Expense", referenceNumber: "EXP-003", partyName: "John Doe", amount: 4500, paymentDate: "2023-11-20", mode: "UPI", status: "Completed", remarks: "Reimbursement" },
  { id: "PAY-004", referenceType: "Petty Cash", referenceNumber: "PC-001", partyName: "Site Engineer", amount: 5000, paymentDate: "2023-11-25", mode: "Cash", status: "Pending", remarks: "Site expenses" },
  { id: "PAY-005", referenceType: "Invoice", referenceNumber: "INV-002", partyName: "Downtown Builders", amount: 25000, paymentDate: "2023-12-01", mode: "RTGS", status: "Completed", remarks: "Partial payment" },
  { id: "PAY-006", referenceType: "PO", referenceNumber: "PO-105", partyName: "Pipe & Co", amount: 12500, paymentDate: "2023-12-05", mode: "NEFT", status: "Failed", remarks: "Bank issue" },
  { id: "PAY-007", referenceType: "Expense", referenceNumber: "EXP-010", partyName: "Jane Smith", amount: 1000, paymentDate: "2023-12-10", mode: "UPI", status: "Completed", remarks: "Reimbursement" },
  { id: "PAY-008", referenceType: "Invoice", referenceNumber: "INV-003", partyName: "Tech Park", amount: 250000, paymentDate: "2023-12-15", mode: "Cheque", status: "Reversed", remarks: "Cheque bounced" },
];

export const SEED_CONTRACTS = [
  { id: "CON-001", title: "HVAC Annual Maintenance", partyType: "Customer", partyName: "City Mall", projectId: "p1", startDate: "2023-01-01", endDate: "2023-12-31", contractValue: 1200000, contractType: "AMC", status: "Active", renewalReminderDays: 30 },
  { id: "CON-002", title: "Electrical Supply Agreement", partyType: "Vendor", partyName: "Electra Supply", projectId: "p2", startDate: "2023-06-01", endDate: "2024-05-31", contractValue: 500000, contractType: "Supply", status: "Active", renewalReminderDays: 45 },
  { id: "CON-003", title: "Plumbing Subcontract", partyType: "Vendor", partyName: "Plumb Right", projectId: "p3", startDate: "2022-01-15", endDate: "2022-12-31", contractValue: 800000, contractType: "Subcontract", status: "Expired", renewalReminderDays: 30 },
  { id: "CON-004", title: "Consulting Services", partyType: "Customer", partyName: "Tech Park Developers", projectId: "p1", startDate: "2024-01-01", endDate: "2024-12-31", contractValue: 1500000, contractType: "Service", status: "Draft", renewalReminderDays: 60 },
  { id: "CON-005", title: "Fire Fighting AMC", partyType: "Customer", partyName: "Hospital Group", projectId: "p2", startDate: "2023-05-01", endDate: "2023-10-31", contractValue: 900000, contractType: "AMC", status: "Terminated", renewalReminderDays: 30 },
];

export const SEED_APPROVALS = [
  { id: "APV-001", module: "PO", referenceNumber: "PO-102", requestedBy: "e1", requestedDate: "2023-11-05", approvalLevel: 1, assignedApprover: "e2", status: "Approved", comments: "Looks good", decisionDate: "2023-11-06" },
  { id: "APV-002", module: "Invoice", referenceNumber: "INV-002", requestedBy: "e2", requestedDate: "2023-11-10", approvalLevel: 2, assignedApprover: "u1", status: "Pending", comments: "", decisionDate: null },
  { id: "APV-003", module: "Expense", referenceNumber: "EXP-005", requestedBy: "e1", requestedDate: "2023-11-15", approvalLevel: 1, assignedApprover: "e2", status: "Rejected", comments: "Need more details", decisionDate: "2023-11-16" },
  { id: "APV-004", module: "Leave", referenceNumber: "LEV-001", requestedBy: "e1", requestedDate: "2023-11-20", approvalLevel: 1, assignedApprover: "e2", status: "Approved", comments: "Approved", decisionDate: "2023-11-21" },
  { id: "APV-005", module: "Payroll", referenceNumber: "PAY-2023-11", requestedBy: "e2", requestedDate: "2023-11-25", approvalLevel: 3, assignedApprover: "u1", status: "Escalated", comments: "Requires management review", decisionDate: "2023-11-26" },
  { id: "APV-006", module: "Tender", referenceNumber: "TEN-003", requestedBy: "e1", requestedDate: "2023-12-01", approvalLevel: 2, assignedApprover: "u1", status: "Pending", comments: "", decisionDate: null },
  { id: "APV-007", module: "PO", referenceNumber: "PO-105", requestedBy: "e2", requestedDate: "2023-12-05", approvalLevel: 1, assignedApprover: "u1", status: "Approved", comments: "Urgent processing", decisionDate: "2023-12-05" },
  { id: "APV-008", module: "Expense", referenceNumber: "EXP-008", requestedBy: "e1", requestedDate: "2023-12-10", approvalLevel: 1, assignedApprover: "e2", status: "Pending", comments: "", decisionDate: null },
];

export const SEED_DOCUMENTS = [
  { id: "DOC-001", documentTitle: "Site Plan Phase 1", documentType: "Drawing", projectId: "p1", employeeId: null, uploadedBy: "e1", uploadDate: "2023-11-01", expiryDate: null, version: "v1.0", fileName: "site_plan_p1.pdf", accessLevel: "Internal", tags: "site, plan, phase1" },
  { id: "DOC-002", documentTitle: "Electrical Specs", documentType: "Specification", projectId: "p2", employeeId: null, uploadedBy: "e2", uploadDate: "2023-11-05", expiryDate: null, version: "v2.1", fileName: "elec_specs_p2.docx", accessLevel: "Public", tags: "electrical, specs" },
  { id: "DOC-003", documentTitle: "Vendor Contract A", documentType: "Contract", projectId: "p1", employeeId: null, uploadedBy: "u1", uploadDate: "2023-11-10", expiryDate: "2024-11-10", version: "v1.0", fileName: "vendor_contract_a.pdf", accessLevel: "Restricted", tags: "vendor, contract, legal" },
  { id: "DOC-004", documentTitle: "ISO 9001 Certificate", documentType: "Certificate", projectId: null, employeeId: null, uploadedBy: "u1", uploadDate: "2023-11-15", expiryDate: "2025-11-15", version: "v1.0", fileName: "iso9001.pdf", accessLevel: "Public", tags: "iso, certificate, quality" },
  { id: "DOC-005", documentTitle: "Monthly Progress Report", documentType: "Report", projectId: "p3", employeeId: null, uploadedBy: "e1", uploadDate: "2023-12-01", expiryDate: null, version: "v1.0", fileName: "progress_nov_2023.pdf", accessLevel: "Internal", tags: "progress, report, monthly" },
  { id: "DOC-006", documentTitle: "Employee Policy Handbook", documentType: "Other", projectId: null, employeeId: "e1", uploadedBy: "u1", uploadDate: "2023-12-05", expiryDate: null, version: "v3.0", fileName: "hr_policy_2023.pdf", accessLevel: "Internal", tags: "hr, policy, handbook" },
  { id: "DOC-007", documentTitle: "Plumbing Layout Revision", documentType: "Drawing", projectId: "p2", employeeId: null, uploadedBy: "e2", uploadDate: "2023-12-10", expiryDate: null, version: "v1.2", fileName: "plumbing_layout_rev2.dwg", accessLevel: "Restricted", tags: "plumbing, layout, revision" },
  { id: "DOC-008", documentTitle: "Safety Compliance Report", documentType: "Report", projectId: "p1", employeeId: null, uploadedBy: "e1", uploadDate: "2023-12-15", expiryDate: "2024-12-15", version: "v1.0", fileName: "safety_compliance_p1.pdf", accessLevel: "Public", tags: "safety, compliance, report" },
];

export const SEED_CATEGORIES = [
  { id: "CAT-001", categoryName: "Raw Materials", categoryType: "Item", parentCategory: null, description: "Basic raw materials for construction", status: "Active" },
  { id: "CAT-002", categoryName: "Electrical Items", categoryType: "Item", parentCategory: "CAT-001", description: "Electrical components and cables", status: "Active" },
  { id: "CAT-003", categoryName: "Plumbing Items", categoryType: "Item", parentCategory: "CAT-001", description: "Pipes, fittings, and fixtures", status: "Active" },
  { id: "CAT-004", categoryName: "Office Expenses", categoryType: "Expense", parentCategory: null, description: "General office running expenses", status: "Active" },
  { id: "CAT-005", categoryName: "Travel & Accommodation", categoryType: "Expense", parentCategory: null, description: "Travel related expenses", status: "Active" },
  { id: "CAT-006", categoryName: "Vehicles", categoryType: "Asset", parentCategory: null, description: "Company owned vehicles", status: "Active" },
  { id: "CAT-007", categoryName: "IT Equipment", categoryType: "Asset", parentCategory: null, description: "Computers, printers, network gear", status: "Active" },
  { id: "CAT-008", categoryName: "Project Drawings", categoryType: "Document", parentCategory: null, description: "Architectural and engineering drawings", status: "Active" },
  { id: "CAT-009", categoryName: "Material Suppliers", categoryType: "Vendor", parentCategory: null, description: "Suppliers providing raw materials", status: "Active" },
  { id: "CAT-010", categoryName: "Subcontractors", categoryType: "Vendor", parentCategory: null, description: "Service providing subcontractors", status: "Inactive" },
];

