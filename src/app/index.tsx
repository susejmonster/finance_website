import { CategoryScale } from "chart.js";
import Chart from "chart.js/auto";
import React, { useState } from "react";
import "../../global.css";
import DashboardCards from "../components/ui/Dashboard";
import Header from "../components/ui/Header";
import Sidebar from "../components/ui/Sidebar";
import TransactionModal from "../components/ui/TransactionModal";
import { useEmployeeData } from "../services/fetch.js";
Chart.register(CategoryScale);

interface Employee {
  employeeid: number;
  firstname: string;
  lastname: string;
  // ... other fields
}
//added something to triggr git
interface TransactionFormData {
  amount: string;
  transactiondate: string;
  description: string;
  categoryname: string;
  categorytype: string;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState<TransactionFormData>({
    amount: "",
    transactiondate: "",
    description: "",
    categoryname: "",
    categorytype: "",
  });

  // 1. Pass the logged-in user's ID to your custom hook (fallback to 1 so the hook doesn't crash on initial render)
  const activeEmployeeId = currentUser ? currentUser.employeeid : 1;
  const { 
    employees, 
    loading, 
    error, 
    totalBalance,
    Bills,
    upcomingTransactions,
    usertransactions,
    recentTransactions,
  } = useEmployeeData(activeEmployeeId);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Safety check
    if (!currentUser) return alert("Please log in first.");

    // Retrieve the token saved during login and use your Render API URL
    const token = localStorage.getItem('userToken'); 
    const API_URL = "https://finance-website-h7uo.onrender.com";

    try {
      const response = await fetch(`${API_URL}/eeid?employeeid=${currentUser.employeeid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // <--- This clears the 401 Unauthorized error
        },
        body: JSON.stringify({
          employeeid: currentUser.employeeid,
          amount: parseFloat(formData.amount),
          transactiondate: formData.transactiondate,
          description: formData.description,
          categoryname: formData.categoryname,
          categorytype: formData.categorytype,
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      console.log("Transaction successfully saved:", result);

      setIsModalOpen(false);
      setFormData({ amount: "", transactiondate: "", description: "", categoryname: "", categorytype: "" });
    } catch (err) {
      console.error("Failed to post transaction:", err);
    }
  };

  if (loading) return <div className="flex h-screen w-full items-center justify-center bg-slate-50 text-slate-600 font-medium">Loading employee data...</div>;
  if (error) return <div className="flex h-screen w-full items-center justify-center bg-slate-50 text-red-500 font-medium">Error: {error}</div>;

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 p-6 box-border overflow-hidden relative">
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }}
      />
    
      {/* 4. Conditionally render the dashboard ONLY if a user is logged in */}
      {!currentUser ? (
        <div className="flex flex-col items-center justify-center h-full w-full">
          <h2 className="text-3xl font-bold text-slate-800">Welcome to the Portal</h2>
          <p className="text-slate-500 mt-2 mb-6">Please open the sidebar to log in.</p>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-slate-800 transition-colors"
          >
            Open Login Menu
          </button>
        </div>
      ) : (
        <>
         {/* Header section */}
          <Header 
            employee={currentUser || employees[0]} 
            onOpenModal={() => setIsModalOpen(true)} 
          />

          {/* Cards section */}
          <DashboardCards 
            employee={currentUser || employees[0]}
            totalBalance={totalBalance}
            upcomingTransactions={upcomingTransactions}
            Bills={Bills}
            usertransactions={usertransactions}
            recentTransactions={recentTransactions}
          />

          <TransactionModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            formData={formData}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
          />
        </>
      )}
    </div>
  );
}
