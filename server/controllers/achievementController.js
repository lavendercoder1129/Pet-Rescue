import mongoose from 'mongoose';
import User from '../models/User.js';
import Achievement from '../models/Achievement.js';
import UserAchievement from '../models/UserAchievement.js';
import Donation from '../models/Donation.js';
import {
  getUserAchievementsWithProgress,
  seedAchievements,
} from '../services/achievementService.js';

/**
 * @route   GET /api/achievements
 * @desc    Retrieve all available achievements with donor's progress
 * @access  Private (Authenticated User)
 */
export const getAvailableAchievements = async (req, res, next) => {
  try {
    const user = req.user;
    const data = await getUserAchievementsWithProgress(user._id);

    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/achievements/my
 * @desc    Retrieve user's earned badges
 * @access  Private (Authenticated User)
 */
export const getMyAchievements = async (req, res, next) => {
  try {
    const user = req.user;

    const earned = await UserAchievement.find({ userId: user._id })
      .populate('achievementId')
      .sort({ earnedAt: -1 })
      .lean();

    const badges = earned
      .filter((e) => e.achievementId)
      .map((e) => ({
        _id: e.achievementId._id,
        name: e.achievementId.name,
        slug: e.achievementId.slug,
        description: e.achievementId.description,
        icon: e.achievementId.icon,
        category: e.achievementId.category,
        criteriaType: e.achievementId.criteriaType,
        criteriaValue: e.achievementId.criteriaValue,
        earnedAt: e.earnedAt,
      }));

    res.status(200).json({
      success: true,
      count: badges.length,
      badges,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/donors/recognition-settings
 * @desc    Retrieve current donor privacy & recognition settings
 * @access  Private (Authenticated User)
 */
export const getRecognitionSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('recognitionSettings name');

    res.status(200).json({
      success: true,
      settings: {
        showOnLeaderboard: user?.recognitionSettings?.showOnLeaderboard ?? false,
        displayName: user?.recognitionSettings?.displayName || '',
        showDonationTotal: user?.recognitionSettings?.showDonationTotal ?? false,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/donors/recognition-settings
 * @desc    Update donor privacy & leaderboard recognition settings
 * @access  Private (Authenticated User)
 */
export const updateRecognitionSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const { showOnLeaderboard, displayName, showDonationTotal } = req.body;

    if (!user.recognitionSettings) {
      user.recognitionSettings = {};
    }

    if (showOnLeaderboard !== undefined) {
      user.recognitionSettings.showOnLeaderboard = Boolean(showOnLeaderboard);
    }

    if (displayName !== undefined) {
      const trimmed = String(displayName).trim().slice(0, 50);
      user.recognitionSettings.displayName = trimmed;
    }

    if (showDonationTotal !== undefined) {
      user.recognitionSettings.showDonationTotal = Boolean(showDonationTotal);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Recognition & privacy preferences updated successfully.',
      settings: user.recognitionSettings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/donors/leaderboard
 * @desc    Public Leaderboard of donors who explicitly opted in
 *          Ranking: 1. donationCount (desc) 2. uniqueCasesCount (desc) 3. badgesCount (desc) 4. _id (asc)
 *          Never exposes email, phone, or private user details.
 * @access  Public
 */
export const getPublicLeaderboard = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));

    // 1. Find all users who explicitly opted in: showOnLeaderboard = true
    const optedInUsers = await User.find({
      'recognitionSettings.showOnLeaderboard': true,
      isActive: true,
    })
      .select('_id name recognitionSettings createdAt')
      .lean();

    if (optedInUsers.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        totalDonors: 0,
        totalPages: 1,
        currentPage: pageNum,
        leaderboard: [],
        disclaimer: 'Academic simulation demonstration leaderboard.',
      });
    }

    const userIds = optedInUsers.map((u) => u._id);

    // 2. Aggregate donation statistics for opted-in users
    const donationStats = await Donation.aggregate([
      {
        $match: {
          donor: { $in: userIds },
          transactionStatus: 'Simulated',
          isSimulated: true,
        },
      },
      {
        $group: {
          _id: '$donor',
          totalSimulatedAmount: { $sum: '$amount' },
          donationCount: { $sum: 1 },
          uniqueCases: { $addToSet: '$rescueCase' },
        },
      },
    ]);

    const statsMap = new Map();
    donationStats.forEach((s) => {
      statsMap.set(s._id.toString(), {
        totalSimulatedAmount: s.totalSimulatedAmount || 0,
        donationCount: s.donationCount || 0,
        uniqueCasesCount: s.uniqueCases ? s.uniqueCases.length : 0,
      });
    });

    // 3. Aggregate badges count and badges highlights for opted-in users
    const userBadges = await UserAchievement.find({
      userId: { $in: userIds },
    })
      .populate('achievementId', 'name icon category')
      .sort({ earnedAt: -1 })
      .lean();

    const badgesMap = new Map();
    userBadges.forEach((ub) => {
      if (!ub.achievementId) return;
      const uid = ub.userId.toString();
      if (!badgesMap.has(uid)) {
        badgesMap.set(uid, []);
      }
      badgesMap.get(uid).push({
        name: ub.achievementId.name,
        icon: ub.achievementId.icon,
        category: ub.achievementId.category,
        earnedAt: ub.earnedAt,
      });
    });

    // 4. Build leaderboard records
    const allRanked = optedInUsers.map((u) => {
      const uid = u._id.toString();
      const stats = statsMap.get(uid) || {
        totalSimulatedAmount: 0,
        donationCount: 0,
        uniqueCasesCount: 0,
      };
      const badges = badgesMap.get(uid) || [];

      // Public display name sanitization
      const displayName =
        u.recognitionSettings?.displayName && u.recognitionSettings.displayName.trim()
          ? u.recognitionSettings.displayName.trim()
          : (u.name || 'Anonymous Supporter');

      const record = {
        _id: u._id,
        displayName,
        donationCount: stats.donationCount,
        uniqueCasesCount: stats.uniqueCasesCount,
        badgesCount: badges.length,
        recentBadges: badges.slice(0, 3), // highlight top 3 recent badges
      };

      // Only expose contribution total if user explicitly opted in
      if (u.recognitionSettings?.showDonationTotal) {
        record.totalSimulatedAmount = stats.totalSimulatedAmount;
        record.showsTotal = true;
      } else {
        record.showsTotal = false;
      }

      return record;
    });

    // 5. Sort deterministically:
    // Criteria: 1. donationCount (desc) -> 2. uniqueCasesCount (desc) -> 3. badgesCount (desc) -> 4. _id (asc)
    allRanked.sort((a, b) => {
      if (b.donationCount !== a.donationCount) {
        return b.donationCount - a.donationCount;
      }
      if (b.uniqueCasesCount !== a.uniqueCasesCount) {
        return b.uniqueCasesCount - a.uniqueCasesCount;
      }
      if (b.badgesCount !== a.badgesCount) {
        return b.badgesCount - a.badgesCount;
      }
      return String(a._id).localeCompare(String(b._id));
    });

    // 6. Assign ranks and paginate
    const totalDonors = allRanked.length;
    const skip = (pageNum - 1) * limitNum;
    const paginated = allRanked.slice(skip, skip + limitNum).map((rec, idx) => ({
      rank: skip + idx + 1,
      ...rec,
    }));

    res.status(200).json({
      success: true,
      count: paginated.length,
      totalDonors,
      totalPages: Math.ceil(totalDonors / limitNum) || 1,
      currentPage: pageNum,
      leaderboard: paginated,
      disclaimer: 'Academic simulation demonstration leaderboard.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin Achievement Management Endpoints
 */

/**
 * @route   GET /api/admin/achievements
 * @desc    Admin: list all achievements with recipient counts
 * @access  Private (Admin)
 */
export const getAdminAchievements = async (req, res, next) => {
  try {
    let achievements = await Achievement.find().sort({ createdAt: 1 }).lean();
    if (achievements.length === 0) {
      await seedAchievements();
      achievements = await Achievement.find().sort({ createdAt: 1 }).lean();
    }

    // Attach distribution statistics (count of donors who earned each badge)
    const counts = await UserAchievement.aggregate([
      { $group: { _id: '$achievementId', count: { $sum: 1 } } },
    ]);
    const countMap = new Map();
    counts.forEach((c) => countMap.set(c._id.toString(), c.count));

    const enriched = achievements.map((ach) => ({
      ...ach,
      recipientsCount: countMap.get(ach._id.toString()) || 0,
    }));

    res.status(200).json({
      success: true,
      count: enriched.length,
      achievements: enriched,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/admin/achievements
 * @desc    Admin: create new achievement badge definition
 * @access  Private (Admin)
 */
export const createAdminAchievement = async (req, res, next) => {
  try {
    const {
      name,
      slug,
      description,
      icon = 'Award',
      category = 'milestone',
      criteriaType,
      criteriaValue,
      isActive = true,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Badge name is required.' });
    }

    const cleanSlug = slug ? slug.trim().toLowerCase() : name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const existing = await Achievement.findOne({ slug: cleanSlug });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `An achievement badge with slug "${cleanSlug}" already exists.`,
      });
    }

    if (!['donation_count', 'distinct_cases', 'distinct_months'].includes(criteriaType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid criteriaType. Must be one of [donation_count, distinct_cases, distinct_months].',
      });
    }

    const val = Number(criteriaValue);
    if (!Number.isFinite(val) || val <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Criteria value threshold must be a positive number greater than 0.',
      });
    }

    const achievement = await Achievement.create({
      name: name.trim(),
      slug: cleanSlug,
      description: description ? description.trim() : 'Digital badge for animal rescue donors',
      icon: icon.trim(),
      category,
      criteriaType,
      criteriaValue: val,
      isActive: Boolean(isActive),
    });

    res.status(201).json({
      success: true,
      message: 'Achievement badge created successfully.',
      achievement,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/admin/achievements/:id
 * @desc    Admin: edit achievement badge description and criteria
 * @access  Private (Admin)
 */
export const updateAdminAchievement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, icon, category, criteriaType, criteriaValue, isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid achievement ID.' });
    }

    const achievement = await Achievement.findById(id);
    if (!achievement) {
      return res.status(404).json({ success: false, message: 'Achievement not found.' });
    }

    if (name && name.trim()) achievement.name = name.trim();
    if (description && description.trim()) achievement.description = description.trim();
    if (icon && icon.trim()) achievement.icon = icon.trim();
    if (category) achievement.category = category;
    if (criteriaType) achievement.criteriaType = criteriaType;
    if (criteriaValue !== undefined) {
      const val = Number(criteriaValue);
      if (Number.isFinite(val) && val > 0) achievement.criteriaValue = val;
    }
    if (isActive !== undefined) achievement.isActive = Boolean(isActive);

    await achievement.save();

    res.status(200).json({
      success: true,
      message: 'Achievement badge updated successfully.',
      achievement,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/admin/achievements/:id/status
 * @desc    Admin: activate or deactivate an achievement badge
 * @access  Private (Admin)
 */
export const toggleAdminAchievementStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid achievement ID.' });
    }

    const achievement = await Achievement.findById(id);
    if (!achievement) {
      return res.status(404).json({ success: false, message: 'Achievement not found.' });
    }

    achievement.isActive = isActive !== undefined ? Boolean(isActive) : !achievement.isActive;
    await achievement.save();

    res.status(200).json({
      success: true,
      message: `Achievement status set to ${achievement.isActive ? 'Active' : 'Inactive'}.`,
      achievement,
    });
  } catch (error) {
    next(error);
  }
};
