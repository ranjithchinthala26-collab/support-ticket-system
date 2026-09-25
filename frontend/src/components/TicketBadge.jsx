import React from 'react';
import { AlertCircle, CheckCircle2, Clock, XCircle, AlertTriangle, ArrowUpRight, Minus, Sparkles } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const norm = (status || 'open').toLowerCase();

  const configs = {
    open: {
      label: 'Open',
      bg: 'bg-blue-50 text-blue-700 border-blue-200/80 ring-1 ring-blue-500/10 shadow-sm',
      dot: 'bg-blue-500 animate-pulse',
      icon: AlertCircle,
    },
    in_progress: {
      label: 'In Progress',
      bg: 'bg-amber-50 text-amber-800 border-amber-200/80 ring-1 ring-amber-500/10 shadow-sm',
      dot: 'bg-amber-500',
      icon: Clock,
    },
    resolved: {
      label: 'Resolved',
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80 ring-1 ring-emerald-500/10 shadow-sm',
      dot: 'bg-emerald-500',
      icon: CheckCircle2,
    },
    closed: {
      label: 'Closed',
      bg: 'bg-slate-100 text-slate-700 border-slate-200 ring-1 ring-slate-400/10 shadow-sm',
      dot: 'bg-slate-400',
      icon: XCircle,
    },
  };

  const current = configs[norm] || configs.open;
  const IconComponent = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide border transition-all ${current.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      <IconComponent className="w-3.5 h-3.5" />
      <span>{current.label}</span>
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const norm = (priority || 'medium').toLowerCase();

  const configs = {
    low: {
      label: 'Low',
      bg: 'bg-slate-50 text-slate-700 border-slate-200 ring-1 ring-slate-300/20',
      icon: Minus,
    },
    medium: {
      label: 'Medium',
      bg: 'bg-sky-50 text-sky-700 border-sky-200 ring-1 ring-sky-500/20',
      icon: ArrowUpRight,
    },
    high: {
      label: 'High',
      bg: 'bg-orange-50 text-orange-800 border-orange-200 ring-1 ring-orange-500/20',
      icon: AlertTriangle,
    },
    urgent: {
      label: 'Urgent',
      bg: 'bg-rose-50 text-rose-800 border-rose-300 ring-1 ring-rose-500/30 animate-urgent font-bold',
      icon: AlertTriangle,
    },
  };

  const current = configs[norm] || configs.medium;
  const Icon = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide border transition-all ${current.bg}`}
    >
      {Icon && <Icon className="w-3 h-3 flex-shrink-0" />}
      <span>{current.label}</span>
    </span>
  );
};
