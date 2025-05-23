import React from 'react';
import { useParams } from 'react-router-dom';
import DestinationLayout from './layouts/DestinationLayout';
import Overview from './components/Overview';
import PlacesToVisit from './components/PlacesToVisit';
import ThingsToDo from './components/ThingsToDo';
import BestTimeToVisit from './components/BestTimeToVisit';
import HowToReach from './components/HowToReach';
import Packages from './components/Packages';
import PopularExperiences from './components/PopularExperiences';
import TravelTips from './components/TravelTips';
import WeatherInfo from './components/WeatherInfo';
import Festivals from './components/Festivals';
import Transportation from './components/Transportation';
import destinations from '../../data/destinations';

const Goa = () => {
  const { slug = 'goa' } = useParams();
  const destination = destinations[slug] || destinations.goa;

  // Sample travel tips (can be moved to destination data)
  const travelTips = {
    general: 'Mornings are less crowded at popular attractions. Aim to arrive early to beat the crowds.',
    budget: 'Many museums offer free entry on the first Sunday of the month. Local buses are much cheaper than taxis.',
    photo: 'For the best photos, visit the viewpoint at sunrise when the light is perfect and crowds are minimal.',
    food: 'Don\'t miss the street food at the local market. Try the famous local dish for an authentic taste.',
  };

  // Sample festivals data (can be moved to destination data)
  const festivals = [
    {
      month: 'Jan',
      name: 'Goa Carnival',
      description: 'A four-day celebration featuring colorful parades, music, and dance performances.',
      dates: 'February',
      location: 'Throughout Goa',
      highlights: ['Colorful parades', 'Live music', 'Traditional dances', 'Street food'],
      tips: 'Book accommodations well in advance as this is a peak tourist season.'
    },
    {
      month: 'Aug',
      name: 'Bonderam Festival',
      description: 'A vibrant festival celebrated on Divar Island with flag parades and cultural performances.',
      dates: '4th Saturday of August',
      location: 'Divar Island',
      highlights: ['Flag parades', 'Cultural performances', 'Traditional games'],
      tips: 'Ferry services are available to reach Divar Island.'
    },
    {
      month: 'Dec',
      name: 'Christmas and New Year',
      description: 'Celebrated with great enthusiasm, especially in the Christian-dominated areas of Goa.',
      dates: 'December 24 - January 1',
      location: 'Throughout Goa',
      highlights: ['Midnight masses', 'Christmas markets', 'Fireworks on New Year\'s Eve'],
      tips: 'This is peak tourist season, so book everything well in advance.'
    },
  ];

  return (
    <DestinationLayout destination={destination}>
      <Overview destination={destination} />
      <PlacesToVisit places={destination.placesToVisit} />
      <PopularExperiences experiences={destination.popularExperiences} destination={destination} />
      <WeatherInfo bestTimeToVisit={destination.bestTimeToVisit} />
      <ThingsToDo activities={destination.thingsToDo} />
      <Festivals festivals={festivals} />
      <Transportation transportInfo={{ destinationName: destination.name }} />
      <TravelTips tips={travelTips} />
      <Packages destination={destination} />
    </DestinationLayout>
  );
};

export default Goa;
