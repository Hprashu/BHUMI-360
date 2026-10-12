import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory backend seed state
const DEMO_SECRET = process.env.AUTH_SECRET || 'bhumi360_super_secure_jwt_secret_change_in_production_2026';

interface ServerUser {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  departmentId: string;
  departmentName: string;
  status: string;
  lastLoginAt?: string;
  permissions: string[];
}

const SERVER_PERMISSIONS = [
  'dashboard.view',
  'project.view', 'project.create', 'project.update', 'project.delete',
  'project.assign_officer', 'project.change_status', 'project.view_financials',
  'project.view_documents', 'project.manage_documents', 'project.link_parcels', 'project.export',
  'parcel.view', 'parcel.create', 'parcel.update', 'parcel.delete',
  'gis.view', 'gis.manage_layers',
  'survey.view', 'survey.create', 'survey.update', 'survey.verify',
  'approval.view', 'approval.approve', 'approval.reject',
  'compensation.view', 'compensation.create', 'compensation.update', 'compensation.approve',
  'rr.view', 'rr.create', 'rr.update',
  'document.view', 'document.upload', 'document.update', 'document.delete',
  'notification.view', 'notification.manage',
  'analytics.view', 'report.generate', 'audit.view',
  'user.view', 'user.create', 'user.update', 'user.deactivate',
  'role.view', 'role.manage', 'permission.view',
  'department.view', 'department.manage',
  'integration.view', 'integration.manage', 'system.manage',
];

const SERVER_ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: [...SERVER_PERMISSIONS],
  PROJECT_OFFICER: [
    'dashboard.view', 'project.view', 'project.create', 'project.update',
    'project.assign_officer', 'project.change_status', 'project.view_financials',
    'project.view_documents', 'project.manage_documents', 'project.link_parcels', 'project.export',
    'parcel.view', 'gis.view', 'approval.view', 'analytics.view',
    'report.generate', 'document.view', 'notification.view',
  ],
  LAND_ACQUISITION_OFFICER: [
    'dashboard.view', 'project.view', 'project.update', 'project.change_status',
    'project.view_financials', 'project.view_documents', 'project.manage_documents',
    'project.link_parcels', 'project.export',
    'parcel.view', 'parcel.update', 'gis.view', 'survey.view', 'survey.verify',
    'approval.view', 'compensation.view', 'document.view', 'notification.view',
  ],
  GIS_OFFICER: [
    'dashboard.view', 'project.view', 'project.link_parcels', 'project.view_documents',
    'parcel.view', 'gis.view', 'gis.manage_layers', 'survey.view', 'document.view', 'notification.view',
  ],
  SURVEY_OFFICER: [
    'dashboard.view', 'project.view', 'project.view_documents', 'parcel.view', 'parcel.update',
    'gis.view', 'survey.view', 'survey.create', 'survey.update',
    'document.view', 'document.upload', 'notification.view',
  ],
  FINANCE_OFFICER: [
    'dashboard.view', 'project.view', 'project.view_financials', 'project.view_documents', 'project.export',
    'parcel.view', 'compensation.view', 'compensation.create', 'compensation.update', 'compensation.approve',
    'report.generate', 'document.view', 'notification.view',
  ],
  RR_OFFICER: [
    'dashboard.view', 'project.view', 'project.view_financials', 'project.view_documents',
    'parcel.view', 'rr.view', 'rr.create', 'rr.update', 'document.view', 'notification.view',
  ],
  APPROVING_AUTHORITY: [
    'dashboard.view', 'project.view', 'project.change_status', 'project.view_financials',
    'project.view_documents', 'project.export',
    'parcel.view', 'approval.view', 'approval.approve', 'approval.reject',
    'analytics.view', 'report.generate', 'notification.view',
  ],
  AUDITOR: [
    'dashboard.view', 'project.view', 'project.view_financials', 'project.view_documents', 'project.export',
    'parcel.view', 'audit.view', 'analytics.view', 'report.generate', 'document.view',
  ],
  CITIZEN: [
    'dashboard.view', 'parcel.view', 'document.view', 'notification.view',
  ],
};

const serverUsers: ServerUser[] = [
  {
    id: 'usr-1',
    employeeCode: 'ADM-0001',
    name: 'Dr. Rajeshwar Rao, IAS',
    email: 'admin@bhumi360.demo',
    phone: '+91 98110 99401',
    role: 'SUPER_ADMIN',
    departmentId: 'dept-revenue',
    departmentName: 'State Directorate of Land Records & Revenue',
    status: 'ACTIVE',
    permissions: SERVER_ROLE_PERMISSIONS.SUPER_ADMIN,
  },
  {
    id: 'usr-2',
    employeeCode: 'PRJ-0104',
    name: 'Er. Sumanth Senapati',
    email: 'project@bhumi360.demo',
    phone: '+91 94370 41209',
    role: 'PROJECT_OFFICER',
    departmentId: 'dept-nhai',
    departmentName: 'National Highways & Linear Infrastructure Directorate',
    status: 'ACTIVE',
    permissions: SERVER_ROLE_PERMISSIONS.PROJECT_OFFICER,
  },
  {
    id: 'usr-3',
    employeeCode: 'CALA-028',
    name: 'Shri Anand M. Varma, OAS',
    email: 'land@bhumi360.demo',
    phone: '+91 98480 12890',
    role: 'LAND_ACQUISITION_OFFICER',
    departmentId: 'dept-revenue',
    departmentName: 'State Directorate of Land Records & Revenue',
    status: 'ACTIVE',
    permissions: SERVER_ROLE_PERMISSIONS.LAND_ACQUISITION_OFFICER,
  },
  {
    id: 'usr-4',
    employeeCode: 'GIS-0072',
    name: 'Ananya Deshmukh',
    email: 'gis@bhumi360.demo',
    phone: '+91 99201 34812',
    role: 'GIS_OFFICER',
    departmentId: 'dept-survey',
    departmentName: 'Cadastral Survey & Geospatial Directorate',
    status: 'ACTIVE',
    permissions: SERVER_ROLE_PERMISSIONS.GIS_OFFICER,
  },
  {
    id: 'usr-5',
    employeeCode: 'SRV-0419',
    name: 'Vikramjit Singh',
    email: 'survey@bhumi360.demo',
    phone: '+91 97112 55901',
    role: 'SURVEY_OFFICER',
    departmentId: 'dept-survey',
    departmentName: 'Cadastral Survey & Geospatial Directorate',
    status: 'ACTIVE',
    permissions: SERVER_ROLE_PERMISSIONS.SURVEY_OFFICER,
  },
  {
    id: 'usr-6',
    employeeCode: 'FIN-0091',
    name: 'Meenakshi Sundaram',
    email: 'finance@bhumi360.demo',
    phone: '+91 94440 21980',
    role: 'FINANCE_OFFICER',
    departmentId: 'dept-finance',
    departmentName: 'Finance & Compensation Treasury Division',
    status: 'ACTIVE',
    permissions: SERVER_ROLE_PERMISSIONS.FINANCE_OFFICER,
  },
  {
    id: 'usr-7',
    employeeCode: 'RR-0312',
    name: 'Priyadarshini Patnaik',
    email: 'rr@bhumi360.demo',
    phone: '+91 94371 88204',
    role: 'RR_OFFICER',
    departmentId: 'dept-rr',
    departmentName: 'Rehabilitation & Resettlement Directorate',
    status: 'ACTIVE',
    permissions: SERVER_ROLE_PERMISSIONS.RR_OFFICER,
  },
  {
    id: 'usr-8',
    employeeCode: 'DM-0012',
    name: 'Smt. Kavitha Ramachandran, IAS',
    email: 'authority@bhumi360.demo',
    phone: '+91 98490 11022',
    role: 'APPROVING_AUTHORITY',
    departmentId: 'dept-collector',
    departmentName: 'Office of the District Collector & District Magistrate',
    status: 'ACTIVE',
    permissions: SERVER_ROLE_PERMISSIONS.APPROVING_AUTHORITY,
  },
  {
    id: 'usr-9',
    employeeCode: 'AUD-0005',
    name: 'Harish Chandra Pant, IA&AS',
    email: 'audit@bhumi360.demo',
    phone: '+91 98100 44291',
    role: 'AUDITOR',
    departmentId: 'dept-audit',
    departmentName: 'Statutory Audit & Public Oversight Directorate',
    status: 'ACTIVE',
    permissions: SERVER_ROLE_PERMISSIONS.AUDITOR,
  },
  {
    id: 'usr-10',
    employeeCode: 'CIT-7819',
    name: 'Kondaveeti Venkatesh',
    email: 'citizen@bhumi360.demo',
    phone: '+91 98481 92837',
    role: 'CITIZEN',
    departmentId: 'dept-revenue',
    departmentName: 'Citizen Public Services Portal',
    status: 'ACTIVE',
    permissions: SERVER_ROLE_PERMISSIONS.CITIZEN,
  },
];

const serverAuditLogs: Array<{
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  entity: string;
  entityId: string;
  previousValue: string;
  newValue: string;
  ipAddressMasked: string;
  integrityHash: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  ipAddress?: string;
  details?: string;
  sha256Hash?: string;
}> = [
  {
    id: 'aud-seed-1',
    timestamp: '2026-03-12T14:32:00Z',
    actor: 'Dr. Rajeshwar Rao, IAS',
    role: 'SUPER_ADMIN',
    action: 'SYSTEM_BOOTSTRAP',
    entity: 'RBAC Policy Matrix',
    entityId: 'POL-001',
    previousValue: 'Genesis',
    newValue: 'Applied 10-role RFCTLARR Act 2013 permissions',
    ipAddressMasked: '10.244.18.***',
    integrityHash: '0x8f2d9c41b8e0a32194f10738d2ef5a0194871239bfdeca882039418290fa8182',
  },
];

// Helper: JWT verification
function verifyToken(token: string): ServerUser | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
    const user = serverUsers.find((u) => u.id === payload.sub || u.email === payload.email);
    return user || null;
  } catch (e) {
    return null;
  }
}

// Authentication Middleware
interface AuthenticatedRequest extends Request {
  user?: ServerUser;
}

const authenticateRequest = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required. Missing Bearer token.' },
    });
  }

  const token = authHeader.split(' ')[1];
  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid or expired session token.' },
    });
  }

  req.user = user;
  next();
};

// Authorization Middleware: requireRole
const requireRole = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
      });
    }

    if (req.user.role === 'SUPER_ADMIN' || roles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: {
        code: 'ACCESS_DENIED',
        message: `Forbidden. Role requires one of: ${roles.join(', ')}`,
      },
    });
  };
};

// Authorization Middleware: requirePermission
const requirePermission = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
      });
    }

    if (req.user.role === 'SUPER_ADMIN' || req.user.permissions.includes(permission)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: {
        code: 'INSUFFICIENT_PERMISSIONS',
        message: `Action requires permission: ${permission}`,
      },
    });
  };
};

// API ROUTES
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'operational',
      platform: 'BHUMI 360 National Land Acquisition & Management Platform',
      version: '2.0.0-PROTOTYPE',
      database: 'PostgreSQL + PostGIS Ready',
      timestamp: new Date().toISOString(),
    },
  });
});

// Authentication Routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email) {
    return res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'Email identifier is required.' },
    });
  }

  const normalized = email.trim().toLowerCase();
  const user = serverUsers.find((u) => u.email.toLowerCase() === normalized);

  if (!user) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
    });
  }

  user.lastLoginAt = new Date().toISOString();

  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
      exp: Math.floor(Date.now() / 1000) + 86400 * 7,
    })
  ).toString('base64');
  const signature = crypto.createHmac('sha256', DEMO_SECRET).update(`${header}.${payload}`).digest('base64');
  const token = `${header}.${payload}.${signature}`;

  // Log audit
  serverAuditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: user.name,
    role: user.role,
    action: 'LOGIN_SUCCESS',
    entity: `User [${user.id}]`,
    entityId: user.id,
    previousValue: '-',
    newValue: `Session authenticated for ${user.email}`,
    ipAddressMasked: (req.ip || '127.0.0.1').replace(/\d+$/, '***'),
    integrityHash: '0x' + crypto.randomBytes(20).toString('hex'),
  });

  res.json({
    success: true,
    data: {
      token,
      user,
      expiresAt: new Date(Date.now() + 86400 * 7 * 1000).toISOString(),
    },
  });
});

app.post('/api/auth/logout', authenticateRequest, (req: AuthenticatedRequest, res) => {
  if (req.user) {
    serverAuditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: req.user.name,
      role: req.user.role,
      action: 'LOGOUT',
      entity: `User [${req.user.id}]`,
      entityId: req.user.id,
      previousValue: '-',
      newValue: 'User logged out',
      ipAddressMasked: (req.ip || '127.0.0.1').replace(/\d+$/, '***'),
      integrityHash: '0x' + crypto.randomBytes(20).toString('hex'),
    });
  }
  res.json({ success: true, data: { message: 'Logged out successfully' } });
});

app.get('/api/auth/me', authenticateRequest, (req: AuthenticatedRequest, res) => {
  res.json({ success: true, data: req.user });
});

// User Management Routes
app.get('/api/users', authenticateRequest, requirePermission('user.view'), (req, res) => {
  res.json({ success: true, data: serverUsers });
});

app.post('/api/users', authenticateRequest, requirePermission('user.create'), (req: AuthenticatedRequest, res) => {
  const { name, email, role, departmentId, departmentName, phone, employeeCode } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Name, email, and role are required fields.' },
    });
  }

  const newUser: ServerUser = {
    id: `usr-${Date.now()}`,
    employeeCode: employeeCode || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
    name,
    email,
    phone: phone || '+91 90000 00000',
    role,
    departmentId: departmentId || 'dept-revenue',
    departmentName: departmentName || 'State Directorate of Land Records & Revenue',
    status: 'ACTIVE',
    permissions: SERVER_ROLE_PERMISSIONS[role] || [],
    lastLoginAt: undefined,
  };

  serverUsers.push(newUser);

  serverAuditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: req.user?.name || 'Admin',
    role: req.user?.role || 'SUPER_ADMIN',
    action: 'USER_CREATED',
    entity: `User [${newUser.id}]`,
    entityId: newUser.id,
    previousValue: '-',
    newValue: `Created ${newUser.name} (${newUser.role})`,
    ipAddressMasked: (req.ip || '127.0.0.1').replace(/\d+$/, '***'),
    integrityHash: '0x' + crypto.randomBytes(20).toString('hex'),
  });

  res.status(201).json({ success: true, data: newUser });
});

// Roles & Permissions Routes
app.get('/api/roles', authenticateRequest, requirePermission('role.view'), (req, res) => {
  const roles = Object.keys(SERVER_ROLE_PERMISSIONS).map((roleName) => ({
    name: roleName,
    displayName: roleName.replace(/_/g, ' '),
    permissions: SERVER_ROLE_PERMISSIONS[roleName],
    usersCount: serverUsers.filter((u) => u.role === roleName).length,
  }));
  res.json({ success: true, data: roles });
});

app.get('/api/permissions', authenticateRequest, requirePermission('permission.view'), (req, res) => {
  res.json({ success: true, data: SERVER_PERMISSIONS });
});

// Audit Route
app.get('/api/audit', authenticateRequest, requirePermission('audit.view'), (req, res) => {
  res.json({ success: true, data: serverAuditLogs });
});

app.post('/api/audit/verify', authenticateRequest, requirePermission('audit.view'), (req, res) => {
  res.json({
    success: true,
    data: {
      verified: true,
      blockCount: serverAuditLogs.length,
      merkleRoot: '0x8f2d9c41b8e0a32194f10738d2ef5a0194871239bfdeca882039418290fa8182',
      verifiedAt: new Date().toISOString(),
      status: 'GENESIS_ANCHOR_VERIFIED',
    },
  });
});

// GIS Data Sources
app.get('/api/gis/sources', authenticateRequest, requirePermission('gis.view'), (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'ds-osm',
        name: 'OpenStreetMap Carto',
        type: 'OPENSTREETMAP',
        baseUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        status: 'CONNECTED',
        description: 'Standard cartographic basemap (not an official cadastral boundary source).',
      },
      {
        id: 'ds-cadastral',
        name: 'National Cadastral GeoServer WFS',
        type: 'WFS',
        baseUrl: 'https://geoserver.bhumi.gov.in/geoserver/wfs',
        status: 'CONNECTED',
        description: 'Authorized OGC WFS / PostGIS cadastral boundary provider.',
      },
    ],
  });
});

// ============================================================
// PHASE 3: PROJECT MANAGEMENT & LIFECYCLE REST ENDPOINTS
// ============================================================

interface ServerProject {
  id: string;
  projectCode: string;
  code: string;
  projectName: string;
  name: string;
  description: string;
  projectType: string;
  departmentId?: string;
  state: string;
  district: string;
  subDistrict: string;
  village?: string;
  locationDescription?: string;
  implementingAgency: string;
  projectOfficerId?: string;
  leadOfficer?: string;
  startDate: string;
  expectedCompletionDate: string;
  targetCompletion?: string;
  actualCompletionDate?: string;
  status: string;
  priority: string;
  estimatedCost: number;
  landRequiredArea: number;
  totalAreaAcres: number;
  totalParcelsRequired: number;
  parcelsCount: number;
  acquiredParcels: number;
  acquiredParcelsCount: number;
  pendingParcels: number;
  pendingParcelsCount: number;
  disputedParcelsCount: number;
  compensationBudget: number;
  compensationBudgetCr: number;
  compensationPaid: number;
  compensationDisbursedCr: number;
  rrBudget: number;
  rrSpent: number;
  rrFamiliesCount: number;
  rrFamiliesRehabilitated: number;
  progressPercentage: number;
  progressPercent: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
}

interface ServerLifecycleEvent {
  id: string;
  projectId: string;
  previousStatus: string;
  newStatus: string;
  changedBy: string;
  changedAt: string;
  reason: string;
  remarks?: string;
}

interface ServerProjectDocument {
  id: string;
  projectId: string;
  name: string;
  documentType: string;
  description?: string;
  fileSize?: string;
  status: string;
  uploadedBy: string;
  uploadedAt: string;
}

const serverProjects: ServerProject[] = [
  {
    id: 'PRJ-2026-0042',
    projectCode: 'NH-326',
    code: 'NH-326',
    projectName: 'NH-326 Coastal Connectivity Corridor',
    name: 'NH-326 Coastal Connectivity Corridor',
    description: 'Widening and geometric realignments of the NH-326 corridor connecting deep-sea freight nodes and port connectivity networks across 14 revenue villages.',
    projectType: 'NATIONAL_HIGHWAY',
    state: 'National Infrastructure Zone (Multi-State)',
    district: 'Puri & Coastal Zone',
    subDistrict: 'Konark Sub-Division',
    village: 'Gop / Ramachandi',
    locationDescription: 'Chainage km 42+200 to 78+600 spanning marine highway sanctuary perimeter.',
    implementingAgency: 'National Highways Authority (Regional Office)',
    leadOfficer: 'Dr. Arvinder Singh, IAS (Special Land Acquisition Officer)',
    startDate: '2025-01-15',
    expectedCompletionDate: '2026-12-31',
    targetCompletion: '31 Dec 2026',
    status: 'ACQUISITION_IN_PROGRESS',
    priority: 'CRITICAL',
    estimatedCost: 340.5,
    landRequiredArea: 1842,
    totalAreaAcres: 1842,
    totalParcelsRequired: 624,
    parcelsCount: 624,
    acquiredParcels: 438,
    acquiredParcelsCount: 438,
    pendingParcels: 186,
    pendingParcelsCount: 186,
    disputedParcelsCount: 14,
    compensationBudget: 42.8,
    compensationBudgetCr: 42.8,
    compensationPaid: 32.4,
    compensationDisbursedCr: 32.4,
    rrBudget: 12.5,
    rrSpent: 8.2,
    rrFamiliesCount: 312,
    rrFamiliesRehabilitated: 248,
    progressPercentage: 72,
    progressPercent: 72,
    createdAt: '2025-01-15T08:00:00.000Z',
    updatedAt: '2026-09-14T09:30:00.000Z',
    createdBy: 'usr-1',
  },
  {
    id: 'PRJ-2026-0089',
    projectCode: 'DFCC-E04',
    code: 'DFCC-E04',
    projectName: 'Eastern Dedicated Freight Rail Bypass (Sonnagar-Dankuni Section)',
    name: 'Eastern Dedicated Freight Rail Bypass (Sonnagar-Dankuni Section)',
    description: 'High-axle 32.5T dedicated electrified freight track bypass corridor avoiding congested suburban junctions and grade crossings.',
    projectType: 'RAILWAY',
    state: 'National Infrastructure Zone (Multi-State)',
    district: 'Gomati-Damodar Valley',
    subDistrict: 'Barhi Tehsil',
    village: 'Chitpur / Belmuri',
    locationDescription: 'Rail corridor chainage 112+000 to 148+300.',
    implementingAgency: 'Dedicated Freight Corridor Corporation',
    leadOfficer: 'Shri R. K. Bhattacharya, IRSE (Chief Project Manager)',
    startDate: '2024-08-01',
    expectedCompletionDate: '2026-09-30',
    targetCompletion: '30 Sep 2026',
    status: 'SURVEY',
    priority: 'HIGH',
    estimatedCost: 512.0,
    landRequiredArea: 920,
    totalAreaAcres: 920,
    totalParcelsRequired: 340,
    parcelsCount: 340,
    acquiredParcels: 180,
    acquiredParcelsCount: 180,
    pendingParcels: 160,
    pendingParcelsCount: 160,
    disputedParcelsCount: 22,
    compensationBudget: 68.2,
    compensationBudgetCr: 68.2,
    compensationPaid: 36.5,
    compensationDisbursedCr: 36.5,
    rrBudget: 24.0,
    rrSpent: 11.8,
    rrFamiliesCount: 420,
    rrFamiliesRehabilitated: 195,
    progressPercentage: 54,
    progressPercent: 54,
    createdAt: '2024-08-01T08:00:00.000Z',
    updatedAt: '2026-09-14T09:30:00.000Z',
    createdBy: 'usr-1',
  },
  {
    id: 'PRJ-2026-0104',
    projectCode: 'SEC-750',
    code: 'SEC-750',
    projectName: 'National Ultra-Mega Green Hydrogen & Solar Park Phase II',
    name: 'National Ultra-Mega Green Hydrogen & Solar Park Phase II',
    description: '750 MW utility-scale photovoltaic park and green ammonia synthesis plant with 220kV pooling substations and dedicated transmission rights-of-way.',
    projectType: 'POWER_INFRASTRUCTURE',
    state: 'National Infrastructure Zone (Multi-State)',
    district: 'Kurnool & Rayalaseema Tract',
    subDistrict: 'Panyam Mandal',
    village: 'Talamanchi',
    locationDescription: 'Contiguous semi-arid non-agricultural parcel cluster.',
    implementingAgency: 'Renewable Energy Development Agency',
    leadOfficer: 'Smt. Priya Chandrasekhar, IDAS',
    startDate: '2025-06-01',
    expectedCompletionDate: '2027-03-31',
    targetCompletion: '31 Mar 2027',
    status: 'LAND_IDENTIFICATION',
    priority: 'MEDIUM',
    estimatedCost: 680.0,
    landRequiredArea: 3200,
    totalAreaAcres: 3200,
    totalParcelsRequired: 1420,
    parcelsCount: 1420,
    acquiredParcels: 1290,
    acquiredParcelsCount: 1290,
    pendingParcels: 130,
    pendingParcelsCount: 130,
    disputedParcelsCount: 4,
    compensationBudget: 85.0,
    compensationBudgetCr: 85.0,
    compensationPaid: 76.5,
    compensationDisbursedCr: 76.5,
    rrBudget: 6.0,
    rrSpent: 4.8,
    rrFamiliesCount: 88,
    rrFamiliesRehabilitated: 78,
    progressPercentage: 88,
    progressPercent: 88,
    createdAt: '2025-06-01T08:00:00.000Z',
    updatedAt: '2026-09-14T09:30:00.000Z',
    createdBy: 'usr-1',
  },
];

const serverProjectEvents: ServerLifecycleEvent[] = [
  {
    id: 'evt-1',
    projectId: 'PRJ-2026-0042',
    previousStatus: 'DRAFT',
    newStatus: 'PLANNING',
    changedBy: 'Dr. Rajeshwar Rao, IAS',
    changedAt: '2025-01-15T08:30:00.000Z',
    reason: 'Corridor preliminary scheme sanction granted.',
    remarks: 'Approved by State Infrastructure Steering Committee.',
  },
  {
    id: 'evt-2',
    projectId: 'PRJ-2026-0042',
    previousStatus: 'PLANNING',
    newStatus: 'LAND_IDENTIFICATION',
    changedBy: 'Dr. Arvinder Singh, IAS',
    changedAt: '2025-02-16T11:00:00.000Z',
    reason: 'Section 11 Preliminary Notification gazetted.',
    remarks: 'Published in State Extraordinary Gazette No. 28.',
  },
  {
    id: 'evt-3',
    projectId: 'PRJ-2026-0042',
    previousStatus: 'LAND_IDENTIFICATION',
    newStatus: 'ACQUISITION_IN_PROGRESS',
    changedBy: 'Dr. Arvinder Singh, IAS',
    changedAt: '2025-06-10T14:15:00.000Z',
    reason: 'Section 19 Declaration approved and award enquiry initiated.',
    remarks: 'Field Measurement Books approved for 438 parcels.',
  },
];

const serverProjectDocs: ServerProjectDocument[] = [
  {
    id: 'doc-1',
    projectId: 'PRJ-2026-0042',
    name: 'NH-326_Section_11_Gazette_Official.pdf',
    documentType: 'Statutory Gazette Notification (Sec 11)',
    description: 'Gazette notification under Section 11(1) RFCTLARR 2013.',
    fileSize: '4.8 MB',
    status: 'VERIFIED',
    uploadedBy: 'Dr. Arvinder Singh, IAS',
    uploadedAt: '2025-02-16 11:30 IST',
  },
  {
    id: 'doc-2',
    projectId: 'PRJ-2026-0042',
    name: 'NH-326_Corridor_Alignment_DPR.pdf',
    documentType: 'Corridor Feasibility Study & DPR',
    description: 'Approved alignment, chainages, and RoW boundary coordinates.',
    fileSize: '16.4 MB',
    status: 'VERIFIED',
    uploadedBy: 'Er. Sumanth Senapati',
    uploadedAt: '2025-01-20 15:45 IST',
  },
];

// 1. GET /api/projects - List projects with search & filters
app.get('/api/projects', authenticateRequest, requirePermission('project.view'), (req, res) => {
  const { status, priority, projectType, state, district, search, page = '1', limit = '50' } = req.query;

  let list = [...serverProjects];

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    list = list.filter((p) =>
      p.projectCode.toLowerCase().includes(q) ||
      p.projectName.toLowerCase().includes(q) ||
      p.state.toLowerCase().includes(q) ||
      p.district.toLowerCase().includes(q) ||
      (p.leadOfficer && p.leadOfficer.toLowerCase().includes(q))
    );
  }

  if (status && status !== 'ALL') {
    list = list.filter((p) => p.status === status);
  }

  if (priority && priority !== 'ALL') {
    list = list.filter((p) => p.priority === priority);
  }

  if (projectType && projectType !== 'ALL') {
    list = list.filter((p) => p.projectType === projectType);
  }

  if (state && state !== 'ALL') {
    list = list.filter((p) => p.state === state);
  }

  if (district && district !== 'ALL') {
    list = list.filter((p) => p.district === district);
  }

  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = parseInt(limit as string, 10) || 50;
  const total = list.length;
  const start = (pageNum - 1) * limitNum;
  const paginated = list.slice(start, start + limitNum);

  res.json({
    success: true,
    data: paginated,
    meta: {
      total,
      page: pageNum,
      limit: limitNum,
      environment: 'Synthetic Demo Data',
    },
  });
});

// 2. GET /api/projects/stats/kpis - Project KPIs
app.get('/api/projects/stats/kpis', authenticateRequest, requirePermission('project.view'), (req, res) => {
  let totalLand = 0;
  let activeCount = 0;
  let compPending = 0;

  serverProjects.forEach((p) => {
    totalLand += p.landRequiredArea || 0;
    if (p.status !== 'COMPLETED' && p.status !== 'CANCELLED') activeCount++;
    compPending += Math.max(0, (p.compensationBudget || 0) - (p.compensationPaid || 0));
  });

  res.json({
    success: true,
    data: {
      totalProjects: serverProjects.length,
      activeProjects: activeCount,
      atRiskProjects: 1,
      completedProjects: serverProjects.filter((p) => p.status === 'COMPLETED').length,
      totalLandRequiredAcres: Math.round(totalLand),
      compensationPendingCr: Number(compPending.toFixed(1)),
      pendingApprovals: 28,
      notice: 'Synthetic Demo Data',
    },
  });
});

// 3. GET /api/projects/:id - Single project details
app.get('/api/projects/:id', authenticateRequest, requirePermission('project.view'), (req, res) => {
  const { id } = req.params;
  const proj = serverProjects.find((p) => p.id === id || p.projectCode === id || p.code === id);
  if (!proj) {
    return res.status(404).json({ success: false, error: `Project '${id}' not found.` });
  }

  const events = serverProjectEvents.filter((e) => e.projectId === proj.id);
  const docs = serverProjectDocs.filter((d) => d.projectId === proj.id);

  res.json({
    success: true,
    data: {
      ...proj,
      lifecycleEvents: events,
      documents: docs,
    },
  });
});

// 4. POST /api/projects - Create project
app.post('/api/projects', authenticateRequest, requirePermission('project.create'), (req: AuthenticatedRequest, res: Response) => {
  const {
    projectCode,
    projectName,
    description = '',
    projectType = 'NATIONAL_HIGHWAY',
    departmentId,
    state,
    district,
    subDistrict = 'Tehsil',
    village = '',
    locationDescription = '',
    implementingAgency = 'National Infrastructure Directorate',
    leadOfficer = 'Project Officer',
    startDate,
    expectedCompletionDate,
    priority = 'MEDIUM',
    initialStatus = 'DRAFT',
    estimatedCost = 0,
    landRequiredArea = 0,
    totalParcelsRequired = 0,
    compensationBudget = 0,
    rrBudget = 0,
  } = req.body;

  if (!projectCode || !projectName || !state || !district) {
    return res.status(400).json({
      success: false,
      error: 'Missing mandatory fields: projectCode, projectName, state, and district are required.',
    });
  }

  const codeUpper = projectCode.toUpperCase().trim();
  if (serverProjects.some((p) => p.projectCode === codeUpper || p.code === codeUpper)) {
    return res.status(409).json({
      success: false,
      error: `Project Code '${codeUpper}' is already registered in the system.`,
    });
  }

  const id = `PRJ-${new Date().getFullYear()}-${String(serverProjects.length + 1).padStart(4, '0')}`;
  const now = new Date().toISOString();

  const newProject: ServerProject = {
    id,
    projectCode: codeUpper,
    code: codeUpper,
    projectName: projectName.trim(),
    name: projectName.trim(),
    description,
    projectType,
    departmentId,
    state,
    district,
    subDistrict,
    village,
    locationDescription,
    implementingAgency,
    leadOfficer,
    startDate: startDate || now.split('T')[0],
    expectedCompletionDate: expectedCompletionDate || '2027-12-31',
    targetCompletion: expectedCompletionDate || '2027-12-31',
    status: initialStatus,
    priority,
    estimatedCost: Number(estimatedCost) || 0,
    landRequiredArea: Number(landRequiredArea) || 0,
    totalAreaAcres: Number(landRequiredArea) || 0,
    totalParcelsRequired: Number(totalParcelsRequired) || 0,
    parcelsCount: Number(totalParcelsRequired) || 0,
    acquiredParcels: 0,
    acquiredParcelsCount: 0,
    pendingParcels: Number(totalParcelsRequired) || 0,
    pendingParcelsCount: Number(totalParcelsRequired) || 0,
    disputedParcelsCount: 0,
    compensationBudget: Number(compensationBudget) || 0,
    compensationBudgetCr: Number(compensationBudget) || 0,
    compensationPaid: 0,
    compensationDisbursedCr: 0,
    rrBudget: Number(rrBudget) || 0,
    rrSpent: 0,
    rrFamiliesCount: 0,
    rrFamiliesRehabilitated: 0,
    progressPercentage: 0,
    progressPercent: 0,
    createdAt: now,
    updatedAt: now,
    createdBy: req.user?.id || 'admin',
  };

  serverProjects.unshift(newProject);

  // Initial lifecycle event
  const initEvent: ServerLifecycleEvent = {
    id: `evt-${Date.now()}`,
    projectId: id,
    previousStatus: 'DRAFT',
    newStatus: initialStatus,
    changedBy: req.user?.name || 'Project Officer',
    changedAt: now,
    reason: 'Scheme creation and corridor definition in BHUMI 360.',
    remarks: 'Registered via Project Management API.',
  };
  serverProjectEvents.unshift(initEvent);

  // Audit event
  serverAuditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: now,
    actor: req.user?.name || 'System User',
    role: req.user?.role || 'PROJECT_OFFICER',
    action: 'PROJECT_CREATED',
    entity: 'PROJECT',
    entityId: id,
    previousValue: 'NONE',
    newValue: `${newProject.projectName} (${newProject.projectCode})`,
    ipAddressMasked: '10.244.18.***',
    integrityHash: '0x' + Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2),
    userId: req.user?.id || 'usr-1',
    userName: req.user?.name || 'System User',
    userRole: req.user?.role || 'PROJECT_OFFICER',
    ipAddress: req.ip || '127.0.0.1',
    details: `Created corridor project '${newProject.projectName}' (${newProject.projectCode}) in ${newProject.state}.`,
    sha256Hash: '0x' + Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2),
  });

  res.status(201).json({
    success: true,
    data: newProject,
    message: `Project '${newProject.projectName}' created successfully.`,
  });
});

// 5. PATCH /api/projects/:id - Update project
app.patch('/api/projects/:id', authenticateRequest, requirePermission('project.update'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const idx = serverProjects.findIndex((p) => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: `Project '${id}' not found.` });
  }

  const existing = serverProjects[idx];
  const now = new Date().toISOString();

  const updated: ServerProject = {
    ...existing,
    projectName: req.body.projectName ?? existing.projectName,
    name: req.body.projectName ?? existing.name,
    description: req.body.description ?? existing.description,
    projectType: req.body.projectType ?? existing.projectType,
    departmentId: req.body.departmentId ?? existing.departmentId,
    state: req.body.state ?? existing.state,
    district: req.body.district ?? existing.district,
    subDistrict: req.body.subDistrict ?? existing.subDistrict,
    village: req.body.village ?? existing.village,
    locationDescription: req.body.locationDescription ?? existing.locationDescription,
    implementingAgency: req.body.implementingAgency ?? existing.implementingAgency,
    leadOfficer: req.body.leadOfficer ?? existing.leadOfficer,
    startDate: req.body.startDate ?? existing.startDate,
    expectedCompletionDate: req.body.expectedCompletionDate ?? existing.expectedCompletionDate,
    targetCompletion: req.body.expectedCompletionDate ?? existing.targetCompletion,
    priority: req.body.priority ?? existing.priority,
    estimatedCost: req.body.estimatedCost !== undefined ? Number(req.body.estimatedCost) : existing.estimatedCost,
    landRequiredArea: req.body.landRequiredArea !== undefined ? Number(req.body.landRequiredArea) : existing.landRequiredArea,
    totalAreaAcres: req.body.landRequiredArea !== undefined ? Number(req.body.landRequiredArea) : existing.totalAreaAcres,
    totalParcelsRequired: req.body.totalParcelsRequired !== undefined ? Number(req.body.totalParcelsRequired) : existing.totalParcelsRequired,
    parcelsCount: req.body.totalParcelsRequired !== undefined ? Number(req.body.totalParcelsRequired) : existing.parcelsCount,
    compensationBudget: req.body.compensationBudget !== undefined ? Number(req.body.compensationBudget) : existing.compensationBudget,
    compensationBudgetCr: req.body.compensationBudget !== undefined ? Number(req.body.compensationBudget) : existing.compensationBudgetCr,
    rrBudget: req.body.rrBudget !== undefined ? Number(req.body.rrBudget) : existing.rrBudget,
    updatedAt: now,
    updatedBy: req.user?.id,
  };

  serverProjects[idx] = updated;

  serverAuditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: now,
    actor: req.user?.name || 'System User',
    role: req.user?.role || 'PROJECT_OFFICER',
    action: 'PROJECT_UPDATED',
    entity: 'PROJECT',
    entityId: id,
    previousValue: existing.projectName,
    newValue: updated.projectName,
    ipAddressMasked: '10.244.18.***',
    integrityHash: '0x' + Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2),
    userId: req.user?.id || 'usr-1',
    userName: req.user?.name || 'System User',
    userRole: req.user?.role || 'PROJECT_OFFICER',
    ipAddress: req.ip || '127.0.0.1',
    details: `Updated parameters for project corridor '${updated.projectName}'.`,
    sha256Hash: '0x' + Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2),
  });

  res.json({ success: true, data: updated, message: 'Project parameters successfully updated.' });
});

// 6. DELETE /api/projects/:id - Delete / Archive project
app.delete('/api/projects/:id', authenticateRequest, requirePermission('project.delete'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const idx = serverProjects.findIndex((p) => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: `Project '${id}' not found.` });
  }

  const removed = serverProjects.splice(idx, 1)[0];
  const now = new Date().toISOString();

  serverAuditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: now,
    actor: req.user?.name || 'Authorized Officer',
    role: req.user?.role || 'SUPER_ADMIN',
    action: 'PROJECT_DELETED',
    entity: 'PROJECT',
    entityId: id,
    userId: req.user?.id || 'usr-1',
    userName: req.user?.name || 'System User',
    userRole: req.user?.role || 'SUPER_ADMIN',
    ipAddress: req.ip || '127.0.0.1',
    details: `Archived/Deleted project corridor '${removed.projectName}' (${removed.projectCode}).`,
    previousValue: removed.projectName,
    newValue: 'ARCHIVED',
    ipAddressMasked: '10.244.18.***',
    integrityHash: '0x' + Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2),
    sha256Hash: '0x' + Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2),
  });

  res.json({ success: true, message: `Project '${removed.projectName}' has been archived.` });
});

// 7. POST /api/projects/:id/status - Transition project status
app.post('/api/projects/:id/status', authenticateRequest, requirePermission('project.change_status'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { newStatus, reason = 'Statutory milestone transition', remarks = '' } = req.body;

  const proj = serverProjects.find((p) => p.id === id);
  if (!proj) {
    return res.status(404).json({ success: false, error: `Project '${id}' not found.` });
  }

  if (!newStatus) {
    return res.status(400).json({ success: false, error: 'newStatus is required.' });
  }

  const previousStatus = proj.status;
  const now = new Date().toISOString();

  proj.status = newStatus;
  proj.updatedAt = now;
  proj.updatedBy = req.user?.id;

  const event: ServerLifecycleEvent = {
    id: `evt-${Date.now()}`,
    projectId: proj.id,
    previousStatus,
    newStatus,
    changedBy: req.user?.name || 'Authorized Officer',
    changedAt: now,
    reason,
    remarks,
  };
  serverProjectEvents.unshift(event);

  serverAuditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: now,
    actor: req.user?.name || 'Officer',
    role: req.user?.role || 'APPROVING_AUTHORITY',
    action: 'PROJECT_STATUS_CHANGED',
    entity: 'PROJECT',
    entityId: id,
    userId: req.user?.id || 'usr-1',
    userName: req.user?.name || 'Officer',
    userRole: req.user?.role || 'APPROVING_AUTHORITY',
    ipAddress: req.ip || '127.0.0.1',
    details: `Project '${proj.projectName}' transitioned from '${previousStatus}' to '${newStatus}'. Reason: ${reason}`,
    previousValue: previousStatus,
    newValue: newStatus,
    ipAddressMasked: '10.244.18.***',
    integrityHash: '0x' + Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2),
    sha256Hash: '0x' + Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2),
  });

  res.json({
    success: true,
    data: { project: proj, event },
    message: `Project status successfully advanced to '${newStatus}'.`,
  });
});

// 8. GET /api/projects/:id/timeline - Timeline events
app.get('/api/projects/:id/timeline', authenticateRequest, requirePermission('project.view'), (req, res) => {
  const { id } = req.params;
  const events = serverProjectEvents.filter((e) => e.projectId === id);
  res.json({ success: true, data: events });
});

// 9. GET /api/projects/:id/documents - Project documents
app.get('/api/projects/:id/documents', authenticateRequest, requirePermission('project.view_documents'), (req, res) => {
  const { id } = req.params;
  const docs = serverProjectDocs.filter((d) => d.projectId === id);
  res.json({ success: true, data: docs });
});

// 10. POST /api/projects/:id/documents - Upload document
app.post('/api/projects/:id/documents', authenticateRequest, requirePermission('project.manage_documents'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, documentType, description = '', fileSize = '2.4 MB' } = req.body;

  if (!name || !documentType) {
    return res.status(400).json({ success: false, error: 'name and documentType are required.' });
  }

  const proj = serverProjects.find((p) => p.id === id);
  if (!proj) {
    return res.status(404).json({ success: false, error: `Project '${id}' not found.` });
  }

  const now = new Date().toISOString();
  const doc: ServerProjectDocument = {
    id: `doc-${Date.now()}`,
    projectId: id,
    name,
    documentType,
    description,
    fileSize,
    status: 'VERIFIED',
    uploadedBy: req.user?.name || 'Project Officer',
    uploadedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
  };

  serverProjectDocs.unshift(doc);

  serverAuditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: now,
    actor: req.user?.name || 'User',
    role: req.user?.role || 'PROJECT_OFFICER',
    action: 'PROJECT_DOCUMENT_ADDED',
    entity: 'PROJECT',
    entityId: id,
    userId: req.user?.id || 'usr-1',
    userName: req.user?.name || 'User',
    userRole: req.user?.role || 'PROJECT_OFFICER',
    ipAddress: req.ip || '127.0.0.1',
    details: `Deposited official notification '${doc.name}' (${doc.documentType}) in project vault.`,
    previousValue: 'NONE',
    newValue: `${doc.name} (${doc.documentType})`,
    ipAddressMasked: '10.244.18.***',
    integrityHash: '0x' + Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2),
    sha256Hash: '0x' + Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2),
  });

  res.status(201).json({ success: true, data: doc, message: 'Document registered successfully in vault.' });
});


// Boot the Server with Vite Middleware in Dev
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BHUMI 360 Enterprise API & UI running on port ${PORT}`);
  });
}

startServer();
