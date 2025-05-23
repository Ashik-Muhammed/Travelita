import React from 'react';
import { useParams } from 'react-router-dom';
import DestinationLayout from './layouts/DestinationLayout';
import Overview from './components/Overview';
import PlacesToVisit from './components/PlacesToVisit';
import ThingsToDo from './components/ThingsToDo';
import BestTimeToVisit from './components/BestTimeToVisit';
import HowToReach from './components/HowToReach';
import Packages from './components/Packages';
import destinations from '../../data/destinations';

const Jaipur = () => {
  const { slug = 'jaipur' } = useParams();
  const destination = destinations[slug] || destinations.jaipur;

  // Jaipur specific data
  const jaipurPlaces = [
    {
      name: 'Amber Fort',
      image: 'https://images.unsplash.com/photo-1534751679422-95e3eafaa592?w=800',
      description: 'Majestic fort-palace with intricate carvings, mirror work, and stunning views of Maota Lake.'
    },
    {
      name: 'Hawa Mahal',
      image: 'https://images.unsplash.com/photo-1534751679422-95e3eafaa592?w=800',
      description: 'Iconic \'Palace of Winds\' with 953 small windows, built for royal women to observe street festivals.'
    },
    {
      name: 'City Palace',
      image: 'https://images.unsplash.com/photo-1534751679422-95e3eafaa592?w=800',
      description: 'Grand palace complex with museums, courtyards, and the famous Peacock Gate.'
    },
    {
      name: 'Jantar Mantar',
      image: 'https://images.unsplash.com/photo-1534751679422-95e3eafaa592?w=800',
      description: 'UNESCO World Heritage Site featuring astronomical observation instruments.'
    },
    {
      name: 'Nahargarh Fort',
      image: 'https://images.unsplash.com/photo-1534751679422-95e3eafaa592?w=800',
      description: 'Hilltop fort offering panoramic views of Jaipur city, especially beautiful at sunset.'
    },
    {
      name: 'Jal Mahal',
      image: 'https://images.unsplash.com/photo-1534751679422-95e3eafaa592?w=800',
      description: 'Beautiful water palace appearing to float on Man Sagar Lake.'
    }
  ];

  const jaipurActivities = [
    'Elephant ride to Amber Fort',
    'Shopping for handicrafts at Johari Bazaar',
    'Attending a cultural show with traditional dance and music',
    'Trying Rajasthani thali at local restaurants',
    'Photography tour of Hawa Mahal at sunrise',
    'Hot air balloon ride over the Pink City',
    'Visiting local artisan workshops',
    'Exploring the stepwell (Panna Meena Ka Kund)'
  ];

  return (
    <DestinationLayout destination={destination}>
      <Overview destination={destination} />
      <PlacesToVisit places={jaipurPlaces} />
      <ThingsToDo activities={[...(destination.popularExperiences || []), ...jaipurActivities]} />
      <BestTimeToVisit destination={{
        ...destination,
        overview: {
          ...destination.overview,
          bestTime: 'October to March',
          idealDuration: '3-4 days'
        }
      }} />
      <HowToReach destination={{
        ...destination,
        howToReach: {
          byAir: 'Jaipur International Airport (JAI) is well-connected to major Indian cities and some international destinations.',
          byTrain: 'Jaipur Junction (JP) is well-connected to all major cities in India.',
          byRoad: 'Well-connected by road from Delhi (280 km), Agra (240 km), and Udaipur (400 km).'
        }
      }} />
      <Packages destination={destination} />
    </DestinationLayout>
  );
};

export default Jaipur;
