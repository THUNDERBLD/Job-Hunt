import asyncHandler from '../utils/asyncHandler.js';
import Contact      from '../models/contactModel.js';

// ─────────────────────────────────────────────────────────────
// @desc    Full dashboard stats for logged-in user
// @route   GET /api/dashboard
// @access  Private
// ─────────────────────────────────────────────────────────────
export const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [
    total,
    byStatus,
    byPriority,
    byCompanyType,
    bySocials,
    messagedCount,
    sentMailsCount,
    recentContacts,
    topCompanies,
    referralStats,
  ] = await Promise.all([

    // Total contacts
    Contact.countDocuments({ userId }),

    // By status pipeline
    Contact.aggregate([
      { $match: { userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort:  { count: -1 } },
    ]),

    // By priority
    Contact.aggregate([
      { $match: { userId } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]),

    // By company type (startup vs MNC)
    Contact.aggregate([
      { $match: { userId } },
      { $group: { _id: '$companyType', count: { $sum: 1 } } },
    ]),

    // By social platform
    Contact.aggregate([
      { $match: { userId } },
      { $group: { _id: '$socials', count: { $sum: 1 } } },
      { $sort:  { count: -1 } },
    ]),

    // Messaged count
    Contact.countDocuments({ userId, messaged: 'Yes' }),

    // Sent mails count
    Contact.countDocuments({ userId, sentMails: 'Yes' }),

    // 5 most recently added
    Contact.find({ userId })
      .sort('-createdAt')
      .limit(5)
      .select('person companies position status priority createdAt links'),

    // Top companies by count
    Contact.aggregate([
      { $match: { userId } },
      { $group: { _id: '$companies', count: { $sum: 1 }, priority: { $first: '$priority' } } },
      { $sort:  { count: -1 } },
      { $limit: 8 },
    ]),

    // Referral breakdown
    Contact.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          asked:       { $sum: { $cond: [{ $regexMatch: { input: { $toLower: '$referrals' }, regex: /^asked$/ } }, 1, 0] } },
          notAsked:    { $sum: { $cond: [{ $regexMatch: { input: { $toLower: '$referrals' }, regex: /not asked/ } }, 1, 0] } },
          askInFuture: { $sum: { $cond: [{ $regexMatch: { input: { $toLower: '$referrals' }, regex: /future/ } }, 1, 0] } },
        },
      },
    ]),
  ]);

  // Conversion rates
  const connectedCount = byStatus.find(s => s._id === 'connected')?.count || 0;
  const repliedCount   = byStatus.find(s => s._id === 'replied')?.count   || 0;
  const inProcessCount = byStatus.find(s => s._id === 'in_process')?.count || 0;

  const connectionRate = total > 0
    ? Math.round((connectedCount / total) * 100) : 0;
  const replyRate = messagedCount > 0
    ? Math.round((repliedCount / messagedCount) * 100) : 0;

  res.json({
    success: true,
    data: {
      overview: {
        total,
        messaged:  messagedCount,
        sentMails: sentMailsCount,
        replied:   repliedCount,
        inProcess: inProcessCount,
        connectionRate: `${connectionRate}%`,
        replyRate:      `${replyRate}%`,
      },
      charts: {
        byStatus:      byStatus.map(s =>    ({ name: s._id || 'unknown', value: s.count })),
        byPriority:    byPriority.map(p =>  ({ name: p._id || 'unknown', value: p.count })),
        byCompanyType: byCompanyType.map(c =>({ name: c._id || 'unknown', value: c.count })),
        bySocials:     bySocials.map(s =>   ({ name: s._id || 'other',   value: s.count })),
        topCompanies:  topCompanies.map(c => ({ name: c._id || 'unknown', value: c.count, priority: c.priority })),
      },
      referrals: referralStats[0] || { asked: 0, notAsked: 0, askInFuture: 0 },
      recentContacts,
      user: {
        name:              req.user.name,
        plan:              req.user.plan,
        aiUsed:            req.user.aiGenerationsUsed,
        aiLimit:           req.user.aiGenerationsLimit,
        aiRemaining:       Math.max(0, req.user.aiGenerationsLimit - req.user.aiGenerationsUsed),
        hasPersonalKey:    !!req.user.cohereApiKey,
      },
    },
  });
});