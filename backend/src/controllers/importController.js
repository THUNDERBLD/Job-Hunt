import asyncHandler from '../utils/asyncHandler.js';
import Contact      from '../models/contactModel.js';
import ExcelJS      from 'exceljs';

// Map Excel column headers → model field names
// Handles typos and extra spaces from the original sheet
const COLUMN_MAP = {
  'socails':      'socials',    // original has typo
  'socials':      'socials',
  'companies':    'companies',
  'start-ups':    'startups',
  'startups':     'startups',
  'person':       'person',
  'referrals':    'referrals',
  'position':     'position',
  'messaged':     'messaged',
  'links':        'links',
  'status/stage': 'statusStage',
  'status':       'statusStage',
  'priority':     'priority',
  'resume':       'resume',
  'notes':        'notes',
  'email':        'email',
  'sent mails':   'sentMails',
  'sentmails':    'sentMails',
};

// Normalize "Yes"/"No"/"yes"/"no" → "Yes"/"No"
const normalizeYesNo = (val) => {
  if (!val) return 'No';
  const s = String(val).trim().toLowerCase();
  return s === 'yes' ? 'Yes' : 'No';
};

// Normalize priority
const normalizePriority = (val) => {
  if (!val) return 'Mid';
  const s = String(val).trim();
  if (s.toLowerCase() === 'high') return 'High';
  if (s.toLowerCase() === 'low')  return 'Low';
  return 'Mid';
};

// ─────────────────────────────────────────────────────────────
// @desc    Upload Excel file and import contacts
// @route   POST /api/import
// @access  Private
// Expects: multipart/form-data with field name "file"
// ─────────────────────────────────────────────────────────────
export const importExcel = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded. Send an Excel file in the "file" field.');
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(req.file.buffer);

  const sheet = workbook.worksheets[0];
  if (!sheet) {
    res.status(400);
    throw new Error('Excel file has no worksheets');
  }

  // Read headers from first row
  const headerRow = sheet.getRow(1).values; // index 1-based
  const headers   = [];
  for (let i = 1; i < headerRow.length; i++) {
    const raw = String(headerRow[i] || '').trim().toLowerCase();
    headers.push(COLUMN_MAP[raw] || raw);
  }

  // Parse all data rows
  const toInsert  = [];
  const skipped   = [];
  const errors    = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header

    const values = row.values;
    const obj    = {};
    headers.forEach((field, i) => {
      let val = values[i + 1]; // +1 because ExcelJS values is 1-indexed
      if (val === null || val === undefined) val = '';
      if (typeof val === 'object' && val.text) val = val.text; // hyperlink cell
      obj[field] = String(val).trim();
    });

    // Skip empty rows
    if (!obj.person || obj.person === '') {
      skipped.push(rowNumber);
      return;
    }

    // Normalize fields
    obj.messaged  = normalizeYesNo(obj.messaged);
    obj.sentMails = normalizeYesNo(obj.sentMails);
    obj.priority  = normalizePriority(obj.priority);
    if (obj.statusStage === 'NAN' || !obj.statusStage) obj.statusStage = 'NAN';
    if (!obj.notes || obj.notes === 'NAN')     obj.notes = '';
    if (!obj.email || obj.email === 'NAN')     obj.email = null;
    if (!obj.resume || obj.resume === 'NAN')   obj.resume = '';
    if (!obj.referrals)                         obj.referrals = 'Not asked';

    obj.userId = req.user._id;

    toInsert.push(obj);
  });

  if (toInsert.length === 0) {
    res.status(400);
    throw new Error('No valid rows found in the uploaded file');
  }

  // Bulk insert with ordered: false so one duplicate doesn't stop everything
  let inserted = 0, duplicates = 0;

  const results = await Promise.allSettled(
    toInsert.map(doc => Contact.create(doc))
  );

  results.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      inserted++;
    } else {
      const isDup = r.reason?.code === 11000 || r.reason?.message?.includes('duplicate');
      if (isDup) duplicates++;
      else errors.push({ row: i + 2, error: r.reason?.message });
    }
  });

  res.json({
    success: true,
    message: `Import complete: ${inserted} added, ${duplicates} duplicates skipped, ${errors.length} errors`,
    data: {
      total:      toInsert.length,
      inserted,
      duplicates,
      skipped:    skipped.length,
      errors,
    },
  });
});

// ─────────────────────────────────────────────────────────────
// @desc    Download the Excel template (blank, with correct headers)
// @route   GET /api/import/template
// @access  Private
// ─────────────────────────────────────────────────────────────
export const downloadTemplate = asyncHandler(async (req, res) => {
  const workbook = new ExcelJS.Workbook();
  const sheet    = workbook.addWorksheet('JobHunt Tracker');

  sheet.columns = [
    { header: 'Socails',      key: 'socials',     width: 18 },
    { header: 'Companies',    key: 'companies',   width: 22 },
    { header: 'Start-ups',    key: 'startups',    width: 12 },
    { header: 'Person',       key: 'person',      width: 22 },
    { header: 'Referrals',    key: 'referrals',   width: 20 },
    { header: 'Position',     key: 'position',    width: 24 },
    { header: 'Messaged',     key: 'messaged',    width: 12 },
    { header: 'Links',        key: 'links',       width: 45 },
    { header: 'Status/Stage', key: 'statusStage', width: 18 },
    { header: 'Priority ',    key: 'priority',    width: 12 },
    { header: 'Resume',       key: 'resume',      width: 45 },
    { header: 'Notes ',       key: 'notes',       width: 35 },
    { header: 'Email',        key: 'email',       width: 30 },
    { header: 'Sent Mails',   key: 'sentMails',   width: 12 },
  ];

  sheet.getRow(1).eachCell(cell => {
    cell.font      = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F7A4D' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  // Add one example row
  sheet.addRow({
    socials: 'LinkedIn', companies: 'Acme Corp', startups: 'Yes',
    person: 'Jane Doe', referrals: 'Not asked', position: 'Hiring Manager',
    messaged: 'No', links: 'https://www.linkedin.com/in/jane-doe/',
    statusStage: 'NAN', priority: 'High',
    resume: 'https://drive.google.com/...', notes: '', email: 'jane.doe@acme.com', sentMails: 'No',
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=jobhunt-template.xlsx');
  await workbook.xlsx.write(res);
  res.end();
});