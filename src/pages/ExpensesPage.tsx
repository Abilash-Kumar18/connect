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
  IndianRupee,
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
    <div className="flex-1 flex flex-col h-full bg-[#F7F2EB] dark:bg-[#1E231B] text-[#2D3325] dark:text-[#F7F2EB] overflow-hidden">
      {/* Header */}
      <header className="h-16 px-4 sm:px-6 border-b border-[#EAE2D6] dark:border-[#353E2F] bg-[#F7F2EB]/95 dark:bg-[#1E231B]/95 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="md:hidden p-2 -ml-1 rounded-xl text-[#586348] dark:text-[#C5CEB8] hover:bg-[#EAE2D6] dark:hover:bg-[#252C21]"
            title="Open Channels List"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-[#8B9A6E]/15 text-[#586348] dark:text-[#C5CEB8] flex items-center justify-center border border-[#8B9A6E]/30">
            <Receipt className="w-5 h-5 text-[#8B9A6E]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold font-display text-[#2D3325] dark:text-white">
                Duo Shared Expenses
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-[#EAE2D6] dark:bg-[#252C21] text-[#586348] dark:text-[#C5CEB8] text-[11px] font-semibold">
                Direct URL: /expenses
              </span>
            </div>
            <p className="text-xs text-[#788566] dark:text-[#A7B395]">
              Auto-splitting and live balance tracking across all conversation workspaces
            </p>
          </div>
        </div>

        <button
          onClick={onOpenExpenseModal}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#8B9A6E] hover:bg-[#79875F] text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
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
          <div className="p-5 rounded-3xl bg-[#EAE2D6]/40 dark:bg-[#252C21] border border-[#8B9A6E]/40">
            <div className="flex items-center justify-between text-xs font-semibold text-[#586348] dark:text-[#C5CEB8] uppercase tracking-wider">
              <span>Net Settlement</span>
              <span className="p-1.5 rounded-lg bg-[#8B9A6E]/20 text-[#8B9A6E]">
                <Receipt className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3">
              {isSettled ? (
                <div className="flex items-center gap-2 text-[#8B9A6E]">
                  <CheckCircle className="w-6 h-6" />
                  <span className="text-xl font-bold">All Settled Up!</span>
                </div>
              ) : (
                <div>
                  <div className="text-xs text-[#788566] dark:text-[#A7B395]">
                    {isAlexOwed ? 'Jordan owes Alex' : 'Alex owes Jordan'}
                  </div>
                  <div className="text-3xl font-extrabold font-mono text-[#586348] dark:text-[#C5CEB8] mt-0.5">
                    ₹{Math.abs(netBalance).toFixed(2)}
                  </div>
                </div>
              )}
            </div>
            <p className="text-[11px] text-[#788566] dark:text-[#A7B395] mt-2">
              {unsettledCount} unsettled {unsettledCount === 1 ? 'transaction' : 'transactions'} pending
            </p>
          </div>

          {/* Alex Paid Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#252C21] border border-[#EAE2D6] dark:border-[#353E2F]">
            <div className="flex items-center justify-between text-xs font-semibold text-[#788566] dark:text-[#A7B395]">
              <span>Alex Morgan Paid</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B9A6E]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#2D3325] dark:text-white mt-3">
              ₹{user1Paid.toFixed(2)}
            </div>
            <div className="mt-2 text-[11px] text-[#8F9882] flex items-center justify-between">
              <span>Share: {totalAmount > 0 ? Math.round((user1Paid / totalAmount) * 100) : 0}%</span>
              <span>Total spent: ₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Jordan Paid Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#252C21] border border-[#EAE2D6] dark:border-[#353E2F]">
            <div className="flex items-center justify-between text-xs font-semibold text-[#788566] dark:text-[#A7B395]">
              <span>Jordan Lee Paid</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#67754E]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#2D3325] dark:text-white mt-3">
              ₹{user2Paid.toFixed(2)}
            </div>
            <div className="mt-2 text-[11px] text-[#8F9882] flex items-center justify-between">
              <span>Share: {totalAmount > 0 ? Math.round((user2Paid / totalAmount) * 100) : 0}%</span>
              <span>Total spent: ₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Channels with Expenses Quick-Links */}
        <div>
          <h2 className="text-xs font-semibold text-[#788566] dark:text-[#A7B395] uppercase tracking-wider mb-3">
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
                    className="p-4 rounded-2xl bg-white dark:bg-[#252C21] border border-[#EAE2D6] dark:border-[#353E2F] hover:border-[#8B9A6E] transition-all cursor-pointer group flex items-center justify-between shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#EEEEEE] dark:bg-[#1E231B] text-[#586348] dark:text-[#C5CEB8] flex items-center justify-center group-hover:bg-[#8B9A6E] group-hover:text-white transition-colors">
                        <ChannelIcon name={channel.icon} className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#2D3325] dark:text-white group-hover:text-[#8B9A6E] transition-colors">
                          {channel.name}
                        </div>
                        <div className="text-[11px] text-[#8F9882]">
                          {chanExpenses.length} entries · ₹{chanTotal.toFixed(2)} total
                        </div>
                      </div>
                    </div>
                    <div className="text-[#8F9882] group-hover:text-[#8B9A6E] group-hover:translate-x-1 transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Filter Pills & All Transactions List */}
        <div className="bg-white dark:bg-[#252C21] rounded-3xl border border-[#EAE2D6] dark:border-[#353E2F] p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EAE2D6] dark:border-[#353E2F]">
            <h2 className="text-sm font-bold text-[#2D3325] dark:text-white flex items-center gap-2">
              <span>All Expense Records</span>
              <span className="text-xs font-normal text-[#8F9882]">({filteredExpenses.length})</span>
            </h2>

            {/* Filter buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center bg-[#EEEEEE] dark:bg-[#1E231B] p-1 rounded-xl text-xs border border-[#DFD6C7] dark:border-[#353E2F]">
                {(['all', 'unsettled', 'settled'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1 rounded-lg capitalize font-medium transition-colors ${
                      filterStatus === status
                        ? 'bg-[#8B9A6E] text-white shadow-xs'
                        : 'text-[#586348] dark:text-[#C5CEB8] hover:text-[#2D3325]'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="divide-y divide-[#EAE2D6] dark:divide-[#353E2F] mt-2">
            {filteredExpenses.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="w-10 h-10 text-[#8B9A6E]/30 mx-auto mb-2" />
                <p className="text-xs font-medium text-[#788566]">No expenses matching your filter</p>
              </div>
            ) : (
              filteredExpenses.map((msg) => {
                const exp = msg.expense!;
                const channel = getChannel(msg.channelId);
                const isPaidByAlex = exp.paidBy === 'alex';

                return (
                  <div
                    key={msg.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F7F2EB]/60 dark:hover:bg-[#1E231B]/50 px-2 rounded-2xl transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                          exp.isSettled
                            ? 'bg-[#8B9A6E]/15 text-[#586348]'
                            : 'bg-[#EAE2D6] text-[#788566]'
                        }`}
                      >
                        <IndianRupee className="w-5 h-5 text-[#8B9A6E]" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#2D3325] dark:text-white flex items-center gap-2">
                          <span>{exp.title}</span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                              exp.isSettled
                                ? 'bg-[#8B9A6E]/20 text-[#586348] dark:text-[#C5CEB8]'
                                : 'bg-[#EAE2D6] text-[#788566]'
                            }`}
                          >
                            {exp.isSettled ? 'Settled' : 'Pending'}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#788566] dark:text-[#A7B395] mt-0.5 flex items-center gap-2 flex-wrap">
                          <span>Paid by {isPaidByAlex ? 'Alex' : 'Jordan'}</span>
                          <span>·</span>
                          <span className="capitalize">{exp.splitType.replace(/_/g, ' ')}</span>
                          {channel && (
                            <>
                              <span>·</span>
                              <button
                                onClick={() => navigate(`/channels/${channel.id}`)}
                                className="text-[#8B9A6E] hover:underline flex items-center gap-0.5 font-medium"
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
                        <div className="text-sm font-extrabold font-mono tabular-nums text-[#2D3325] dark:text-white">
                          {exp.currency === '$' ? '₹' : (exp.currency || '₹')}{exp.amount.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-[#8F9882]">
                          {new Date(msg.timestamp).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </div>

                      {!exp.isSettled && (
                        <button
                          onClick={() => markExpenseSettled(msg.id)}
                          className="px-3 py-1.5 rounded-xl bg-[#8B9A6E] text-white text-xs font-semibold hover:bg-[#79875F] transition-colors active:scale-95 shadow-xs"
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
