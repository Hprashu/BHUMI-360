# BHUMI 360 Database Architecture (PostgreSQL + PostGIS)

## Overview
BHUMI 360 utilizes a resilient, enterprise-grade relational schema backed by **PostgreSQL 15+** with the **PostGIS** geospatial extension enabled. It implements end-to-end statutory compliance with the **Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement (RFCTLARR) Act, 2013**, and the National Highways Act, 1956 (Section 3A-3J).

---

## 1. Core Schema Entities

```
+------------------+         +------------------+         +----------------------+
|      roles       | <-----> | role_permissions | <-----> |     permissions      |
+------------------+         +------------------+         +----------------------+
        ^
        |
        v
+------------------+         +------------------+         +----------------------+
|      users       | <-----> |   departments    |         | administrative_units |
+------------------+         +------------------+         +----------------------+
        ^                                                            ^
        |                                                            |
        v                                                            v
+------------------+         +------------------+         +----------------------+
|     projects     | ------> |   land_parcels   | <-----> |  acquisition_cases   |
+------------------+         +------------------+         +----------------------+
                                                                     |
                                           +-------------------------+-----------------------+
                                           |                         |                       |
                                           v                         v                       v
                                    +--------------+          +--------------+        +--------------+
                                    |   surveys    |          |  approvals   |        | compensation |
                                    +--------------+          +--------------+        +--------------+
```

---

## 2. Table Specifications

### 2.1 Role-Based Access Control (RBAC)
- `roles`: Master list of the 10 statutory user roles (`SUPER_ADMIN`, `PROJECT_OFFICER`, `LAND_ACQUISITION_OFFICER`, `GIS_OFFICER`, `SURVEY_OFFICER`, `FINANCE_OFFICER`, `RR_OFFICER`, `APPROVING_AUTHORITY`, `AUDITOR`, `CITIZEN`).
- `permissions`: Atomic permissions formatted as `MODULE.ACTION` (e.g., `project.view`, `parcel.update`, `compensation.approve`, `audit.view`).
- `role_permissions`: Junction table establishing the default statutory entitlement matrix.
- `departments`: Directorates across state and central tiers with jurisdiction mapping.
- `users`: Officers and platform operators with encrypted credentials, department bindings, and active session telemetry.

### 2.2 Spatial & Cadastral Modeling
- `projects`: Linear corridor alignments stored as `GEOMETRY(MultiLineString, 4326)`, along with dynamically generated Right-of-Way (RoW) buffer zones stored as `GEOMETRY(MultiPolygon, 4326)`.
- `land_parcels`: Cadastral plots stored as `GEOMETRY(Polygon, 4326)` containing survey numbers, khata details, and area demarcations.
- `administrative_units`: Hierarchical jurisdiction records supporting state-specific nomenclature (Tehsil vs Mandal vs Taluka).

### 2.3 Workflow Lifecycle & Audit
- `acquisition_cases`: Master workflow tracking statutory stages from Section 11 preliminary notification through Section 38 possession.
- `surveys`: DGPS ground-truthing records, Field Measurement Books (FMB), and coordinate arrays.
- `approvals`: Cryptographically signed statutory declarations with digital signature hashes.
- `compensation_awards`: Detailed computation of Section 26-30 market assessments, 100% solatium, and 12% additional interest with PFMS DBT vouchers.
- `rr_cases`: Resettlement dossiers for Project-Affected Families (PAFs).
- `audit_logs`: Append-only cryptographic ledger chaining mutations with SHA-256 integrity hashes.
- `gis_data_sources` & `gis_layers`: OGC WMS/WFS map sources and PostGIS vector overlay configs.

---

## 3. Key PostGIS Vector Queries

### 3.1 Spatial Intersection: Parcels within Corridor RoW Buffer
```sql
-- Identify all revenue parcels intersected by a 100m corridor buffer
SELECT 
    p.parcel_code,
    p.survey_number,
    p.owner_name,
    p.area_acres,
    ST_Area(ST_Intersection(p.geometry::geography, prj.buffer_geometry::geography)) / 4046.86 AS impacted_acres
FROM land_parcels p
JOIN projects prj ON prj.id = 'PRJ-2026-EC01'
WHERE ST_Intersects(p.geometry, prj.buffer_geometry);
```

### 3.2 Dynamic Corridor Buffer Generation
```sql
-- Generate 100m Right-of-Way buffer along the surveyed centerline
UPDATE projects
SET buffer_geometry = ST_Multi(ST_Buffer(corridor_geometry::geography, 100)::geometry)
WHERE id = 'PRJ-2026-EC01';
```

---

## 4. Environment Configuration
Configure database connectivity via `.env`:
```env
DATABASE_URL="postgresql://bhumi_user:secure_password@localhost:5432/bhumi360_db?sslmode=disable"
```
Execute initial migrations with standard PostgreSQL clients or your preferred ORM:
```bash
psql $DATABASE_URL -f src/server/db/migrations/001_initial_schema.sql
psql $DATABASE_URL -f src/server/db/migrations/002_seed_data.sql
```
