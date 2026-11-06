import { useState, useEffect } from "react";

export function useEmployeeData(employeeId = 1) {
  const [employees, setEmployees] = useState([]);
  const [usertransactions, setUserTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true); 

    Promise.all([
      fetch("http://localhost:3007/users").then((res) => {
        if (!res.ok) throw new Error("Failed to fetch employees");
        return res.json();
      }),
      // Use the dynamic employeeId here
      fetch(`http://localhost:3007/eeid?employeeid=${employeeId}`).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user transactions");
        return res.json();
      })
    ])
      .then(([employeesData, transactionsData]) => {
        setEmployees(employeesData);
        setUserTransactions(transactionsData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [employeeId]); 

  // balanc calculations
  const salary = employees[0]?.salary || 0;
  const totalSpent = usertransactions.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  const totalBalance = salary - totalSpent;

  //upcoming transactions
  
  const todayStr = new Date().toISOString().split("T")[0];

  const upcomingTransactions= usertransactions.filter(
    (tx) => tx.transactiondate && tx.transactiondate.split("T")[0] > todayStr
  );
  console.log(upcomingTransactions)
 const Bills = upcomingTransactions.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
 console.log(Bills)
 const recentTransactions = [...usertransactions]
  .sort((a, b) => new Date(b.transactiondate) - new Date(a.transactiondate))
  .slice(0, 5);
  return {
    employees,
    usertransactions,
    loading,
    error,
    salary,
    totalSpent,
    totalBalance,
    Bills,
    upcomingTransactions,
    recentTransactions,
  };
}