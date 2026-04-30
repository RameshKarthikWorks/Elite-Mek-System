import { useState } from "react";
import { useAuditLog } from "@/lib/audit";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

export default function AuditLogs() {
  const { logs } = useAuditLog();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = logs.filter(l => 
    l.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader title="Audit Logs" subtitle="Read-only history of all system actions." />
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search logs..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="text-sm text-muted-foreground">Total: {filteredLogs.length}</div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center h-32">No audit logs found.</TableCell></TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{log.userName}</TableCell>
                      <TableCell>{log.module}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          log.action === "CREATE" ? "text-emerald-500 border-emerald-200" :
                          log.action === "UPDATE" ? "text-blue-500 border-blue-200" :
                          log.action === "DELETE" ? "text-destructive border-destructive" :
                          "text-muted-foreground"
                        }>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.details}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
