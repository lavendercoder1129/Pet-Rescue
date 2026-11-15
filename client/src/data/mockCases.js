import brunoImg from '../assets/images/bruno.jpg';
import lunaImg from '../assets/images/luna.jpg';
import maxImg from '../assets/images/max.jpg';
import bellaImg from '../assets/images/bella.jpg';

/**
 * Explicitly fictional demonstration campaign data for academic project simulation.
 */
export const mockCases = [
  {
    id: 'case-bruno',
    slug: 'bruno-injured-street-dog',
    name: 'Bruno',
    title: 'Bruno — Street Dog with Pelvic Fracture',
    animalType: 'Dog',
    breed: 'Indie / Street Dog',
    location: 'Sector 14, Old Town Market',
    injuryDescription: 'Discovered immobile near construction site after a vehicular collision. X-ray confirmed non-displaced pelvic fracture requiring 4 weeks immobilization and pain management.',
    urgency: 'critical',
    currentAmount: 9200,
    targetAmount: 14000,
    donorCount: 28,
    image: brunoImg,
    fallbackImage: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
    admissionDate: '12 Nov 2026',
    veterinaryClinic: 'Hope Animal Trauma Clinic',
    status: 'In Treatment',
    summary: 'Requires anti-inflammatory medication, weekly checkups, and specialized high-protein recovery diet.'
  },
  {
    id: 'case-luna',
    slug: 'luna-abandoned-kitten-treatment',
    name: 'Luna',
    title: 'Luna — Abandoned Kitten Needing Treatment',
    animalType: 'Kitten',
    breed: 'Domestic Short-hair',
    location: 'Koramangala 5th Block',
    injuryDescription: 'Found shivering in open drain with acute respiratory infection and severe bilateral conjunctivitis. Undergoing oxygen nebulization and antibacterial eye drops.',
    urgency: 'urgent',
    currentAmount: 3400,
    targetAmount: 4800,
    donorCount: 16,
    image: lunaImg,
    fallbackImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
    admissionDate: '13 Nov 2026',
    veterinaryClinic: 'Care & Cure Feline Ward',
    status: 'Stabilizing',
    summary: 'Responding well to antibiotics; bottle feeding schedule every 4 hours.'
  },
  {
    id: 'case-max',
    slug: 'max-accident-injured-stray-dog',
    name: 'Max',
    title: 'Max — Accident-Injured Stray Dog',
    animalType: 'Dog',
    breed: 'Indie Hound Cross',
    location: 'Outer Ring Road, Flyover Pier 42',
    injuryDescription: 'Suffered deep laceration along left flank after road collision. Wound has been debrided, sutured with 14 stitches, and requires daily antiseptic flush dressings.',
    urgency: 'urgent',
    currentAmount: 6800,
    targetAmount: 8500,
    donorCount: 21,
    image: maxImg,
    fallbackImage: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
    admissionDate: '10 Nov 2026',
    veterinaryClinic: 'Metro Paws Surgical Unit',
    status: 'In Recovery',
    summary: 'Infection successfully prevented; expected stitch removal in 8 days.'
  },
  {
    id: 'case-bella',
    slug: 'bella-puppy-needing-medical-care',
    name: 'Bella',
    title: 'Bella — Puppy Needing Medical Care',
    animalType: 'Puppy',
    breed: 'Indie Mix',
    location: 'Whitefield Green Glen',
    injuryDescription: '8-week-old puppy found suffering from acute tick fever and severe anemia. Requires supportive hematinic injections, fluid electrolyte therapy, and immune boosters.',
    urgency: 'normal',
    currentAmount: 5100,
    targetAmount: 5500,
    donorCount: 19,
    image: bellaImg,
    fallbackImage: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80',
    admissionDate: '14 Nov 2026',
    veterinaryClinic: 'Sunrise Animal Care Center',
    status: 'Recovering',
    summary: 'Platelet counts recovering steadily; active and eating solid meals.'
  }
];

export const mockImpactStats = [
  {
    title: 'Animals Rescued',
    value: '184',
    subtitle: 'Simulated treated strays',
    colorScheme: 'forest'
  },
  {
    title: 'Active Rescue Cases',
    value: '12',
    subtitle: 'Undergoing treatment today',
    colorScheme: 'orange'
  },
  {
    title: 'Supporters',
    value: '1,420',
    subtitle: 'Simulated community donors',
    colorScheme: 'sage'
  },
  {
    title: 'Funds Tracked',
    value: '₹3,92,400',
    subtitle: '100% verified allocation',
    colorScheme: 'forest'
  }
];

export const mockTransparencyFinancials = {
  collected: 392400,
  allocated: 350000,
  spent: 284500,
  verified: 284500,
  remaining: 107900
};
