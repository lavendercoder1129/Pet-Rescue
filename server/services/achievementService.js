import mongoose from 'mongoose';
import Achievement from '../models/Achievement.js';
import UserAchievement from '../models/UserAchievement.js';
import Donation from '../models/Donation.js';
import Notification from '../models/Notification.js';

export const DEFAULT_ACHIEVEMENTS = [
  {
    name: 'First Contribution',
    slug: 'first-contribution',
    description: 'Awarded when a donor completes their first successful simulated donation.',
    icon: 'Sparkles',
    category: 'milestone',
    criteriaType: 'donation_count',
    criteriaValue: 1,
    isActive: true,
  },
  {
    name: 'Helping Hand',
    slug: 'helping-hand',
    description: 'Awarded after completing 3 simulated donations.',
    icon: 'HeartHandshake',
    category: 'milestone',
    criteriaType: 'donation_count',
    criteriaValue: 3,
    isActive: true,
  },
  {
    name: 'Compassion Champion',
    slug: 'compassion-champion',
    description: 'Awarded after completing 5 simulated donations.',
    icon: 'Award',
    category: 'milestone',
    criteriaType: 'donation_count',
    criteriaValue: 5,
    isActive: true,
  },
  {
    name: 'Animal Advocate',
    slug: 'animal-advocate',
    description: 'Awarded after supporting 10 simulated donations.',
    icon: 'ShieldHeart',
    category: 'milestone',
    criteriaType: 'donation_count',
    criteriaValue: 10,
    isActive: true,
  },
  {
    name: 'Consistent Supporter',
    slug: 'consistent-supporter',
    description: 'Awarded when a donor contributes during 3 different calendar months.',
    icon: 'CalendarCheck',
    category: 'frequency',
    criteriaType: 'distinct_months',
    criteriaValue: 3,
    isActive: true,
  },
  {
    name: 'Rescue Supporter',
    slug: 'rescue-supporter',
    description: 'Awarded when a donor supports 3 different rescue cases.',
    icon: 'LifeBuoy',
    category: 'diversity',
    criteriaType: 'distinct_cases',
    criteriaValue: 3,
    isActive: true,
  },
];

/**
 * Seed initial achievement definitions idempotently
 */
export const seedAchievements = async () => {
  for (const item of DEFAULT_ACHIEVEMENTS) {
    await Achievement.findOneAndUpdate(
      { slug: item.slug },
      { $setOnInsert: item },
      { upsert: true, new: true }
    );
  }
};

/**
 * Evaluate achievements for a donor after a successful simulated donation.
 * Source of truth: completed, successful simulated donations only.
 * Idempotent: Never awards duplicate achievements.
 */
export const evaluateUserAchievements = async (userId) => {
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) return [];

  // Ensure initial definitions exist in database
  const activeAchievements = await Achievement.find({ isActive: true });
  if (activeAchievements.length === 0) {
    await seedAchievements();
  }

  // 1. Fetch all valid simulated donations for this donor
  const donations = await Donation.find({
    donor: userId,
    transactionStatus: 'Simulated',
    isSimulated: true,
  }).select('amount rescueCase createdAt').lean();

  const totalDonationsCount = donations.length;

  // Distinct rescue cases supported
  const distinctCaseIds = new Set(
    donations.map((d) => d.rescueCase?.toString()).filter(Boolean)
  );
  const distinctCasesCount = distinctCaseIds.size;

  // Distinct calendar months with contributions (format YYYY-MM)
  const distinctMonthsSet = new Set(
    donations.map((d) => {
      const dt = new Date(d.createdAt);
      return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
    })
  );
  const distinctMonthsCount = distinctMonthsSet.size;

  // 2. Fetch already earned achievements for this user
  const existingUserAchievements = await UserAchievement.find({ userId })
    .select('achievementId')
    .lean();
  const earnedSet = new Set(
    existingUserAchievements.map((ua) => ua.achievementId.toString())
  );

  // 3. Evaluate each active achievement
  const newlyAwarded = [];

  for (const achievement of activeAchievements) {
    if (earnedSet.has(achievement._id.toString())) {
      continue; // Already earned, guarantee idempotency
    }

    let isEligible = false;
    let currentProgressValue = 0;

    switch (achievement.criteriaType) {
      case 'donation_count':
        currentProgressValue = totalDonationsCount;
        isEligible = totalDonationsCount >= achievement.criteriaValue;
        break;
      case 'distinct_cases':
        currentProgressValue = distinctCasesCount;
        isEligible = distinctCasesCount >= achievement.criteriaValue;
        break;
      case 'distinct_months':
        currentProgressValue = distinctMonthsCount;
        isEligible = distinctMonthsCount >= achievement.criteriaValue;
        break;
      default:
        isEligible = false;
    }

    if (isEligible) {
      try {
        const userAch = await UserAchievement.create({
          userId,
          achievementId: achievement._id,
          earnedAt: new Date(),
          metadata: {
            criteriaValue: achievement.criteriaValue,
            achievedAtValue: currentProgressValue,
          },
        });

        newlyAwarded.push({
          ...achievement.toObject(),
          earnedAt: userAch.earnedAt,
        });

        // Trigger in-app notification
        await Notification.create({
          recipient: userId,
          title: `New Badge Earned: ${achievement.name} 🏆`,
          message: `Congratulations! You unlocked the "${achievement.name}" badge: ${achievement.description}`,
        }).catch(() => {});
      } catch (err) {
        // Handle race conditions safely (unique index on userId + achievementId)
        if (err.code !== 11000) {
          console.error('[AchievementService] Error awarding achievement:', err);
        }
      }
    }
  }

  return newlyAwarded;
};

/**
 * Compute progress across all active achievements for a donor
 */
export const getUserAchievementsWithProgress = async (userId) => {
  // Ensure default badges exist
  let allAchievements = await Achievement.find({ isActive: true }).lean();
  if (allAchievements.length === 0) {
    await seedAchievements();
    allAchievements = await Achievement.find({ isActive: true }).lean();
  }

  // Fetch valid simulated donations
  const donations = await Donation.find({
    donor: userId,
    transactionStatus: 'Simulated',
    isSimulated: true,
  }).select('amount rescueCase createdAt').lean();

  const totalDonationsCount = donations.length;
  const distinctCasesCount = new Set(
    donations.map((d) => d.rescueCase?.toString()).filter(Boolean)
  ).size;
  const distinctMonthsCount = new Set(
    donations.map((d) => {
      const dt = new Date(d.createdAt);
      return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
    })
  ).size;

  // Fetch user's earned badges
  const earnedDocs = await UserAchievement.find({ userId })
    .populate('achievementId')
    .sort({ earnedAt: -1 })
    .lean();

  const earnedMap = new Map();
  earnedDocs.forEach((doc) => {
    if (doc.achievementId) {
      earnedMap.set(doc.achievementId._id.toString(), doc.earnedAt);
    }
  });

  const badges = allAchievements.map((ach) => {
    const isEarned = earnedMap.has(ach._id.toString());
    const earnedAt = isEarned ? earnedMap.get(ach._id.toString()) : null;

    let current = 0;
    switch (ach.criteriaType) {
      case 'donation_count':
        current = totalDonationsCount;
        break;
      case 'distinct_cases':
        current = distinctCasesCount;
        break;
      case 'distinct_months':
        current = distinctMonthsCount;
        break;
    }

    const target = ach.criteriaValue;
    const progressPercent = isEarned
      ? 100
      : Math.min(100, Math.round((current / (target || 1)) * 100));

    return {
      _id: ach._id,
      name: ach.name,
      slug: ach.slug,
      description: ach.description,
      icon: ach.icon,
      category: ach.category,
      criteriaType: ach.criteriaType,
      criteriaValue: target,
      currentValue: Math.min(current, target),
      isEarned,
      earnedAt,
      progressPercent,
      progressText: isEarned
        ? 'Completed'
        : `${Math.min(current, target)} of ${target} ${
            ach.criteriaType === 'distinct_months'
              ? 'calendar months'
              : ach.criteriaType === 'distinct_cases'
              ? 'cases'
              : 'donations'
          }`,
    };
  });

  return {
    badges,
    totalEarned: earnedMap.size,
    totalAvailable: allAchievements.length,
    stats: {
      totalDonationsCount,
      distinctCasesCount,
      distinctMonthsCount,
    },
  };
};

export default {
  seedAchievements,
  evaluateUserAchievements,
  getUserAchievementsWithProgress,
};
