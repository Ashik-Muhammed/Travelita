import React, { useState } from 'react';
import { auth, rtdb } from '../config/firebase';
import { ref, set, push } from 'firebase/database';
import { useNavigate } from 'react-router-dom';

const VendorDatabaseInit = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const initializeVendorPackages = async () => {
    try {
      setLoading(true);
      setMessage('Initializing sample tour packages...');

      // Check if user is authenticated
      const user = auth.currentUser;
      if (!user) {
        setMessage('You must be logged in to initialize data');
        setLoading(false);
        return;
      }

      // Sample tour packages data
      const samplePackages = [
        {
          title: 'Exotic Goa Beach Retreat',
          description: 'Experience the pristine beaches and vibrant nightlife of Goa in this 5-day retreat package.',
          destination: 'Goa',
          duration: '5 days, 4 nights',
          price: 15000,
          vendorId: user.uid,
          included: ['Hotel accommodation', 'Daily breakfast', 'Airport transfers', 'Sightseeing tours'],
          itinerary: [
            { day: 1, title: 'Arrival', description: 'Airport pickup and check-in to hotel. Evening free for leisure.' },
            { day: 2, title: 'North Goa Tour', description: 'Visit famous beaches like Baga, Calangute, and Anjuna.' },
            { day: 3, title: 'South Goa Tour', description: 'Explore the serene beaches of South Goa and local markets.' },
            { day: 4, title: 'Water Activities', description: 'Enjoy water sports like parasailing, jet skiing, and banana boat rides.' },
            { day: 5, title: 'Departure', description: 'Check-out and transfer to airport.' }
          ],
          images: [
            'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80',
            'https://images.unsplash.com/photo-1451976426598-a7593bd6d0b2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'
          ],
          available: true,
          featured: true,
          status: 'approved',
          createdAt: Date.now(),
          views: 0,
          ratings: 0
        },
        {
          title: 'Majestic Rajasthan Heritage Tour',
          description: 'Discover the royal heritage and vibrant culture of Rajasthan in this comprehensive 7-day tour.',
          destination: 'Rajasthan',
          duration: '7 days, 6 nights',
          price: 25000,
          vendorId: user.uid,
          included: ['Hotel accommodation', 'Daily breakfast and dinner', 'Private car with driver', 'Entry tickets to monuments', 'Local guide'],
          itinerary: [
            { day: 1, title: 'Arrival in Jaipur', description: 'Airport pickup and check-in to hotel. Evening visit to local market.' },
            { day: 2, title: 'Jaipur Sightseeing', description: 'Visit Amber Fort, City Palace, Hawa Mahal, and Jantar Mantar.' },
            { day: 3, title: 'Jaipur to Jodhpur', description: 'Drive to Jodhpur. Evening free for leisure.' },
            { day: 4, title: 'Jodhpur Sightseeing', description: 'Visit Mehrangarh Fort, Jaswant Thada, and Umaid Bhawan Palace.' },
            { day: 5, title: 'Jodhpur to Udaipur', description: 'Drive to Udaipur. En route visit Ranakpur Jain Temple.' },
            { day: 6, title: 'Udaipur Sightseeing', description: 'Visit City Palace, Saheliyon ki Bari, and enjoy a boat ride on Lake Pichola.' },
            { day: 7, title: 'Departure', description: 'Check-out and transfer to airport.' }
          ],
          images: [
            'https://images.unsplash.com/photo-1599661046289-e31897846e41?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
            'https://images.unsplash.com/photo-1548013146-72479768bada?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1176&q=80'
          ],
          available: true,
          featured: false,
          status: 'approved',
          createdAt: Date.now(),
          views: 0,
          ratings: 0
        },
        {
          title: 'Kerala Backwaters Cruise',
          description: 'Relax and rejuvenate with a serene cruise through the backwaters of Kerala in a traditional houseboat.',
          destination: 'Kerala',
          duration: '4 days, 3 nights',
          price: 18000,
          vendorId: user.uid,
          included: ['Houseboat stay', 'All meals', 'Airport transfers', 'Ayurvedic massage'],
          itinerary: [
            { day: 1, title: 'Arrival in Kochi', description: 'Airport pickup and transfer to Alleppey. Check-in to houseboat.' },
            { day: 2, title: 'Backwaters Cruise', description: 'Full day cruise through the serene backwaters of Alleppey.' },
            { day: 3, title: 'Kumarakom', description: 'Visit Kumarakom Bird Sanctuary and enjoy Ayurvedic massage.' },
            { day: 4, title: 'Departure', description: 'Check-out and transfer to Kochi airport.' }
          ],
          images: [
            'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1332&q=80',
            'https://images.unsplash.com/photo-1590077428593-a33c3fb61d63?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80'
          ],
          available: true,
          featured: true,
          status: 'approved',
          createdAt: Date.now(),
          views: 0,
          ratings: 0
        }
      ];

      // Add sample packages to Realtime Database
      const packagesRef = ref(rtdb, 'tourPackages');
      
      for (const packageData of samplePackages) {
        const newPackageRef = push(packagesRef);
        await set(newPackageRef, packageData);
        console.log('Added package:', newPackageRef.key);
      }

      setMessage('Sample tour packages have been added successfully!');
      setTimeout(() => {
        navigate('/vendor/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error initializing data:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      <h1>Vendor Database Initialization</h1>
      <p>This page will help you add sample tour packages to test the vendor dashboard.</p>
      <p>Click the button below to add sample tour packages for the current vendor.</p>
      
      <button 
        onClick={initializeVendorPackages}
        disabled={loading}
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          backgroundColor: '#3182ce',
          color: 'white',
          border: 'none',
          borderRadius: '0.25rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1
        }}
      >
        {loading ? 'Adding Sample Data...' : 'Add Sample Tour Packages'}
      </button>
      
      {message && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: message.includes('Error') ? '#fed7d7' : '#c6f6d5', borderRadius: '0.25rem' }}>
          {message}
        </div>
      )}
      
      <div style={{ marginTop: '2rem' }}>
        <button 
          onClick={() => navigate('/vendor/dashboard')}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            backgroundColor: '#718096',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer'
          }}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default VendorDatabaseInit;
