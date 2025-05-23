const destinations = {
  goa: {
    id: 1,
    name: 'Goa',
    slug: 'goa',
    country: 'India',
    region: 'West India',
    heroImage: 'https://images.unsplash.com/photo-1506929562872-b5415f302be9?w=1600',
    overview: {
      description: 'Famous for its palm-fringed beaches, Portuguese heritage, vibrant nightlife and seafood, Goa is India\'s smallest state and a favorite among both domestic and international tourists. The former Portuguese colony offers a unique blend of Indian and Western cultures, with its colonial architecture, beach shacks, and laid-back vibe.',
      highlights: [
        'Stunning beaches like Palolem, Baga, and Anjuna',
        'UNESCO-listed Old Goa churches',
        'Vibrant nightlife and beach parties',
        'Water sports and adventure activities',
        'Delicious Goan cuisine and seafood',
        'Rich Portuguese heritage and architecture'
      ],
      bestTime: 'November to February',
      idealDuration: '4-7 days',
      weather: '25-35°C',
      rating: 4.7,
      reviewCount: 5240
    },
    popularExperiences: [
      {
        name: 'Sunset Cruise on Mandovi River',
        price: 1500,
        image: 'https://images.unsplash.com/photo-1596436889106-be35e8431c4c?w=400',
        duration: '2 hours',
        rating: 4.8
      },
      {
        name: 'Spice Plantation Tour',
        price: 1200,
        image: 'https://images.unsplash.com/photo-1574156936814-7e3d5e4d57e1?w=400',
        duration: '4 hours',
        rating: 4.6
      },
      {
        name: 'Dudhsagar Waterfalls Day Trip',
        price: 2500,
        image: 'https://images.unsplash.com/photo-1587474268922-0ddde52e5ae1?w=400',
        duration: '10 hours',
        rating: 4.9
      }
    ],
    placesToVisit: [
      {
        name: 'Calangute Beach',
        image: 'https://images.unsplash.com/photo-1582657457566-2c6c6fdf1097?w=800',
        description: 'The largest beach in North Goa, famous for water sports and beach shacks.'
      },
      {
        name: 'Old Goa Churches',
        image: 'https://images.unsplash.com/photo-1582657457566-2c6c6fdf1097?w=800',
        description: 'UNESCO World Heritage Site with stunning Portuguese-era churches.'
      },
      {
        name: 'Dudhsagar Waterfalls',
        image: 'https://images.unsplash.com/photo-1587474268922-0ddde52e5ae1?w=800',
        description: 'Majestic four-tiered waterfall located on the Goa-Karnataka border.'
      }
    ],
    thingsToDo: [
      'Enjoy water sports at Baga and Calangute beaches',
      'Explore the Latin Quarter in Panjim',
      'Try local Goan cuisine like vindaloo and bebinca',
      'Visit the Saturday Night Market in Arpora'
    ],
    bestTimeToVisit: {
      months: 'November to February',
      description: 'The winter months offer pleasant weather with temperatures between 20-30°C, making it ideal for beach activities and sightseeing.'
    },
    howToReach: {
      byAir: 'Dabolim Airport (GOI) is well-connected to major Indian cities and some international destinations.',
      byTrain: 'Madgaon (MAO) and Thivim (THVM) are the main railway stations in Goa.',
      byRoad: 'Well-connected by road from Mumbai (600 km) and Bangalore (560 km).'
    },
    packages: [
      {
        name: 'Goa Beach Holiday',
        duration: '4 Days / 3 Nights',
        price: 15999,
        highlights: ['Beach stay', 'City tour', 'Cruise on Mandovi River'],
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400'
      },
      {
        name: 'Goa Honeymoon Special',
        duration: '6 Days / 5 Nights',
        price: 28999,
        highlights: ['Romantic dinner', 'Spa treatment', 'Private beach villa'],
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'
      }
    ]
  },
  manali: {
    id: 2,
    name: 'Manali',
    slug: 'manali',
    country: 'India',
    region: 'Himachal Pradesh',
    heroImage: 'https://images.unsplash.com/photo-1582038832823-044f3b0a2f2b?w=1600',
    overview: {
      description: 'Nestled in the mountains of the Indian state of Himachal Pradesh, Manali is a high-altitude Himalayan resort town known for its scenic beauty, adventure sports, and ancient temples. Surrounded by towering peaks and offering cool weather year-round, it\'s a popular destination for honeymooners and adventure enthusiasts alike.',
      highlights: [
        'Rohtang Pass and Solang Valley',
        'Hidimba Devi Temple',
        'Adventure sports like skiing and paragliding',
        'Hot springs at Vashisht',
        'Great Himalayan National Park',
        'Old Manali cafes and culture'
      ],
      bestTime: 'October to June',
      idealDuration: '5-7 days',
      weather: '5-25°C',
      rating: 4.6,
      reviewCount: 3870
    },
    popularExperiences: [
      {
        name: 'Rohtang Pass Day Trip',
        price: 2500,
        image: 'https://images.unsplash.com/photo-1582038832823-044f3b0a2f2b?w=400',
        duration: 'Full day',
        rating: 4.7
      },
      {
        name: 'Paragliding in Solang Valley',
        price: 3500,
        image: 'https://images.unsplash.com/photo-1582038832823-044f3b0a2f2b?w=400',
        duration: '2-3 hours',
        rating: 4.8
      },
      {
        name: 'Trek to Jogini Waterfall',
        price: 800,
        image: 'https://images.unsplash.com/photo-1582038832823-044f3b0a2f2b?w=400',
        duration: '4-5 hours',
        rating: 4.5
      }
    ]
  },
  jaipur: {
    id: 3,
    name: 'Jaipur',
    slug: 'jaipur',
    country: 'India',
    region: 'Rajasthan',
    heroImage: 'https://images.unsplash.com/photo-1534751679422-95e3eafaa592?w=1600',
    overview: {
      description: 'The capital of India\'s Rajasthan state, Jaipur is known as the Pink City for its distinctive terracotta-painted buildings. Part of the Golden Triangle tourist circuit, it offers a mix of history, culture, and modern Indian life with its magnificent palaces, historic forts, and vibrant bazaars.',
      highlights: [
        'Amber Fort and City Palace',
        'Hawa Mahal (Palace of Winds)',
        'Jantar Mantar Observatory',
        'Local markets for handicrafts and jewelry',
        'Elephant rides at Amber Fort',
        'Traditional Rajasthani cuisine'
      ],
      bestTime: 'October to March',
      idealDuration: '3-4 days',
      weather: '15-30°C',
      rating: 4.8,
      reviewCount: 6120
    },
    popularExperiences: [
      {
        name: 'Amber Fort Elephant Ride',
        price: 1800,
        image: 'https://images.unsplash.com/photo-1534751679422-95e3eafaa592?w=400',
        duration: '1-2 hours',
        rating: 4.7
      },
      {
        name: 'Heritage Walking Tour',
        price: 1200,
        image: 'https://images.unsplash.com/photo-1534751679422-95e3eafaa592?w=400',
        duration: '3 hours',
        rating: 4.8
      },
      {
        name: 'Hot Air Balloon Ride',
        price: 9500,
        image: 'https://images.unsplash.com/photo-1534751679422-95e3eafaa592?w=400',
        duration: '1 hour',
        rating: 4.9
      }
    ]
  },
  kerala: {
    id: 4,
    name: 'Kerala',
    slug: 'kerala',
    country: 'India',
    region: 'South India',
    heroImage: 'https://images.unsplash.com/photo-1583422409516-289911ce76b3?w=1600',
    overview: {
      description: 'Fondly called \'God\'s Own Country\', Kerala is a tropical paradise of palm-lined beaches, backwaters, tea plantations, and lush hill stations. Known for its Ayurvedic treatments, traditional Kathakali dance, and delicious cuisine, it offers a perfect blend of relaxation and cultural experiences.',
      highlights: [
        'Backwater houseboat cruises in Alleppey',
        'Tea plantations in Munnar',
        'Beaches of Kovalam and Varkala',
        'Wildlife in Periyar National Park',
        'Kathakali and Kalaripayattu performances',
        'Ayurvedic treatments and massages'
      ],
      bestTime: 'September to March',
      idealDuration: '7-10 days',
      weather: '23-32°C',
      rating: 4.9,
      reviewCount: 7450
    },
    popularExperiences: [
      {
        name: 'Alleppey Houseboat Stay',
        price: 8000,
        image: 'https://images.unsplash.com/photo-1583422409516-289911ce76b3?w=400',
        duration: 'Overnight',
        rating: 4.9
      },
      {
        name: 'Tea Plantation Tour in Munnar',
        price: 1500,
        image: 'https://images.unsplash.com/photo-1583422409516-289911ce76b3?w=400',
        duration: '4 hours',
        rating: 4.7
      },
      {
        name: 'Kathakali Dance Show',
        price: 600,
        image: 'https://images.unsplash.com/photo-1583422409516-289911ce76b3?w=400',
        duration: '2 hours',
        rating: 4.5
      }
    ]
  },
  ladakh: {
    id: 5,
    name: 'Ladakh',
    slug: 'ladakh',
    country: 'India',
    region: 'Ladakh',
    heroImage: 'https://images.unsplash.com/photo-1587474260584-136574528edc?w=1600',
    overview: {
      description: 'A land of high passes, Ladakh is a region in the Indian state of Jammu and Kashmir that extends from the Siachen Glacier to the main Great Himalayas. Known for its remote mountain beauty and Buddhist culture, it offers stunning landscapes, ancient monasteries, and thrilling adventure opportunities.',
      highlights: [
        'Pangong Tso Lake',
        'Nubra Valley and Hunder Sand Dunes',
        'Magnetic Hill and Confluence Point',
        'Hemis and Thiksey Monasteries',
        'Khardung La - World\'s Highest Motorable Road',
        'Chadar Trek on frozen Zanskar River'
      ],
      bestTime: 'May to September',
      idealDuration: '8-12 days',
      weather: '5-25°C (summer), -15 to -5°C (winter)',
      rating: 4.8,
      reviewCount: 4320
    },
    popularExperiences: [
      {
        name: 'Pangong Lake Day Trip',
        price: 3500,
        image: 'https://images.unsplash.com/photo-1587474260584-136574528edc?w=400',
        duration: 'Full day',
        rating: 4.9
      },
      {
        name: 'Nubra Valley Camel Safari',
        price: 1200,
        image: 'https://images.unsplash.com/photo-1587474260584-136574528edc?w=400',
        duration: '1-2 hours',
        rating: 4.6
      },
      {
        name: 'Mountain Biking in Leh',
        price: 2800,
        image: 'https://images.unsplash.com/photo-1587474260584-136574528edc?w=400',
        duration: '6 hours',
        rating: 4.7
      }
    ]
  }
};

export default destinations;
