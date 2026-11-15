import mongoose from 'mongoose';

const rescueCaseSchema = new mongoose.Schema(
  {
    // Basic Information
    title: {
      type: String,
      required: [true, 'Please provide a case title'],
      trim: true,
      maxlength: [140, 'Title cannot exceed 140 characters'],
    },
    animalName: {
      type: String,
      required: [true, 'Please provide the animal name or temporary identifier'],
      trim: true,
      maxlength: [60, 'Animal name cannot exceed 60 characters'],
    },
    animalType: {
      type: String,
      required: [true, 'Please specify animal type (Dog, Cat, or Other)'],
      enum: {
        values: ['Dog', 'Cat', 'Other'],
        message: '{VALUE} is not a supported animal type',
      },
      default: 'Dog',
    },
    breed: {
      type: String,
      trim: true,
      default: 'Indie / Mixed Breed',
    },
    age: {
      type: String,
      trim: true,
      default: 'Unknown Age',
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Unknown'],
      default: 'Unknown',
    },
    location: {
      type: String,
      required: [true, 'Please specify the rescue location / landmark'],
      trim: true,
      maxlength: [200, 'Location description cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide an overall case description'],
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },

    // Medical Information
    injuryType: {
      type: String,
      required: [true, 'Please specify injury type (e.g. Fracture, Hit-and-Run, Infection)'],
      trim: true,
      maxlength: [100, 'Injury type cannot exceed 100 characters'],
    },
    injuryDescription: {
      type: String,
      required: [true, 'Please describe physical trauma and clinical symptoms'],
      trim: true,
      maxlength: [2000, 'Injury description cannot exceed 2000 characters'],
    },
    medicalCondition: {
      type: String,
      required: [true, 'Please describe current clinical diagnosis / condition'],
      trim: true,
      maxlength: [2000, 'Medical condition cannot exceed 2000 characters'],
    },
    urgencyLevel: {
      type: String,
      required: [true, 'Please specify urgency level'],
      enum: {
        values: ['Critical', 'Urgent', 'Normal'],
        message: '{VALUE} is not a valid urgency level',
      },
      default: 'Urgent',
    },

    // Campaign Information (Simulated Platform)
    estimatedTreatmentCost: {
      type: Number,
      required: [true, 'Please specify estimated treatment cost in INR'],
      min: [100, 'Treatment cost must be at least ₹100'],
    },
    fundraisingGoal: {
      type: Number,
      required: [true, 'Please specify fundraising goal in INR'],
      min: [100, 'Fundraising goal must be at least ₹100'],
    },
    amountCollected: {
      type: Number,
      default: 0,
      min: [0, 'Amount collected cannot be negative'],
    },
    campaignStatus: {
      type: String,
      enum: ['Pending', 'Active', 'Resolved', 'Rejected'],
      default: 'Pending',
    },
    images: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A rescue case must be linked to a registered rescuer'],
    },

    // Verification Information (Admin Controlled Only)
    verificationStatus: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
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
  },
  {
    timestamps: true,
  }
);

// Indexes for high-performance public search and admin triage
rescueCaseSchema.index({ verificationStatus: 1, campaignStatus: 1 });
rescueCaseSchema.index({ urgencyLevel: 1 });
rescueCaseSchema.index({ animalType: 1 });
rescueCaseSchema.index({ title: 'text', animalName: 'text', location: 'text' });
rescueCaseSchema.index({ createdBy: 1 });

export const RescueCase = mongoose.model('RescueCase', rescueCaseSchema);
export default RescueCase;
