import React, { useEffect, useState } from 'react';
import {
  MapPin,
  Search,
  Filter,
  Compass,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Hash,
  Download,
  Plus,
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { DataService } from '../services/dataService';
import { Parcel } from '../types';

interface ParcelsListPageProps {
  onNavigate: (route: string) => void;
}

export const ParcelsListPage: React.FC<ParcelsListPageProps> = ({ onNavigate }) => {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    DataService.getParcels().then(setParcels);
  }, []);

  const filtered = parcels.filter((p) => {
    const matchesSearch =
      p.parcelCode.toLowerCase().includes(search.toLowerCase()) ||
      p.surveyNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      p.village.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-left" id="parcels-registry-page">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              CADASTRAL PARCEL REGISTRY
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Survey & Mutation Integrated Records
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Land Parcel 360 Repository
          </h1>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            Browse, search and inspect individual land parcels, survey numbers and ownership titles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('/gis')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
          >
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>Open in GIS Map</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by survey no (e.g. 128/4A), parcel ID, landowner, village..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto text-xs">
          {[
            { id: 'ALL', label: 'All Parcels' },
            { id: 'ACQUIRED', label: 'Acquired' },
            { id: 'UNDER_COMPENSATION', label: 'In Compensation' },
            { id: 'UNDER_VERIFICATION', label: 'Under Verification' },
            { id: 'DISPUTED', label: 'Disputed' },
            { id: 'UNDER_SURVEY', label: 'Under Survey' },
          ].map((flt) => (
            <button
              key={flt.id}
              type="button"
              onClick={() => setStatusFilter(flt.id)}
              className={`px-3 py-1.5 rounded-xl border font-semibold whitespace-nowrap transition-colors ${
                statusFilter === flt.id
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {flt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Parcels Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Parcel Code</th>
                <th className="p-3.5">Survey No.</th>
                <th className="p-3.5">Landowner & Khata</th>
                <th className="p-3.5">Village / Sub-District</th>
                <th className="p-3.5">Area (Acres)</th>
                <th className="p-3.5">Acquisition Status</th>
                <th className="p-3.5">Award / Compensation</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((parcel) => (
                <tr
                  key={parcel.id}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  onClick={() => onNavigate(`/parcels/${parcel.id}`)}
                >
                  <td className="p-3.5 font-mono font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {parcel.parcelCode}
                  </td>
                  <td className="p-3.5 font-semibold text-slate-800">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono">
                      {parcel.surveyNumber}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <strong className="text-slate-900 block">{parcel.ownerName}</strong>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Khata: {parcel.ownerKhataNo}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-600">
                    <div>{parcel.village}</div>
                    <div className="text-[10px] text-slate-400">{parcel.subDistrict}</div>
                  </td>
                  <td className="p-3.5 font-semibold text-slate-900">
                    {parcel.areaAcres} ac
                    <span className="block text-[10px] text-slate-400 font-normal">
                      ({parcel.areaSqm.toLocaleString()} m²)
                    </span>
                  </td>
                  <td className="p-3.5">
                    <StatusBadge status={parcel.status} size="sm" />
                  </td>
                  <td className="p-3.5">
                    <span className="font-bold text-slate-900 block">
                      ₹{(parcel.totalAwardAmount / 100000).toFixed(2)} Lakh
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {parcel.compensationStatus}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate(`/parcels/${parcel.id}`);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>Parcel 360</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
