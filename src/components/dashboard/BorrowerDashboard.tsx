import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Wallet, TrendingUp, Clock } from "lucide-react";
import WalletCard from "@/components/wallet/WalletCard";
import LoanRequestDialog from "@/components/loans/LoanRequestDialog";
import MyLoansTable from "@/components/loans/MyLoansTable";
import TransactionHistory from "@/components/transactions/TransactionHistory";

interface BorrowerDashboardProps {
  userId: string;
}

const BorrowerDashboard = ({ userId }: BorrowerDashboardProps) => {
  const [showLoanDialog, setShowLoanDialog] = useState(false);
  const [stats, setStats] = useState({
    activeLoans: 0,
    totalBorrowed: 0,
    pendingLoans: 0,
  });

  useEffect(() => {
    fetchStats();
  }, [userId]);

  const fetchStats = async () => {
    const { data: loans } = await supabase
      .from("loans")
      .select("*")
      .eq("borrower_id", userId);

    if (loans) {
      const active = loans.filter((l) => l.status === "active").length;
      const pending = loans.filter((l) => l.status === "pending").length;
      const total = loans
        .filter((l) => l.status !== "pending")
        .reduce((sum, l) => sum + parseFloat(l.amount.toString()), 0);

      setStats({
        activeLoans: active,
        totalBorrowed: total,
        pendingLoans: pending,
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Borrower Dashboard</h2>
          <p className="text-muted-foreground">Manage your loan requests and repayments</p>
        </div>
        <Button onClick={() => setShowLoanDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Request Loan
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeLoans}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Borrowed</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalBorrowed.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingLoans}</div>
          </CardContent>
        </Card>

        <WalletCard userId={userId} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>My Loans</CardTitle>
            <CardDescription>Track your active and pending loan requests</CardDescription>
          </CardHeader>
          <CardContent>
            <MyLoansTable userId={userId} userType="borrower" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Recent transactions and repayments</CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionHistory userId={userId} />
          </CardContent>
        </Card>
      </div>

      <LoanRequestDialog
        open={showLoanDialog}
        onOpenChange={setShowLoanDialog}
        userId={userId}
        onSuccess={fetchStats}
      />
    </div>
  );
};

export default BorrowerDashboard;