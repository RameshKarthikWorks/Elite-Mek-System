import { useLocalStorage } from "./store";

export type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "VIEW" | "APPROVE" | "EXPORT" | "LOGIN";

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  module: string;
  action: AuditAction;
  details: string;
}

export function useAuditLog() {
  const [logs, setLogs] = useLocalStorage<AuditLog[]>("elitemek_audit_logs", []);
  
  const addLog = (userId: string, userName: string, module: string, action: AuditAction, details: string) => {
    const newLog: AuditLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      userId,
      userName,
      module,
      action,
      details
    };
    setLogs(prev => [newLog, ...prev]);
  };

  return { logs, addLog };
}
