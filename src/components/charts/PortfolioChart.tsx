import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";

interface PortfolioChartProps {
  userId: string;
}

const PortfolioChart = ({ userId }: PortfolioChartProps) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    setLoading(true);
    
    const { data: loans } = await supabase
      .from("loans")
      .select("*")
      .eq("lender_id", userId)
      .order("funded_at", { ascending: true });

    if (loans && loans.length > 0) {
      let cumulativeValue = 0;
      const chartData = loans.map((loan) => {
        cumulativeValue += parseFloat(loan.amount.toString());
        return {
          date: new Date(loan.funded_at || loan.created_at).toLocaleDateString(),
          value: cumulativeValue,
        };
      });
      setData(chartData);
    } else {
      setData([{ date: "Today", value: 0 }]);
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="date" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--primary))" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PortfolioChart;