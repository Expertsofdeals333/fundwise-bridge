import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Plus, Minus } from "lucide-react";
import AddFundsDialog from "./AddFundsDialog";

interface WalletCardProps {
  userId: string;
}

const WalletCard = ({ userId }: WalletCardProps) => {
  const [balance, setBalance] = useState(0);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBalance();
  }, [userId]);

  const fetchBalance = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", userId)
      .maybeSingle();

    if (data && !error) {
      setBalance(parseFloat(data.balance.toString()));
    }
    setLoading(false);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${balance.toFixed(2)}</div>
          <Button
            size="sm"
            variant="outline"
            className="mt-3 w-full gap-2"
            onClick={() => setShowAddFunds(true)}
          >
            <Plus className="h-3 w-3" />
            Add Funds
          </Button>
        </CardContent>
      </Card>

      <AddFundsDialog
        open={showAddFunds}
        onOpenChange={setShowAddFunds}
        userId={userId}
        currentBalance={balance}
        onSuccess={fetchBalance}
      />
    </>
  );
};

export default WalletCard;