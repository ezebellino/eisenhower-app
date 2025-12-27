import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

type Props = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: Props) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div style={{ padding: 24 }}>Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
