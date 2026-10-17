import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Receipt, DollarSign, Users, Tag } from 'lucide-react';
import { useConnect } from '../context/ConnectContext';
import { SplitType } from '../types';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Groceries',
  'College & Xerox',
  'Books & Stationery',
  'Transit & Cabs',
  'Coffee & Snacks',
  'Apartment & Utilities',
  'Entertainment',
  'General Shared',
];

export const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose }) => {
  const { activeChannel, currentUser, partnerUser, sendMessage } = useConnect();
  const currency = activeChannel?.currency || '$';

  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(
    activeChannel?.category === 'college' ? 'College & Xerox' : 'Food & Dining'
  );
  const [paidBy, setPaidBy] = useState<string>(currentUser.id);
  const [splitType, setSplitType] = useState<SplitType>('equally');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }
    if (!title.trim()) {
      setError('Please enter an expense title or description.');
      return;
    }

    const partnerId = paidBy === currentUser.id ? partnerUser.id : currentUser.id;

    sendMessage({
      content: `${title.trim()} (${currency}${parsedAmount.toFixed(2)})`,
      type: 'expense',
      expense: {
        amount: parsedAmount,
        currency,
        category,
        title: title.trim(),
        paidBy,
        splitWith: partnerId,
        splitType,
        isSettled: false,
      },
    });

    setAmount('');
    setTitle('');
    setError('');
    onClose();
  };

  const parsedAmount = parseFloat(amount) || 0;
  const splitShare = splitType === 'equally' ? (parsedAmount / 2).toFixed(2) : parsedAmount.toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
                Log Shared Expense
              </h3>
              <p className="text-[11px] text-slate-500">
                Adding to #{activeChannel?.name || 'Expenses'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Amount input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Amount ({currency})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-lg font-bold text-slate-400">
                {currency}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                placeholder="0.00"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-lg font-bold tabular-nums text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Expense Description *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError('');
              }}
              placeholder="e.g. Lab manual color prints, Bistro dinner, Uber ride"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Paid by */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Who paid?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaidBy(currentUser.id)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  paidBy === currentUser.id
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>{currentUser.name} (You)</span>
              </button>
              <button
                type="button"
                onClick={() => setPaidBy(partnerUser.id)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  paidBy === partnerUser.id
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>{partnerUser.name}</span>
              </button>
            </div>
          </div>

          {/* Split Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Split Option
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setSplitType('equally')}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all ${
                  splitType === 'equally'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Split 50/50
              </button>
              <button
                type="button"
                onClick={() => setSplitType('partner_owes_full')}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all ${
                  splitType === 'partner_owes_full'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Owes 100%
              </button>
              <button
                type="button"
                onClick={() => setSplitType('you_owe_full')}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all ${
                  splitType === 'you_owe_full'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Cover 100%
              </button>
            </div>
            {parsedAmount > 0 && (
              <p className="text-[11px] text-slate-500 mt-1.5">
                {splitType === 'equally'
                  ? `Each person's share: ${currency}${splitShare}`
                  : splitType === 'partner_owes_full'
                  ? `Full amount (${currency}${splitShare}) charged to other person`
                  : `Full amount (${currency}${splitShare}) covered by payer`}
              </p>
            )}
          </div>

          {error && <p className="text-xs text-rose-500">{error}</p>}

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 active:scale-95"
            >
              Post Expense Card
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
