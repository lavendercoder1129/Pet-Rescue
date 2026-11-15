import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an announcement title'],
      trim: true,
      maxlength: [140, 'Title cannot exceed 140 characters'],
    },
    message: {
      type: String,
      required: [true, 'Please provide announcement content'],
      trim: true,
      maxlength: [3000, 'Message cannot exceed 3000 characters'],
    },
    type: {
      type: String,
      required: true,
      enum: {
        values: ['general', 'urgent', 'emergency'],
        message: '{VALUE} is not a valid announcement type',
      },
      default: 'general',
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ['draft', 'published', 'archived'],
        message: '{VALUE} is not a valid announcement status',
      },
      default: 'draft',
      index: true,
    },
    priority: {
      type: Number,
      default: 0, // Higher numbers indicate higher priority
      min: 0,
      max: 10,
    },
    startAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      default: null, // null means no expiration
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author reference is required'],
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    isSimulated: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast active announcements lookup: published, startAt <= now, (expiresAt is null or > now)
announcementSchema.index({ status: 1, type: 1, startAt: 1, expiresAt: 1, priority: -1 });

const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;
