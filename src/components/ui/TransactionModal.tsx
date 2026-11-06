import React from "react";

// Define the shape of your form data
interface TransactionFormData {
  amount: string;
  transactiondate: string;
  description: string;
  categoryname: string;
  categorytype: string;
}

// Define the props the modal needs to receive from App.tsx
interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: TransactionFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function AddTransactionModal({ 
  isOpen, 
  onClose, 
  formData, 
  onInputChange, 
  onSubmit 
}: AddTransactionModalProps) {
  
  // If the modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900">Add New Transaction</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
            <input
              type="text"
              name="description"
              required
              placeholder="e.g. Housing Tax"
              value={formData.description}
              onChange={onInputChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              name="amount"
              required
              placeholder="0.00"
              value={formData.amount}
              onChange={onInputChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Transaction Date</label>
            <input
              type="datetime-local"
              name="transactiondate"
              required
              value={formData.transactiondate}
              onChange={onInputChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Category Name</label>
            <input
              type="text"
              name="categoryname"
              placeholder="e.g. Performance Bonus"
              value={formData.categoryname}
              onChange={onInputChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Category Type</label>
            <input
              type="text"
              name="categorytype"
              placeholder="e.g. Bonus, Tax, Income"
              value={formData.categorytype}
              onChange={onInputChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all"
            >
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}