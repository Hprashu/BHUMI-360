import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileCheck,
  ShieldAlert,
  ArrowUpRight,
} from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = '',
}) => {
  const norm = status.toUpperCase().replace(/\s+/g, '_');

  let config = {
    label: status.replace(/_/g, ' '),
    bg: 'bg-slate-100 text-slate-700 border-slate-300',
    icon: Clock,
  };

  if (
    ['COMPLETED', 'ACQUIRED', 'DISBURSED', 'APPROVED', 'POSSESSION_TAKEN', 'SUCCESS'].includes(norm)
  ) {
    config = {
      label: status.replace(/_/g, ' '),
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      icon: CheckCircle2,
    };
  } else if (
    ['PENDING', 'UNDER_SURVEY', 'UNDER_VERIFICATION', 'UNDER_APPROVAL', 'UNDER_COMPENSATION', 'PARTIALLY_DISBURSED', 'AWARD_PASSED', 'ENTITLEMENT_FORMULATED', 'ON_SCHEDULE'].includes(norm)
  ) {
    config = {
      label: status.replace(/_/g, ' '),
      bg: 'bg-amber-50 text-amber-800 border-amber-300',
      icon: Clock,
    };
  } else if (['DELAYED', 'REJECTED', 'DISPUTED', 'BLOCKED', 'DISPUTED_ESCROW'].includes(norm)) {
    config = {
      label: status.replace(/_/g, ' '),
      bg: 'bg-rose-50 text-rose-800 border-rose-300',
      icon: ShieldAlert,
    };
  } else if (['ACTIVE', 'IDENTIFIED', 'ELIGIBLE', 'DRAFT'].includes(norm)) {
    config = {
      label: status.replace(/_/g, ' '),
      bg: 'bg-blue-50 text-blue-800 border-blue-300',
      icon: FileCheck,
    };
  }

  const IconComponent = config.icon;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border tracking-wide select-none ${config.bg} ${padding} ${className}`}
      id={`status-badge-${norm.toLowerCase()}`}
    >
      <IconComponent className={size === 'sm' ? 'w-3 h-3 shrink-0' : 'w-3.5 h-3.5 shrink-0'} />
      <span className="capitalize">{config.label.toLowerCase()}</span>
    </span>
  );
};
