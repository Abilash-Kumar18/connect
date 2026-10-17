import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Receipt,
  Plus,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Filter,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Tag,
  Menu,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useConnect } from '../context/ConnectContext';
import { ChannelIcon } from '../components/ChannelIcon';

interface ExpensesPageProps {
  onOpenExpenseModal: () => void;
}

export const ExpensesPage: React.FC<ExpensesPageProps> = ({ onOpenExpenseModal }) => {
  const {
    channels,
    currentUser,
    partnerUser,
    markExpenseSettled,
    setIsMobileDrawerOpen,
    activeMessages,
  } = useConnect();
  const navigate = useNavigate();

  // Collect all expense messages across all stored messages in local storage or active channel
  // Let's get all messages from localStorage to calculate global statistics
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unsettled' | 'settled'>('all');

  const allMessagesRaw = (() => {
    try {
      const saved = localStorage.getItem('connect_messages_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return activeMessages;
  })();

  const allExpenses = (allMessagesRaw as any[]).filter(
    (m) => m.type === 'expense' && m.expense
  );

  // Calculate global summary across all channels
  let totalAmount = 0;
  let user1Paid = 0; // alex
  let user2Paid = 0; // jordan
  let netBalance = 0; // positive = jordan owes alex, negative = alex owes jordan
  let unsettledCount = 0;

  allExpenses.forEach((msg) => {
    const exp = msg.expense;
    if (!exp) return;
    totalAmount += exp.amount;

    if (exp.paidBy === 'alex') {
      user1Paid += exp.amount;
    } else {
      user2Paid += exp.amount;
    }

    if (!exp.isSettled) {
      unsettledCount++;
      const half = exp.amount / 2;
      if (exp.splitType === 'equally') {
        if (exp.paidBy === 'alex') netBalance += half;
        else netBalance -= half;
      } else if (exp.splitType === 'partner_owes_full') {
        if (exp.paidBy === 'alex') netBalance += exp.amount;
        else netBalance -= exp.amount;
      } else if (exp.splitType === 'you_owe_full') {
        if (exp.paidBy === 'alex') netBalance -= exp.amount;
        else netBalance += exp.amount;
      }
    }
  });

  const isAlexOwed = netBalance > 0.01;
  const isJordanOwed = netBalance < -0.01;
  const isSettled = Math.abs(netBalance) <= 0.01;

  // Filtered expense list
  const filteredExpenses = allExpenses.filter((msg) => {
    const exp = msg.expense;
    if (!exp) return false;
    if (filterStatus === 'unsettled' && exp.isSettled) return false;
    if (filterStatus === 'settled' && !exp.isSettled) return false;
    if (filterCategory !== 'all' && exp.category !== filterCategory) return false;
    return true;
  });

  const getChannel = (channelId: string) => channels.find((c) => c.id === channelId);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Header */}
      <header className="h-16 px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="md:hidden p-2 -ml-1 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Open Channels List"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-900/50">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold font-display text-slate-900 dark:text-white">
                Duo Shared Expenses
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold">
                Direct URL: /expenses
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Auto-splitting and live balance tracking across all conversation workspaces
            </p>
          </div>
        </div>

        <button
          onClick={onOpenExpenseModal}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Expense</span>
        </button>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Top Summary Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Net Settlement Balance Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 dark:border-emerald-500/30">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              <span>Net Settlement</span>
              <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                <Receipt className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3">
              {isSettled ? (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-6 h-6" />
                  <span className="text-xl font-bold">All Settled Up!</span>
                </div>
              ) : (
                <div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {isAlexOwed ? 'Jordan owes Alex' : 'Alex owes Jordan'}
                  </div>
                  <div className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                    ${Math.abs(netBalance).toFixed(2)}
                  </div>
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              {unsettledCount} unsettled {unsettledCount === 1 ? 'transaction' : 'transactions'} pending
            </p>
          </div>

          {/* Alex Paid Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Alex Morgan Paid</span>
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-3">
              ${user1Paid.toFixed(2)}
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Share: {totalAmount > 0 ? Math.round((user1Paid / totalAmount) * 100) : 0}%</span>
              <span>Total spent: ${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Jordan Paid Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Jordan Lee Paid</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-3">
              ${user2Paid.toFixed(2)}
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Share: {totalAmount > 0 ? Math.round((user2Paid / totalAmount) * 100) : 0}%</span>
              <span>Total spent: ${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Channels with Expenses Quick-Links */}
        <div>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Expenses By Topic Channel
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {channels
              .filter((ch) => ch.category === 'expenses' || ch.category === 'college')
              .map((channel) => {
                const chanExpenses = allExpenses.filter((m) => m.channelId === channel.id);
                const chanTotal = chanExpenses.reduce((acc, m) => acc + (m.expense?.amount || 0), 0);
                return (
                  <div
                    key={channel.id}
                    onClick={() => navigate(`/channels/${channel.id}`)}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer group flex items-center justify-between shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/60 group-hover:text-indigo-600 transition-colors">
                        <ChannelIcon name={channel.icon} className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {channel.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {chanExpenses.length} entries · ${chanTotal.toFixed(2)} total
                        </div>
                      </div>
                    </div>
                    <div className="text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Filter Pills & All Transactions List */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>All Expense Records</span>
              <span className="text-xs font-normal text-slate-400">({filteredExpenses.length})</span>
            </h2>

            {/* Filter buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
                {(['all', 'unsettled', 'settled'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1 rounded-lg capitalize font-medium transition-colors ${
                      filterStatus === status
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 mt-2">
            {filteredExpenses.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-500">No expenses matching your filter</p>
              </div>
            ) : (
              filteredExpenses.map((msg) => {
                const exp = msg.expense!;
                const channel = getChannel(msg.channelId);
                const isPaidByAlex = exp.paidBy === 'alex';

                return (
                  <div
                    key={msg.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 px-2 rounded-2xl transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                          exp.isSettled
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600'
                        }`}
                      >
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{exp.title}</span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                              exp.isSettled
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                            }`}
                          >
                            {exp.isSettled ? 'Settled' : 'Pending'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                          <span>Paid by {isPaidByAlex ? 'Alex' : 'Jordan'}</span>
                          <span>·</span>
                          <span className="capitalize">{exp.splitType.replace(/_/g, ' ')}</span>
                          {channel && (
                            <>
                              <span>·</span>
                              <button
                                onClick={() => navigate(`/channels/${channel.id}`)}
                                className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 font-medium"
                              >
                                #{channel.name}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center">
                      <div className="text-right">
                        <div className="text-sm font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
                          ${exp.amount.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(msg.timestamp).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </div>

                      {!exp.isSettled && (
                        <button
                          onClick={() => markExpenseSettled(msg.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 transition-colors active:scale-95"
                        >
                          Mark Settled
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
