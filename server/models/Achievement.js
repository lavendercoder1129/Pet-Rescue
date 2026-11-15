import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide an achievement name'],
      trim: true,
      maxlength: [100, 'Achievement name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Please provide a unique slug for the badge'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide an achievement description'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    icon: {
      type: String,
      required: [true, 'Please provide an icon or illustration reference'],
      trim: true,
      default: 'Award', // Lucide icon key or asset identifier
    },
    category: {
      type: String,
      required: true,
      enum: {
        values: ['milestone', 'frequency', 'diversity', 'special'],
        message: '{VALUE} is not a valid achievement category',
      },
      default: 'milestone',
      index: true,
    },
    criteriaType: {
      type: String,
      required: true,
      enum: {
        values: ['donation_count', 'distinct_cases', 'distinct_months'],
        message: '{VALUE} is not a valid criteria type',
      },
      index: true,
    },
    criteriaValue: {
      type: Number,
      required: true,
      min: [1, 'Criteria threshold must be at least 1'],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Achievement = mongoose.model('Achievement', achievementSchema);
export default Achievement;
