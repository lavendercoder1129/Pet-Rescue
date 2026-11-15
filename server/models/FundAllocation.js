import mongoose from 'mongoose';

const fundAllocationSchema = new mongoose.Schema(
  {
    rescueCase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RescueCase',
      required: [true, 'Fund allocation must be linked to a rescue case'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please specify an allocation amount in INR'],
      min: [1, 'Allocation amount must be at least ₹1'],
      validate: {
        validator: function (v) {
          return Number.isFinite(v) && v > 0;
        },
        message: 'Allocation amount must be a positive number',
      },
    },
    allocationCategory: {
      type: String,
      required: [true, 'Please select an allocation category'],
      enum: {
        values: [
          'Emergency treatment',
          'Medicines',
          'Surgery',
          'Food and nutrition',
          'Shelter',
          'Transportation',
          'Other',
        ],
        message: '{VALUE} is not a supported allocation category',
      },
      default: 'Emergency treatment',
    },
    description: {
      type: String,
      required: [true, 'Please provide an allocation justification / description'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    allocatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Allocation must be recorded by an administrator'],
    },
    allocationReference: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Partially Spent', 'Fully Spent', 'Cancelled'],
      default: 'Active',
      index: true,
    },

    // Expense Tracking Foundation (Preparation for Module 8)
    amountSpent: {
      type: Number,
      default: 0,
      min: [0, 'Amount spent cannot be negative'],
    },
    isSimulated: {
      type: Boolean,
      default: true,
      immutable: true,
    },
  },
  {
    timestamps: true,
  }
);

// High-speed index for retrieving allocations by case and chronological audit
fundAllocationSchema.index({ rescueCase: 1, createdAt: -1 });
fundAllocationSchema.index({ status: 1, createdAt: -1 });

export const FundAllocation = mongoose.model('FundAllocation', fundAllocationSchema);
export default FundAllocation;
