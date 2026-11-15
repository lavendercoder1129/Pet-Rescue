import mongoose from 'mongoose';

const rescueUpdateSchema = new mongoose.Schema(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RescueCase',
      required: [true, 'Rescue update must be linked to a rescue case'],
      index: true,
    },
    rescuerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Rescue update must be submitted by an authenticated rescuer'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide an update title'],
      trim: true,
      maxlength: [140, 'Title cannot exceed 140 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a progress report description'],
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ['pending', 'published', 'rejected'],
        message: '{VALUE} is not a valid status',
      },
      default: 'pending',
      index: true,
    },
    milestone: {
      type: String,
      required: [true, 'Please select a recovery milestone'],
      enum: {
        values: [
          'rescued',
          'veterinary examination',
          'treatment',
          'recovering',
          'recovered',
          'released',
          'other',
        ],
        message: '{VALUE} is not a valid milestone',
      },
      default: 'treatment',
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (v) {
          return v.length <= 5;
        },
        message: 'A maximum of 5 images can be attached per rescue update',
      },
    },
    adminFeedback: {
      type: String,
      trim: true,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
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

// Compound index for querying published updates by case in chronological order
rescueUpdateSchema.index({ caseId: 1, status: 1, createdAt: -1 });
rescueUpdateSchema.index({ rescuerId: 1, createdAt: -1 });

const RescueUpdate = mongoose.model('RescueUpdate', rescueUpdateSchema);
export default RescueUpdate;
