import React from "react";
import { TransactionChart } from "../../services/charts.js";

// Define the shape of the props needed for this section
interface DashboardCardsProps {
  employee: any; // You can replace 'any' with your 'Employee' interface
  totalBalance: number | string;
  upcomingTransactions: any[];
  Bills: number | string;
  usertransactions: any[];
  recentTransactions: any[];
}

export default function DashboardCards({
  employee,
  totalBalance,
  upcomingTransactions,
  Bills,
  usertransactions,
  recentTransactions,
}: DashboardCardsProps) {
  return (
    <section className="flex-1 flex flex-col gap-4 w-full mt-4">
      
      {/* Top Row: Summary Cards */}
      <div className="flex-[1] flex flex-col md:flex-row gap-4">
        <div className="flex-1 bg-white border border-slate-200 text-slate-800 p-4 rounded-2xl shadow-sm flex items-center justify-center font-semibold">
          {employee ? `${employee.salary} ` : "User"}
        </div>
        <div className="flex-1 bg-white border border-slate-200 text-slate-800 p-4 rounded-2xl shadow-sm flex items-center justify-center font-semibold">
          {employee ? `Balance: $${totalBalance}` : "Balance: $0"}
        </div>
        <div className="flex-1 bg-white border border-slate-200 text-slate-800 p-4 rounded-2xl shadow-sm flex items-center justify-center font-semibold">
          {upcomingTransactions.length > 0 ? `Upcoming: $${Bills}` : "Upcoming: $0"}
        </div>
      </div>

      {/* Bottom Row: Chart and Recent Transactions */}
      <div className="flex-[4] flex flex-col md:flex-row gap-4">
        
        {/* Chart */}
        <div className="flex-1 bg-white border border-slate-200 text-slate-800 p-4 rounded-2xl shadow-sm flex items-center justify-center font-semibold overflow-hidden">
          <TransactionChart usertransactions={usertransactions} />
        </div>

        {/* Recent Transactions List */}
        <div className="w-full md:w-1/4 bg-white border border-slate-200 text-slate-800 p-4 rounded-2xl shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold mb-3">Recent Transactions</h3>
          <ul className="flex flex-col gap-2.5 w-full overflow-y-auto">
            {recentTransactions.map((tx) => (
              <li 
                key={tx.transactionid} 
                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-slate-900">{tx.description}</span>
                  <small className="text-slate-400 text-xs">
                    {tx.transactiondate ? tx.transactiondate.split("T")[0] : ""}
                  </small>
                </div>
                <span className="font-semibold text-slate-700">
                  ${Number(tx.amount).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}