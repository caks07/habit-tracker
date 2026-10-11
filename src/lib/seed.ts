import type {
  GalleryItem,
  HistoryEntry,
  PageInfo,
  ProfileRow,
  Section,
  SourceTable,
  TableProperty,
  TableRecord,
} from '../types';
import { daysAgo, getTodayDateStr, todayIndex, weekInfo } from './date';
import { uid } from './util';

export const seedPage: PageInfo = {
  title: 'Scholar',
  owner: 'Arga',
  cover: '/img/cover.jpg',
  avatar: '/img/avatar.jpg',
  quote:
    'You failed, it’s okay to fail, just admit it, whatever it is, but don’t fail twice in the same thing and don’t regret not trying it.',
  quoteBy: 'Caks',
};

const todayStr = getTodayDateStr();

// ----------------------------------------------------------------------------
// 1. MASTER SOURCE TABLES (Single Source of Truth)
// ----------------------------------------------------------------------------

export function createDefaultSourceTables(): Record<string, SourceTable> {
  // Table 0: Activities (Main Activity: Bootcamp, Courses, Study Programs)
  const activitiesProps: TableProperty[] = [
    { id: 'act-p1', key: 'title', name: 'Aktivitas', type: 'title', width: 260 },
    { id: 'act-p2', key: 'event', name: 'Program / Event', type: 'text', width: 160 },
    { id: 'act-p3', key: 'sesi', name: 'Sesi', type: 'text', width: 80 },
    { id: 'act-p4', key: 'achieve', name: 'Achieve', type: 'text', width: 130 },
    { id: 'act-p5', key: 'cover', name: 'Cover Image', type: 'text', width: 150 },
    {
      id: 'act-p6',
      key: 'category',
      name: 'Kategori',
      type: 'select',
      width: 120,
      options: [
        { id: 'ac1', label: 'Bootcamp', color: 'purple' },
        { id: 'ac2', label: 'Kuliah', color: 'pink' },
        { id: 'ac3', label: 'Bahasa', color: 'blue' },
        { id: 'ac4', label: 'Skripsi', color: 'red' },
      ],
    },
    {
      id: 'act-p7',
      key: 'status',
      name: 'Status',
      type: 'status',
      width: 110,
      options: [
        { id: 'as1', label: 'Active', color: 'green' },
        { id: 'as2', label: 'In Progress', color: 'blue' },
        { id: 'as3', label: 'Completed', color: 'gray' },
      ],
    },
    { id: 'act-p8', key: 'notes', name: 'Deskripsi', type: 'text', width: 240 },
  ];

  const activitiesRecords: TableRecord[] = [
    {
      id: 'act-1',
      values: {
        title: 'Bootcamp Data Analyst with Excel',
        event: 'Bootcamp DQ Lab',
        sesi: '5',
        achieve: '9 Packages',
        cover: '/img/reading.jpg',
        category: 'Bootcamp',
        status: 'Active',
        notes: 'Selasa dan Jumat, 19.00–21.30 lewat Zoom. Fokus: pivot table, lookup, dan dashboard analitik.',
        scheduleIds: ['sch-2', 'sch-6'],
        taskIds: ['tsk-4', 'tsk-5'],
        assignmentIds: ['asg-2'],
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },
    {
      id: 'act-2',
      values: {
        title: 'Bootcamp Business Intelligence Analyst with Power BI',
        event: 'Bootcamp DQ Lab',
        sesi: '8',
        achieve: '12 Modules',
        cover: '/img/records.jpg',
        category: 'Bootcamp',
        status: 'Active',
        notes: 'Data modeling, DAX measure, dan publikasi executive dashboard.',
        scheduleIds: ['sch-4'],
        taskIds: ['tsk-11'],
        assignmentIds: ['asg-3'],
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },
    {
      id: 'act-3',
      values: {
        title: 'Bahasa Inggris',
        event: 'Kampung Inggris Online',
        sesi: '12',
        achieve: 'Speaking Fluency',
        cover: '/img/hill.jpg',
        category: 'Bahasa',
        status: 'Active',
        notes: 'Senin dan Kamis malam, 20.00–21.00. Target: speaking lancar sebelum technical interview.',
        scheduleIds: ['sch-1', 'sch-5'],
        taskIds: ['tsk-12', 'tsk-14'],
        assignmentIds: ['asg-1'],
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },
    {
      id: 'act-4',
      values: {
        title: 'Skripsi & Research Writing',
        event: 'Tugas Akhir',
        sesi: 'Bab 3',
        achieve: 'Drafting',
        cover: '/img/koi_pond.jpg',
        category: 'Skripsi',
        status: 'Active',
        notes: 'Konsultasi berkala tiap Selasa dengan Dosen Pembimbing. Fokus metodologi sampling & data collection.',
        scheduleIds: ['sch-3'],
        taskIds: ['tsk-7', 'tsk-8', 'tsk-13'],
        assignmentIds: ['asg-4'],
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },
  ];

  // Table 1: Schedule (Time Table)
  const scheduleProps: TableProperty[] = [
    { id: 'p1', key: 'title', name: 'Main Activity', type: 'title', width: 240 },
    {
      id: 'p2',
      key: 'day',
      name: 'Hari',
      type: 'select',
      width: 95,
      options: [
        { id: 'd0', label: 'Senin', color: 'green' },
        { id: 'd1', label: 'Selasa', color: 'pink' },
        { id: 'd2', label: 'Rabu', color: 'blue' },
        { id: 'd3', label: 'Kamis', color: 'brown' },
        { id: 'd4', label: 'Jumat', color: 'orange' },
        { id: 'd5', label: 'Sabtu', color: 'purple' },
        { id: 'd6', label: 'Minggu', color: 'gray' },
      ],
    },
    { id: 'p3', key: 'startTime', name: 'Jam Mulai', type: 'time', width: 85 },
    { id: 'p4', key: 'endTime', name: 'Jam Selesai', type: 'time', width: 85 },
    { id: 'p5', key: 'place', name: 'Tempat', type: 'text', width: 100 },
    {
      id: 'p6',
      key: 'activityId',
      name: 'Relasi Matkul',
      type: 'relation',
      relationTableId: 'activities',
      width: 220,
    },
    {
      id: 'p7',
      key: 'category',
      name: 'Kategori',
      type: 'select',
      width: 110,
      options: [
        { id: 'o1', label: 'Study', color: 'purple' },
        { id: 'o2', label: 'Exercise', color: 'green' },
        { id: 'o3', label: 'Entertainment', color: 'blue' },
        { id: 'o4', label: 'Project', color: 'orange' },
        { id: 'o5', label: 'Kuliah', color: 'pink' },
      ],
    },
    {
      id: 'p8',
      key: 'status',
      name: 'Status',
      type: 'status',
      width: 110,
      options: [
        { id: 's1', label: 'Planned', color: 'gray' },
        { id: 's2', label: 'In Progress', color: 'blue' },
        { id: 's3', label: 'Done', color: 'green' },
        { id: 's4', label: 'Canceled', color: 'red' },
      ],
    },
    { id: 'p9', key: 'date', name: 'Tanggal', type: 'date', width: 110 },
  ];

  const scheduleRecords: TableRecord[] = [
    {
      id: 'sch-1',
      values: {
        title: 'Kampung Inggris Online',
        day: 'Senin',
        startTime: '20:00',
        endTime: '21:00',
        place: 'Zoom',
        activityId: 'act-3',
        category: 'Kuliah',
        status: 'Done',
        date: todayStr,
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },
    {
      id: 'sch-2',
      values: {
        title: 'Bootcamp Data Analyst with Excel',
        day: 'Selasa',
        startTime: '19:00',
        endTime: '21:30',
        place: 'Zoom',
        activityId: 'act-1',
        category: 'Study',
        status: 'In Progress',
        date: todayStr,
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },
    {
      id: 'sch-3',
      values: {
        title: 'Revisi Skripsi Bab 3',
        day: 'Selasa',
        startTime: '08:00',
        endTime: '12:00',
        place: 'Perpustakaan',
        activityId: 'act-4',
        category: 'Project',
        status: 'Canceled',
        date: todayStr,
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },
    {
      id: 'sch-4',
      values: {
        title: 'Bootcamp Business Intelligence Analyst with Power BI',
        day: 'Rabu',
        startTime: '19:00',
        endTime: '21:00',
        place: 'Zoom',
        activityId: 'act-2',
        category: 'Study',
        status: 'Planned',
        date: '2026-10-08',
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },
    {
      id: 'sch-5',
      values: {
        title: 'Bahasa Inggris',
        day: 'Kamis',
        startTime: '20:00',
        endTime: '21:30',
        place: 'Zoom',
        activityId: 'act-3',
        category: 'Kuliah',
        status: 'In Progress',
        date: '2026-10-09',
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },
    {
      id: 'sch-6',
      values: {
        title: 'Bootcamp Data Analyst with Excel',
        day: 'Jumat',
        startTime: '19:00',
        endTime: '21:30',
        place: 'Zoom',
        activityId: 'act-1',
        category: 'Study',
        status: 'Planned',
        date: '2026-10-10',
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },
    {
      id: 'sch-7',
      values: {
        title: 'Review Mingguan & Rencana Pekan Depan',
        day: 'Sabtu',
        startTime: '16:00',
        endTime: '17:30',
        place: 'Home',
        category: 'Project',
        status: 'Planned',
        date: '2026-10-11',
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },
  ];

  // Table 2: Tasks (To do List Harian)
  const tasksProps: TableProperty[] = [
    { id: 'tp1', key: 'title', name: 'Topik', type: 'title', width: 240 },
    {
      id: 'tp2',
      key: 'day',
      name: 'Hari',
      type: 'select',
      width: 95,
      options: [
        { id: 'td0', label: 'Senin', color: 'green' },
        { id: 'td1', label: 'Selasa', color: 'pink' },
        { id: 'td2', label: 'Rabu', color: 'blue' },
        { id: 'td3', label: 'Kamis', color: 'brown' },
        { id: 'td4', label: 'Jumat', color: 'orange' },
        { id: 'td5', label: 'Sabtu', color: 'purple' },
        { id: 'td6', label: 'Minggu', color: 'gray' },
      ],
    },
    { id: 'tp3', key: 'time', name: 'Jam', type: 'text', width: 110 },
    {
      id: 'tp4',
      key: 'category',
      name: 'Kategori',
      type: 'select',
      width: 110,
      options: [
        { id: 'tc1', label: 'Olahraga', color: 'brown' },
        { id: 'tc2', label: 'Hiburan', color: 'blue' },
        { id: 'tc3', label: 'Skripsi', color: 'red' },
        { id: 'tc4', label: 'Kuliah', color: 'green' },
        { id: 'tc5', label: 'Bahasa Inggris', color: 'orange' },
      ],
    },
    {
      id: 'tp5',
      key: 'status',
      name: 'Status',
      type: 'status',
      width: 120,
      options: [
        { id: 'tst1', label: 'Not started', color: 'gray' },
        { id: 'tst2', label: 'In progress', color: 'blue' },
        { id: 'tst3', label: 'Done', color: 'green' },
        { id: 'tst4', label: 'Canceled', color: 'red' },
      ],
    },
    { id: 'tp6', key: 'subtasks', name: 'Detail Subtask', type: 'text', width: 170 },
    { id: 'tp7', key: 'dueDate', name: 'Tenggat', type: 'date', width: 110 },
  ];

  const tasksRecords: TableRecord[] = [
    // Senin
    {
      id: 'tsk-1',
      values: {
        title: 'Jalan 45 Menit',
        day: 'Senin',
        time: '06.00 - 07.00',
        category: 'Olahraga',
        status: 'Done',
        subtasks: 'Jalan 45 Menit',
        dueDate: todayStr,
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },
    {
      id: 'tsk-2',
      values: {
        title: 'Baca Atomic Habbits',
        day: 'Senin',
        time: '07.00 - 08.00',
        category: 'Hiburan',
        status: 'Done',
        subtasks: 'Baca',
        dueDate: todayStr,
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },
    {
      id: 'tsk-3',
      values: {
        title: 'Ga ada',
        day: 'Senin',
        time: '08.00 - 11.00',
        category: 'Skripsi',
        status: 'Canceled',
        subtasks: 'Jadwal kosong',
        dueDate: todayStr,
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },
    {
      id: 'tsk-4',
      values: {
        title: 'Bootcamp Data Analyst with Excel',
        day: 'Senin',
        time: '19.00 - 21.30',
        category: 'Kuliah',
        status: 'Not started',
        subtasks: 'Persiapan Zoom',
        dueDate: todayStr,
        activityId: 'act-1',
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },

    // Selasa
    {
      id: 'tsk-5',
      values: {
        title: 'Jalan 45 menit',
        day: 'Selasa',
        time: '06.00 - 07.00',
        category: 'Olahraga',
        status: 'Done',
        subtasks: 'Jalan 45 menit',
        dueDate: todayStr,
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },
    {
      id: 'tsk-6',
      values: {
        title: 'Baca novel',
        day: 'Selasa',
        time: '07.00 - 08.00',
        category: 'Hiburan',
        status: 'Done',
        subtasks: 'Baca',
        dueDate: todayStr,
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },
    {
      id: 'tsk-7',
      values: {
        title: 'Tulis Pendahuluan Paragraf 1-2',
        day: 'Selasa',
        time: '08.00 - 12.00',
        category: 'Skripsi',
        status: 'Canceled',
        subtasks: 'Revisi latar belakang',
        dueDate: todayStr,
        activityId: 'act-4',
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },
    {
      id: 'tsk-8',
      values: {
        title: 'Tulis Pendahuluan Paragraf 3-4',
        day: 'Selasa',
        time: '21.30 - 23.00',
        category: 'Skripsi',
        status: 'In progress',
        subtasks: 'Tulis rumusan masalah',
        dueDate: todayStr,
        activityId: 'act-4',
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },
    {
      id: 'tsk-9',
      values: {
        title: 'Belajar gitar',
        day: 'Selasa',
        time: '12.00 - 14.00',
        category: 'Hiburan',
        status: 'Done',
        subtasks: 'gitar',
        dueDate: todayStr,
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },

    // Rabu
    {
      id: 'tsk-10',
      values: {
        title: 'Jalan 30 menit',
        day: 'Rabu',
        time: '05.30 - 06.30',
        category: 'Olahraga',
        status: 'Done',
        subtasks: 'Jalan 30 menit',
        dueDate: todayStr,
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },
    {
      id: 'tsk-11',
      values: {
        title: 'Bootcamp Business Intelligence Analyst with Power BI',
        day: 'Rabu',
        time: '19.00 - 21.00',
        category: 'Kuliah',
        status: 'Not started',
        subtasks: 'Materi DAX Measure',
        dueDate: todayStr,
        activityId: 'act-2',
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },
    {
      id: 'tsk-12',
      values: {
        title: 'Kampung Inggris Online',
        day: 'Rabu',
        time: '20.00 - 21.00',
        category: 'Kuliah',
        status: 'Not started',
        subtasks: 'Vocabulary review',
        dueDate: todayStr,
        activityId: 'act-3',
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },
    {
      id: 'tsk-13',
      values: {
        title: 'Outline Skripsi & Referensi',
        day: 'Rabu',
        time: '21.30 - 23.00',
        category: 'Skripsi',
        status: 'Not started',
        subtasks: 'Outline referensi bab 3',
        dueDate: todayStr,
        activityId: 'act-4',
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },

    // Kamis
    {
      id: 'tsk-14',
      values: {
        title: 'Topik 1 Speaking Interview',
        day: 'Kamis',
        time: '20.00 - 21.30',
        category: 'Bahasa Inggris',
        status: 'In progress',
        subtasks: 'Speaking practice sesi 1',
        dueDate: '2026-10-09',
        activityId: 'act-3',
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },
  ];

  // Table 3: Assignments (Screenshot 2 & 3)
  const assignmentsProps: TableProperty[] = [
    { id: 'ap1', key: 'title', name: 'Topik', type: 'title', width: 240 },
    {
      id: 'ap2',
      key: 'category',
      name: 'Kategori',
      type: 'select',
      width: 110,
      options: [
        { id: 'ac1', label: 'Kuliah', color: 'green' },
        { id: 'ac2', label: 'Bootcamp', color: 'purple' },
        { id: 'ac3', label: 'Sertifikasi', color: 'blue' },
      ],
    },
    {
      id: 'ap3',
      key: 'course',
      name: 'Mata Kuliah',
      type: 'relation',
      relationTableId: 'activities',
      width: 220,
    },
    { id: 'ap4', key: 'dueDate', name: 'Deadline', type: 'date', width: 120 },
    {
      id: 'ap5',
      key: 'status',
      name: 'Status',
      type: 'status',
      width: 120,
      options: [
        { id: 'as1', label: 'Not started', color: 'gray' },
        { id: 'as2', label: 'In progress', color: 'blue' },
        { id: 'as3', label: 'Submitted', color: 'green' },
      ],
    },
  ];

  const assignmentsRecords: TableRecord[] = [
    {
      id: 'asg-1',
      values: {
        title: 'Presentasi Contoh SE',
        category: 'Kuliah',
        course: 'act-3',
        dueDate: '2026-10-15',
        status: 'Not started',
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },
    {
      id: 'asg-2',
      values: {
        title: 'Latihan Pivot Table & VLOOKUP',
        category: 'Bootcamp',
        course: 'act-1',
        dueDate: '2026-10-09',
        status: 'Submitted',
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },
    {
      id: 'asg-3',
      values: {
        title: 'Laporan Dashboard Penjualan Power BI',
        category: 'Bootcamp',
        course: 'act-2',
        dueDate: '2026-10-12',
        status: 'In progress',
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },
    {
      id: 'asg-4',
      values: {
        title: 'Studi Kasus Normalisasi Database 3NF',
        category: 'Kuliah',
        course: 'Database Systems',
        dueDate: '2026-10-10',
        status: 'Submitted',
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },
  ];

  // Table 4: Habits
  const habitsProps: TableProperty[] = [
    { id: 'hp1', key: 'title', name: 'Kebiasaan', type: 'title', width: 220 },
    {
      id: 'hp2',
      key: 'category',
      name: 'Kategori',
      type: 'select',
      width: 110,
      options: [
        { id: 'hc1', label: 'Health', color: 'green' },
        { id: 'hc2', label: 'Mind', color: 'blue' },
        { id: 'hc3', label: 'Study', color: 'purple' },
        { id: 'hc4', label: 'Routine', color: 'orange' },
      ],
    },
    { id: 'hp3', key: 'days', name: 'Senin-Minggu', type: 'text', width: 200 },
    { id: 'hp4', key: 'streak', name: 'Streak', type: 'number', width: 85 },
    {
      id: 'hp5',
      key: 'status',
      name: 'Status',
      type: 'status',
      width: 100,
      options: [
        { id: 'hs1', label: 'Active', color: 'green' },
        { id: 'hs2', label: 'Paused', color: 'gray' },
      ],
    },
  ];

  const habitsRecords: TableRecord[] = [
    {
      id: 'hbt-1',
      values: {
        title: 'Jalan pagi 45 menit',
        category: 'Health',
        days: [1, 1, 1, 0, 0, 0, 0],
        streak: 12,
        status: 'Active',
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },
    {
      id: 'hbt-2',
      values: {
        title: 'Baca buku 30 menit',
        category: 'Mind',
        days: [1, 1, 1, 1, 0, 0, 0],
        streak: 21,
        status: 'Active',
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },
    {
      id: 'hbt-3',
      values: {
        title: 'Latihan SQL 1 jam',
        category: 'Study',
        days: [1, 1, 1, 0, 0, 0, 0],
        streak: 8,
        status: 'Active',
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },
    {
      id: 'hbt-4',
      values: {
        title: 'Tulis skripsi 2 lembar',
        category: 'Study',
        days: [1, 2, 1, 0, 0, 0, 0],
        streak: 3,
        status: 'Active',
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },
    {
      id: 'hbt-5',
      values: {
        title: 'Tidur sebelum 23.00',
        category: 'Routine',
        days: [1, 1, 2, 0, 0, 0, 0],
        streak: 5,
        status: 'Active',
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },
  ];

  // Table 5: Entertainment
  const entertainmentProps: TableProperty[] = [
    { id: 'ep1', key: 'title', name: 'Judul', type: 'title', width: 220 },
    {
      id: 'ep2',
      key: 'type',
      name: 'Tipe',
      type: 'select',
      width: 100,
      options: [
        { id: 'et1', label: 'Movie', color: 'blue' },
        { id: 'et2', label: 'Anime', color: 'purple' },
        { id: 'et3', label: 'Book', color: 'green' },
        { id: 'et4', label: 'Game', color: 'orange' },
      ],
    },
    { id: 'ep3', key: 'date', name: 'Tanggal', type: 'date', width: 110 },
    { id: 'ep4', key: 'time', name: 'Waktu', type: 'time', width: 80 },
    {
      id: 'ep5',
      key: 'platform',
      name: 'Platform',
      type: 'select',
      width: 110,
      options: [
        { id: 'pl1', label: 'Netflix', color: 'red' },
        { id: 'pl2', label: 'Crunchyroll', color: 'orange' },
        { id: 'pl3', label: 'Spotify', color: 'green' },
        { id: 'pl4', label: 'Steam', color: 'blue' },
      ],
    },
    {
      id: 'ep6',
      key: 'status',
      name: 'Status',
      type: 'status',
      width: 110,
      options: [
        { id: 'es1', label: 'Wishlist', color: 'gray' },
        { id: 'es2', label: 'In Progress', color: 'blue' },
        { id: 'es3', label: 'Completed', color: 'green' },
      ],
    },
    { id: 'ep7', key: 'rating', name: 'Rating', type: 'rating', width: 100 },
    { id: 'ep8', key: 'notes', name: 'Catatan', type: 'text', width: 160 },
  ];

  const entertainmentRecords: TableRecord[] = [
    {
      id: 'ent-1',
      values: {
        title: 'Interstellar',
        type: 'Movie',
        date: todayStr,
        time: '19:30',
        platform: 'Netflix',
        status: 'Completed',
        rating: 5,
        notes: 'Masterpiece soundtrack & visual Hans Zimmer',
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },
    {
      id: 'ent-2',
      values: {
        title: 'Sousou no Frieren',
        type: 'Anime',
        date: todayStr,
        time: '21:00',
        platform: 'Crunchyroll',
        status: 'In Progress',
        rating: 5,
        notes: 'Pacing sangat tenang, visual indah',
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },
    {
      id: 'ent-3',
      values: {
        title: 'Atomic Habits',
        type: 'Book',
        date: '2026-10-05',
        time: '07:30',
        platform: 'Spotify',
        status: 'Completed',
        rating: 5,
        notes: 'Konsep 1% perbaikan harian',
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },
    {
      id: 'ent-4',
      values: {
        title: 'Cyberpunk 2077: Phantom Liberty',
        type: 'Game',
        date: '2026-10-10',
        time: '20:00',
        platform: 'Steam',
        status: 'Wishlist',
        rating: 4,
        notes: 'Mainkan di akhir pekan bersama teman',
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },
  ];

  // Table 6: Goals
  const goalsProps: TableProperty[] = [
    { id: 'gp1', key: 'title', name: 'Target', type: 'title', width: 220 },
    { id: 'gp2', key: 'targetDate', name: 'Target Waktu', type: 'date', width: 110 },
    {
      id: 'gp3',
      key: 'category',
      name: 'Bidang',
      type: 'select',
      width: 110,
      options: [
        { id: 'gc1', label: 'Akademik', color: 'red' },
        { id: 'gc2', label: 'Karir', color: 'orange' },
        { id: 'gc3', label: 'Kesehatan', color: 'green' },
        { id: 'gc4', label: 'Finansial', color: 'blue' },
      ],
    },
    { id: 'gp4', key: 'progress', name: 'Progress %', type: 'number', width: 90 },
    {
      id: 'gp5',
      key: 'status',
      name: 'Status',
      type: 'status',
      width: 110,
      options: [
        { id: 'gs1', label: 'In Progress', color: 'blue' },
        { id: 'gs2', label: 'Achieved', color: 'green' },
      ],
    },
  ];

  const goalsRecords: TableRecord[] = [
    {
      id: 'gol-1',
      values: {
        title: 'Sidang Skripsi Selesai Bulan Depan',
        targetDate: '2026-11-20',
        category: 'Akademik',
        progress: 65,
        status: 'In Progress',
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },
    {
      id: 'gol-2',
      values: {
        title: 'Sertifikasi Data Analyst Professional',
        targetDate: '2026-10-30',
        category: 'Karir',
        progress: 80,
        status: 'In Progress',
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },
    {
      id: 'gol-3',
      values: {
        title: 'Lari 10K Sub-60 Menit',
        targetDate: '2026-10-25',
        category: 'Kesehatan',
        progress: 40,
        status: 'In Progress',
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },
    {
      id: 'gol-4',
      values: {
        title: 'Dana Darurat 6 Bulan Terkumpul',
        targetDate: '2026-12-31',
        category: 'Finansial',
        progress: 90,
        status: 'In Progress',
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },
  ];

  // Table 7: Notes
  const notesProps: TableProperty[] = [
    { id: 'np1', key: 'title', name: 'Judul', type: 'title', width: 220 },
    {
      id: 'np2',
      key: 'category',
      name: 'Kategori',
      type: 'select',
      width: 120,
      options: [
        { id: 'nc1', label: 'Weekly Review', color: 'purple' },
        { id: 'nc2', label: 'Belajar', color: 'blue' },
        { id: 'nc3', label: 'Refleksi', color: 'green' },
      ],
    },
    { id: 'np3', key: 'content', name: 'Isi Catatan', type: 'text', width: 300 },
    { id: 'np4', key: 'updated', name: 'Tanggal', type: 'date', width: 110 },
  ];

  const notesRecords: TableRecord[] = [
    {
      id: 'not-1',
      values: {
        title: 'Refleksi Minggu 41: Bangun Pagi & Disiplin Waktu',
        category: 'Refleksi',
        content:
          'Rutinitas pagi berjalan sangat baik. Jangan buka sosial media sebelum sesi belajar pertama selesai.',
        updated: todayStr,
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },
    {
      id: 'not-2',
      values: {
        title: 'Catatan SQL Indexing & Window Function',
        category: 'Belajar',
        content:
          'Gunakan EXISTS daripada IN untuk subquery besar. Buat B-Tree index pada foreign key.',
        updated: '2026-10-06',
      },
      createdAt: todayStr,
      updatedAt: todayStr,
    },
  ];

  return {
    activities: {
      id: 'activities',
      name: 'Activities',
      icon: 'Activity',
      description: 'Master program bootcamp, kuliah, dan kegiatan utama',
      properties: activitiesProps,
      records: activitiesRecords,
      isSystem: true,
    },
    schedule: {
      id: 'schedule',
      name: 'Schedule',
      icon: 'Calendar',
      description: 'Master jadwal kegiatan harian dan mingguan',
      properties: scheduleProps,
      records: scheduleRecords,
      isSystem: true,
    },
    tasks: {
      id: 'tasks',
      name: 'Tasks',
      icon: 'CheckSquare',
      description: 'Master daftar tugas dan to-do list harian',
      properties: tasksProps,
      records: tasksRecords,
      isSystem: true,
    },
    assignments: {
      id: 'assignments',
      name: 'Assignments',
      icon: 'BookOpen',
      description: 'Master tugas kuliah dan mata kuliah',
      properties: assignmentsProps,
      records: assignmentsRecords,
      isSystem: true,
    },
    habits: {
      id: 'habits',
      name: 'Habits',
      icon: 'Repeat',
      description: 'Master pelacak kebiasaan rutin',
      properties: habitsProps,
      records: habitsRecords,
      isSystem: true,
    },
    entertainment: {
      id: 'entertainment',
      name: 'Entertainment',
      icon: 'Film',
      description: 'Master daftar hiburan, film, anime, dan buku',
      properties: entertainmentProps,
      records: entertainmentRecords,
      isSystem: true,
    },
    goals: {
      id: 'goals',
      name: 'Goals',
      icon: 'Target',
      description: 'Master sasaran jangka panjang dan milestone',
      properties: goalsProps,
      records: goalsRecords,
      isSystem: true,
    },
    notes: {
      id: 'notes',
      name: 'Notes',
      icon: 'FileText',
      description: 'Master catatan refleksi dan review mingguan',
      properties: notesProps,
      records: notesRecords,
      isSystem: true,
    },
  };
}

// ----------------------------------------------------------------------------
// 2. DEFAULT DASHBOARD CANVAS BLOCKS (Pure Presentation Layer)
// ----------------------------------------------------------------------------

export function createDefaultSections(): Section[] {
  const profileRows: ProfileRow[] = [
    { id: uid(), key: 'Name', value: 'Arga' },
    { id: uid(), key: 'Age', value: '22th' },
    { id: uid(), key: 'Status', value: 'Fresh Graduate' },
    { id: uid(), key: 'Favorites', value: 'analytic, music, series' },
    { id: uid(), key: 'Notes', value: 'jangan malas, satu langkah tiap hari' },
  ];

  return [
    // Row 1: Profile (7 cols) + Weekly Progress (5 cols)
    {
      id: 'sec-profile',
      dashboardId: 'dashboard_main',
      type: 'profile',
      contentSubtype: 'profile',
      label: 'about me . . .',
      title: '',
      span: 7,
      layout: { x: 0, y: 0, w: 7, h: 4 },
      items: profileRows,
      meta: { photo: '/img/avatar.jpg' },
      config: { photo: '/img/avatar.jpg', rows: profileRows },
    },
    {
      id: 'sec-progress',
      dashboardId: 'dashboard_main',
      type: 'progress',
      contentSubtype: 'progress',
      label: 'progress',
      title: 'Minggu ini',
      span: 5,
      layout: { x: 7, y: 0, w: 5, h: 4 },
      meta: { auto: true },
      config: { auto: true },
    },

    // Row 2: Divider Strip
    {
      id: 'sec-divider-1',
      dashboardId: 'dashboard_main',
      type: 'divider',
      contentSubtype: 'divider',
      label: 'divider',
      title: '',
      span: 12,
      layout: { x: 0, y: 1, w: 12, h: 1 },
    },

    // Row 3: Main Activity (Linked → activities, Gallery View)
    {
      id: 'sec-main-activity',
      dashboardId: 'dashboard_main',
      type: 'linked_database',
      sourceDatabaseId: 'activities',
      label: 'activity',
      title: 'Main Activity',
      span: 12,
      layout: { x: 0, y: 2, w: 12, h: 5 },
      view: {
        type: 'gallery',
        filters: [],
        sorts: [],
      },
      linkedConfig: {
        id: 'cfg-main-act',
        title: 'Main Activity',
        sourceTableId: 'activities',
        viewType: 'gallery',
        filters: [],
        sorts: [],
        span: 12,
      },
    },

    // Row 4: Indify Radar Clock (4 cols) + Time Table Schedule (8 cols)
    {
      id: 'sec-clock',
      dashboardId: 'dashboard_main',
      type: 'clock',
      contentSubtype: 'clock',
      label: 'widget',
      title: 'Analog Clock',
      span: 4,
      layout: { x: 0, y: 3, w: 4, h: 4 },
    },
    {
      id: 'sec-today-schedule',
      dashboardId: 'dashboard_main',
      type: 'linked_database',
      sourceDatabaseId: 'schedule',
      label: 'time table',
      title: 'Schedule',
      span: 8,
      layout: { x: 4, y: 3, w: 8, h: 4 },
      view: {
        type: 'table',
        filters: [],
        sorts: [{ property: 'startTime', direction: 'asc' }],
      },
      linkedConfig: {
        id: 'cfg-today-sch',
        title: 'Schedule',
        sourceTableId: 'schedule',
        viewType: 'table',
        filters: [],
        sorts: [{ property: 'startTime', direction: 'asc' }],
        span: 8,
      },
    },

    // Row 5: Divider Strip
    {
      id: 'sec-divider-2',
      dashboardId: 'dashboard_main',
      type: 'divider',
      contentSubtype: 'divider',
      label: 'divider',
      title: '',
      span: 12,
      layout: { x: 0, y: 4, w: 12, h: 1 },
    },

    // Row 6: To do List Harian (Multi-Source Linked View: Tasks, Activities, Habits, Entertainment, Schedule, Assignments)
    {
      id: 'sec-todo-board',
      dashboardId: 'dashboard_main',
      type: 'linked_multi_database',
      sourceDatabaseId: 'tasks',
      sourceDatabases: ['tasks', 'activities', 'habits', 'entertainment', 'schedule', 'assignments'],
      label: 'routine execution',
      title: 'To do List Harian',
      span: 12,
      layout: { x: 0, y: 5, w: 12, h: 6 },
      view: {
        type: 'board',
        groupBy: 'day',
        filters: [],
        sorts: [],
      },
      linkedConfig: {
        id: 'cfg-todo-board',
        title: 'To do List Harian',
        sourceTableId: 'tasks',
        sourceDatabases: ['tasks', 'activities', 'habits', 'entertainment', 'schedule', 'assignments'],
        viewType: 'board',
        groupBy: 'day',
        filters: [],
        sorts: [],
        span: 12,
      },
    },

    // Row 7: Divider Strip
    {
      id: 'sec-divider-3',
      dashboardId: 'dashboard_main',
      type: 'divider',
      contentSubtype: 'divider',
      label: 'divider',
      title: '',
      span: 12,
      layout: { x: 0, y: 6, w: 12, h: 1 },
    },

    // Row 8: Assignment Table (8 cols) + Cat on window Artwork (4 cols)
    {
      id: 'sec-assignments',
      dashboardId: 'dashboard_main',
      type: 'linked_database',
      sourceDatabaseId: 'assignments',
      label: 'academic desk',
      title: 'Assignment',
      span: 8,
      layout: { x: 0, y: 7, w: 8, h: 4 },
      view: {
        type: 'table',
        filters: [],
        sorts: [{ property: 'dueDate', direction: 'asc' }],
      },
      linkedConfig: {
        id: 'cfg-asg',
        title: 'Assignment',
        sourceTableId: 'assignments',
        viewType: 'table',
        filters: [],
        sorts: [{ property: 'dueDate', direction: 'asc' }],
        span: 8,
      },
    },
    {
      id: 'sec-art-cat',
      dashboardId: 'dashboard_main',
      type: 'image',
      contentSubtype: 'image',
      label: 'artwork',
      title: '',
      span: 4,
      layout: { x: 8, y: 7, w: 4, h: 4 },
      meta: {
        src: '/img/cat_window.jpg',
        caption: 'Study companion',
        fit: 'cover',
      },
      config: {
        src: '/img/cat_window.jpg',
        caption: 'Study companion',
        fit: 'cover',
      },
    },

    // Row 9: Divider Strip
    {
      id: 'sec-divider-4',
      dashboardId: 'dashboard_main',
      type: 'divider',
      contentSubtype: 'divider',
      label: 'divider',
      title: '',
      span: 12,
      layout: { x: 0, y: 8, w: 12, h: 1 },
    },

    // Row 10: Koi pond Artwork (4 cols) + Daily List Skripsi (8 cols)
    {
      id: 'sec-art-koi',
      dashboardId: 'dashboard_main',
      type: 'image',
      contentSubtype: 'image',
      label: 'zen garden',
      title: '',
      span: 4,
      layout: { x: 0, y: 9, w: 4, h: 4 },
      meta: {
        src: '/img/koi_pond.jpg',
        caption: 'Mindfulness & focus',
        fit: 'cover',
      },
      config: {
        src: '/img/koi_pond.jpg',
        caption: 'Mindfulness & focus',
        fit: 'cover',
      },
    },
    {
      id: 'sec-skripsi-tasks',
      dashboardId: 'dashboard_main',
      type: 'linked_database',
      sourceDatabaseId: 'tasks',
      label: 'milestone',
      title: 'Daily List Skripsi . . . . . .',
      span: 8,
      layout: { x: 4, y: 9, w: 8, h: 4 },
      view: {
        type: 'table',
        filters: [{ id: 'f-skr', property: 'category', operator: 'equals', value: 'Skripsi' }],
        sorts: [],
      },
      linkedConfig: {
        id: 'cfg-skr',
        title: 'Daily List Skripsi . . . . . .',
        sourceTableId: 'tasks',
        viewType: 'table',
        filters: [{ id: 'f-skr', property: 'category', operator: 'equals', value: 'Skripsi' }],
        sorts: [],
        span: 8,
      },
    },

    // Row 11: Habit Tracker (6 cols) + Goals & Milestones (6 cols)
    {
      id: 'sec-habits',
      dashboardId: 'dashboard_main',
      type: 'linked_database',
      sourceDatabaseId: 'habits',
      label: 'linked view',
      title: 'Habit Tracker',
      span: 6,
      layout: { x: 0, y: 10, w: 6, h: 4 },
      view: {
        type: 'compact-list',
        filters: [{ id: 'f-act', property: 'status', operator: 'equals', value: 'Active' }],
        sorts: [{ property: 'streak', direction: 'desc' }],
      },
      linkedConfig: {
        id: 'cfg-habits',
        title: 'Habit Tracker',
        sourceTableId: 'habits',
        viewType: 'compact-list',
        filters: [{ id: 'f-act', property: 'status', operator: 'equals', value: 'Active' }],
        sorts: [{ property: 'streak', direction: 'desc' }],
        span: 6,
      },
    },
    {
      id: 'sec-goals',
      dashboardId: 'dashboard_main',
      type: 'linked_database',
      sourceDatabaseId: 'goals',
      label: 'linked view',
      title: 'Goals & Milestones',
      span: 6,
      layout: { x: 6, y: 10, w: 6, h: 4 },
      view: {
        type: 'list',
        filters: [],
        sorts: [{ property: 'progress', direction: 'desc' }],
      },
      linkedConfig: {
        id: 'cfg-goals',
        title: 'Goals & Milestones',
        sourceTableId: 'goals',
        viewType: 'list',
        filters: [],
        sorts: [{ property: 'progress', direction: 'desc' }],
        span: 6,
      },
    },

    // Row 12: Entertainment (6 cols) + Weekly Review Notes (6 cols)
    {
      id: 'sec-entertainment',
      dashboardId: 'dashboard_main',
      type: 'linked_database',
      sourceDatabaseId: 'entertainment',
      label: 'linked view',
      title: 'Entertainment & Watchlist',
      span: 6,
      layout: { x: 0, y: 11, w: 6, h: 4 },
      view: {
        type: 'table',
        filters: [],
        sorts: [{ property: 'date', direction: 'desc' }],
      },
      linkedConfig: {
        id: 'cfg-ent',
        title: 'Entertainment & Watchlist',
        sourceTableId: 'entertainment',
        viewType: 'table',
        filters: [],
        sorts: [{ property: 'date', direction: 'desc' }],
        span: 6,
      },
    },
    {
      id: 'sec-review',
      dashboardId: 'dashboard_main',
      type: 'note',
      contentSubtype: 'note',
      label: 'weekly review',
      title: 'Catatan & Refleksi Minggu Ini',
      span: 6,
      layout: { x: 6, y: 11, w: 6, h: 4 },
      meta: {
        text: 'Yang berjalan baik:\nLatihan SQL rutin tiap pagi, tidak buka media sosial sebelum jam 10.\n\nYang perlu diperbaiki:\nTidur lewat jam 23.00 dua kali. Pasang alarm jam 22.30.\n\nFokus minggu depan:\nSelesaikan bab 3 dan kirim ke dosen pembimbing.',
      },
      config: {
        text: 'Yang berjalan baik:\nLatihan SQL rutin tiap pagi, tidak buka media sosial sebelum jam 10.\n\nYang perlu diperbaiki:\nTidur lewat jam 23.00 dua kali. Pasang alarm jam 22.30.\n\nFokus minggu depan:\nSelesaikan bab 3 dan kirim ke dosen pembimbing.',
      },
    },
  ];
}

// ----------------------------------------------------------------------------
// 3. SEED HISTORY (Historical Snapshots for Week 40 and Week 39)
// ----------------------------------------------------------------------------

export function seedHistory(): HistoryEntry[] {
  const defaultTables = createDefaultSourceTables();
  const defaultSections = createDefaultSections();

  const out: HistoryEntry[] = [];
  [7, 14].forEach((ago, n) => {
    const w = weekInfo(daysAgo(ago));
    const batchId = uid();
    const archivedAt = daysAgo(ago - (6 - todayIndex(daysAgo(ago)))).toISOString();

    out.push({
      id: uid(),
      batchId,
      weekKey: w.key,
      year: w.year,
      week: w.week,
      range: w.range,
      archivedAt,
      snapshotTables: Object.values(defaultTables),
      snapshotSections: defaultSections,
      metrics: {
        habitsRate: n === 0 ? 84 : 76,
        tasksDone: n === 0 ? 14 : 11,
        totalTasks: n === 0 ? 16 : 15,
        scheduleEvents: 18,
      },
      reflectionText:
        n === 0
          ? 'Outline skripsi diterima dosen pembimbing. Konsisten lari 3x seminggu.'
          : 'Mulai kebiasaan baca malam 30 menit. Target habit tercapai 76%.',
    });
  });

  return out;
}
