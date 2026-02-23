-- SAFE migration: only additive changes (no drops, no PK rewrites)

-- If you need UUID generation for text ids
create extension if not exists "pgcrypto";

-- 1) LeaveTypeCatalog index (safe)
create index if not exists "LeaveTypeCatalog_isActive_idx"
  on "LeaveTypeCatalog" ("isActive");

-- 2) LeaveRequest indexes (safe)
create index if not exists "LeaveRequest_userId_startYmd_idx"
  on "LeaveRequest" ("userId", "startYmd");

create index if not exists "LeaveRequest_userId_endYmd_idx"
  on "LeaveRequest" ("userId", "endYmd");

create index if not exists "LeaveRequest_typeCatalogId_idx"
  on "LeaveRequest" ("typeCatalogId");

-- 3) Create VacationBalance (safe, text IDs) - no FK required (relationMode="prisma")
create table if not exists "VacationBalance" (
  "id"        text primary key default gen_random_uuid()::text,
  "userId"    text not null,
  "year"      integer not null,
  "totalDays" integer not null,
  "usedDays"  integer not null default 0,
  "deletedAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  constraint "VacationBalance_userId_year_key" unique ("userId","year")
);

create index if not exists "VacationBalance_userId_idx"
  on "VacationBalance" ("userId");