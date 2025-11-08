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
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface MyLoansTableProps {
  userId: string;
  userType: "borrower" | "lender";
}

const MyLoansTable = ({ userId, userType }: MyLoansTableProps) => {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoans();
  }, [userId, userType]);

  const fetchLoans = async () => {
    setLoading(true);
    const column = userType === "borrower" ? "borrower_id" : "lender_id";
    
    const { data, error } = await supabase
      .from("loans")
      .select("*, profiles!loans_borrower_id_fkey(full_name)")
      .eq(column, userId)
      .order("created_at", { ascending: false });

    if (data && !error) {
      setLoans(data);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "pending":
        return "secondary";
      case "completed":
        return "outline";
      case "defaulted":
        return "destructive";
      default:
        return "secondary";
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
        No loans found
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Amount</TableHead>
            <TableHead>Interest</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loans.map((loan) => (
            <TableRow key={loan.id}>
              <TableCell className="font-medium">${parseFloat(loan.amount).toFixed(2)}</TableCell>
              <TableCell>{parseFloat(loan.interest_rate).toFixed(2)}%</TableCell>
              <TableCell>{loan.duration_months} months</TableCell>
              <TableCell>
                <Badge variant={getStatusColor(loan.status)}>{loan.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MyLoansTable;