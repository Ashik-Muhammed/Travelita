// Convert array to object with slugs as keys
export const destinations = {
  goa: {
    id: 1,
    slug: 'bali',
    name: 'Bali',
    country: 'Indonesia',
    region: 'Southeast Asia',
    tagline: 'The Island of the Gods',
    description: 'Bali is a living postcard, an Indonesian paradise that seems to have it all. From its iconic rice paddies and pristine beaches to its rich cultural heritage and spiritual atmosphere, Bali offers a perfect blend of relaxation and adventure.',
    heroImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600',
    rating: 4.8,
    bestTime: 'April to October',
    weather: '27-32',
    startingPrice: 899,
    duration: '7-14',
    gallery: [
      'https://images.unsplash.com/photo-1539367627418-b413481029f0?w=1600',
      'https://images.unsplash.com/photo-1526779259211-939e708789bb?w=1600',
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600',
      'https://images.unsplash.com/photo-1539367627418-b413481029f0?w=1600',
    ],
    highlights: [
      {
        title: 'Cultural Heritage',
        description: 'Explore ancient temples and traditional Balinese culture',
        icon: 'fas fa-landmark'
      },
      {
        title: 'Beaches',
        description: 'Relax on world-famous beaches with crystal clear waters',
        icon: 'fas fa-umbrella-beach'
      },
      {
        title: 'Nature',
        description: 'Discover lush rice terraces and volcanic landscapes',
        icon: 'fas fa-mountain'
      }
    ],
    tips: {
      cuisine: 'Try the famous Babi Guling (suckling pig) and Nasi Goreng (fried rice)',
      transportation: 'Rent a scooter or use ride-hailing apps for getting around',
      budget: 'Budget around $30-50 per day for comfortable travel',
    },
    packages: [
      {
        id: 'bali-7d',
        name: '7-Day Bali Adventure',
        duration: '7 days',
        price: 899,
        highlights: ['Ubud Tour', 'Uluwatu Temple', 'Tegallalang Rice Terraces', 'Beach Relaxation']
      },
      {
        id: 'bali-10d',
        name: '10-Day Bali Explorer',
        duration: '10 days',
        price: 1299,
        highlights: ['All 7-day highlights', 'Nusa Penida Island', 'Mount Batur Sunrise Trek', 'Waterfall Tour']
      }
    ]
  },
  {
    id: 2,
    slug: 'kyoto',
    name: 'Kyoto',
    country: 'Japan',
    region: 'Kansai',
    tagline: 'The Heart of Traditional Japan',
    description: 'Kyoto, once the capital of Japan, is a city where ancient traditions are preserved and celebrated. With over 2,000 religious places, including 1,600 Buddhist temples and 400 Shinto shrines, Kyoto is a living museum of Japan\'s rich cultural heritage.',
    heroImage: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=1600',
    rating: 4.9,
    bestTime: 'March to May, October to November',
    weather: '5-30',
    startingPrice: 1299,
    duration: '5-10',
    gallery: [
      'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=1600',
      'https://images.unsplash.com/photo-1526481280693-3bfa7568c0c5?w=1600',
      'https://images.unsplash.com/photo-1526481280693-3bfa7568c0c5?w=1600',
      'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=1600',
    ],
    highlights: [
      {
        title: 'Temples & Shrines',
        description: 'Visit iconic sites like Kinkaku-ji and Fushimi Inari',
        icon: 'fas fa-torii-gate'
      },
      {
        title: 'Cherry Blossoms',
        description: 'Experience the magical cherry blossom season',
        icon: 'fas fa-tree'
      },
      {
        title: 'Traditional Culture',
        description: 'Witness geisha performances and tea ceremonies',
        icon: 'fas fa-mask'
      }
    ],
    tips: {
      cuisine: 'Try kaiseki ryori and matcha sweets',
      transportation: 'Get a JR Pass for unlimited train travel',
      budget: 'Budget around $70-100 per day',
    },
    packages: [
      {
        id: 'kyoto-5d',
        name: '5-Day Kyoto Experience',
        duration: '5 days',
        price: 1299,
        highlights: ['Golden Pavilion', 'Bamboo Forest', 'Gion District', 'Nijo Castle']
      },
      {
        id: 'kyoto-7d',
        name: '7-Day Kyoto & Nara',
        duration: '7 days',
        price: 1599,
        highlights: ['All 5-day highlights', 'Nara Day Trip', 'Fushimi Inari Shrine', 'Tea Ceremony Experience']
      }
    ]
  },
  // Add more destinations as needed
];
