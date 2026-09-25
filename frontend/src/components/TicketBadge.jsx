import React from 'react';
import { AlertCircle, CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const norm = (status || 'open').toLowerCase();

  const configs = {
    open: {
      label: 'Open',
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: AlertCircle,
    },
    in_progress: {
      label: 'In Progress',
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: Clock,
    },
    resolved: {
      label: 'Resolved',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
    },
    closed: {
      label: 'Closed',
      bg: 'bg-slate-100 text-slate-600 border-slate-200',
      icon: XCircle,
    },
  };

  const current = configs[norm] || configs.open;
  const IconComponent = current.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${current.bg}`}>
      <IconComponent className="w-3.5 h-3.5" />
      {current.label}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const norm = (priority || 'medium').toLowerCase();

  const configs = {
    low: {
      label: 'Low',
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    medium: {
      label: 'Medium',
      bg: 'bg-sky-50 text-sky-700 border-sky-200',
    },
    high: {
      label: 'High',
      bg: 'bg-orange-50 text-orange-700 border-orange-200',
    },
    urgent: {
      label: 'Urgent',
      bg: 'bg-rose-50 text-rose-700 border-rose-300 font-semibold',
      icon: AlertTriangle,
    },
  };

  const current = configs[norm] || configs.medium;
  const Icon = current.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${current.bg}`}>
      {Icon && <Icon className="w-3 h-3 text-rose-600 animate-pulse" />}
      {current.label}
    </span>
  );
};
