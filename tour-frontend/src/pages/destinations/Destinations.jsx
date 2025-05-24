import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { destinations } from './destinationsData';
import DestinationCard from '../../components/DestinationCard';

const Destinations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');

  const filteredDestinations = Object.fromEntries(
    Object.entries(destinations)
      .filter(([_, destination]) => {
        const matchesSearch = destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           destination.country.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRegion = !regionFilter || destination.region === regionFilter;
        const priceRange = destination.startingPrice < 1000 ? 'budget' : 
                          destination.startingPrice < 2000 ? 'mid-range' : 'luxury';
        const matchesPrice = !priceFilter || priceFilter === priceRange;
        
        return matchesSearch && matchesRegion && matchesPrice;
      })
  );

  const regions = [...new Set(Object.values(destinations).map(d => d.region))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 w-full h-full bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-pink-100/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative py-24 md:py-36 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60"></div>
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold mb-4"
          >
            Discover Your Next Adventure
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl md:text-2xl max-w-3xl mx-auto text-blue-100 mb-8"
          >
            Explore our handpicked destinations and find your perfect getaway amidst breathtaking landscapes and vibrant cultures
          </motion.p>
          
          {/* Animated scroll indicator */}
          <motion.div 
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <svg className="w-8 h-8 text-white opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter */}
      <motion.div 
        className="container mx-auto px-4 -mt-12 relative z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-6 mb-16 border border-white/20">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1.5">Search Destinations</label>
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="search"
                  className="block w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-300"
                  placeholder="Search by destination, country, or region"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </motion.div>
            </div>
            
            <motion.div 
              className="w-full md:w-52"
              whileHover={{ y: -2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1.5">Filter by Region</label>
              <div className="relative">
                <select
                  id="region"
                  className="appearance-none block w-full pl-3 pr-10 py-2.5 text-base border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl transition-all duration-300 hover:border-blue-300 cursor-pointer"
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                >
                  <option value="">All Regions</option>
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="w-full md:w-48"
              whileHover={{ y: -2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1.5">Sort By</label>
              <div className="relative">
                <select
                  id="sort"
                  className="appearance-none block w-full pl-3 pr-10 py-2.5 text-base border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl transition-all duration-300 hover:border-blue-300 cursor-pointer"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="price-asc">Price (Low to High)</option>
                  <option value="price-desc">Price (High to Low)</option>
                  <option value="rating-desc">Highest Rated</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Destinations Grid */}
      <div className="container mx-auto px-4 py-12 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            Discover Amazing Destinations
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto mb-6 rounded-full"></div>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            {Object.keys(filteredDestinations).length} {Object.keys(filteredDestinations).length === 1 ? 'destination' : 'destinations'} waiting to be explored
          </p>
        </motion.div>
        
        {Object.keys(filteredDestinations).length === 0 ? (
          <motion.div 
            className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 mb-4">
              <svg className="h-12 w-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No destinations found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">We couldn't find any destinations matching your search. Try adjusting your filters or search term.</p>
            <motion.button
              onClick={() => {
                setSearchTerm('');
                setRegionFilter('');
                setPriceFilter('');
                setSortBy('name-asc');
              }}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md hover:shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Clear all filters
            </motion.button>
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {Object.values(filteredDestinations)
              .sort((a, b) => {
                switch(sortBy) {
                  case 'name-asc':
                    return a.name.localeCompare(b.name);
                  case 'name-desc':
                    return b.name.localeCompare(a.name);
                  case 'price-asc':
                    return (a.startingPrice || 0) - (b.startingPrice || 0);
                  case 'price-desc':
                    return (b.startingPrice || 0) - (a.startingPrice || 0);
                  case 'rating-desc':
                    return (b.rating || 0) - (a.rating || 0);
                  default:
                    return 0;
                }
              })
              .map((destination, index) => (
                <motion.div
                  key={destination.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { 
                      opacity: 1, 
                      y: 0,
                      transition: {
                        duration: 0.5,
                        ease: "easeOut"
                      }
                    }
                  }}
                  initial="hidden"
                  animate="show"
                  transition={{ delay: index * 0.1 }}
                >
                  <DestinationCard 
                    destination={{
                      ...destination,
                      slug: Object.keys(destinations).find(key => destinations[key].id === destination.id) || destination.id
                    }} 
                  />
                </motion.div>
              ))}
          </motion.div>
        )}
        
        {/* Decorative elements */}
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-10 -right-10 w-80 h-80 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      {/* Call to Action */}
      <section className="relative py-24 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-indigo-800/30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-white/20">
            <div className="p-8 md:p-12 lg:flex lg:items-center lg:justify-between">
              <div className="lg:w-2/3">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ready for your next adventure?</h2>
                <p className="text-lg text-gray-600 mb-6 lg:mb-0">
                  Can't find what you're looking for? Our travel experts can help you plan the perfect trip tailored to your preferences.
                </p>
              </div>
              <div className="lg:w-1/3 flex justify-center lg:justify-end">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full lg:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Contact Our Experts
                </motion.button>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-20 w-80 h-80 bg-white/10 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
      </section>
    </div>
  );
};

export default Destinations;
