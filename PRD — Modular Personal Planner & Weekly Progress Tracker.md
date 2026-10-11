# PRD — Modular Personal Planner & Weekly Progress Tracker

**Product Name:** TBD\
**Document Version:** 1.0\
**Status:** Draft\
**Target Platform:** Web Application\
**Primary User:** Individual user / personal productivity\
**Design Reference:** Notion-style workspace, specifically the provided "Scholar" workspace

---

# 1. Product Overview

## 1.1 Product Vision

Membangun aplikasi personal productivity berbasis modular workspace yang memungkinkan pengguna:

- membuat dan mengatur jadwal;
- membuat berbagai section secara fleksibel;
- menyusun section dalam grid/column;
- menjalankan habit dan task secara harian;
- melakukan reset/restart terhadap section;
- menyimpan data periode sebelumnya secara otomatis;
- melihat history aktivitas;
- menghasilkan weekly report dalam format PDF.

Produk mengambil inspirasi dari fleksibilitas layout Notion, tetapi menyederhanakan mekanisme pembuatan dan pengelolaan section.

Produk tidak bertujuan menjadi clone Notion.

Fokus utama produk adalah:

> **Plan → Execute → Track → Reset → Archive → Review**

---

# 2. Problem Statement

Aplikasi seperti Notion memberikan fleksibilitas tinggi, tetapi fleksibilitas tersebut juga menghasilkan kompleksitas.

Untuk kebutuhan personal planning sederhana, pengguna sering kali harus:

1. membuat page;
2. memilih block;
3. membuat database;
4. menentukan property;
5. membuat view;
6. mengatur layout;
7. mengatur filter;
8. mengatur relasi;
9. melakukan reset secara manual.

Hal tersebut tidak ideal untuk workflow yang berulang setiap minggu.

Contoh:

> Pengguna memiliki habit "Workout", "Study", "Reading", dan "Morning Run".

Setiap minggu pengguna ingin:

- memulai periode baru;
- mempertahankan struktur habit;
- mengosongkan progress minggu sebelumnya;
- menyimpan progress lama;
- melihat statistik;
- membuat laporan PDF.

Aplikasi harus membuat proses tersebut menjadi satu workflow sederhana:

**Restart Week → Archive → Create New Week**

---

# 3. Product Goals

## 3.1 Primary Goals

### G1 — Modular Workspace

Pengguna dapat membuat dashboard personal dengan berbagai section.

### G2 — Simple Section Creation

Pengguna dapat menambahkan section tanpa memahami konsep database atau block seperti pada Notion.

### G3 — Flexible Layout

Pengguna dapat mengatur section dalam:

- 1 column;
- 2 columns;
- 3 columns;
- custom grid.

### G4 — Habit & Activity Tracking

Pengguna dapat menjalankan dan mencatat aktivitas harian.

### G5 — Weekly Cycle

Setiap minggu memiliki periode aktif sendiri.

### G6 — Non-destructive Restart

Restart tidak menghapus history.

### G7 — Historical Tracking

Data minggu sebelumnya dapat dilihat kembali.

### G8 — Weekly PDF Report

Pengguna dapat mengubah aktivitas minggu menjadi laporan PDF.

---

# 4. Non-Goals

Produk pada MVP **tidak** bertujuan menjadi:

- full Notion replacement;
- collaborative workspace;
- project management platform;
- enterprise productivity platform;
- document editor kompleks;
- real-time multiplayer editor;
- advanced relational database system.

Fitur tersebut dapat dipertimbangkan setelah core product terbukti berguna.

---

# 5. Target User

## Primary Persona

### Personal Productivity User

Karakteristik:

- menggunakan planner untuk kehidupan pribadi;
- memiliki banyak aktivitas;
- ingin membuat habit;
- memiliki jadwal belajar/kerja;
- ingin melihat progress;
- ingin mengevaluasi minggu sebelumnya;
- membutuhkan laporan atau dokumentasi aktivitas.

Contoh:

- mahasiswa;
- fresh graduate;
- freelancer;
- developer;
- content creator;
- professional;
- job seeker.

---

# 6. Core User Journey

## 6.1 First Visit

```text
Landing
   ↓
Create Workspace
   ↓
Choose Template
   ↓
Dashboard
```

Template awal:

- Personal
- Student
- Career
- Custom

---

# 7. Main Application Structure

```text
Application
│
├── Dashboard
│
├── Today
│
├── This Week
│
├── Sections
│   ├── Habits
│   ├── Tasks
│   ├── Schedule
│   ├── Goals
│   └── Notes
│
├── History
│   ├── Week 40
│   ├── Week 39
│   ├── Week 38
│   └── ...
│
└── Settings
```

---

# 8. Dashboard

Dashboard merupakan halaman utama.

## 8.1 Header

Header harus menampilkan:

- workspace name;
- current date;
- current week;
- search;
- settings;
- user profile;
- export button.

Contoh:

```text
ARGA'S WORKSPACE

Tuesday, October 6, 2026

[ Today ] [ Week ] [ History ]

                              [ Export PDF ]
```

---

# 9. Dashboard Sections

Dashboard dapat terdiri dari beberapa section.

Contoh default:

```text
Weekly Progress
Habit Tracker
Weekly Schedule
Daily Tasks
Notes
Goals
```

Pengguna bebas:

- menambah;
- menghapus;
- mengubah urutan;
- resize;
- mengubah posisi.

---

# 10. Section Builder

## 10.1 Add Section

Tombol utama:

```text
+ Add Section
```

Ketika diklik:

```text
Add Section

☑ Checklist
🔥 Habit Tracker
📅 Schedule
📝 Notes
📊 Progress
🎯 Goals
📋 Task Board
🗓 Calendar
▦ Custom Grid

+ Blank Section
```

---

# 11. Section Types

## 11.1 Checklist

Digunakan untuk task sederhana.

Contoh:

```text
DAILY TASKS

☑ Study SQL
☐ Complete Power BI module
☐ Workout
☐ Read
```

Properties:

- title;
- task;
- completed;
- priority;
- due date;
- notes.

---

# 12. Habit Tracker

Habit Tracker merupakan salah satu fitur utama.

Contoh:

```text
HABITS

Habit          Mon Tue Wed Thu Fri Sat Sun

Morning Run     ✓   ✓   ✕   ✓   ✓   ✓   -
Workout         ✓   ✕   ✓   ✓   ✕   ✓   -
Reading         ✓   ✓   ✓   ✓   ✓   ✓   -
Study           ✓   ✓   ✓   ✓   ✓   ✓   -
```

Setiap habit memiliki:

- name;
- frequency;
- daily status;
- target;
- progress;
- streak.

Status:

```text
completed
failed
skipped
pending
```

---

# 13. Schedule

Schedule digunakan untuk aktivitas berbasis waktu.

Contoh:

```text
WEEKLY SCHEDULE

Monday
08:00 — SQL
10:00 — Project
17:00 — Workout

Tuesday
09:00 — Power BI
13:00 — Job Application
17:00 — Workout
```

Data:

- title;
- date;
- start time;
- end time;
- category;
- description;
- status.

---

# 14. Notes

Notes section digunakan untuk:

- reflection;
- weekly review;
- ideas;
- important information.

Contoh:

```text
WEEKLY NOTES

What went well?
...

What went wrong?
...

What should improve?
...

Next week focus:
...
```

---

# 15. Progress Section

Progress section menghitung progress berdasarkan section lain.

Contoh:

```text
WEEKLY PROGRESS

Study        ████████░░ 80%
Exercise     ██████░░░░ 60%
Projects     █████████░ 90%

Overall      ████████░░ 78%
```

Progress dapat dihitung berdasarkan:

- completed tasks;
- completed habits;
- goals;
- custom percentage.

---

# 16. Grid Layout

Section harus mendukung layout fleksibel.

## Layout 1

```text
┌───────────────────────┐
│ Section                │
└───────────────────────┘
```

## Layout 2

```text
┌──────────────┬──────────────┐
│ Section A    │ Section B    │
└──────────────┴──────────────┘
```

## Layout 3

```text
┌────────┬────────┬────────┐
│ A      │ B      │ C      │
└────────┴────────┴────────┘
```

## Custom

```text
┌──────────────────┬───────┐
│                  │       │
│        A         │   B   │
│                  │       │
├──────────────────┼───────┤
│        C         │   D   │
└──────────────────┴───────┘
```

---

# 17. Section Controls

Setiap section memiliki menu:

```text
⋮
```

Menu:

```text
Rename
Duplicate
Resize
Move
Appearance
Archive
Restart
Delete
```

---

# 18. Drag & Drop

Section dapat dipindahkan menggunakan drag & drop.

Requirements:

- drag section;
- reorder;
- move between rows;
- move between columns;
- visual drop indicator;
- preserve section data.

---

# 19. Resize

Section dapat diubah ukurannya.

Preset:

```text
25%
33%
50%
66%
75%
100%
```

Atau menggunakan grid units.

Contoh:

```text
12-column grid

Section A = 8 columns
Section B = 4 columns
```

---

# 20. Weekly Cycle

Sistem menggunakan periode mingguan.

Contoh:

```text
Week 40
September 28 — October 4

Week 41
October 5 — October 11
```

Current active week:

```text
CURRENT WEEK
October 5 — October 11
```

---

# 21. Restart System

Restart merupakan fitur inti.

## 21.1 Restart Section

Contoh:

```text
Habit Tracker

[ ↻ Restart ]
```

Ketika diklik:

```text
Restart Habit Tracker?

Current progress will be archived.

Week:
Sep 28 — Oct 4

✓ Save current week to History
✓ Reset current progress

[ Cancel ] [ Restart ]
```

---

# 22. Restart Behavior

Restart harus:

1. mengambil snapshot data aktif;
2. menyimpan snapshot ke history;
3. membuat state baru;
4. mempertahankan struktur section;
5. mengosongkan progress;
6. mempertahankan konfigurasi habit/task;
7. mengubah active period.

Contoh:

```text
Template
   │
   ├── Week 40 → Archived
   │
   └── Week 41 → Active
```

---

# 23. Important Rule

Restart **tidak boleh menggunakan delete** terhadap data lama.

Salah:

```text
DELETE Week 40
CREATE Week 41
```

Benar:

```text
ARCHIVE Week 40
CREATE Week 41
```

Hal ini penting untuk:

- history;
- analytics;
- PDF;
- audit;
- comparison;
- future statistics.

---

# 24. History

History menyimpan seluruh periode sebelumnya.

Sidebar:

```text
HISTORY

2026

Week 40
Week 39
Week 38
Week 37
```

Klik periode:

```text
Week 40

Sep 28 — Oct 4

Overall Progress: 78%

Habits
Tasks
Schedule
Notes
Goals

[ Export PDF ]
```

---

# 25. History Detail

History harus bersifat read-only secara default.

User dapat:

- melihat;
- membandingkan;
- export;
- duplicate sebagai template.

User tidak boleh secara tidak sengaja mengubah historical data.

---

# 26. Weekly Report

Weekly report mengambil seluruh data dalam satu periode.

Isi report:

1. Cover;
2. Weekly Overview;
3. Overall Progress;
4. Habit Tracker;
5. Tasks;
6. Schedule;
7. Goals;
8. Accomplishments;
9. Notes;
10. Reflection;
11. Next Week Focus.

---

# 27. PDF Export

Button:

```text
Export PDF
```

Modal:

```text
Export Weekly Report

Period:
● Week 40

Include:

☑ Overview
☑ Habits
☑ Tasks
☑ Schedule
☑ Progress
☑ Goals
☑ Notes

Style:

● Professional
○ Minimal

[ Preview ]
[ Export PDF ]
```

---

# 28. PDF Naming Convention

Format:

```text
Weekly_Report_2026_W40.pdf
```

atau:

```text
Weekly_Report_Sep28-Oct04_2026.pdf
```

---

# 29. Weekly Report Example

```text
WEEKLY REPORT

ARGA

September 28 — October 4, 2026


WEEKLY OVERVIEW

Overall Progress
78%


HABITS

Morning Run       5 / 7
Workout           4 / 7
Reading           7 / 7
Study             6 / 7


TASKS

12 Completed
3 Remaining


SCHEDULE

...


ACCOMPLISHMENTS

...


REFLECTION

...


NEXT WEEK

1. ...
2. ...
3. ...
```

---

# 30. Data Model

High-level entity relationship:

```text
User
 │
 └── Workspace
       │
       ├── Layout
       │
       ├── Sections
       │     ├── Habit Section
       │     ├── Task Section
       │     ├── Schedule Section
       │     ├── Notes Section
       │     └── Progress Section
       │
       └── Weekly Periods
              │
              ├── Week 40
              ├── Week 39
              └── Week 38
```

---

# 31. Core Entities

## User

```text
id
name
email
created_at
updated_at
```

## Workspace

```text
id
user_id
name
description
created_at
updated_at
```

## Section

```text
id
workspace_id
type
title
position
layout_config
settings
created_at
updated_at
```

## Weekly Period

```text
id
workspace_id
start_date
end_date
status
created_at
archived_at
```

Status:

```text
active
archived
```

---

# 32. Habit

```text
id
section_id
name
description
frequency
target
position
created_at
updated_at
```

## Habit Log

```text
id
habit_id
weekly_period_id
date
status
note
created_at
updated_at
```

---

# 33. Task

```text
id
section_id
weekly_period_id
title
description
priority
due_date
status
position
created_at
updated_at
```

---

# 34. Schedule

```text
id
section_id
weekly_period_id
title
description
date
start_time
end_time
category
status
created_at
updated_at
```

---

# 35. Notes

```text
id
section_id
weekly_period_id
content
created_at
updated_at
```

---

# 36. Weekly Snapshot

Untuk memastikan history tidak berubah setelah restart, sistem dapat menyimpan snapshot.

```text
WeeklySnapshot

id
weekly_period_id
workspace_snapshot
created_at
```

Snapshot dapat berupa JSON terstruktur.

Contoh:

```json
{
  "habits": [],
  "tasks": [],
  "schedule": [],
  "notes": [],
  "progress": {}
}
```

---

# 37. Layout Model

Workspace menggunakan konsep:

```text
Workspace
    ↓
Canvas
    ↓
Rows
    ↓
Columns
    ↓
Sections
```

Contoh:

```json
{
  "rows": [
    {
      "columns": [
        {
          "width": 6,
          "sectionId": "habit-01"
        },
        {
          "width": 6,
          "sectionId": "schedule-01"
        }
      ]
    }
  ]
}
```

---

# 38. UX Principles

## Principle 1 — Zero Configuration

User harus bisa membuat section tanpa memahami database.

## Principle 2 — Fast Interaction

Task/habit harus bisa dibuat dalam maksimal beberapa klik.

## Principle 3 — Safe Reset

Reset tidak boleh menyebabkan data hilang.

## Principle 4 — History First

Data lama selalu dapat ditemukan kembali.

## Principle 5 — Visual Simplicity

UI mengikuti prinsip visual Notion:

- clean;
- minimal;
- whitespace;
- typography-focused;
- subtle borders;
- minimal color.

## Principle 6 — Modular

Semua fitur utama harus berupa section.

---

# 39. Visual Design Direction

## General Style

Inspired by Notion, tetapi bukan copy.

Karakteristik:

- white/light gray background;
- rounded cards;
- subtle border;
- minimal shadows;
- clean typography;
- compact sidebar;
- responsive grid;
- clear hierarchy.

---

# 40. Color System

Default:

```text
Background
#FFFFFF

Secondary Background
#F7F7F5

Border
#E8E8E5

Primary Text
#1F1F1F

Secondary Text
#737373

Accent
#2383E2

Success
#3BA55D

Warning
#E5A000

Danger
#D64545
```

Color harus dapat dikustomisasi pada future version.

---

# 41. Responsive Design

## Desktop

Primary experience.

Layout:

```text
Sidebar + Workspace
```

## Tablet

Sidebar dapat collapse.

## Mobile

Section menjadi single-column.

Grid:

```text
Desktop:
A | B

Mobile:
A
B
```

---

# 42. Navigation

Sidebar:

```text
🏠 Dashboard

TODAY
📅 Today
📆 This Week

SECTIONS
🔥 Habits
📋 Tasks
📅 Schedule
🎯 Goals

HISTORY
2026
 ├ Week 40
 ├ Week 39
 └ Week 38

⚙ Settings
```

---

# 43. Quick Add

Aplikasi harus menyediakan quick action.

Button:

```text
+
```

Menu:

```text
Add Task
Add Habit
Add Schedule
Add Note
Add Goal
Add Section
```

Tujuannya agar pengguna tidak perlu membuka section terlebih dahulu.

---

# 44. Keyboard Shortcuts

Future feature:

```text
N → New Task
H → New Habit
S → New Schedule
R → Restart
E → Export
```

---

# 45. Search

Search harus dapat mencari:

- section;
- task;
- habit;
- schedule;
- history;
- notes.

Contoh:

```text
Search "SQL"

Results

Week 40
- Study SQL
- SQL Course

Week 39
- SQL Dashboard
```

---

# 46. Notifications

MVP:

Tidak diperlukan.

Future:

- upcoming schedule;
- incomplete habit;
- weekly review reminder;
- weekly reset reminder.

---

# 47. Authentication

MVP:

- email/password atau OAuth;
- satu user dapat memiliki beberapa workspace.

Future:

- Google login;
- GitHub login.

---

# 48. Workspace

User dapat memiliki:

```text
My Workspace

├── Personal
├── Career
├── Study
└── Projects
```

Namun MVP dapat dimulai dengan satu workspace untuk mengurangi kompleksitas.

---

# 49. Template System

Template memungkinkan user membuat workspace dari preset.

### Personal

```text
Habits
Tasks
Schedule
Notes
Weekly Review
```

### Student

```text
Class Schedule
Assignments
Study Tracker
Habits
Weekly Review
```

### Career

```text
Job Applications
Learning Tracker
Daily Tasks
Portfolio
Weekly Review
```

### Custom

```text
Blank Workspace
```

---

# 50. Weekly Review

Setiap akhir periode, sistem menyediakan:

```text
WEEKLY REVIEW

What did you accomplish?

...

What didn't go according to plan?

...

What should you improve?

...

Top priorities for next week:

1.
2.
3.
```

Review menjadi bagian dari PDF.

---

# 51. Weekly Comparison

Future feature.

Contoh:

```text
WEEKLY PERFORMANCE

             W39     W40

Study        72%     87%   ↑
Exercise     80%     71%   ↓
Tasks        65%     82%   ↑
```

Tujuan:

membantu user melihat trend, bukan hanya data satu minggu.

---

# 52. Gamification

Tidak menjadi fokus MVP.

Possible future features:

- streak;
- badges;
- completion score;
- weekly score;
- consistency score.

Namun jangan sampai produk berubah menjadi aplikasi habit tracker yang penuh gamifikasi.

---

# 53. MVP Scope

## Must Have

### Workspace

- [x] Dashboard
- [x] Sidebar
- [x] Workspace

### Section

- [x] Add section
- [x] Delete section
- [x] Rename section
- [x] Duplicate section
- [x] Reorder section
- [x] Resize section

### Section Types

- [x] Checklist
- [x] Habit
- [x] Schedule
- [x] Notes
- [x] Progress

### Weekly System

- [x] Active week
- [x] Restart
- [x] Archive
- [x] History

### Reporting

- [x] Weekly summary
- [x] PDF export
- [x] Historical report

---

# 54. Post-MVP

- Calendar
- Kanban
- Goals
- Advanced analytics
- Weekly comparison
- Templates
- Search
- Keyboard shortcuts
- Dark mode
- Mobile optimization
- Notifications
- Google Calendar integration
- AI weekly summary

---

# 55. Recommended Technical Architecture

## Frontend

Recommended:

```text
React
TypeScript
Vite
Tailwind CSS
```

UI:

```text
shadcn/ui
```

Drag & drop:

```text
dnd-kit
```

Rich text:

```text
TipTap
```

Charts:

```text
Recharts
```

---

# 56. Backend

Recommended:

```text
Laravel
```

API:

```text
REST API
```

Database:

```text
PostgreSQL
```

Authentication:

```text
Laravel Sanctum
```

---

# 57. PDF Generation

Recommended approach:

```text
Frontend
    ↓
Request Report
    ↓
Backend
    ↓
Generate HTML
    ↓
Render PDF
    ↓
Return PDF
```

Possible implementation:

```text
Puppeteer
```

or a server-side PDF library.

The PDF should be generated from structured data, not screenshots.

---

# 58. State Management

Frontend:

```text
Server State
→ TanStack Query

Local UI State
→ Zustand
```

Section layout state:

```text
Workspace Layout JSON
```

---

# 59. API Structure

Example:

```text
GET    /api/workspaces
POST   /api/workspaces

GET    /api/workspaces/{id}

GET    /api/workspaces/{id}/sections
POST   /api/workspaces/{id}/sections
PATCH  /api/sections/{id}
DELETE /api/sections/{id}

GET    /api/weeks/current
POST   /api/weeks/restart

GET    /api/history
GET    /api/history/{id}

GET    /api/reports/{week}
POST   /api/reports/{week}/export
```

---

# 60. Critical API: Restart

Endpoint:

```text
POST /api/weeks/restart
```

Process:

```text
Validate active week
        ↓
Create snapshot
        ↓
Archive current week
        ↓
Create new week
        ↓
Copy recurring structures
        ↓
Reset activity state
        ↓
Return new active week
```

Must be transactional.

If one step fails:

```text
ROLLBACK
```

No partial restart.

---

# 61. Acceptance Criteria

## Add Section

Given user is on dashboard:

When user clicks:

```text
+ Add Section
```

Then:

- section picker appears;
- user chooses type;
- section is created;
- section appears in workspace;
- section can immediately be edited.

---

# 62. Acceptance Criteria — Habit

User can:

- create habit;
- mark complete;
- mark incomplete;
- view weekly progress;
- view completion percentage.

Example:

```text
7 days
5 completed

Progress = 71.4%
```

---

# 63. Acceptance Criteria — Restart

When user clicks Restart:

1. confirmation appears;
2. current data is archived;
3. new period is created;
4. section structure remains;
5. activity status is reset;
6. old period remains accessible.

---

# 64. Acceptance Criteria — History

User can:

- open previous week;
- view its data;
- view progress;
- export it;
- return to active week.

Historical data must remain unchanged by current-week actions.

---

# 65. Acceptance Criteria — PDF

PDF must:

- contain selected sections;
- contain correct weekly period;
- calculate progress correctly;
- include notes;
- include schedule;
- include habits;
- have readable formatting;
- use a consistent layout;
- be downloadable.

---

# 66. Performance Requirements

Target:

- initial dashboard load < 2 seconds under normal conditions;
- section interaction should feel immediate;
- drag-and-drop must not cause noticeable lag;
- autosave should not block UI;
- PDF generation should provide loading state.

---

# 67. Autosave

Changes should automatically persist.

Example:

```text
User checks habit
      ↓
Local state update
      ↓
API mutation
      ↓
Database
```

UI should not require a Save button for ordinary actions.

Display:

```text
Saved ✓
```

or:

```text
Saving...
```

---

# 68. Data Safety

Critical operations:

- restart;
- delete;
- archive;
- workspace deletion

must have confirmation.

History must not be silently deleted.

---

# 69. Delete vs Archive

### Delete

Used when user explicitly wants to permanently remove something.

### Archive

Used for completed periods.

Example:

```text
Week 40
↓
Archive
```

not:

```text
Delete
```

---

# 70. Empty States

Example:

```text
No habits yet.

Build a small routine and start tracking it.

[ + Add Habit ]
```

For empty workspace:

```text
Your workspace is empty.

Start with a section.

[ + Add Section ]
```

---

# 71. Error Handling

Example:

```text
Unable to save changes.

Your changes are temporarily stored locally.

[ Retry ]
```

Restart failure:

```text
Restart failed.

Your current week has not been modified.

[ Try Again ]
```

---

# 72. Security

Minimum:

- authenticated API;
- authorization per workspace;
- server-side validation;
- rate limiting;
- CSRF protection;
- sanitized rich text;
- secure PDF generation;
- no cross-user workspace access.

---

# 73. Analytics

Internal product analytics may track:

- section creation;
- section type usage;
- restart frequency;
- weekly report export;
- active workspace;
- habit completion;
- weekly retention.

Do not track personal note content unless explicitly required and consented.

---

# 74. Success Metrics

## Activation

Percentage of users who create their first section.

Target:

```text
> 70%
```

## Weekly Retention

Percentage of users who return in the following week.

Target:

```text
> 40%
```

## Weekly Restart

Percentage of active users completing a weekly cycle.

Target:

```text
> 50%
```

## PDF Export

Percentage of active users exporting at least one report.

Target:

```text
> 30%
```

These are initial product targets, not validated market benchmarks.

---

# 75. Product Differentiation

The product should differentiate itself through:

### 1. Simplicity

Much easier than Notion for personal planning.

### 2. Weekly Lifecycle

Planning is organized around weekly cycles.

### 3. Safe Restart

Restarting does not destroy historical data.

### 4. Automatic History

Every completed period becomes an archive.

### 5. Reporting

Activities automatically become a structured weekly report.

### 6. Modular UI

Users can construct their own dashboard without database complexity.

---

# 76. Core Product Loop

The entire product should revolve around:

```text
PLAN
  ↓
CREATE SECTIONS
  ↓
EXECUTE DAILY
  ↓
TRACK PROGRESS
  ↓
WEEKLY REVIEW
  ↓
EXPORT REPORT
  ↓
ARCHIVE
  ↓
RESTART
  ↓
PLAN NEXT WEEK
```

This loop is the core product.

---

# 77. MVP User Flow

```text
Login
  ↓
Dashboard
  ↓
Add Section
  ↓
Habit Tracker
  ↓
Add Habits
  ↓
Daily Tracking
  ↓
Weekly Progress
  ↓
Weekly Review
  ↓
Restart
  ↓
Archive Week
  ↓
Create New Week
  ↓
History
  ↓
Export PDF
```

---

# 78. Recommended Development Order

## Sprint 1 — Foundation

- project setup;
- authentication;
- workspace;
- database;
- dashboard shell;
- sidebar.

## Sprint 2 — Section Engine

- section model;
- add section;
- delete;
- rename;
- duplicate;
- reorder;
- resize;
- grid layout.

## Sprint 3 — Core Sections

- checklist;
- habit;
- schedule;
- notes.

## Sprint 4 — Weekly Engine

- active week;
- weekly data;
- restart;
- archive;
- history.

## Sprint 5 — Reporting

- progress calculation;
- weekly summary;
- PDF generation;
- PDF preview.

## Sprint 6 — UX Polish

- animations;
- responsive design;
- empty states;
- error handling;
- autosave;
- loading states.

---

# 79. Future AI Features

AI should not be included in MVP.

Potential future features:

### Weekly Summary

```text
Summarize my Week 40.
```

AI generates:

```text
You completed 78% of planned activities.

Strongest area:
Study — 87%

Weakest area:
Exercise — 71%

Main issue:
Several workout sessions were missed on Wednesday and Friday.

Recommendation:
Schedule shorter workouts on those days.
```

### Automatic Planning

```text
Create next week's schedule based on my previous week.
```

### Reflection Analysis

AI can identify:

- recurring missed habits;
- overloaded schedules;
- inconsistent routines;
- improvement trends.

---

# 80. Product Principle

The product should follow one fundamental principle:

> **The user should spend more time doing their work than managing the productivity system.**

If adding a task requires five interactions, the UX is wrong.

If restarting a week requires manually recreating data, the architecture is wrong.

If reviewing a week requires manually compiling information, the reporting system is wrong.

The application should remove administrative friction from personal planning.

---

# 81. Final MVP Definition

The MVP is successful when a user can:

1. open the dashboard;
2. create sections;
3. arrange sections in a grid;
4. create habits;
5. create tasks;
6. create schedules;
7. track activities during the week;
8. view weekly progress;
9. restart the week;
10. automatically archive the previous week;
11. open historical weeks;
12. export a historical/current week as PDF.

If these 12 workflows work smoothly, the core product is already viable.

Everything else is secondary.
