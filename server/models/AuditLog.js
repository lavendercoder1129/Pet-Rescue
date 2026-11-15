import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RescueCase',
      required: [true, 'Case ID is required for audit history'],
      index: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Admin ID is required for audit history'],
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      enum: ['Approved', 'Rejected', 'Reopened', 'Resubmitted'],
    },
    previousStatus: {
      type: String,
      required: true,
    },
    newStatus: {
      type: String,
      required: true,
    },
    reviewNote: {
      type: String,
      trim: true,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Append-only
  }
);

// High-speed index for retrieving case audit trails
auditLogSchema.index({ caseId: 1, timestamp: -1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
