import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Coins,
  Compass,
  FileText,
  HeartHandshake,
  Stamp,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NotificationItem } from '../types';

interface NotificationsPageProps {
  onNavigate: (route: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigate }) => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useApp();
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const categories: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'ALL', label: 'All Alerts', icon: Bell },
    { id: 'approval', label: 'Approvals', icon: Stamp },
    { id: 'compensation', label: 'Compensation', icon: Coins },
    { id: 'survey', label: 'Survey & DGPS', icon: Compass },
    { id: 'rr', label: 'R&R Families', icon: HeartHandshake },
    { id: 'document', label: 'Documents', icon: FileText },
    { id: 'system', label: 'System', icon: AlertTriangle },
  ];

  const filtered = notifications.filter(
    (n) => activeCategory === 'ALL' || n.category === activeCategory
  );

  const getPriorityBadge = (priority: NotificationItem['priority']) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
            URGENT
          </span>
        );
      case 'high':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
            HIGH
          </span>
        );
      case 'normal':
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
            ROUTINE
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-left" id="notifications-page">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
              ACTION CENTER
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Statutory Deadlines, SLA Escalations & Payment Milestones
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Notifications & Escalations
          </h1>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            Operational alerts routed to your role desk across all active corridors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={markAllNotificationsAsRead}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mark All Read</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex items-center gap-1 overflow-x-auto">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Notification List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            No active alerts or notifications in this category.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                markNotificationAsRead(item.id);
                if (item.linkRoute) onNavigate(item.linkRoute);
              }}
              className={`p-4 md:p-5 transition-colors cursor-pointer flex flex-wrap items-start justify-between gap-4 group ${
                !item.isRead ? 'bg-slate-50/70 hover:bg-slate-100/70' : 'bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start gap-3.5 max-w-2xl">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                    item.priority === 'urgent'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-bold text-xs md:text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {item.title}
                    </span>
                    {getPriorityBadge(item.priority)}
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.message}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-400">
                    <span>{item.timestamp}</span>
                    <span>•</span>
                    <span className="uppercase font-mono">{item.category}</span>
                    {item.entityId && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-slate-600 font-semibold">
                          {item.entityId}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {item.linkRoute && (
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 group-hover:translate-x-0.5 transition-transform self-center">
                  <span>Open Item</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
