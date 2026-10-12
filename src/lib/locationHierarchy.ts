// ============================================================
// BHUMI 360 - STATE-AGNOSTIC LOCATION HIERARCHY ENGINE
// Supports dynamic administrative levels and state-specific terminology
// All demo data is strictly marked as: "Synthetic Demo Data"
// ============================================================

export interface StateTerminology {
  stateName: string;
  stateCode: string;
  districtLabel: string;
  subDistrictLabel: string; // e.g., Mandal, Taluka, Tehsil
  subDistrictType: string;
  villageLabel: string;     // e.g., Revenue Village, Mauza, Gram Panchayat
  parcelPlotLabel: string;  // e.g., Survey No., Khasra No., Gat No., Dag No.
  officerTitle: string;     // e.g., Tahsildar, Mamlatdar, MRO
  stateLevel?: string;
  districtLevel?: string;
  subDistrictLevel?: string;
  revenueRecordName?: string;
  landParcelTerm?: string;
}

export const STATE_TERMINOLOGY_PRESETS: Record<string, StateTerminology> = {
  NATIONAL: {
    stateName: 'National Infrastructure Zone (Multi-State)',
    stateCode: 'IN-NAT',
    districtLabel: 'District',
    subDistrictLabel: 'Sub-District / Tehsil',
    subDistrictType: 'Tehsil',
    villageLabel: 'Revenue Village',
    parcelPlotLabel: 'Survey / Khasra No.',
    officerTitle: 'Sub-Divisional Magistrate / CALA',
  },
  TELANGANA: {
    stateName: 'Telangana',
    stateCode: 'TS',
    districtLabel: 'District',
    subDistrictLabel: 'Mandal',
    subDistrictType: 'Mandal',
    villageLabel: 'Revenue Village',
    parcelPlotLabel: 'Survey No.',
    officerTitle: 'Mandal Revenue Officer (MRO) / CALA',
  },
  ANDHRA_PRADESH: {
    stateName: 'Andhra Pradesh',
    stateCode: 'AP',
    districtLabel: 'District',
    subDistrictLabel: 'Mandal',
    subDistrictType: 'Mandal',
    villageLabel: 'Revenue Village',
    parcelPlotLabel: 'Survey No.',
    officerTitle: 'Tahsildar / CALA',
  },
  MAHARASHTRA: {
    stateName: 'Maharashtra',
    stateCode: 'MH',
    districtLabel: 'District (Jilha)',
    subDistrictLabel: 'Taluka',
    subDistrictType: 'Taluka',
    villageLabel: 'Revenue Village (Gaon)',
    parcelPlotLabel: 'Gat / Survey No.',
    officerTitle: 'Tahsildar / SLAO',
  },
  UTTAR_PRADESH: {
    stateName: 'Uttar Pradesh',
    stateCode: 'UP',
    districtLabel: 'District (Zila)',
    subDistrictLabel: 'Tehsil',
    subDistrictType: 'Tehsil',
    villageLabel: 'Revenue Village / Mauza',
    parcelPlotLabel: 'Khasra No.',
    officerTitle: 'Sub-Divisional Magistrate (SDM) / SLAO',
  },
  KARNATAKA: {
    stateName: 'Karnataka',
    stateCode: 'KA',
    districtLabel: 'District',
    subDistrictLabel: 'Taluk',
    subDistrictType: 'Taluk',
    villageLabel: 'Revenue Village',
    parcelPlotLabel: 'Survey No. / Hissa',
    officerTitle: 'Tahsildar / SLAO',
  },
  ODISHA: {
    stateName: 'Odisha',
    stateCode: 'OD',
    districtLabel: 'District',
    subDistrictLabel: 'Tahasil',
    subDistrictType: 'Tahasil',
    villageLabel: 'Revenue Village',
    parcelPlotLabel: 'Khata / Plot No.',
    officerTitle: 'Tahasildar / LAO',
  },
  WEST_BENGAL: {
    stateName: 'West Bengal',
    stateCode: 'WB',
    districtLabel: 'District',
    subDistrictLabel: 'Sub-Division / Block',
    subDistrictType: 'Block',
    villageLabel: 'Mouza',
    parcelPlotLabel: 'Dag / Khatian No.',
    officerTitle: 'Block Land & Land Reforms Officer (BL&LRO)',
  },
  GUJARAT: {
    stateName: 'Gujarat',
    stateCode: 'GJ',
    districtLabel: 'District',
    subDistrictLabel: 'Taluka',
    subDistrictType: 'Taluka',
    villageLabel: 'Revenue Village',
    parcelPlotLabel: 'Survey / Block No.',
    officerTitle: 'Mamlatdar / SLAO',
  },
  TAMIL_NADU: {
    stateName: 'Tamil Nadu',
    stateCode: 'TN',
    districtLabel: 'District',
    subDistrictLabel: 'Taluk',
    subDistrictType: 'Taluk',
    villageLabel: 'Revenue Village',
    parcelPlotLabel: 'Survey Number (SF No.)',
    officerTitle: 'Tahsildar / DRO (LA)',
  },
};

/**
 * Resolves the appropriate location terminology based on state name or code
 */
export function getLocationTerminology(stateNameOrCode?: string): StateTerminology {
  let base: StateTerminology = STATE_TERMINOLOGY_PRESETS.NATIONAL;
  if (stateNameOrCode) {
    const normalized = stateNameOrCode.toUpperCase().replace(/\s+/g, '_');
    let matched: StateTerminology | undefined;
    for (const [key, val] of Object.entries(STATE_TERMINOLOGY_PRESETS)) {
      if (
        key === normalized ||
        val.stateCode.toUpperCase() === normalized ||
        val.stateName.toUpperCase().includes(stateNameOrCode.toUpperCase())
      ) {
        matched = val;
        break;
      }
    }
    base = matched || {
      stateName: stateNameOrCode,
      stateCode: 'GEN',
      districtLabel: 'District',
      subDistrictLabel: 'Sub-District / Tehsil',
      subDistrictType: 'Tehsil',
      villageLabel: 'Revenue Village',
      parcelPlotLabel: 'Survey / Khasra No.',
      officerTitle: 'Competent Authority (CALA / SLAO)',
    };
  }

  return {
    ...base,
    stateLevel: 'State',
    districtLevel: base.districtLabel,
    subDistrictLevel: base.subDistrictLabel,
    revenueRecordName: 'Record of Rights (RoR)',
    landParcelTerm: base.parcelPlotLabel,
  };
}

export const getStateTerminology = getLocationTerminology;

export function getAllStateNames(): string[] {
  return [
    'Odisha',
    'Telangana',
    'Andhra Pradesh',
    'Maharashtra',
    'Uttar Pradesh',
    'Karnataka',
    'Gujarat',
    'West Bengal',
    'Tamil Nadu',
    'Madhya Pradesh',
    'Rajasthan',
    'Haryana',
    'Punjab',
    'Bihar',
    'Assam',
  ];
}

export const SYNTHETIC_DEMO_DATA_NOTICE = 'Synthetic Demo Data (Simulation Environment for Demonstration Purposes Only)';
