import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

type Props = {
  children: React.ReactNode;
  allowed: Array<"user" | "supervisor">;
};

export default function RoleRoute({ children, allowed }: Props) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div style={{ padding: 24 }}>Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;

  if (!allowed.includes(user.role)) return <Navigate to="/tasks" replace />;

  return <>{children}</>;
}
