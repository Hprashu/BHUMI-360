# BHUMI 360 — Enterprise Database Architecture Specification
**Document Version:** 2.0 (Phase 2 Master Architecture)  
**Target Platform:** PostgreSQL 15+ with PostGIS 3.3 Spatial Engine  
**Compliance Standard:** RFCTLARR Act 2013, Section 33 Cryptographic Audit Trail, OGC WFS 2.0  

---

## 1. Architectural Philosophy

BHUMI 360’s database architecture is built upon three non-negotiable principles:
1. **State-Agnostic Cadastral Normalization:** Rather than hardcoding state-specific revenue structures (such as Telangana's Mandal/VRO or Maharashtra's Taluka/Talathi), the schema decouples administrative terminology into a multi-tier location hierarchy (`states` → `districts` → `subdistricts` → `villages`).
2. **Strict Append-Only Cryptographic Audit:** Under Section 33 statutory rules, mutations to land parcels, award declarations, and compensation releases generate append-only logs (`audit_logs`) anchored by SHA-256 integrity hashes.
3. **True Spatial PostGIS Integration:** Land parcels are indexed using PostGIS `GEOMETRY(MultiPolygon, 4326)` with R-Tree GiST indexes, ensuring real geospatial intersections with linear Right-of-Way (RoW) corridor polygons.

---

## 2. Core Entity Relational Diagram (ERD Summary)

```
[states] ──< [districts] ──< [subdistricts] ──< [villages]
                                                    │
[departments] ──< [users]                          │
     │               │                              │
     │               ├──< [notifications]           │
     │               ├──< [audit_logs]              │
     │               └──< [surveys]                 │
     │                                              │
[roles] ──< [role_permissions] >── [permissions]    │
     │                                              │
     └── [users.role_id]                            │
                                                    │
[projects] ───────────────┬─────────────────────────┤
     │                    ▼                         ▼
     └─────────────< [land_parcels] (geom PostGIS) ─┘
                            │
                            ▼
                  [acquisition_cases]
                            │
        ┌───────────────────┼────────────────────┬─────────────────┐
        ▼                   ▼                    ▼                 ▼
   [surveys]           [approvals]        [compensations]      [rr_cases]
   (DGPS Hash)         (DSC Token)          (PFMS DBT)         (Families)
```

---

## 3. Detailed Entity Dictionary

### A. Access Control & Identity (RBAC)

#### `roles`
Defines the 10 statutory role designations within the land acquisition apparatus.
- `id` (VARCHAR, PK): Unique role key (`role_super_admin`, `role_project_officer`, etc.)
- `name` (ENUM, UNIQUE): `SUPER_ADMIN`, `PROJECT_OFFICER`, `LAND_ACQUISITION_OFFICER`, `GIS_OFFICER`, `SURVEY_OFFICER`, `FINANCE_OFFICER`, `RR_OFFICER`, `APPROVING_AUTHORITY`, `AUDITOR`, `CITIZEN`
- `display_name` (VARCHAR): Human-readable designation
- `description` (TEXT): Statutory remit and responsibilities
- `status` (VARCHAR): `ACTIVE` | `INACTIVE`

#### `permissions`
Granular `MODULE.ACTION` capabilities governing API endpoints and UI elements.
- `id` (VARCHAR, PK): `p_dash_01`, `p_prj_01`, `p_cmp_04`, etc.
- `key` (VARCHAR, UNIQUE): e.g. `project.create`, `approval.approve`, `compensation.approve`
- `module` (VARCHAR): e.g. `project`, `parcel`, `gis`, `survey`, `approval`, `compensation`, `audit`
- `action` (VARCHAR): e.g. `view`, `create`, `update`, `delete`, `approve`, `manage`

#### `role_permissions`
Cross-reference mapping defining the Role-Permission matrix.
- `role_id` (FK -> `roles.id`)
- `permission_id` (FK -> `permissions.id`)
- PK: `(role_id, permission_id)`

#### `departments`
Regional acquisition cells, revenue secretariats, and executing project directorates.
- `id` (UUID, PK)
- `code` (VARCHAR, UNIQUE): e.g. `CALA-GJM-01`, `NHAI-PIU-BBSR`
- `name` (VARCHAR): e.g. `Competent Authority for Land Acquisition - Ganjam`
- `state` / `district` (VARCHAR): Multi-state geographic jurisdiction
- `status` (VARCHAR): `ACTIVE` | `INACTIVE`

#### `users`
Authenticated personnel and citizen accounts.
- `id` (UUID, PK)
- `employee_code` (VARCHAR, UNIQUE): Institutional identity code
- `name` (VARCHAR), `email` (VARCHAR, UNIQUE), `phone` (VARCHAR)
- `password_hash` (VARCHAR): Argon2id / bcrypt salted cryptographic hash
- `role_id` (FK -> `roles.name`)
- `department_id` (FK -> `departments.id`)
- `status` (ENUM): `ACTIVE` | `INACTIVE` | `SUSPENDED` | `PENDING`

---

### B. Geographic & Cadastral Hierarchy

- `states`: Root administrative unit storing localized terminology overrides (`regional_subdistrict_term`, `regional_plot_term`, etc.).
- `districts`: District Revenue Administration led by District Collector / Magistrate.
- `subdistricts`: Sub-division unit (Tehsil / Mandal / Taluka / Circle).
- `villages`: Base revenue cadastre (Census Village / Mauza / Grama) with unique LGD Census Code.

---

### C. Infrastructure Corridor & Cadastral Parcels

#### `projects`
Linear corridor schemes (Highways, Expressways, Dedicated Freight Corridors).
- `id` (UUID, PK)
- `project_code` (VARCHAR, UNIQUE): e.g. `PRJ-2026-0042`
- `name` (VARCHAR), `description` (TEXT), `project_type` (ENUM)
- `state_id`, `district_id` (FKs)
- `status` (ENUM): `DRAFT`, `PLANNING`, `ACTIVE`, `ON_HOLD`, `COMPLETED`, `CANCELLED`
- `total_area_acres`, `total_budget_inr` (NUMERIC)

#### `land_parcels`
Individual cadastral land plots earmarked for Right-of-Way acquisition.
- `id` (UUID, PK)
- `parcel_code` (VARCHAR, UNIQUE): e.g. `PCL-00421`
- `survey_number` (VARCHAR): e.g. `128/4A`
- `area` (NUMERIC), `area_unit` (VARCHAR: `ACRES`, `HECTARES`)
- `land_type` (VARCHAR): `AGRICULTURAL`, `COMMERCIAL`, `RESIDENTIAL`, etc.
- `acquisition_status` (ENUM): `IDENTIFIED` -> `ACQUIRED`
- `project_id` (FK -> `projects.id`)
- `village_id` (FK -> `villages.id`)
- `geom` (GEOMETRY: `MultiPolygon, 4326`): PostGIS spatial boundary with GiST index

---

### D. Statutory Acquisition Lifecycle Cases

#### `acquisition_cases`
Lifecycle orchestrator binding parcels to statutory stages.
- `id` (UUID, PK)
- `case_number` (VARCHAR, UNIQUE): e.g. `ACQ-2026-00421`
- `project_id`, `parcel_id` (FKs)
- `current_stage` (ENUM): `IDENTIFICATION` to `COMPLETION`
- `assigned_to` (FK -> `users.id`)

#### `surveys`
Field DGPS and Electronic Total Station pegging records.
- `parcel_id` (FK -> `land_parcels.id`)
- `survey_number`, `survey_date`, `survey_officer_id`
- `dgps_point_count` (INT)
- `boundary_verification_hash` (SHA-256 string)

#### `approvals`
Statutory notifications (Section 11 preliminary, Section 19 declaration, Section 23 award).
- `case_id` (FK -> `acquisition_cases.id`)
- `approval_type`, `status` (`PENDING`, `APPROVED`, `REJECTED`)
- `requested_by`, `approved_by` (FKs -> `users.id`)
- `dsc_token_fingerprint` (Cryptographic hardware token identifier)

#### `compensations`
Valuation schedule and disbursement tracking.
- `case_id` (FK -> `acquisition_cases.id`)
- `eligible_amount`, `approved_amount`, `disbursed_amount`
- `pfms_transaction_reference` (Direct Benefit Transfer voucher)

#### `rr_cases`
Rehabilitation and Resettlement entitlements under Schedule II.
- `case_id` (FK -> `acquisition_cases.id`)
- `eligible_family_count` (INT)
- `benefit_status` (`HOUSING_ALLOTTED`, `GRANTS_DISBURSED`)

---

### E. Security, System & Spatial Integrity

#### `audit_logs`
Cryptographic tamper-evident append-only journal.
- `actor_user_id` (FK -> `users.id`)
- `action` (VARCHAR): e.g. `COMPENSATION_AWARD_SANCTIONED`
- `entity_type`, `entity_id`
- `previous_value`, `new_value`
- `ip_address_masked`, `integrity_hash` (SHA-256 Merkle link)

#### `gis_data_sources` & `gis_layers`
Authorized external OGC WFS / GeoServer service registrations preventing arbitrary client geometry fabrication.
