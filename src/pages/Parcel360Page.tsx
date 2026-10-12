import React, { useEffect, useState } from 'react';
import {
  MapPin,
  Calendar,
  User,
  Coins,
  HeartHandshake,
  FileText,
  Stamp,
  ShieldCheck,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Printer,
  Share2,
  Lock,
  ExternalLink,
  ChevronRight,
  Hash,
  Building,
  Info,
  Download,
} from 'lucide-react';
import { LifecycleStepper } from '../components/common/LifecycleStepper';
import { StatusBadge } from '../components/common/StatusBadge';
import { useApp } from '../context/AppContext';
import { DataService } from '../services/dataService';
import { Parcel, TimelineEvent } from '../types';

interface Parcel360PageProps {
  parcelId?: string;
  onNavigate: (route: string) => void;
}

export const Parcel360Page: React.FC<Parcel360PageProps> = ({
  parcelId = 'PCL-00421',
  onNavigate,
}) => {
  const { locationConfig } = useApp();
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [activeTab, setActiveTab] = useState<
    'all' | 'ownership' | 'compensation' | 'rr' | 'documents' | 'timeline' | 'audit'
  >('all');
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    DataService.getParcelById(parcelId).then((p) => {
      if (p) setParcel(p);
    });
    DataService.getParcelTimeline(parcelId).then(setTimeline);
  }, [parcelId]);

  const handleAction = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  if (!parcel) {
    return (
      <div className="py-16 text-center text-slate-500">
        <MapPin className="w-8 h-8 mx-auto text-slate-400 mb-2 animate-pulse" />
        <p className="text-sm font-semibold">Loading Parcel 360 Record...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left" id="parcel-360-container">
      {/* Action Toast */}
      {notice && (
        <div className="fixed bottom-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 text-xs flex items-center gap-2.5 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Parcel Identity Hero Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                {parcel.parcelCode}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                Survey No. {parcel.surveyNumber}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                {parcel.landType}
              </span>
              <StatusBadge status={parcel.status} size="sm" />
            </div>

            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Parcel 360 View: {parcel.parcelCode}</span>
            </h1>

            <p className="text-xs md:text-sm text-slate-600 mt-1">
              Part of Corridor Project:{' '}
              <button
                type="button"
                onClick={() => onNavigate(`/projects/${parcel.projectId}`)}
                className="font-semibold text-emerald-700 hover:underline"
              >
                {parcel.projectName} ({parcel.projectId})
              </button>
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {parcel.village}, {parcel.subDistrict}, {parcel.district}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Owner: <strong className="text-slate-900">{parcel.ownerName}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Last Audit Sync: {parcel.lastUpdated}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('/gis')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>Locate on GIS Map</span>
            </button>
            <button
              type="button"
              onClick={() => handleAction('Generating cryptographic 360 Parcel Dossier PDF...')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export 360 Dossier</span>
            </button>
          </div>
        </div>

        {/* Parcel 360 Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-100 text-left">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Area</span>
            <strong className="text-base font-black text-slate-900">
              {parcel.areaAcres} <span className="text-xs font-normal text-slate-500">acres</span>
            </strong>
            <span className="text-[10px] text-slate-400 block mt-0.5">({parcel.areaSqm} sqm)</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Khata / RoR Record</span>
            <strong className="text-sm font-black text-slate-900 font-mono">
              {parcel.ownerKhataNo}
            </strong>
            <span className="text-[10px] text-emerald-700 block mt-0.5">e-RoR Verified</span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200">
            <span className="text-[10px] uppercase font-bold text-amber-800 block">Total Award Passed</span>
            <strong className="text-base font-black text-amber-900">
              ₹{(parcel.totalAwardAmount / 100000).toFixed(2)} <span className="text-xs font-normal">Lakh</span>
            </strong>
            <span className="text-[10px] text-amber-700 block mt-0.5">Includes 100% Solatium</span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <span className="text-[10px] uppercase font-bold text-emerald-800 block">Disbursed via PFMS</span>
            <strong className="text-base font-black text-emerald-900">
              ₹{(parcel.compensationPaidAmount / 100000).toFixed(2)} <span className="text-xs font-normal">Lakh</span>
            </strong>
            <span className="text-[10px] text-emerald-700 block mt-0.5">75% Tranche Disbursed</span>
          </div>

          <div className="p-3 rounded-xl bg-cyan-50/70 border border-cyan-200">
            <span className="text-[10px] uppercase font-bold text-cyan-800 block">R&R Entitlement</span>
            <strong className="text-sm font-bold text-cyan-950 block truncate">
              {parcel.rrStatus}
            </strong>
            <span className="text-[10px] text-cyan-700 block mt-0.5">Colony Allotment Active</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 text-white border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block">Possession Status</span>
            <strong className="text-sm font-bold text-emerald-300 block">
              {parcel.possessionDate ? `Delivered on ${parcel.possessionDate}` : 'Under Compensation'}
            </strong>
            <span className="text-[10px] text-slate-400 block mt-0.5">Section 37 Stage</span>
          </div>
        </div>
      </div>

      {/* Acquisition Stage Progress for this parcel */}
      <LifecycleStepper currentStage={parcel.currentStage} />

      {/* Tab Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-2 rounded-xl border transition-all ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          All 360 Sections
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('timeline')}
          className={`px-3.5 py-2 rounded-xl border transition-all flex items-center gap-1.5 ${
            activeTab === 'timeline'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Timeline (5 Events)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ownership')}
          className={`px-3.5 py-2 rounded-xl border transition-all flex items-center gap-1.5 ${
            activeTab === 'ownership'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Ownership & Cadastral</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('compensation')}
          className={`px-3.5 py-2 rounded-xl border transition-all flex items-center gap-1.5 ${
            activeTab === 'compensation'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span>Compensation Award</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('documents')}
          className={`px-3.5 py-2 rounded-xl border transition-all flex items-center gap-1.5 ${
            activeTab === 'documents'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Documents (9)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`px-3.5 py-2 rounded-xl border transition-all flex items-center gap-1.5 ${
            activeTab === 'audit'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Cryptographic Audit</span>
        </button>
      </div>

      {/* Two Column Comprehensive 360 Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Detailed Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* SECTION 1: Ownership & Cadastral Record */}
          {(activeTab === 'all' || activeTab === 'ownership') && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <h3 className="text-sm md:text-base font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-700" />
                  <span>Cadastral & Landowner Profile</span>
                </h3>
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  State Land Registry Synced
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Primary Khatedar / Owner</span>
                    <strong className="text-sm font-bold text-slate-900 block mt-0.5">{parcel.ownerName}</strong>
                    <span className="text-slate-500 mt-1 block">Aadhaar: {parcel.ownerAadhaarMasked}</span>
                    <span className="text-slate-500 block">Mobile: {parcel.ownerMobileMasked}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Khata & Mutation Reference</span>
                    <div className="flex justify-between mt-1 text-slate-700">
                      <span>RoR Khata No:</span>
                      <strong className="font-mono text-slate-900">{parcel.ownerKhataNo}</strong>
                    </div>
                    <div className="flex justify-between text-slate-700 mt-1">
                      <span>Mutation Case:</span>
                      <strong className="font-mono text-slate-900">MUT-2022-89104</strong>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Cadastral Demarcation</span>
                    <div className="flex justify-between mt-1 text-slate-700">
                      <span>Survey / Khasra:</span>
                      <strong className="font-bold text-slate-900">{parcel.surveyNumber}</strong>
                    </div>
                    <div className="flex justify-between text-slate-700 mt-1">
                      <span>Sub-Division:</span>
                      <strong className="font-bold text-slate-900">{parcel.subDivision}</strong>
                    </div>
                    <div className="flex justify-between text-slate-700 mt-1">
                      <span>Classification:</span>
                      <strong className="text-slate-900">{parcel.landType}</strong>
                    </div>
                    <div className="flex justify-between text-slate-700 mt-1">
                      <span>Ground Demarcation:</span>
                      <strong className="text-emerald-700">4 DGPS Boundary Pegs Fixed</strong>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Encumbrance & Search Certificate</span>
                    <p className="text-slate-600 mt-1 leading-relaxed">
                      30-year non-encumbrance certificate verified from Sub-Registrar Office. Nil registered mortgages or active litigation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: Compensation Calculation & PFMS Disbursements */}
          {(activeTab === 'all' || activeTab === 'compensation') && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <h3 className="text-sm md:text-base font-bold text-slate-900 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-600" />
                  <span>Compensation Award Assessment (Section 26-30 LARR)</span>
                </h3>
                <StatusBadge status={parcel.compensationStatus} size="sm" />
              </div>

              <div className="space-y-4 text-xs">
                {/* Mathematical Solatium Breakdown Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                      <tr>
                        <th className="p-2.5">Component</th>
                        <th className="p-2.5">Statutory Basis</th>
                        <th className="p-2.5 text-right">Valuation Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-2.5 font-medium text-slate-900">Base Land Market Value (2.46 acres)</td>
                        <td className="p-2.5 text-slate-500">Circle Rate × Multiplier Factor (1.25)</td>
                        <td className="p-2.5 text-right font-mono font-semibold text-slate-900">₹12,30,000</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium text-slate-900">Solatium (100% statutory grant)</td>
                        <td className="p-2.5 text-slate-500">Section 30(1) Mandatory Entitlement</td>
                        <td className="p-2.5 text-right font-mono font-semibold text-slate-900">₹12,30,000</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium text-slate-900">Standing Timber / Horticultural Crop</td>
                        <td className="p-2.5 text-slate-500">Horticulture Officer Valuation</td>
                        <td className="p-2.5 text-right font-mono font-semibold text-slate-900">Nil</td>
                      </tr>
                      <tr className="bg-emerald-50/50 font-bold">
                        <td className="p-2.5 text-emerald-950">Total Determined Compensation Award</td>
                        <td className="p-2.5 text-emerald-800">Section 37 Gazetted Award</td>
                        <td className="p-2.5 text-right font-mono text-emerald-900 text-sm">₹24,60,000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Disbursement Milestone Voucher */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">PFMS DBT Payment Voucher</span>
                    <span className="font-mono font-bold text-slate-800">Txn: PFMS-TRN-9021948</span>
                    <span className="text-slate-500 text-[11px] block mt-0.5">
                      Direct Credit to State Bank of India A/C ****8912 (IFSC: SBIN0001890)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-700 font-bold text-sm block">₹18,45,000 Disbursed</span>
                    <span className="text-[10px] text-slate-500">Remaining ₹6,15,000 held in Escrow</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: Vertical Timeline (Section 20) */}
          {(activeTab === 'all' || activeTab === 'timeline') && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-100">
                <div>
                  <h3 className="text-sm md:text-base font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-700" />
                    <span>Parcel Milestone & Audit Timeline</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Immutable event sequence with cryptographic hash fingerprints
                  </p>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">5 Event Blocks</span>
              </div>

              {/* Vertical Timeline Tree */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {timeline.map((event, idx) => (
                  <div key={event.id} className="relative group text-xs text-slate-700">
                    {/* Node Dot */}
                    <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-emerald-600 flex items-center justify-center ring-4 ring-white">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                      <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-slate-900 text-xs">{event.action}</span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {event.date} • {event.timestamp}
                        </span>
                      </div>

                      <div className="text-slate-600 mt-1 leading-relaxed">
                        {event.remarks}
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                        <span>
                          Actor: <strong className="text-slate-800">{event.actor}</strong> (
                          {event.actorRole.replace(/_/g, ' ')})
                        </span>
                        {event.tamperEvidentHash && (
                          <span className="font-mono text-[10px] text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                            Hash: {event.tamperEvidentHash}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 4: Digital Cadastral Documents Repository */}
          {(activeTab === 'all' || activeTab === 'documents') && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <h3 className="text-sm md:text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Digital Cadastral Document Vault</span>
                </h3>
                <span className="text-xs text-slate-500">{parcel.documentsCount} Verified Files</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  { name: 'Gazetted Section 37 Award Order', ref: 'AWD-CALA-2026-089.pdf', size: '1.4 MB', date: '08 Sep 2026' },
                  { name: 'DGPS Joint Cadastral Field Book', ref: 'DGPS-FLD-2026-421.pdf', size: '4.8 MB', date: '20 Aug 2026' },
                  { name: 'Certified Record of Rights (RoR)', ref: 'ROR-KHATA-892.pdf', size: '890 KB', date: '02 Sep 2026' },
                  { name: 'Drone Orthomosaic GeoTIFF Clip', ref: 'ORTHO-PCL-00421.tif', size: '18.2 MB', date: '18 Aug 2026' },
                ].map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between gap-2 transition-colors cursor-pointer group"
                    onClick={() => handleAction(`Viewing ${doc.name}...`)}
                  >
                    <div className="min-w-0">
                      <strong className="text-slate-900 group-hover:text-emerald-700 transition-colors block truncate">
                        {doc.name}
                      </strong>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {doc.ref} • {doc.size} • {doc.date}
                      </span>
                    </div>
                    <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Cadastral Mini-Map + R&R Details + Audit Stamp */}
        <div className="space-y-6">
          {/* Cadastral Polygon Mini-Map Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-700" />
                <span>Cadastral Geometry</span>
              </h3>
              <button
                type="button"
                onClick={() => onNavigate('/gis')}
                className="text-xs font-semibold text-emerald-700 hover:underline"
              >
                Expand GIS →
              </button>
            </div>

            <div className="w-full h-48 rounded-xl bg-slate-950 border border-slate-800 relative overflow-hidden flex items-center justify-center">
              <svg viewBox="0 0 200 160" className="w-full h-full">
                <polygon
                  points="40,30 160,20 170,120 50,130"
                  fill="#f59e0b"
                  fillOpacity="0.4"
                  stroke="#f59e0b"
                  strokeWidth="2"
                />
                <circle cx="40" cy="30" r="3" fill="#10b981" />
                <circle cx="160" cy="20" r="3" fill="#10b981" />
                <circle cx="170" cy="120" r="3" fill="#10b981" />
                <circle cx="50" cy="130" r="3" fill="#10b981" />
                <text x="75" y="80" fill="#ffffff" fontSize="10" fontWeight="bold">
                  SY-128/4A
                </text>
              </svg>

              <div className="absolute bottom-2 left-2 bg-slate-900/90 text-white text-[10px] px-2 py-1 rounded border border-slate-700">
                Polygon Vertices: 4 (DGPS Pegs)
              </div>
            </div>

            <div className="mt-3 text-xs text-slate-500 space-y-1">
              <div className="flex justify-between">
                <span>Centroid Coordinates:</span>
                <span className="font-mono text-slate-800">19.892° N, 86.085° E</span>
              </div>
              <div className="flex justify-between">
                <span>Perimeter:</span>
                <span className="text-slate-800">412.8 meters</span>
              </div>
            </div>
          </div>

          {/* R&R Entitlement Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-cyan-600" />
              <span>R&R Family Package</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-cyan-50/60 border border-cyan-200 text-cyan-950">
                <strong className="block mb-1">Entitlement Package Approved</strong>
                <ul className="space-y-1 list-disc list-inside text-cyan-900">
                  <li>Homestead plot allotted: Plot #42, Model Colony II</li>
                  <li>One-time resettlement grant: ₹50,000</li>
                  <li>Subsistence allowance: ₹3,000/mo for 12 months</li>
                </ul>
              </div>

              <div className="flex items-center justify-between text-slate-500 pt-1">
                <span>R&R Officer in charge:</span>
                <strong className="text-slate-800">Anita Behera</strong>
              </div>
            </div>
          </div>

          {/* Tamper-Evident Integrity Stamp */}
          <div className="bg-slate-950 text-slate-300 rounded-2xl border border-slate-800 p-5 shadow-sm text-xs">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                Cryptographic Integrity Verification
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              This parcel record is anchored in the BHUMI 360 tamper-evident audit ledger. All stage mutations, bank disbursements, and area measurements are hashed sequentially.
            </p>
            <div className="mt-3 p-2 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[10px] text-emerald-400 truncate">
              Root Hash: 0x8f2d1e99c4b7201a4e523f...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
