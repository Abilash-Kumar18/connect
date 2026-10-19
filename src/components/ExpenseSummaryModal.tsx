import React from 'react';
import { motion } from 'motion/react';
import { X, Receipt, CheckCircle, ArrowRightLeft, Sparkles, AlertCircle } from 'lucide-react';
import { useConnect } from '../context/ConnectContext';

interface ExpenseSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExpenseSummaryModal: React.FC<ExpenseSummaryModalProps> = ({ isOpen, onClose }) => {
  const {
    activeChannel,
    activeMessages,
    currentUser,
    partnerUser,
    getChannelExpenseSummary,
    markExpenseSettled,
    settleAllChannelExpenses,
  } = useConnect();

  if (!isOpen || !activeChannel) return null;

  const summary = getChannelExpenseSummary(activeChannel.id);
  const currency = activeChannel.currency === '$' ? '₹' : (activeChannel.currency || '₹');
  const expenseMessages = activeMessages.filter((m) => m.type === 'expense' && m.expense);

  const isAlexOwed = summary.netBalance > 0.01;
  const isJordanOwed = summary.netBalance < -0.01;
  const isSettled = Math.abs(summary.netBalance) <= 0.01;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-[#F7F2EB] dark:bg-[#1E231B] border border-[#EAE2D6] dark:border-[#353E2F] rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D6] dark:border-[#353E2F]">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-[#8B9A6E]/15 text-[#8B9A6E] dark:text-[#A3B386]">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
                Channel Expense Balance
              </h3>
              <p className="text-xs text-slate-500">#{activeChannel.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-[#EEEEEE] dark:hover:bg-[#252C21] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance Overview Card */}
        <div className="my-4 p-4 rounded-2xl bg-white dark:bg-[#252C21] border border-[#EAE2D6] dark:border-[#353E2F] shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Net Duo Settlement Status
          </div>

          {isSettled ? (
            <div className="flex items-center gap-2 text-[#8B9A6E] dark:text-[#A3B386]">
              <CheckCircle className="w-6 h-6" />
              <div>
                <div className="text-base font-bold">All Settled Up!</div>
                <div className="text-xs text-slate-500">No pending balances between Alex & Jordan</div>
              </div>
            </div>
          ) : (
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  {isAlexOwed ? 'Jordan owes Alex' : 'Alex owes Jordan'}
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-[#8B9A6E] dark:text-[#A3B386]">
                  {currency}
                  {Math.abs(summary.netBalance).toFixed(2)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => settleAllChannelExpenses(activeChannel.id)}
                className="px-4 py-2 rounded-xl bg-[#8B9A6E] hover:bg-[#79875F] text-white text-xs font-semibold shadow-sm active:scale-95 transition-all"
              >
                Settle All ({summary.unsettledCount})
              </button>
            </div>
          )}

          {/* Breakdown stat bars */}
          <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-[#EAE2D6] dark:border-[#353E2F]">
            <div>
              <div className="text-[11px] text-slate-500">Alex Morgan paid</div>
              <div className="text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-200">
                {currency}
                {summary.user1Paid.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">Jordan Lee paid</div>
              <div className="text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-200">
                {currency}
                {summary.user2Paid.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Itemized Expenses List */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Expense Records ({expenseMessages.length})
          </div>

          {expenseMessages.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No expenses recorded in this topic yet.
            </div>
          ) : (
            <div className="space-y-2">
              {expenseMessages.map((msg) => {
                const exp = msg.expense!;
                const payerName = exp.paidBy === 'alex' ? 'Alex' : 'Jordan';
                return (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-2xl border text-xs flex items-center justify-between transition-all ${
                      exp.isSettled
                        ? 'border-[#EAE2D6] dark:border-[#353E2F] bg-[#EEEEEE]/40 dark:bg-[#252C21]/40 opacity-60'
                        : 'border-[#8B9A6E]/30 bg-[#8B9A6E]/10 dark:bg-[#8B9A6E]/15'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{exp.title}</span>
                        {exp.isSettled ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#EEEEEE] dark:bg-[#2A3125] text-slate-600 dark:text-slate-400">
                            Settled
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#8B9A6E]/20 text-[#3C4731] dark:text-[#C5D4AD] font-medium">
                            Pending
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Paid by {payerName} · {exp.category} ·{' '}
                        {new Date(msg.timestamp).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-bold tabular-nums text-slate-900 dark:text-white">
                          {exp.currency === '$' ? '₹' : (exp.currency || currency)}
                          {exp.amount.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {exp.splitType === 'equally'
                            ? `${exp.currency === '$' ? '₹' : (exp.currency || currency)}${(exp.amount / 2).toFixed(2)} ea`
                            : 'Direct'}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => markExpenseSettled(msg.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                          exp.isSettled
                            ? 'border-[#EAE2D6] dark:border-[#353E2F] text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                            : 'border-[#8B9A6E] bg-[#8B9A6E] text-white hover:bg-[#79875F]'
                        }`}
                      >
                        {exp.isSettled ? 'Undo' : 'Settle'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#EAE2D6] dark:border-[#353E2F] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#8B9A6E] hover:bg-[#79875F] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
