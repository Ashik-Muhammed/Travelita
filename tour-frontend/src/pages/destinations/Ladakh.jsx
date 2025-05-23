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

const Ladakh = () => {
  const { slug = 'ladakh' } = useParams();
  const destination = destinations[slug] || {
    id: 5,
    name: 'Ladakh',
    slug: 'ladakh',
    country: 'India',
    region: 'Jammu and Kashmir',
    heroImage: 'https://images.unsplash.com/photo-1587474268922-0ddde52e5ae1?w=1600',
    overview: {
      description: 'Known as the \'Land of High Passes\', Ladakh is a high-altitude desert region in the northernmost part of India. Famous for its dramatic landscapes, pristine lakes, ancient monasteries, and unique Tibetan Buddhist culture, Ladakh offers an otherworldly experience for travelers seeking adventure and spirituality.',
      highlights: [
        'Pangong Tso Lake',
        'Nubra Valley and Hunder Sand Dunes',
        'Ancient monasteries like Thiksey and Hemis',
        'Khardung La - one of the highest motorable roads',
        'Magnetic Hill and Zanskar Valley',
        'Trekking routes like Markha Valley and Chadar'
      ],
      bestTime: 'May to September',
      idealDuration: '7-10 days',
      weather: '5-25°C (summer), -15 to -25°C (winter)',
      rating: 4.9,
      reviewCount: 4210
    },
    popularExperiences: [
      {
        name: 'Pangong Lake Day Trip',
        price: 4500,
        image: 'https://images.unsplash.com/photo-1587474268922-0ddde52e5ae1?w=400',
        duration: 'Full day',
        rating: 4.9
      },
      {
        name: 'Nubra Valley Overnight Camping',
        price: 6500,
        image: 'https://images.unsplash.com/photo-1587474268922-0ddde52e5ae1?w=400',
        duration: '2 days',
        rating: 4.8
      },
      {
        name: 'Mountain Biking Tour',
        price: 3500,
        image: 'https://images.unsplash.com/photo-1587474268922-0ddde52e5ae1?w=400',
        duration: '1 day',
        rating: 4.7
      }
    ]
  };

  // Ladakh specific data
  const ladakhPlaces = [
    {
      name: 'Pangong Tso Lake',
      image: 'https://images.unsplash.com/photo-1587474268922-0ddde52e5ae1?w=800',
      description: 'Stunning high-altitude lake known for its changing colors, located at 4,350 meters.'
    },
    {
      name: 'Nubra Valley',
      image: 'https://images.unsplash.com/photo-1587474268922-0ddde52e5ae1?w=800',
      description: 'High-altitude desert with sand dunes, double-humped camels, and scenic landscapes.'
    },
    {
      name: 'Leh Palace',
      image: 'https://images.unsplash.com/photo-1587474268922-0ddde52e5ae1?w=800',
      description: '17th-century royal palace offering panoramic views of Leh and the surrounding mountains.'
    },
    {
      name: 'Thiksey Monastery',
      image: 'https://images.unsplash.com/photo-1587474268922-0ddde52e5ae1?w=800',
      description: 'Beautiful 12-story monastery complex resembling the Potala Palace in Lhasa.'
    },
    {
      name: 'Khardung La',
      image: 'https://images.unsplash.com/photo-1587474268922-0ddde52e5ae1?w=800',
      description: 'One of the highest motorable passes in the world at 5,359 meters.'
    },
    {
      name: 'Tso Moriri Lake',
      image: 'https://images.unsplash.com/photo-1587474268922-0ddde52e5ae1?w=800',
      description: 'Pristine high-altitude lake in the Changthang region, home to rare wildlife.'
    }
  ];

  const ladakhActivities = [
    'Visit ancient monasteries like Hemis, Diskit, and Lamayuru',
    'Experience a homestay with a local Ladakhi family',
    'Try traditional Ladakhi cuisine like thukpa and momos',
    'Attend the Hemis Festival (usually in June/July)',
    'Go river rafting in the Zanskar River',
    'Take a camel safari on the Hunder sand dunes',
    'Visit the Hall of Fame Museum',
    'Explore the local markets in Leh for handicrafts and souvenirs',
    'Experience the unique culture of the Brokpa tribe',
    'Stargazing in the clear mountain skies'
  ];

  return (
    <DestinationLayout destination={destination}>
      <Overview destination={destination} />
      <PlacesToVisit places={ladakhPlaces} />
      <ThingsToDo activities={[...(destination.popularExperiences || []), ...ladakhActivities]} />
      <BestTimeToVisit destination={{
        ...destination,
        overview: {
          ...destination.overview,
          bestTime: 'May to September',
          idealDuration: '7-10 days',
          weather: '5-25°C (summer), -15 to -25°C (winter)'
        }
      }} />
      <HowToReach destination={{
        ...destination,
        howToReach: {
          byAir: 'Kushok Bakula Rimpochee Airport (IXL) in Leh is connected to Delhi, Mumbai, and other major cities.',
          byRoad: 'Manali-Leh Highway (open May-Oct) and Srinagar-Leh Highway (open May-Nov) are the two main road routes.',
          byTrain: 'Nearest major railway station is Jammu Tawi (700 km from Leh).',
          note: 'Roads to Ladakh are closed during winter months (November-April) due to heavy snowfall.'
        }
      }} />
      <Packages destination={destination} />
    </DestinationLayout>
  );
};

export default Ladakh;
