import { Navigate } from "react-router-dom";
import { AuthService } from "@/lib/AuthService";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!AuthService.isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};
