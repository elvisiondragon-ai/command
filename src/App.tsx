import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ProtectedRoute } from "./components/ProtectedRoute";

const Index = lazy(() => import("./pages/Index"));
const AdsHubPage = lazy(() => import("./pages/AdsHub"));
const LoginPage = lazy(() => import("./pages/Login"));
const LostPage = lazy(() => import("./pages/lost"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AvatarPage = lazy(() => import("./pages/avatar"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/agents" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/pipeline" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/ads" element={<ProtectedRoute><AdsHubPage /></ProtectedRoute>} />
            <Route path="/lost" element={<LostPage />} />
            <Route path="/research" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/insights" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/assets" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/avatar" element={<ProtectedRoute><AvatarPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
