import React from "react";

// Define the shape of the props so TypeScript knows what to expect
interface HeaderProps {
  employee?: {
    firstname: string;
    lastname: string;
  };
  onOpenModal: () => void;
}

export default function Header({ employee, onOpenModal }: HeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
        Hello <span>{employee ? `${employee.firstname} ${employee.lastname}` : "User"}</span>
      </h1>
      <h2 className="text-slate-500 font-medium text-sm mt-1">
        Thursday, October 5th
      </h2>

      {/* 3 small fixed-size square buttons */}
      <div className="flex flex-row gap-3 mt-4">
        <button className="h-10 w-10 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-semibold shadow-sm flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all">
          1
        </button>
        <button className="h-10 w-10 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-semibold shadow-sm flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all">
          2
        </button>
        
        {/* + icon modal trigger using the prop function */}
        <button 
          onClick={onOpenModal}
          aria-label="Add Transaction"
          className="h-10 w-10 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-semibold shadow-sm flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all"
        >
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>
    </div>
  );
}