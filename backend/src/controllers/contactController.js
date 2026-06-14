import asyncHandler from '../utils/asyncHandler.js';
import Contact      from '../models/contactModel.js';
import ExcelJS      from 'exceljs';

// ─────────────────────────────────────────────────────────────
// @desc    Get all contacts for logged-in user
// @route   GET /api/contacts
// @access  Private
// Query:  ?status=&priority=&startups=&search=&sort=
// ─────────────────────────────────────────────────────────────
export const getAllContacts = asyncHandler(async (req, res) => {
  const { status, priority, startups, search, sort = '-createdAt' } = req.query;

  const filter = { userId: req.user._id };
  if (status)   filter.status   = status;
  if (priority) filter.priority = priority;
  if (startups) filter.startups = startups;
  if (search) {
    filter.$or = [
      { person:    { $regex: search, $options: 'i' } },
      { companies: { $regex: search, $options: 'i' } },
      { email:     { $regex: search, $options: 'i' } },
      { position:  { $regex: search, $options: 'i' } },
    ];
  }

  const [contacts, total] = await Promise.all([
    Contact.find(filter).sort(sort),
    Contact.countDocuments({ userId: req.user._id }),
  ]);

  // Stats aggregation
  const statusAgg = await Contact.aggregate([
    { $match: { userId: req.user._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const priorityAgg = await Contact.aggregate([
    { $match: { userId: req.user._id } },
    { $group: { _id: '$priority', count: { $sum: 1 } } },
  ]);
  const messagedCount  = await Contact.countDocuments({ userId: req.user._id, messaged: 'Yes' });
  const sentMailsCount = await Contact.countDocuments({ userId: req.user._id, sentMails: 'Yes' });

  const byStatus   = statusAgg.reduce((a, s)   => ({ ...a, [s._id]: s.count }), {});
  const byPriority = priorityAgg.reduce((a, p) => ({ ...a, [p._id]: p.count }), {});

  res.json({
    success: true,
    count: contacts.length,
    stats: {
      total,
      byStatus,
      byPriority,
      messaged:  messagedCount,
      sentMails: sentMailsCount,
    },
    data: contacts,
  });
});

// ─────────────────────────────────────────────────────────────
// @desc    Get single contact (must belong to user)
// @route   GET /api/contacts/:id
// @access  Private
// ─────────────────────────────────────────────────────────────
export const getContactById = asyncHandler(async (req, res) => {
  const contact = await Contact.findOne({ _id: req.params.id, userId: req.user._id });
  if (!contact) {
    res.status(404);
    throw new Error('Contact not found');
  }
  res.json({ success: true, data: contact });
});

// ─────────────────────────────────────────────────────────────
// @desc    Create a new contact
// @route   POST /api/contacts
// @access  Private
// ─────────────────────────────────────────────────────────────
export const createContact = asyncHandler(async (req, res) => {
  const { links } = req.body;

  // Duplicate check for this user
  if (links) {
    const existing = await Contact.findOne({ userId: req.user._id, links });
    if (existing) {
      res.status(409);
      throw new Error(`Already tracking ${existing.person} from ${existing.companies}`);
    }
  }

  const contact = await Contact.create({ ...req.body, userId: req.user._id });
  res.status(201).json({ success: true, data: contact });
});

// ─────────────────────────────────────────────────────────────
// @desc    Update contact
// @route   PUT /api/contacts/:id
// @access  Private
// ─────────────────────────────────────────────────────────────
export const updateContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findOne({ _id: req.params.id, userId: req.user._id });
  if (!contact) {
    res.status(404);
    throw new Error('Contact not found');
  }

  Object.assign(contact, req.body);
  const updated = await contact.save();
  res.json({ success: true, data: updated });
});

// ─────────────────────────────────────────────────────────────
// @desc    Delete contact
// @route   DELETE /api/contacts/:id
// @access  Private
// ─────────────────────────────────────────────────────────────
export const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!contact) {
    res.status(404);
    throw new Error('Contact not found');
  }
  res.json({ success: true, message: `${contact.person} deleted` });
});

// ─────────────────────────────────────────────────────────────
// @desc    Export contacts as .xlsx (exact same format as input sheet)
// @route   GET /api/contacts/export
// @access  Private
// ─────────────────────────────────────────────────────────────
export const exportContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.find({ userId: req.user._id }).sort('-createdAt');

  const workbook  = new ExcelJS.Workbook();
  const sheet     = workbook.addWorksheet('JobHunt Tracker');

  // Exact same column names as the original Excel sheet
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

  // Style header row — matching original green
  sheet.getRow(1).eachCell(cell => {
    cell.font      = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F7A4D' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  // Priority colors
  const PRIORITY_FILL = { High: 'FFFFF3CD', Mid: 'FFE8F4FD', Low: 'FFF8F9FA' };

  contacts.forEach(c => {
    const row = sheet.addRow({
      socials:     c.socials,
      companies:   c.companies,
      startups:    c.startups,
      person:      c.person,
      referrals:   c.referrals,
      position:    c.position,
      messaged:    c.messaged,
      links:       c.links,
      statusStage: c.statusStage,
      priority:    c.priority,
      resume:      c.resume,
      notes:       c.notes,
      email:       c.email || '',
      sentMails:   c.sentMails,
    });

    const fill = PRIORITY_FILL[c.priority];
    if (fill) {
      row.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
      });
    }
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=jobhunt-${req.user.name.replace(/\s/g,'-')}.xlsx`);
  await workbook.xlsx.write(res);
  res.end();
});