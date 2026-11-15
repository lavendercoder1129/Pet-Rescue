import mongoose from 'mongoose';

const proofDocumentSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    storagePath: {
      type: String,
      required: true,
    },
  },
  { _id: true, timestamps: { createdAt: true, updatedAt: false } }
);

const expenseSchema = new mongoose.Schema(
  {
    // Basic Information
    rescueCase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RescueCase',
      required: [true, 'Expense must be linked to a rescue case'],
      index: true,
    },
    fundAllocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FundAllocation',
      required: [true, 'Expense must be linked to an active fund allocation'],
      index: true,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Expense must be submitted by an authenticated rescuer'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide an expense title'],
      trim: true,
      maxlength: [140, 'Title cannot exceed 140 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a clinical or operational expense description'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    expenseCategory: {
      type: String,
      required: [true, 'Please select an expense category'],
      enum: {
        values: [
          'Veterinary consultation',
          'Medicines',
          'Surgery',
          'Medical tests',
          'Food and nutrition',
          'Transportation',
          'Shelter',
          'Other',
        ],
        message: '{VALUE} is not a valid expense category',
      },
    },
    amount: {
      type: Number,
      required: [true, 'Please specify the expense amount in INR'],
      min: [1, 'Expense amount must be at least ₹1'],
      validate: {
        validator: function (v) {
          return Number.isFinite(v) && v > 0;
        },
        message: 'Expense amount must be a positive number',
      },
    },
    expenseDate: {
      type: Date,
      required: [true, 'Please specify the date this expense was incurred'],
      validate: {
        validator: function (v) {
          return v instanceof Date && !isNaN(v.getTime()) && v <= new Date();
        },
        message: 'Expense date cannot be in the future',
      },
    },

    // Supporting Evidence
    proofDocuments: {
      type: [proofDocumentSchema],
      default: [],
      validate: {
        validator: function (docs) {
          return Array.isArray(docs) && docs.length > 0;
        },
        message: 'At least one proof document (bill, invoice, or receipt) is required',
      },
    },
    documentType: {
      type: String,
      trim: true,
      default: 'Hospital Invoice / Medical Bill',
    },
    documentDescription: {
      type: String,
      trim: true,
      default: '',
    },

    // Verification Workflow (Admin Controlled Only)
    verificationStatus: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewNote: {
      type: String,
      trim: true,
      default: '',
    },
    reviewedAt: {
      type: Date,
      default: null,
    },

    // Simulation Marker
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

// High-speed indices for rescuer history, admin review, and financial aggregates
expenseSchema.index({ rescueCase: 1, verificationStatus: 1 });
expenseSchema.index({ fundAllocation: 1, verificationStatus: 1 });
expenseSchema.index({ submittedBy: 1, createdAt: -1 });

export const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
