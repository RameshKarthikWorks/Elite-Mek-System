import { useState, useMemo } from "react";
import { Search, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import { useCrudStore, SEED_APPROVALS, SEED_EMPLOYEES } from "@/lib/store/data";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


export default function ApprovalWorkflow() {
  const { data: approvals, update } = useCrudStore("approvals", SEED_APPROVALS, "Approvals");
  const { data: employees } = useCrudStore("employees", SEED_EMPLOYEES, "Employees");

  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const handleAction = (id: string, action: "Approved" | "Rejected") => {
    update(id, { 
      status: action,
      decisionDate: new Date().toISOString().split('T')[0]
    });
    toast.success(`Request ${action.toLowerCase()}`);
  };

  const filteredData = useMemo(() => {
    return approvals.filter((a) => {
      const matchesSearch = a.referenceNumber.toLowerCase().includes(search.toLowerCase());
      const matchesModule = moduleFilter === "All" || a.module === moduleFilter;
      const matchesStatus = statusFilter === "All" || a.status === statusFilter;
      return matchesSearch && matchesModule && matchesStatus;
    });
  }, [approvals, search, moduleFilter, statusFilter]);

  const chartData = useMemo(() => {
    const modules = ["PO", "Invoice", "Expense", "Leave", "Payroll", "Tender"];
    return modules.map(m => ({
      name: m,
      count: filteredData.filter(a => a.module === m).length
    })).filter(d => d.count > 0);
  }, [filteredData]);

  const pendingCount = approvals.filter(a => a.status === "Pending").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Approval Workflow"
        subtitle="Manage pending approvals across all modules"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Pending Approvals</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-amber-600">{pendingCount}</div></CardContent>
        </Card>
        <Card className="md:col-span-3">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Requests by Module</CardTitle></CardHeader>
          <CardContent className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" hide />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search ref number..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={moduleFilter} onValueChange={setModuleFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Module" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Modules</SelectItem>
            <SelectItem value="PO">PO</SelectItem>
            <SelectItem value="Invoice">Invoice</SelectItem>
            <SelectItem value="Expense">Expense</SelectItem>
            <SelectItem value="Leave">Leave</SelectItem>
            <SelectItem value="Payroll">Payroll</SelectItem>
            <SelectItem value="Tender">Tender</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
            <SelectItem value="Escalated">Escalated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ref Number</TableHead>
              <TableHead>Module</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8"><span className="text-muted-foreground text-sm">No approvals found</span></TableCell></TableRow>
            ) : (
              filteredData.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.referenceNumber}</TableCell>
                  <TableCell>{record.module}</TableCell>
                  <TableCell>{employees.find(e => e.id === record.requestedBy)?.name || record.requestedBy}</TableCell>
                  <TableCell>Level {record.approvalLevel}</TableCell>
                  <TableCell>{record.requestedDate}</TableCell>
                  <TableCell>
                    <Badge variant={record.status === 'Approved' ? 'default' : record.status === 'Pending' ? 'secondary' : 'destructive'}>
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {record.status === "Pending" ? (
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700" onClick={() => handleAction(record.id, "Approved")}>
                          <CheckCircle className="w-4 h-4 mr-1" /> Approve
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleAction(record.id, "Rejected")}>
                          <XCircle className="w-4 h-4 mr-1" /> Reject
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Decided on {record.decisionDate}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
