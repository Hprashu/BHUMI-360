import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Coins,
  MapPin,
  HeartHandshake,
  User,
  ShieldCheck,
  Download,
  HelpCircle,
  Send,
  Building,
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { DEMO_PARCELS } from '../data/mockData';
import { Parcel } from '../types';

interface CitizenPortalPageProps {
  onNavigate: (route: string) => void;
}

export const CitizenPortalPage: React.FC<CitizenPortalPageProps> = ({ onNavigate }) => {
  const [searchSurvey, setSearchSurvey] = useState('128/4A');
  const [activeParcel, setActiveParcel] = useState<Parcel | null>(DEMO_PARCELS[0]);
  const [grievanceText, setGrievanceText] = useState('');
  const [grievanceSubmitted, setGrievanceSubmitted] = useState(false);

  const handleSearch = () => {
    const found = DEMO_PARCELS.find(
      (p) =>
        p.surveyNumber.toLowerCase().includes(searchSurvey.toLowerCase()) ||
        p.parcelCode.toLowerCase().includes(searchSurvey.toLowerCase())
    );
    if (found) setActiveParcel(found);
  };

  const handleGrievanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grievanceText.trim()) return;
    setGrievanceSubmitted(true);
    setTimeout(() => {
      setGrievanceText('');
    }, 4000);
  };

  return (
    <div className="space-y-6 text-left" id="citizen-portal-page">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-md">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              CITIZEN & LANDOWNER SELF-SERVICE DESK
            </span>
            <span className="text-xs text-slate-300">Direct PFMS & Entitlement Tracking</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Track Land Acquisition & Award Status
          </h1>
          <p className="text-xs md:text-sm text-slate-300 mt-2 leading-relaxed">
            Verify survey measurements, track Direct Benefit Transfer (DBT) bank compensation payments, and check Rehabilitation & Resettlement (R&R) entitlements transparently.
          </p>
        </div>

        {/* Search Box */}
        <div className="mt-6 flex flex-col sm:flex-row gap-2 max-w-2xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchSurvey}
              onChange={(e) => setSearchSurvey(e.target.value)}
              placeholder="Enter Survey Number (e.g. 128/4A) or Parcel ID (e.g. PCL-00421)..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-slate-400 text-xs md:text-sm focus:outline-none focus:border-emerald-400"
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shrink-0 shadow-sm"
          >
            Track Status
          </button>
        </div>
      </div>

      {/* Tracked Parcel Card */}
      {activeParcel && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                  {activeParcel.parcelCode}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Survey No. {activeParcel.surveyNumber}
                </span>
                <StatusBadge status={activeParcel.status} size="sm" />
              </div>
              <h2 className="text-lg md:text-xl font-black text-slate-900">
                Landowner Record: {activeParcel.ownerName}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeParcel.village}, {activeParcel.subDistrict} • Corridor: {activeParcel.projectName}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate(`/parcels/${activeParcel.id}`)}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Open Full 360 Record →
            </button>
          </div>

          {/* Citizen Milestone Progress */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Survey & Measurement</span>
              </div>
              <strong className="text-sm font-extrabold text-emerald-950 block">
                {activeParcel.areaAcres} Acres Measured
              </strong>
              <p className="text-emerald-800 text-[11px]">
                Ground pegging completed with 4 DGPS reference benchmarks.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                <Coins className="w-4 h-4" />
                <span>Award & Solatium</span>
              </div>
              <strong className="text-sm font-extrabold text-amber-950 block">
                ₹{(activeParcel.totalAwardAmount / 100000).toFixed(2)} Lakh Approved
              </strong>
              <p className="text-amber-800 text-[11px]">
                Direct PFMS transfer of ₹{(activeParcel.compensationPaidAmount / 100000).toFixed(2)} L initiated.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-cyan-50/70 border border-cyan-200 space-y-1">
              <div className="flex items-center gap-1.5 text-cyan-800 font-bold">
                <HeartHandshake className="w-4 h-4" />
                <span>Rehabilitation Entitlement</span>
              </div>
              <strong className="text-sm font-extrabold text-cyan-950 block">
                {activeParcel.rrStatus}
              </strong>
              <p className="text-cyan-800 text-[11px]">
                Homestead plot allotment certificate available at District R&R cell.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Citizen Grievance & Objection Submission Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-emerald-700" />
          <span>Lodge Inquiry or Section 15 Objection</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Submissions are registered directly into the CALA administrative hearing diary with automatic SMS acknowledgement.
        </p>

        {grievanceSubmitted ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1">
            <strong className="block font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Objection Registered Successfully!
            </strong>
            <p>
              Your token reference is <span className="font-mono font-bold">OBJ-2026-9042</span>. Hearing date notice will be dispatched via registered post and SMS.
            </p>
          </div>
        ) : (
          <form onSubmit={handleGrievanceSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Objection / Question Details
              </label>
              <textarea
                rows={3}
                value={grievanceText}
                onChange={(e) => setGrievanceText(e.target.value)}
                placeholder="Enter details regarding title clarification, boundary objection, or bank account update..."
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">
                Governed under Right to Fair Compensation & Transparency Act
              </span>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit to CALA Desk</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
