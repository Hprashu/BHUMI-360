import React, { useState } from 'react';
import {
  Globe,
  Database,
  CheckCircle2,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SettingsPageProps {
  onNavigate: (route: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const { locationConfig, updateLocationConfig, currentRole } = useApp();
  const [savedNotice, setSavedNotice] = useState(false);

  const statePresets = [
    {
      state: 'Central / North Standard',
      subDistrictLabel: 'Tehsil',
      villageLabel: 'Revenue Village',
      surveyLabel: 'Khasra No.',
      subDistrictType: 'Tehsil' as const,
    },
    {
      state: 'Southern Standard',
      subDistrictLabel: 'Mandal / Taluk',
      villageLabel: 'Revenue Village',
      surveyLabel: 'Survey / Sub-Division No.',
      subDistrictType: 'Mandal' as const,
    },
    {
      state: 'Western Standard',
      subDistrictLabel: 'Taluka',
      villageLabel: 'Grama / Village',
      surveyLabel: 'Gut Number',
      subDistrictType: 'Taluka' as const,
    },
    {
      state: 'Eastern Standard',
      subDistrictLabel: 'Sub-Division / Circle',
      villageLabel: 'Mauza / Village',
      surveyLabel: 'Dag Number',
      subDistrictType: 'Sub-Division' as const,
    },
  ];

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const integrations = [
    { name: 'State Land Records / RoR Gateway', protocol: 'REST / e-Bhumi XML', status: 'CONNECTED', ping: '24ms' },
    { name: 'National Cadastral GeoServer / WFS', protocol: 'OGC WFS / PostGIS', status: 'CONNECTED', ping: '42ms' },
    { name: 'Public Financial Management System (PFMS)', protocol: 'SFTP / ISO20022 DBT', status: 'CONNECTED', ping: '18ms' },
    { name: 'DigiLocker & e-Sign Provider (C-DAC)', protocol: 'Aadhaar e-Sign API v2', status: 'CONNECTED', ping: '31ms' },
    { name: 'State Registration (SRO) Deed Linker', protocol: 'WebHook / Mutation v3', status: 'STANDBY', ping: '58ms' },
  ];

  return (
    <div className="space-y-6 text-left" id="settings-page">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
              SYSTEM CONFIGURATION
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Multi-State Terminology & Enterprise Integration Gateway
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Platform Settings & Terminology
          </h1>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            Configure jurisdiction terminology mappings and monitor external revenue system connections.
          </p>
        </div>

        {savedNotice && (
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Preferences Saved</span>
          </div>
        )}
      </div>

      {/* State-Agnostic Terminology Engine (Section 24 & 31) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-700" />
            <span>State-Agnostic Cadastral Terminology Presets</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            BHUMI 360 adapts field terminology to match each state's land revenue codes seamlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {statePresets.map((preset, idx) => {
            const isSelected =
              locationConfig.subDistrictLabel === preset.subDistrictLabel &&
              locationConfig.surveyLabel === preset.surveyLabel;

            return (
              <div
                key={idx}
                onClick={() => {
                  updateLocationConfig({
                    subDistrictLabel: preset.subDistrictLabel,
                    villageLabel: preset.villageLabel,
                    surveyLabel: preset.surveyLabel,
                    currentSubDistrictType: preset.subDistrictType,
                  });
                  handleSave();
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer text-xs space-y-2 ${
                  isSelected
                    ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span className="truncate">{preset.state}</span>
                  {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                </div>

                <div className="space-y-1 text-[11px] text-slate-600">
                  <div>
                    <span className="text-slate-400">Sub-District:</span>{' '}
                    <strong>{preset.subDistrictLabel}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Village Unit:</span>{' '}
                    <strong>{preset.villageLabel}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Cadastral Plot:</span>{' '}
                    <strong>{preset.surveyLabel}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Integration Adapter Matrix (Section 31) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-600" />
            <span>Statutory Integration Connectors</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status of external revenue, GIS, PFMS, and digital signing infrastructure.
          </p>
        </div>

        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
          {integrations.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 flex flex-wrap items-center justify-between gap-3 bg-white hover:bg-slate-50 transition-colors"
            >
              <div>
                <strong className="text-slate-900 block">{item.name}</strong>
                <span className="text-[11px] text-slate-400 font-mono">{item.protocol}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] text-slate-400">Latency: {item.ping}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.status === 'CONNECTED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
