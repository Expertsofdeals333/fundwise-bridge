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

const AllLoansTable = () => {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("loans")
      .select(`
        *,
        borrower:profiles!loans_borrower_id_fkey(full_name),
        lender:profiles!loans_lender_id_fkey(full_name)
      `)
      .order("created_at", { ascending: false });

    if (data) {
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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Borrower</TableHead>
            <TableHead>Lender</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Interest</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loans.map((loan) => (
            <TableRow key={loan.id}>
              <TableCell className="font-medium">{loan.borrower?.full_name || "N/A"}</TableCell>
              <TableCell>{loan.lender?.full_name || "Pending"}</TableCell>
              <TableCell>${parseFloat(loan.amount).toFixed(2)}</TableCell>
              <TableCell>{parseFloat(loan.interest_rate).toFixed(2)}%</TableCell>
              <TableCell>
                <Badge variant={getStatusColor(loan.status)}>{loan.status}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(loan.created_at).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AllLoansTable;