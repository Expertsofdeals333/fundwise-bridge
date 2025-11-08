import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Wallet, DollarSign, Users } from "lucide-react";
import WalletCard from "@/components/wallet/WalletCard";
import AvailableLoansTable from "@/components/loans/AvailableLoansTable";
import MyLoansTable from "@/components/loans/MyLoansTable";
import PortfolioChart from "@/components/charts/PortfolioChart";
import TransactionHistory from "@/components/transactions/TransactionHistory";

interface LenderDashboardProps {
  userId: string;
}

const LenderDashboard = ({ userId }: LenderDashboardProps) => {
  const [stats, setStats] = useState({
    activeInvestments: 0,
    totalInvested: 0,
    totalEarnings: 0,
  });

  useEffect(() => {
    fetchStats();
  }, [userId]);

  const fetchStats = async () => {
    const { data: loans } = await supabase
      .from("loans")
      .select("*")
      .eq("lender_id", userId);

    if (loans) {
      const active = loans.filter((l) => l.status === "active").length;
      const invested = loans.reduce((sum, l) => sum + parseFloat(l.amount.toString()), 0);
      const earnings = loans.reduce(
        (sum, l) => sum + parseFloat(l.amount.toString()) * (parseFloat(l.interest_rate.toString()) / 100),
        0
      );

      setStats({
        activeInvestments: active,
        totalInvested: invested,
        totalEarnings: earnings,
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Lender Dashboard</h2>
        <p className="text-muted-foreground">Invest in loans and track your portfolio</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeInvestments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalInvested.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">${stats.totalEarnings.toFixed(2)}</div>
          </CardContent>
        </Card>

        <WalletCard userId={userId} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Performance</CardTitle>
            <CardDescription>Your investment growth over time</CardDescription>
          </CardHeader>
          <CardContent>
            <PortfolioChart userId={userId} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Recent investments and returns</CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionHistory userId={userId} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Loans</CardTitle>
          <CardDescription>Browse and fund loan requests</CardDescription>
        </CardHeader>
        <CardContent>
          <AvailableLoansTable userId={userId} onFund={fetchStats} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Investments</CardTitle>
          <CardDescription>Track your funded loans</CardDescription>
        </CardHeader>
        <CardContent>
          <MyLoansTable userId={userId} userType="lender" />
        </CardContent>
      </Card>
    </div>
  );
};

export default LenderDashboard;