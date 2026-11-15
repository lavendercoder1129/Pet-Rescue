import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Donation must be linked to a registered user account'],
      index: true,
    },
    rescueCase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RescueCase',
      required: [true, 'Donation must be linked to an approved rescue case'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please specify a donation amount in INR'],
      min: [10, 'Minimum simulated donation is ₹10'],
      max: [500000, 'Maximum simulated donation is ₹500,000 per transaction'],
      validate: {
        validator: function (v) {
          return Number.isFinite(v) && v > 0;
        },
        message: 'Donation amount must be a valid positive number',
      },
    },
    currency: {
      type: String,
      default: 'INR',
      immutable: true,
    },
    donationReference: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
      trim: true,
    },
    donationMessage: {
      type: String,
      trim: true,
      maxlength: [500, 'Donation message cannot exceed 500 characters'],
      default: '',
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    idempotencyKey: {
      type: String,
      trim: true,
      sparse: true,
      index: true,
    },

    // Simulation Flags & Tracking
    transactionStatus: {
      type: String,
      enum: ['Simulated', 'Failed'],
      default: 'Simulated',
      required: true,
    },
    paymentMethod: {
      type: String,
      default: 'Simulation Only',
      immutable: true,
    },
    isSimulated: {
      type: Boolean,
      default: true,
      required: true,
      immutable: true,
    },
  },
  {
    timestamps: true,
  }
);

// High-performance indices for donor history and administrative audit
donationSchema.index({ donor: 1, createdAt: -1 });
donationSchema.index({ rescueCase: 1, createdAt: -1 });
donationSchema.index({ createdAt: -1 });

export const Donation = mongoose.model('Donation', donationSchema);
export default Donation;
