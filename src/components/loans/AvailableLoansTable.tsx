import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AvailableLoansTableProps {
  userId: string;
  onFund: () => void;
}

const AvailableLoansTable = ({ userId, onFund }: AvailableLoansTableProps) => {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fundingLoan, setFundingLoan] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("loans")
      .select("*, profiles!loans_borrower_id_fkey(full_name)")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (data && !error) {
      setLoans(data);
    }
    setLoading(false);
  };

  const handleFund = async (loanId: string, amount: string) => {
    setFundingLoan(loanId);

    try {
      const { data: wallet } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", userId)
        .single();

      if (!wallet || parseFloat(wallet.balance.toString()) < parseFloat(amount)) {
        throw new Error("Insufficient wallet balance");
      }

      const newBalance = parseFloat(wallet.balance.toString()) - parseFloat(amount);
      await supabase.from("wallets").update({ balance: newBalance }).eq("user_id", userId);

      await supabase
        .from("loans")
        .update({ lender_id: userId, status: "active", funded_at: new Date().toISOString() })
        .eq("id", loanId);

      await supabase.from("transactions").insert({
        from_user_id: userId,
        to_user_id: loans.find((l) => l.id === loanId)?.borrower_id,
        amount: parseFloat(amount),
        type: "loan_funding",
        loan_id: loanId,
      });

      toast({
        title: "Success!",
        description: "Loan funded successfully.",
      });

      fetchLoans();
      onFund();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setFundingLoan(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (loans.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No available loans at the moment
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Borrower</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Interest</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Purpose</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loans.map((loan) => (
            <TableRow key={loan.id}>
              <TableCell className="font-medium">{loan.profiles?.full_name || "Unknown"}</TableCell>
              <TableCell>${parseFloat(loan.amount).toFixed(2)}</TableCell>
              <TableCell>
                <Badge variant="outline">{parseFloat(loan.interest_rate).toFixed(2)}%</Badge>
              </TableCell>
              <TableCell>{loan.duration_months} months</TableCell>
              <TableCell className="max-w-xs truncate">{loan.purpose}</TableCell>
              <TableCell>
                <Button
                  size="sm"
                  onClick={() => handleFund(loan.id, loan.amount)}
                  disabled={fundingLoan === loan.id}
                >
                  {fundingLoan === loan.id && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Fund
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AvailableLoansTable;