import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import RescueCase from '../models/RescueCase.js';

dotenv.config();

/**
 * Seed realistic demonstration rescue cases for development.
 * All amounts and patient names are explicitly simulated demonstration data.
 */
export const seedDemonstrationCases = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pet_rescue';
  console.log(`Connecting to MongoDB at ${uri}...`);
  await mongoose.connect(uri);

  // Ensure an approved rescuer exists for attributing seed cases
  let rescuer = await User.findOne({ email: 'seed_rescuer@petrescue.example' });
  if (!rescuer) {
    const passwordHash = await User.hashPassword('RescuerPass2026!');
    rescuer = await User.create({
      name: 'Priya Sundaram (Lead Rescuer)',
      email: 'seed_rescuer@petrescue.example',
      phone: '+91 98450 12345',
      passwordHash,
      role: 'rescuer',
      rescuerVerificationStatus: 'approved',
      isActive: true,
    });
    console.log('Created approved demonstration rescuer: seed_rescuer@petrescue.example');
  } else if (rescuer.rescuerVerificationStatus !== 'approved') {
    rescuer.rescuerVerificationStatus = 'approved';
    await rescuer.save();
  }

  // Ensure an admin exists
  let admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    const passwordHash = await User.hashPassword('AdminPass2026!');
    admin = await User.create({
      name: 'System Administrator',
      email: 'admin@petrescue.example',
      phone: '+91 98000 00000',
      passwordHash,
      role: 'admin',
      rescuerVerificationStatus: 'not_applicable',
      isActive: true,
    });
    console.log('Created admin account for seed verification');
  }

  // Check existing seed cases
  const existingCount = await RescueCase.countDocuments();
  if (existingCount > 0) {
    console.log(`Database already has ${existingCount} rescue cases. Re-seeding clean demo dataset...`);
    await RescueCase.deleteMany({});
  }

  const demoCases = [
    {
      title: 'Bruno — Injured Street Dog with Pelvic Fracture',
      animalName: 'Bruno',
      animalType: 'Dog',
      breed: 'Indie Hound Cross',
      age: '3 years approx',
      gender: 'Male',
      location: 'Sector 14, Old Town Market, Bangalore',
      description:
        'Bruno was discovered immobile near a construction barrier after an alleged hit-and-run collision. On-ground rescuers transported him to Hope Animal Trauma Clinic where radiography revealed a non-displaced pelvic wing fracture.',
      injuryType: 'Pelvic Fracture & Soft Tissue Trauma',
      injuryDescription:
        'Non-displaced pelvic wing fracture and extensive deep bruising along left hind quarter. Patient cannot support weight on hind limbs without vocal distress.',
      medicalCondition:
        'Stable cardiovascular vitals; pain managed with analgesics and anti-inflammatory therapy. Strict cage rest and physiotherapy required for 4 weeks.',
      urgencyLevel: 'Critical',
      estimatedTreatmentCost: 14000,
      fundraisingGoal: 14000,
      amountCollected: 9200,
      campaignStatus: 'Active',
      verificationStatus: 'Approved',
      reviewedBy: admin._id,
      reviewNote: 'Clinic invoices and radiographic plates verified. Dr. Rao registration confirmed.',
      reviewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      images: ['https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80'],
      createdBy: rescuer._id,
    },
    {
      title: 'Luna — Abandoned Kitten Requiring Treatment',
      animalName: 'Luna',
      animalType: 'Cat',
      breed: 'Domestic Short-hair',
      age: '5 weeks',
      gender: 'Female',
      location: 'Koramangala 5th Block, Near Central Park',
      description:
        'Found drenched in a roadside stormwater ditch shivering and malnourished. Diagnosed with acute bilateral conjunctivitis and upper respiratory feline infection.',
      injuryType: 'Acute Conjunctivitis & Malnutrition',
      injuryDescription:
        'Eyes completely crusted shut with purulent discharge; hypothermia and dehydration grade 2.',
      medicalCondition:
        'Undergoing antibacterial ophthalmic drops, aerosol nebulization, and specialized warm kitten milk formula schedule every 3 hours.',
      urgencyLevel: 'Urgent',
      estimatedTreatmentCost: 4800,
      fundraisingGoal: 4800,
      amountCollected: 3400,
      campaignStatus: 'Active',
      verificationStatus: 'Approved',
      reviewedBy: admin._id,
      reviewNote: 'Admitted in isolation feline ward. Approved for simulated community support.',
      reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      images: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80'],
      createdBy: rescuer._id,
    },
    {
      title: 'Max — Accident-Injured Stray Dog',
      animalName: 'Max',
      animalType: 'Dog',
      breed: 'Indie Street Dog',
      age: '2 years approx',
      gender: 'Male',
      location: 'Outer Ring Road, Flyover Pier 42',
      injuryDescription:
        'Deep laceration measuring 12cm across left lateral flank following high-speed glancing impact with a two-wheeler. Muscle layer exposed but no abdominal puncture.',
      injuryType: 'Deep Flank Laceration',
      medicalCondition:
        'Emergency debridement and 14 surgical sutures completed under general anesthesia. Requires daily antiseptic flush and protective collar.',
      description:
        'Max is a beloved friendly community dog who met with an accident on the busy ring road. He is now safely admitted at Metro Paws Surgical Unit.',
      urgencyLevel: 'Urgent',
      estimatedTreatmentCost: 8500,
      fundraisingGoal: 8500,
      amountCollected: 6800,
      campaignStatus: 'Active',
      verificationStatus: 'Approved',
      reviewedBy: admin._id,
      reviewNote: 'Surgery receipts and postoperative photos inspected.',
      reviewedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      images: ['https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80'],
      createdBy: rescuer._id,
    },
    {
      title: 'Bella — Puppy Requiring Medical Care',
      animalName: 'Bella',
      animalType: 'Dog',
      breed: 'Indie Terrier Mix',
      age: '8 weeks',
      gender: 'Female',
      location: 'Whitefield Green Glen Layout',
      injuryDescription:
        'Severe tick infestation causing acute babesiosis (tick fever) and severe regenerative anemia with pale mucous membranes.',
      injuryType: 'Acute Tick Fever & Anemia',
      medicalCondition:
        'Intravenous fluid therapy, doxycycline protocol, hematinic iron supplementation, and daily CBC platelet monitoring.',
      description:
        'Found abandoned in a cardboard box near a garbage disposal point. Her platelet count dropped critically but has stabilized over the last 48 hours.',
      urgencyLevel: 'Normal',
      estimatedTreatmentCost: 5500,
      fundraisingGoal: 5500,
      amountCollected: 5100,
      campaignStatus: 'Active',
      verificationStatus: 'Approved',
      reviewedBy: admin._id,
      reviewNote: 'Diagnostic lab panel verified.',
      reviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      images: ['https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80'],
      createdBy: rescuer._id,
    },
    {
      title: 'Koko — Abandoned Community Kitten with Fractured Paw',
      animalName: 'Koko',
      animalType: 'Cat',
      breed: 'Indie Tabby',
      age: '4 months',
      gender: 'Male',
      location: 'Indiranagar 12th Main',
      injuryDescription:
        'Metatarsal fracture on front right paw after getting trapped in iron gate.',
      injuryType: 'Metatarsal Bone Fracture',
      medicalCondition:
        'Splint applied; requiring anti-inflammatory medication and follow-up X-ray.',
      description:
        'Pending review submission awaiting administrative verification and hospital estimate review.',
      urgencyLevel: 'Urgent',
      estimatedTreatmentCost: 3800,
      fundraisingGoal: 3800,
      amountCollected: 0,
      campaignStatus: 'Pending',
      verificationStatus: 'Pending', // Demonstrates a Pending case
      images: ['https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=80'],
      createdBy: rescuer._id,
    },
  ];

  await RescueCase.insertMany(demoCases);
  console.log(`Successfully seeded ${demoCases.length} demonstration rescue cases!`);
  await mongoose.disconnect();
};

seedDemonstrationCases();
