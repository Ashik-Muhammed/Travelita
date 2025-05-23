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

const Kerala = () => {
  const { slug = 'kerala' } = useParams();
  const destination = destinations[slug] || destinations.kerala;

  // Kerala specific data
  const keralaPlaces = [
    {
      name: 'Alleppey Backwaters',
      image: 'https://images.unsplash.com/photo-1583422409516-289911ce76b3?w=800',
      description: 'Serene network of canals, lagoons, and lakes best experienced on a traditional houseboat.'
    },
    {
      name: 'Munnar',
      image: 'https://images.unsplash.com/photo-1583422409516-289911ce76b3?w=800',
      description: 'Picturesque hill station known for its tea plantations, rolling hills, and cool climate.'
    },
    {
      name: 'Kochi',
      image: 'https://images.unsplash.com/photo-1583422409516-289911ce76b3?w=800',
      description: 'Historic port city with colonial architecture, Chinese fishing nets, and cultural diversity.'
    },
    {
      name: 'Thekkady',
      image: 'https://images.unsplash.com/photo-1583422409516-289911ce76b3?w=800',
      description: 'Wildlife sanctuary known for its tiger reserve, spice plantations, and bamboo rafting.'
    },
    {
      name: 'Varkala',
      image: 'https://images.unsplash.com/photo-1583422409516-289911ce76b3?w=800',
      description: 'Cliffside beach destination with stunning sunset views and natural springs.'
    },
    {
      name: 'Kumarakom',
      image: 'https://images.unsplash.com/photo-1583422409516-289911ce76b3?w=800',
      description: 'Tranquil backwater destination and bird sanctuary on Vembanad Lake.'
    }
  ];

  const keralaActivities = [
    'Houseboat cruise in Alleppey or Kumarakom',
    'Kathakali and Kalaripayattu cultural shows',
    'Ayurvedic massage and wellness treatments',
    'Tea plantation tour in Munnar',
    'Wildlife safari in Periyar Tiger Reserve',
    'Village life experience in Kuttanad',
    'Beach hopping in Kovalam and Varkala',
    'Spice plantation tour in Thekkady',
    'Canoeing in the backwaters',
    'Trying traditional Kerala sadhya (banana leaf meal)'
  ];

  return (
    <DestinationLayout destination={destination}>
      <Overview destination={destination} />
      <PlacesToVisit places={keralaPlaces} />
      <ThingsToDo activities={[...(destination.popularExperiences || []), ...keralaActivities]} />
      <BestTimeToVisit destination={{
        ...destination,
        overview: {
          ...destination.overview,
          bestTime: 'September to March',
          idealDuration: '7-10 days'
        }
      }} />
      <HowToReach destination={{
        ...destination,
        howToReach: {
          byAir: 'Major airports are Cochin International Airport (COK), Trivandrum International Airport (TRV), and Calicut International Airport (CCJ).',
          byTrain: 'Well-connected by rail with major stations in Thiruvananthapuram, Ernakulam, and Kozhikode.',
          byRoad: 'Excellent road connectivity with neighboring states via national highways.'
        }
      }} />
      <Packages destination={destination} />
    </DestinationLayout>
  );
};

export default Kerala;
