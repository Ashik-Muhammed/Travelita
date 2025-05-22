import { rtdb } from '../config/firebase';
import { ref, set, get } from 'firebase/database';

// Sample tour packages data
const samplePackages = [
  {
    id: 'package1',
    title: 'Magical Kerala Backwaters',
    destination: 'Kerala',
    duration: '5 days, 4 nights',
    description: 'Experience the serene backwaters of Kerala on a traditional houseboat. Visit spice plantations, tea gardens, and enjoy authentic Kerala cuisine.',
    price: 15999,
    available: true,
    status: 'approved',
    vendorId: 'admin',
    featured: true,
    rating: 4.8,
    reviewCount: 24,
    images: [
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1623071284168-93f1a3955329?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1609340442497-af6f9d11bd19?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80'
    ],
    inclusions: ['Accommodation', 'Meals (Breakfast, Lunch, Dinner)', 'Houseboat cruise', 'Sightseeing', 'Airport transfers'],
    itinerary: [
      { day: 1, title: 'Arrival in Kochi', description: 'Arrive at Kochi International Airport. Transfer to hotel. Evening Kathakali dance performance.' },
      { day: 2, title: 'Kochi to Munnar', description: 'Drive to Munnar. Visit tea plantations and spice gardens.' },
      { day: 3, title: 'Munnar to Thekkady', description: 'Drive to Thekkady. Spice plantation tour. Evening boat ride on Periyar Lake.' },
      { day: 4, title: 'Thekkady to Alleppey', description: 'Drive to Alleppey. Board houseboat for overnight stay. Cruise through backwaters.' },
      { day: 5, title: 'Departure', description: 'Disembark houseboat. Transfer to Kochi airport for departure.' }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'package2',
    title: 'Royal Rajasthan Tour',
    destination: 'Rajasthan',
    duration: '7 days, 6 nights',
    description: 'Explore the royal heritage of Rajasthan. Visit magnificent forts, palaces, and experience the vibrant culture of the desert state.',
    price: 24999,
    available: true,
    status: 'approved',
    vendorId: 'admin',
    featured: true,
    rating: 4.7,
    reviewCount: 32,
    images: [
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1617516202907-ff75846e6667?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1624461776145-2b5280d82b67?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80'
    ],
    inclusions: ['Accommodation', 'Meals (Breakfast)', 'Sightseeing', 'Airport transfers', 'English-speaking guide'],
    itinerary: [
      { day: 1, title: 'Arrival in Jaipur', description: 'Arrive at Jaipur Airport. Transfer to hotel. Evening visit to local markets.' },
      { day: 2, title: 'Jaipur Sightseeing', description: 'Visit Amber Fort, City Palace, Hawa Mahal, and Jantar Mantar.' },
      { day: 3, title: 'Jaipur to Jodhpur', description: 'Drive to Jodhpur. Evening at leisure.' },
      { day: 4, title: 'Jodhpur Sightseeing', description: 'Visit Mehrangarh Fort, Jaswant Thada, and Umaid Bhawan Palace.' },
      { day: 5, title: 'Jodhpur to Udaipur', description: 'Drive to Udaipur. En route visit Ranakpur Jain Temples.' },
      { day: 6, title: 'Udaipur Sightseeing', description: 'Visit City Palace, Saheliyon ki Bari, and enjoy a boat ride on Lake Pichola.' },
      { day: 7, title: 'Departure', description: 'Transfer to Udaipur airport for departure.' }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'package3',
    title: 'Himalayan Adventure',
    destination: 'Himachal Pradesh',
    duration: '6 days, 5 nights',
    description: 'Embark on an adventure in the Himalayas. Trek through scenic trails, camp under the stars, and experience the thrill of river rafting.',
    price: 18999,
    available: true,
    status: 'approved',
    vendorId: 'admin',
    featured: false,
    rating: 4.9,
    reviewCount: 18,
    images: [
      'https://images.unsplash.com/photo-1626016466112-4ce7186a16c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1585116938581-9d993743b56f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1626335500158-1ef3db42618d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80'
    ],
    inclusions: ['Accommodation', 'Meals (Breakfast, Lunch, Dinner)', 'Trekking equipment', 'Rafting', 'Airport transfers', 'Experienced guide'],
    itinerary: [
      { day: 1, title: 'Arrival in Manali', description: 'Arrive at Kullu-Manali Airport. Transfer to hotel in Manali. Evening at leisure.' },
      { day: 2, title: 'Manali Sightseeing', description: 'Visit Hadimba Temple, Manu Temple, and Vashisht Hot Springs.' },
      { day: 3, title: 'Manali to Solang Valley', description: 'Trek to Solang Valley. Overnight camping.' },
      { day: 4, title: 'Solang Valley Activities', description: 'Adventure activities including paragliding and zipline (optional, at extra cost).' },
      { day: 5, title: 'River Rafting', description: 'River rafting on Beas River. Return to Manali.' },
      { day: 6, title: 'Departure', description: 'Transfer to Kullu-Manali Airport for departure.' }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'package4',
    title: 'Golden Triangle Tour',
    destination: 'Delhi-Agra-Jaipur',
    duration: '5 days, 4 nights',
    description: 'Experience the classic Golden Triangle tour covering Delhi, Agra, and Jaipur. Visit iconic monuments including the Taj Mahal.',
    price: 16999,
    available: true,
    status: 'approved',
    vendorId: 'admin',
    featured: true,
    rating: 4.6,
    reviewCount: 42,
    images: [
      'https://images.unsplash.com/photo-1548013146-72479768bada?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80'
    ],
    inclusions: ['Accommodation', 'Meals (Breakfast)', 'Sightseeing', 'Airport transfers', 'English-speaking guide'],
    itinerary: [
      { day: 1, title: 'Arrival in Delhi', description: 'Arrive at Delhi Airport. Transfer to hotel. Evening visit to Qutub Minar.' },
      { day: 2, title: 'Delhi Sightseeing', description: 'Visit Red Fort, Jama Masjid, Humayun\'s Tomb, and India Gate.' },
      { day: 3, title: 'Delhi to Agra', description: 'Drive to Agra. Visit Taj Mahal and Agra Fort.' },
      { day: 4, title: 'Agra to Jaipur', description: 'Drive to Jaipur. En route visit Fatehpur Sikri.' },
      { day: 5, title: 'Jaipur and Departure', description: 'Morning visit to Amber Fort. Transfer to Jaipur Airport for departure.' }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'package5',
    title: 'Goa Beach Vacation',
    destination: 'Goa',
    duration: '4 days, 3 nights',
    description: 'Relax on the beautiful beaches of Goa. Enjoy water sports, beach parties, and delicious seafood.',
    price: 12999,
    available: true,
    status: 'approved',
    vendorId: 'admin',
    featured: false,
    rating: 4.5,
    reviewCount: 37,
    images: [
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1451312444386-78a708398d7e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80'
    ],
    inclusions: ['Accommodation', 'Meals (Breakfast)', 'Airport transfers', 'One water sport activity'],
    itinerary: [
      { day: 1, title: 'Arrival in Goa', description: 'Arrive at Goa Airport. Transfer to beach resort. Evening at leisure on the beach.' },
      { day: 2, title: 'North Goa Tour', description: 'Visit Calangute, Baga, and Anjuna beaches. Evening visit to a beach shack for dinner.' },
      { day: 3, title: 'South Goa Tour', description: 'Visit Colva and Palolem beaches. Water sports activities.' },
      { day: 4, title: 'Departure', description: 'Transfer to Goa Airport for departure.' }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'package6',
    title: 'Andaman Island Paradise',
    destination: 'Andaman Islands',
    duration: '6 days, 5 nights',
    description: 'Discover the pristine beaches and crystal-clear waters of the Andaman Islands. Snorkel in coral reefs and explore the lush rainforests.',
    price: 28999,
    available: true,
    status: 'approved',
    vendorId: 'admin',
    featured: true,
    rating: 4.9,
    reviewCount: 22,
    images: [
      'https://images.unsplash.com/photo-1589179447679-b6a27beb2120?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517627043994-d62e476f2eeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80'
    ],
    inclusions: ['Accommodation', 'Meals (Breakfast)', 'Ferry tickets', 'Sightseeing', 'Airport transfers', 'Snorkeling equipment'],
    itinerary: [
      { day: 1, title: 'Arrival in Port Blair', description: 'Arrive at Port Blair Airport. Transfer to hotel. Visit Cellular Jail and attend Light and Sound show.' },
      { day: 2, title: 'Port Blair to Havelock Island', description: 'Ferry to Havelock Island. Visit Radhanagar Beach.' },
      { day: 3, title: 'Havelock Island', description: 'Visit Elephant Beach for snorkeling and water activities.' },
      { day: 4, title: 'Havelock to Neil Island', description: 'Ferry to Neil Island. Visit Bharatpur and Laxmanpur beaches.' },
      { day: 5, title: 'Neil Island to Port Blair', description: 'Ferry back to Port Blair. Visit Chidiya Tapu for sunset.' },
      { day: 6, title: 'Departure', description: 'Transfer to Port Blair Airport for departure.' }
    ],
    createdAt: new Date().toISOString()
  }
];

// Function to populate the database with sample data
export const populateSampleData = async () => {
  try {
    // Check if packages already exist
    const packagesRef = ref(rtdb, 'packages');
    const packagesSnapshot = await get(packagesRef);
    
    if (!packagesSnapshot.exists()) {
      // Add sample packages to Firebase
      for (const pkg of samplePackages) {
        const packageRef = ref(rtdb, `packages/${pkg.id}`);
        await set(packageRef, pkg);
      }
      console.log('Sample packages added successfully!');
      return { success: true, message: 'Sample packages added successfully!' };
    } else {
      console.log('Packages already exist in the database.');
      return { success: false, message: 'Packages already exist in the database.' };
    }
  } catch (error) {
    console.error('Error adding sample packages:', error);
    return { success: false, message: `Error adding sample packages: ${error.message}` };
  }
};

// Export the sample packages for reference
export { samplePackages };
