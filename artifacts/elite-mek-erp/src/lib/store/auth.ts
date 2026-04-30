import { useLocalStorage } from "./index";

export type Role = "Super Admin" | "Project Manager" | "Site Engineer" | "Finance Manager" | "HR Manager" | "Store Keeper" | "Employee";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  lastLogin?: string;
}

const DEMO_USERS: User[] = [
  { id: "u1", name: "Admin User", email: "admin@elitemek.com", role: "Super Admin" },
  { id: "u2", name: "PM User", email: "pm@elitemek.com", role: "Project Manager" },
  { id: "u3", name: "Site Engineer", email: "site@elitemek.com", role: "Site Engineer" },
  { id: "u4", name: "Finance User", email: "finance@elitemek.com", role: "Finance Manager" },
  { id: "u5", name: "HR User", email: "hr@elitemek.com", role: "HR Manager" },
  { id: "u6", name: "Store Keeper", email: "store@elitemek.com", role: "Store Keeper" },
  { id: "u7", name: "Employee User", email: "emp@elitemek.com", role: "Employee" },
];

export function useAuthStore() {
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>("elitemek_auth_user", null);
  const [isFirstLogin, setIsFirstLogin] = useLocalStorage<boolean>("elitemek_first_login", false);

  const login = (email: string) => {
    const user = DEMO_USERS.find(u => u.email === email) || {
      id: "u_custom",
      name: email.split("@")[0],
      email: email,
      role: "Super Admin",
    };
    
    setCurrentUser({
      ...user,
      lastLogin: new Date().toISOString()
    });
    setIsFirstLogin(true);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const clearFirstLogin = () => {
    setIsFirstLogin(false);
  };

  return {
    user: currentUser,
    isFirstLogin,
    login,
    logout,
    clearFirstLogin,
    demoUsers: DEMO_USERS
  };
}
