import { ref, set, push } from 'firebase/database';
import { rtdb } from '../config/firebase';

// Sample data for tour packages
const samplePackages = [
  {
    title: 'Beach Paradise Getaway',
    description: 'Enjoy a relaxing vacation on pristine beaches with crystal clear waters.',
    destination: 'Goa',
    duration: '5 days',
    price: 15000,
    included: ['Hotel stay', 'Breakfast', 'Airport transfer', 'Sightseeing'],
    itinerary: [
      { day: 1, title: 'Arrival', description: 'Arrive at the destination and check-in to hotel.' },
      { day: 2, title: 'Beach Day', description: 'Spend the day at the beach with water activities.' },
      { day: 3, title: 'Sightseeing', description: 'Visit local attractions and landmarks.' },
      { day: 4, title: 'Free Day', description: 'Free day to explore on your own.' },
      { day: 5, title: 'Departure', description: 'Check-out and departure.' }
    ],
    images: ['https://via.placeholder.com/800x600?text=Beach+Paradise'],
    available: true,
    featured: true,
    status: 'approved',
    createdAt: Date.now(),
    views: 120,
    ratings: 4.5,
    vendorId: 'vendor1'
  },
  {
    title: 'Mountain Adventure Trek',
    description: 'Experience the thrill of trekking through beautiful mountain trails.',
    destination: 'Himachal Pradesh',
    duration: '7 days',
    price: 25000,
    included: ['Hotel stay', 'All meals', 'Transport', 'Guide', 'Equipment'],
    itinerary: [
      { day: 1, title: 'Arrival', description: 'Arrive at base camp and briefing.' },
      { day: 2, title: 'Start Trek', description: 'Begin the trek to first checkpoint.' },
      { day: 3, title: 'Continue Trek', description: 'Trek to second checkpoint.' },
      { day: 4, title: 'Summit Day', description: 'Reach the summit and enjoy the view.' },
      { day: 5, title: 'Return Trek', description: 'Begin return journey.' },
      { day: 6, title: 'Final Descent', description: 'Complete the trek back to base.' },
      { day: 7, title: 'Departure', description: 'Return to city and departure.' }
    ],
    images: ['https://via.placeholder.com/800x600?text=Mountain+Adventure'],
    available: true,
    featured: true,
    status: 'approved',
    createdAt: Date.now(),
    views: 85,
    ratings: 4.7,
    vendorId: 'vendor2'
  },
  {
    title: 'Cultural Heritage Tour',
    description: 'Explore the rich cultural heritage and historical monuments.',
    destination: 'Rajasthan',
    duration: '6 days',
    price: 18000,
    included: ['Hotel stay', 'Breakfast', 'Transport', 'Guide', 'Entry tickets'],
    itinerary: [
      { day: 1, title: 'Arrival', description: 'Arrive and check-in to heritage hotel.' },
      { day: 2, title: 'City Palace', description: 'Visit the magnificent City Palace.' },
      { day: 3, title: 'Forts Tour', description: 'Explore ancient forts and their history.' },
      { day: 4, title: 'Local Culture', description: 'Experience local culture and cuisine.' },
      { day: 5, title: 'Handicrafts', description: 'Visit local markets and handicraft centers.' },
      { day: 6, title: 'Departure', description: 'Check-out and departure.' }
    ],
    images: ['https://via.placeholder.com/800x600?text=Cultural+Heritage'],
    available: true,
    featured: true,
    status: 'approved',
    createdAt: Date.now(),
    views: 110,
    ratings: 4.3,
    vendorId: 'vendor1'
  },
  {
    title: 'Budget Backpacking Trip',
    description: 'Perfect for budget travelers who want to explore without spending too much.',
    destination: 'Kerala',
    duration: '4 days',
    price: 8000,
    included: ['Hostel stay', 'Breakfast', 'Local transport pass'],
    itinerary: [
      { day: 1, title: 'Arrival', description: 'Arrive and check-in to hostel.' },
      { day: 2, title: 'Backwaters', description: 'Explore the famous backwaters.' },
      { day: 3, title: 'Tea Gardens', description: 'Visit tea plantations and spice gardens.' },
      { day: 4, title: 'Departure', description: 'Check-out and departure.' }
    ],
    images: ['https://via.placeholder.com/800x600?text=Budget+Backpacking'],
    available: true,
    featured: true,
    status: 'approved',
    createdAt: Date.now(),
    views: 200,
    ratings: 4.0,
    vendorId: 'vendor3'
  },
  {
    title: 'Wildlife Safari Experience',
    description: 'Get up close with nature and wildlife in their natural habitat.',
    destination: 'Madhya Pradesh',
    duration: '5 days',
    price: 22000,
    included: ['Resort stay', 'All meals', 'Safari rides', 'Guide', 'Transport'],
    itinerary: [
      { day: 1, title: 'Arrival', description: 'Arrive at wildlife resort and orientation.' },
      { day: 2, title: 'Morning Safari', description: 'Early morning safari to spot wildlife.' },
      { day: 3, title: 'Bird Watching', description: 'Bird watching and nature walk.' },
      { day: 4, title: 'Evening Safari', description: 'Evening safari for nocturnal animals.' },
      { day: 5, title: 'Departure', description: 'Final safari and departure.' }
    ],
    images: ['https://via.placeholder.com/800x600?text=Wildlife+Safari'],
    available: true,
    featured: true,
    status: 'approved',
    createdAt: Date.now(),
    views: 150,
    ratings: 4.8,
    vendorId: 'vendor2'
  },
  {
    title: 'Island Hopping Adventure',
    description: 'Explore multiple islands and enjoy various water activities.',
    destination: 'Andaman',
    duration: '8 days',
    price: 35000,
    included: ['Resort stay', 'Breakfast', 'Ferry tickets', 'Some activities'],
    itinerary: [
      { day: 1, title: 'Arrival', description: 'Arrive at main island and check-in.' },
      { day: 2, title: 'Snorkeling', description: 'Snorkeling and beach activities.' },
      { day: 3, title: 'Island 1', description: 'Visit first island and explore.' },
      { day: 4, title: 'Island 2', description: 'Visit second island and water activities.' },
      { day: 5, title: 'Scuba Diving', description: 'Optional scuba diving experience.' },
      { day: 6, title: 'Island 3', description: 'Visit third island and local culture.' },
      { day: 7, title: 'Free Day', description: 'Free day to relax or explore.' },
      { day: 8, title: 'Departure', description: 'Check-out and departure.' }
    ],
    images: ['https://via.placeholder.com/800x600?text=Island+Hopping'],
    available: true,
    featured: true,
    status: 'approved',
    createdAt: Date.now(),
    views: 90,
    ratings: 4.6,
    vendorId: 'vendor1'
  }
];

// Function to initialize the database with sample data
export const initializeDatabase = async () => {
  try {
    const packagesRef = ref(rtdb, 'tourPackages');
    
    // Add each sample package to the database
    for (const packageData of samplePackages) {
      const newPackageRef = push(packagesRef);
      await set(newPackageRef, packageData);
      console.log(`Added package: ${packageData.title}`);
    }
    
    console.log('Database initialization complete!');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
};

// Create a button component to trigger database initialization
export const InitializeDatabaseButton = ({ onInitialize }) => {
  const handleInitialize = async () => {
    const success = await initializeDatabase();
    if (onInitialize) {
      onInitialize(success);
    }
  };
  
  return {
    handleInitialize
  };
};
