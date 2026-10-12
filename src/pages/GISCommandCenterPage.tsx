import React, { useState, useEffect } from 'react';
import {
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  MapPin,
  Search,
  Filter,
  Eye,
  EyeOff,
  Ruler,
  Navigation,
  Info,
  ExternalLink,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  RefreshCw,
  FolderKanban,
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { DEMO_PARCELS, DEMO_PROJECTS } from '../data/mockData';
import { Parcel, Project } from '../types';
import { gisApi } from '../services/apiClient';
import { DataService } from '../services/dataService';

interface GISCommandCenterPageProps {
  onNavigate: (route: string) => void;
}

export const GISCommandCenterPage: React.FC<GISCommandCenterPageProps> = ({ onNavigate }) => {
  const [parcels, setParcels] = useState<Parcel[]>(DEMO_PARCELS);
  const [projects, setProjects] = useState<Project[]>(DEMO_PROJECTS);
  const [selectedParcel, setSelectedParcel] = useState<Parcel>(DEMO_PARCELS[0]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [activeProject, setActiveProject] = useState('PRJ-2026-0042');
  const [searchQuery, setSearchQuery] = useState('');
  const [baseMapType, setBaseMapType] = useState<'cadastral' | 'satellite' | 'topo'>('cadastral');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadGISData = async () => {
      setIsLoading(true);
      try {
        const [parcelsRes, projs] = await Promise.all([
          gisApi.getParcels({ projectId: activeProject }),
          DataService.getProjects(),
        ]);
        if (isMounted) {
          if (parcelsRes.success && parcelsRes.data && parcelsRes.data.length > 0) {
            setParcels(parcelsRes.data);
            setSelectedParcel(parcelsRes.data[0]);
          }
          if (projs && projs.length > 0) {
            setProjects(projs);
          }
        }
      } catch (err) {
        console.warn('GIS data load fallback to memory cache:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadGISData();
    return () => {
      isMounted = false;
    };
  }, [activeProject]);

  // Layer Visibility Toggles
  const [layers, setLayers] = useState({
    parcels: true,
    corridorAlignment: true,
    bufferZone: true,
    surveyNumbers: true,
    disputedHighlights: true,
  });

  const toggleLayer = (layerKey: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const getParcelColor = (status: string) => {
    switch (status) {
      case 'ACQUIRED':
      case 'POSSESSION_TAKEN':
        return { fill: '#10b981', stroke: '#059669', label: 'Acquired / Possession' };
      case 'UNDER_COMPENSATION':
        return { fill: '#f59e0b', stroke: '#d97706', label: 'Under Compensation' };
      case 'DISPUTED':
        return { fill: '#f43f5e', stroke: '#e11d48', label: 'Disputed Title' };
      case 'UNDER_VERIFICATION':
        return { fill: '#3b82f6', stroke: '#2563eb', label: 'Under Verification' };
      default:
        return { fill: '#8b5cf6', stroke: '#7c3aed', label: 'Under Survey' };
    }
  };

  const filteredParcels = parcels.filter(
    (p) =>
      p.parcelCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.surveyNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 text-left" id="gis-command-center">
      {/* Top Header & Geospatial Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              GIS COMMAND CENTER
            </span>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              PostGIS Vector Architecture & OpenStreetMap Compatible
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Geospatial Land Acquisition Workbench
          </h1>
        </div>

        {/* Project Selector & Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
            <FolderKanban className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={activeProject}
              onChange={(e) => setActiveProject(e.target.value)}
              className="bg-transparent border-none text-slate-800 font-semibold focus:outline-none cursor-pointer"
            >
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.code} - {proj.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Jump to parcel/survey..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-500 w-48 sm:w-56"
            />
          </div>

          <button
            type="button"
            onClick={resetView}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            title="Reset Map View"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main GIS Viewport with Floating Controls & Inspector Panel */}
      <div className="relative w-full h-[620px] rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-md flex">
        {/* SVG Geospatial Interactive Canvas */}
        <div className="flex-1 relative w-full h-full cursor-grab active:cursor-grabbing overflow-hidden">
          <svg
            viewBox="0 0 1000 650"
            className="w-full h-full select-none"
            style={{
              transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
              transformOrigin: 'center center',
              transition: 'transform 0.15s ease-out',
            }}
          >
            {/* Background Map Grid or Satellite Simulation */}
            <defs>
              <pattern id="gis-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#1e293b" strokeWidth="0.8" />
                <circle cx="25" cy="25" r="0.8" fill="#334155" />
              </pattern>
            </defs>

            {/* Base tile surface */}
            <rect width="100%" height="100%" fill="#0b132b" />
            <rect width="100%" height="100%" fill="url(#gis-grid)" opacity="0.6" />

            {/* Simulated River / Topography feature */}
            <path
              d="M 0 550 C 300 520, 600 620, 1000 560"
              fill="none"
              stroke="#0369a1"
              strokeWidth="28"
              strokeOpacity="0.4"
            />

            {/* Layer 1: 100m Buffer Zone (Right of Way) */}
            {layers.bufferZone && (
              <path
                d="M 50 280 Q 350 140, 650 290 T 950 270"
                fill="none"
                stroke="#10b981"
                strokeWidth="110"
                strokeOpacity="0.12"
              />
            )}

            {/* Layer 2: Infrastructure Corridor Alignment Centerline */}
            {layers.corridorAlignment && (
              <>
                <path
                  d="M 50 280 Q 350 140, 650 290 T 950 270"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="4"
                  strokeDasharray="8,6"
                />
                {/* Chainage Markers */}
                <circle cx="200" cy="220" r="4" fill="#38bdf8" />
                <text x="185" y="240" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                  Km 42+000
                </text>
                <circle cx="500" cy="220" r="4" fill="#38bdf8" />
                <text x="485" y="240" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                  Km 44+000
                </text>
                <circle cx="800" cy="285" r="4" fill="#38bdf8" />
                <text x="785" y="305" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                  Km 46+000
                </text>
              </>
            )}

            {/* Layer 3: Cadastral Land Parcels Polygons */}
            {layers.parcels && (
              <g id="gis-parcels-layer">
                {/* Parcel PCL-00421 (Under Compensation) */}
                <polygon
                  points="280,180 370,165 385,245 295,255"
                  fill="#f59e0b"
                  fillOpacity={selectedParcel.id === 'PCL-00421' ? 0.8 : 0.45}
                  stroke={selectedParcel.id === 'PCL-00421' ? '#ffffff' : '#f59e0b'}
                  strokeWidth={selectedParcel.id === 'PCL-00421' ? 3 : 1.5}
                  className="cursor-pointer transition-all hover:fill-opacity-80"
                  onClick={() => setSelectedParcel(DEMO_PARCELS[0])}
                >
                  <title>PCL-00421 (Survey 128/4A) - Under Compensation</title>
                </polygon>
                {layers.surveyNumbers && (
                  <text x="310" y="215" fill="#ffffff" fontSize="11" fontWeight="bold">
                    128/4A
                  </text>
                )}

                {/* Parcel PCL-00422 (Acquired) */}
                <polygon
                  points="180,200 270,185 285,260 195,270"
                  fill="#10b981"
                  fillOpacity={selectedParcel.id === 'PCL-00422' ? 0.8 : 0.45}
                  stroke={selectedParcel.id === 'PCL-00422' ? '#ffffff' : '#10b981'}
                  strokeWidth={selectedParcel.id === 'PCL-00422' ? 3 : 1.5}
                  className="cursor-pointer transition-all hover:fill-opacity-80"
                  onClick={() => setSelectedParcel(DEMO_PARCELS[1])}
                >
                  <title>PCL-00422 (Survey 128/4B) - Acquired</title>
                </polygon>
                {layers.surveyNumbers && (
                  <text x="210" y="235" fill="#ffffff" fontSize="11" fontWeight="bold">
                    128/4B
                  </text>
                )}

                {/* Parcel PCL-00423 (Disputed) */}
                <polygon
                  points="390,160 480,150 500,230 400,240"
                  fill="#f43f5e"
                  fillOpacity={selectedParcel.id === 'PCL-00423' ? 0.85 : 0.5}
                  stroke={selectedParcel.id === 'PCL-00423' ? '#ffffff' : '#f43f5e'}
                  strokeWidth={selectedParcel.id === 'PCL-00423' ? 3 : 2}
                  className="cursor-pointer transition-all hover:fill-opacity-80"
                  onClick={() => setSelectedParcel(DEMO_PARCELS[2])}
                >
                  <title>PCL-00423 (Survey 129/1) - Disputed Title</title>
                </polygon>
                {layers.surveyNumbers && (
                  <text x="425" y="200" fill="#ffffff" fontSize="11" fontWeight="bold">
                    129/1 (Disputed)
                  </text>
                )}

                {/* Parcel PCL-00424 (Under Verification) */}
                <polygon
                  points="510,155 590,160 610,240 525,235"
                  fill="#3b82f6"
                  fillOpacity={selectedParcel.id === 'PCL-00424' ? 0.8 : 0.45}
                  stroke={selectedParcel.id === 'PCL-00424' ? '#ffffff' : '#3b82f6'}
                  strokeWidth={selectedParcel.id === 'PCL-00424' ? 3 : 1.5}
                  className="cursor-pointer transition-all hover:fill-opacity-80"
                  onClick={() => setSelectedParcel(DEMO_PARCELS[3])}
                >
                  <title>PCL-00424 (Survey 129/2A) - Under Verification</title>
                </polygon>
                {layers.surveyNumbers && (
                  <text x="540" y="205" fill="#ffffff" fontSize="11" fontWeight="bold">
                    129/2A
                  </text>
                )}

                {/* Parcel PCL-00425 (Under Survey) */}
                <polygon
                  points="620,165 710,175 730,260 635,250"
                  fill="#8b5cf6"
                  fillOpacity={selectedParcel.id === 'PCL-00425' ? 0.8 : 0.45}
                  stroke={selectedParcel.id === 'PCL-00425' ? '#ffffff' : '#8b5cf6'}
                  strokeWidth={selectedParcel.id === 'PCL-00425' ? 3 : 1.5}
                  className="cursor-pointer transition-all hover:fill-opacity-80"
                  onClick={() => setSelectedParcel(DEMO_PARCELS[4])}
                >
                  <title>PCL-00425 (Survey 130/1) - Under Survey</title>
                </polygon>
                {layers.surveyNumbers && (
                  <text x="650" y="215" fill="#ffffff" fontSize="11" fontWeight="bold">
                    130/1
                  </text>
                )}

                {/* Parcel PCL-00426 (Possession Taken) */}
                <polygon
                  points="740,180 840,195 860,285 755,270"
                  fill="#10b981"
                  fillOpacity={selectedParcel.id === 'PCL-00426' ? 0.8 : 0.45}
                  stroke={selectedParcel.id === 'PCL-00426' ? '#ffffff' : '#10b981'}
                  strokeWidth={selectedParcel.id === 'PCL-00426' ? 3 : 1.5}
                  className="cursor-pointer transition-all hover:fill-opacity-80"
                  onClick={() => setSelectedParcel(DEMO_PARCELS[5])}
                >
                  <title>PCL-00426 (Survey 130/3) - Possession Taken</title>
                </polygon>
                {layers.surveyNumbers && (
                  <text x="770" y="240" fill="#ffffff" fontSize="11" fontWeight="bold">
                    130/3 (Govt)
                  </text>
                )}
              </g>
            )}
          </svg>

          {/* Map Overlay: Zoom & Compass Controls */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            <div className="bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700 p-1 flex flex-col gap-1 shadow-lg text-white">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={resetView}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-xs font-mono"
                title="Reset View"
              >
                {Math.round(zoomLevel * 100)}%
              </button>
            </div>
          </div>

          {/* Map Overlay: Layer Manager Drawer Toggle */}
          <div className="absolute top-4 right-4 z-10">
            <div className="bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-700 p-3 shadow-xl text-white text-xs w-60">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-bold uppercase tracking-wider text-[11px] text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  GIS Layer Controls
                </span>
              </div>

              <div className="space-y-2 mt-2.5">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-300">Cadastral Parcels</span>
                  <input
                    type="checkbox"
                    checked={layers.parcels}
                    onChange={() => toggleLayer('parcels')}
                    className="accent-emerald-500 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-300">Project RoW Centerline</span>
                  <input
                    type="checkbox"
                    checked={layers.corridorAlignment}
                    onChange={() => toggleLayer('corridorAlignment')}
                    className="accent-emerald-500 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-300">100m Impact Buffer</span>
                  <input
                    type="checkbox"
                    checked={layers.bufferZone}
                    onChange={() => toggleLayer('bufferZone')}
                    className="accent-emerald-500 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-300">Survey No. Labels</span>
                  <input
                    type="checkbox"
                    checked={layers.surveyNumbers}
                    onChange={() => toggleLayer('surveyNumbers')}
                    className="accent-emerald-500 rounded"
                  />
                </label>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                Base Layer: PostGIS Vector EPSG:4326
              </div>
            </div>
          </div>

          {/* Map Overlay: Status Legend & Coordinates Bottom Strip */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 z-10 pointer-events-none">
            {/* Status Legend */}
            <div className="bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700 p-2.5 shadow-lg text-white text-[11px] flex flex-wrap items-center gap-3.5 pointer-events-auto">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Acquired
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> Under Compensation
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> Under Verification
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Disputed
              </span>
            </div>

            {/* Coordinates & GIS Benchmark */}
            <div className="bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700 px-3 py-2 text-slate-300 text-[11px] font-mono pointer-events-auto flex items-center gap-2">
              <Navigation className="w-3.5 h-3.5 text-emerald-400" />
              <span>19.8924° N, 86.0851° E • WGS84 Datum</span>
            </div>
          </div>
        </div>

        {/* Selected Parcel Inspector Side Drawer */}
        {selectedParcel && (
          <div className="w-80 md:w-96 bg-white border-l border-slate-200 h-full flex flex-col p-5 overflow-y-auto shrink-0 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Selected Parcel Inspector
              </span>
              <StatusBadge status={selectedParcel.status} size="sm" />
            </div>

            <div className="my-4">
              <div className="text-lg font-black text-slate-900">
                {selectedParcel.parcelCode}
              </div>
              <div className="text-xs font-semibold text-emerald-700 mt-0.5">
                Survey No. {selectedParcel.surveyNumber} (Sub-div: {selectedParcel.subDivision})
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {selectedParcel.village}, {selectedParcel.subDistrict}
              </p>
            </div>

            {/* Key attributes */}
            <div className="space-y-2.5 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-400">Landowner:</span>
                <strong className="text-slate-900">{selectedParcel.ownerName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Area:</span>
                <strong className="text-slate-900">{selectedParcel.areaAcres} acres</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Land Type:</span>
                <strong className="text-slate-900">{selectedParcel.landType}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Stage:</span>
                <strong className="text-amber-700 capitalize">{selectedParcel.currentStage.toLowerCase()}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Award Amount:</span>
                <strong className="text-slate-900">₹{(selectedParcel.totalAwardAmount / 100000).toFixed(2)} Lakh</strong>
              </div>
              {selectedParcel.disputeNotes && (
                <div className="pt-2 border-t border-slate-200 text-rose-700 font-medium">
                  {selectedParcel.disputeNotes}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-auto pt-4 space-y-2">
              <button
                type="button"
                onClick={() => onNavigate(`/parcels/${selectedParcel.id}`)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <span>Launch Full Parcel 360</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate(`/projects/${selectedParcel.projectId}`)}
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
              >
                View Corridor Project
              </button>
            </div>
          </div>
        )}
      </div>

      {/* GIS Disclaimer Note (Section 18) */}
      <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <strong>Demonstration GIS Vector Layer Notice:</strong> Geospatial geometries displayed here represent synthetic acquisition boundaries for prototype evaluation and Hackathon assessment. In production deployment, vector boundaries connect directly to state GeoServer / PostGIS cadastral data endpoints via OGC WFS/WMS standards.
        </div>
      </div>
    </div>
  );
};
