import { useState, useCallback } from 'react';

export const useTransactions = (employeeId?: number) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async (idToFetch?: number) => {
    const targetId = idToFetch || employeeId;
    if (!targetId) {
      setError("No employee ID provided");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3001/eeid?employeeid=${targetId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const data = await response.json();
      setTransactions(data);
    } catch (err: any) {
      console.error("Error loading transactions:", err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  return { transactions, loading, error, fetchTransactions };
};