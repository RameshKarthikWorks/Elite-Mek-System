import { useState, useMemo } from "react";
import { useAuditLog } from "@/lib/audit";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Download, FileText, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

export default function AuditLogs() {
  const { logs } = useAuditLog();
  const [searchTerm, setSearchTerm] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  const uniqueModules = useMemo(() => Array.from(new Set(logs.map(l => l.module))), [logs]);
  const uniqueActions = useMemo(() => Array.from(new Set(logs.map(l => l.action))), [logs]);

  const filteredLogs = useMemo(() => logs.filter(l => {
    const matchesSearch = l.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          l.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          l.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = moduleFilter === "all" || l.module === moduleFilter;
    const matchesAction = actionFilter === "all" || l.action === actionFilter;
    return matchesSearch && matchesModule && matchesAction;
  }), [logs, searchTerm, moduleFilter, actionFilter]);

  const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const summary = useMemo(() => ({
    total: filteredLogs.length,
    creates: filteredLogs.filter(l => l.action === "CREATE").length,
    updates: filteredLogs.filter(l => l.action === "UPDATE").length,
    deletes: filteredLogs.filter(l => l.action === "DELETE").length,
    logins: filteredLogs.filter(l => l.action === "LOGIN").length,
  }), [filteredLogs]);

  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredLogs.forEach(l => { counts[l.module] = (counts[l.module] || 0) + 1; });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [filteredLogs]);

  const exportData = filteredLogs.map(l => ({
    Timestamp: new Date(l.timestamp).toLocaleString(),
    User: l.userName,
    Module: l.module,
    Action: l.action,
    Status: "SUCCESS",
    Detail: l.details
  }));

  const handleExportTXT = () => {
    const lines = filteredLogs.map(l => 
      `[${l.timestamp.replace("T", " ").substring(0, 19)}] | User: ${l.userName} | Module: ${l.module} | Action: ${l.action} | Status: SUCCESS | Detail: ${l.details}`
    );
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `EliteMek_AuditLog_${new Date().toISOString().split("T")[0]}.txt`);
  };

  const handleExportCSV = () => {
    const header = "Timestamp,User,Module,Action,Status,Detail\n";
    const rows = filteredLogs.map(l => 
      `"${new Date(l.timestamp).toLocaleString()}","${l.userName}","${l.module}","${l.action}","SUCCESS","${l.details.replace(/"/g, '""')}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `EliteMek_AuditLog_${new Date().toISOString().split("T")[0]}.csv`);
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Audit Logs");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(blob, `EliteMek_AuditLog_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader title="Audit Logs" subtitle="Comprehensive system activity tracking." />
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={handleExportTXT} data-testid="export-txt"><FileText className="w-4 h-4 mr-2" />Export TXT</Button>
          <Button variant="outline" onClick={handleExportCSV} data-testid="export-csv"><Download className="w-4 h-4 mr-2" />Export CSV</Button>
          <Button variant="outline" onClick={handleExportExcel} data-testid="export-excel"><FileSpreadsheet className="w-4 h-4 mr-2" />Export Excel</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card><CardContent className="p-4 flex flex-col"><span className="text-sm text-muted-foreground font-medium">Total</span><span className="text-2xl font-bold">{summary.total}</span></CardContent></Card>
        <Card><CardContent className="p-4 flex flex-col"><span className="text-sm text-muted-foreground font-medium">Creates</span><span className="text-2xl font-bold text-blue-500">{summary.creates}</span></CardContent></Card>
        <Card><CardContent className="p-4 flex flex-col"><span className="text-sm text-muted-foreground font-medium">Updates</span><span className="text-2xl font-bold text-amber-500">{summary.updates}</span></CardContent></Card>
        <Card><CardContent className="p-4 flex flex-col"><span className="text-sm text-muted-foreground font-medium">Deletes</span><span className="text-2xl font-bold text-red-500">{summary.deletes}</span></CardContent></Card>
        <Card><CardContent className="p-4 flex flex-col"><span className="text-sm text-muted-foreground font-medium">Logins</span><span className="text-2xl font-bold text-emerald-500">{summary.logins}</span></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))'}} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border-b">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search logs..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Module" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {uniqueModules.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Action" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {uniqueActions.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLogs.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center h-32">No audit logs found.</TableCell></TableRow>
                ) : (
                  paginatedLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{log.userName}</TableCell>
                      <TableCell>{log.module}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          log.action === "CREATE" ? "text-blue-500 border-blue-200" :
                          log.action === "UPDATE" ? "text-amber-500 border-amber-200" :
                          log.action === "DELETE" ? "text-red-500 border-red-200" :
                          log.action === "LOGIN" ? "text-emerald-500 border-emerald-200" :
                          log.action === "APPROVE" ? "text-violet-500 border-violet-200" :
                          log.action === "EXPORT" ? "text-sky-500 border-sky-200" :
                          "text-muted-foreground"
                        }>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell><Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">SUCCESS</Badge></TableCell>
                      <TableCell>{log.details}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <span className="text-sm text-muted-foreground">Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length} entries</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
