import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import BorrowerDashboard from "@/components/dashboard/BorrowerDashboard";
import LenderDashboard from "@/components/dashboard/LenderDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchUserRole();
    }
  }, [user]);

  const fetchUserRole = async () => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      setUserRole(data?.role || "borrower");
    } catch (error) {
      console.error("Error fetching user role:", error);
      setUserRole("borrower");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderDashboard = () => {
    if (userRole === "admin") {
      return <AdminDashboard userId={user.id} />;
    } else if (userRole === "lender") {
      return <LenderDashboard userId={user.id} />;
    } else {
      return <BorrowerDashboard userId={user.id} />;
    }
  };

  return (
    <DashboardLayout userRole={userRole || "borrower"}>
      {renderDashboard()}
    </DashboardLayout>
  );
};

export default Dashboard;