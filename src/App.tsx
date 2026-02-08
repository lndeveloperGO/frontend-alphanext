import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

// Pages
import LandingPage from "./pages/LandingPage";
import PackagesPage from "./pages/PackagesPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminQuestions from "./pages/admin/AdminQuestions";
import AdminPackages from "./pages/admin/AdminPackages";
import AdminVouchers from "./pages/admin/AdminVouchers";
import AdminPromoCodes from "./pages/admin/AdminPromoCodes";
import AdminMaterials from "./pages/admin/AdminMaterials";
import AdminTryouts from "./pages/admin/AdminTryouts";
import AdminRankings from "./pages/admin/AdminRankings";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminProducts from "./pages/admin/AdminProducts";
import PackageQuestions from "./pages/admin/PackageQuestions";
import BulkQuestionImport from "./pages/admin/BulkQuestionImport";

// User Pages
import UserDashboard from "./pages/user/UserDashboard";
import UserPackages from "./pages/user/UserPackages";
import UserPractice from "./pages/user/UserPractice";
import UserTryoutAkbar from "./pages/user/UserTryoutAkbar";
import UserProfile from "./pages/user/UserProfile";
import PracticeSession from "./pages/PracticeSession";
import LockdownPracticeSession from "./pages/LockdownPracticeSession";
import UserTest from "./pages/user/UserTest";
import UserRankings from "./pages/user/UserRankings";
import AdminProfile from "./pages/admin/AdminProfile";
import UserCheckout from "./pages/user/UserCheckout";
import AdminOrders from "./pages/admin/AdminOrders";
import UserOrders from "./pages/user/UserOrders";



const queryClient = new QueryClient();

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/packages" element={<PackagesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/questions" element={<ProtectedRoute allowedRoles={["admin"]}><AdminQuestions /></ProtectedRoute>} />
          <Route path="/admin/questions/bulk-import" element={<ProtectedRoute allowedRoles={["admin"]}><BulkQuestionImport /></ProtectedRoute>} />
          <Route path="/admin/packages" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPackages /></ProtectedRoute>} />
          <Route path="/admin/packages/:packageId/questions" element={<ProtectedRoute allowedRoles={["admin"]}><PackageQuestions /></ProtectedRoute>} />
          <Route path="/admin/categories" element={<ProtectedRoute allowedRoles={["admin"]}><AdminCategories /></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute allowedRoles={["admin"]}><AdminProducts /></ProtectedRoute>} />
          <Route path="/admin/promo-codes" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPromoCodes /></ProtectedRoute>} />
          <Route path="/admin/vouchers" element={<ProtectedRoute allowedRoles={["admin"]}><AdminVouchers /></ProtectedRoute>} />
          <Route path="/admin/materials" element={<ProtectedRoute allowedRoles={["admin"]}><AdminMaterials /></ProtectedRoute>} />
          <Route path="/admin/tryouts" element={<ProtectedRoute allowedRoles={["admin"]}><AdminTryouts /></ProtectedRoute>} />
          <Route path="/admin/rankings" element={<ProtectedRoute allowedRoles={["admin"]}><AdminRankings /></ProtectedRoute>} />
          <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={["admin"]}><AdminProfile /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={["admin"]}><AdminOrders /></ProtectedRoute>} />

          {/* User Routes */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["user"]}><UserDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/packages" element={<ProtectedRoute allowedRoles={["user"]}><UserPackages /></ProtectedRoute>} />
          <Route path="/dashboard/user/orders" element={<ProtectedRoute allowedRoles={["user"]}><UserOrders /></ProtectedRoute>} />
          <Route path="/dashboard/tryouts" element={<ProtectedRoute allowedRoles={["user"]}><UserPractice /></ProtectedRoute>} />
          <Route path="/dashboard/tryout-akbar" element={<ProtectedRoute allowedRoles={["user"]}><UserTryoutAkbar /></ProtectedRoute>} />
          <Route path="/dashboard/checkout" element={<ProtectedRoute allowedRoles={["user"]}><UserCheckout /></ProtectedRoute>} />
          <Route path="/dashboard/materials" element={<ProtectedRoute allowedRoles={["user"]}><UserPackages /></ProtectedRoute>} />
          <Route path="/dashboard/history" element={<ProtectedRoute allowedRoles={["user"]}><UserDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/rankings" element={<ProtectedRoute allowedRoles={["user"]}><UserRankings /></ProtectedRoute>} />
          <Route path="/dashboard/profile" element={<ProtectedRoute allowedRoles={["user"]}><UserProfile /></ProtectedRoute>} />
          <Route path="/dashboard/test" element={<ProtectedRoute allowedRoles={["user"]}><UserTest /></ProtectedRoute>} />

          {/* Practice Session */}
          <Route path="/practice" element={<ProtectedRoute><PracticeSession /></ProtectedRoute>} />
          <Route path="/lockdown-practice" element={<LockdownPracticeSession />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
