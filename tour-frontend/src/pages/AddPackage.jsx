import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, rtdb } from '../config/firebase';
import { ref, push, set } from 'firebase/database';
import './AddPackage.css';

const AddPackage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    destination: '',
    duration: '',
    price: '',
    images: [],
    included: [''],
    itinerary: [{ day: 1, description: '' }],
    featured: false,
    available: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Check file sizes - Firebase Realtime Database has size limits
    const maxSizeMB = 1; // 1MB max per image for Realtime Database
    const oversizedFiles = files.filter(file => file.size > maxSizeMB * 1024 * 1024);
    
    if (oversizedFiles.length > 0) {
      setError(`Some images are too large (max ${maxSizeMB}MB each). Please resize them and try again.`);
      return;
    }
    
    // Process images as base64 strings
    const imagePromises = files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          // For Firebase, we'll use image URLs instead of base64 for better performance
          // For now, we'll use the base64 data, but in production, consider using Firebase Storage
          resolve(e.target.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises)
      .then(images => {
        // Limit the number of images to 5 to avoid database size issues
        const allImages = [...formData.images, ...images];
        if (allImages.length > 5) {
          setError('Maximum 5 images allowed per package.');
          return;
        }
        
        setFormData(prev => ({
          ...prev,
          images: allImages
        }));
      })
      .catch(err => {
        console.error('Error reading images:', err);
        setError('Failed to read images. Please try again.');
      });
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleIncludedChange = (index, value) => {
    const newIncluded = [...formData.included];
    newIncluded[index] = value;
    setFormData(prev => ({
      ...prev,
      included: newIncluded
    }));
  };

  const addIncludedItem = () => {
    setFormData(prev => ({
      ...prev,
      included: [...prev.included, '']
    }));
  };

  const removeIncludedItem = (index) => {
    setFormData(prev => ({
      ...prev,
      included: prev.included.filter((_, i) => i !== index)
    }));
  };

  const handleItineraryChange = (index, field, value) => {
    const newItinerary = [...formData.itinerary];
    newItinerary[index] = {
      ...newItinerary[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      itinerary: newItinerary
    }));
  };

  const addItineraryDay = () => {
    setFormData(prev => ({
      ...prev,
      itinerary: [...prev.itinerary, { day: prev.itinerary.length + 1, description: '' }]
    }));
  };

  const removeItineraryDay = (index) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary
        .filter((_, i) => i !== index)
        .map((item, i) => ({ ...item, day: i + 1 }))
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Check if user is authenticated
      const user = auth.currentUser;
      if (!user) {
        navigate('/vendor/login');
        return;
      }

      console.log('Creating new package for vendor:', user.uid);
      
      // Prepare package data
      const packageData = {
        ...formData,
        vendorId: user.uid,
        status: 'pending', // New packages need approval
        createdAt: Date.now(),
        views: 0,
        ratings: 0
      };
      
      // Add package to Realtime Database
      const packagesRef = ref(rtdb, 'tourPackages');
      const newPackageRef = push(packagesRef);
      await set(newPackageRef, packageData);
      
      console.log('Package created successfully with ID:', newPackageRef.key);
      
      // Navigate to vendor dashboard
      navigate('/vendor/dashboard');
    } catch (err) {
      console.error('Error creating package:', err);
      setError(err.message || 'Failed to create package. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-package-page">
      <div className="add-package-header">
        <div className="container">
          <h1>Add New Package</h1>
          <p>Create a new tour package for your customers</p>
        </div>
      </div>

      <div className="container">
        <form onSubmit={handleSubmit} className="package-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-grid">
            {/* Basic Information */}
            <div className="form-section">
              <h2>Basic Information</h2>
              
              <div className="form-group">
                <label htmlFor="title">Package Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Enter package title"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder="Enter package description"
                  rows="4"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="destination">Destination</label>
                  <input
                    type="text"
                    id="destination"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    required
                    placeholder="Enter destination"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="duration">Duration (days)</label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                    min="1"
                    placeholder="Enter duration"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="price">Price (₹)</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="Enter price"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="form-section">
              <h2>Package Images</h2>
              
              <div className="form-group">
                <label htmlFor="images">Upload Images</label>
                <input
                  type="file"
                  id="images"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="file-input"
                />
                <p className="help-text">You can select multiple images</p>
              </div>

              {formData.images.length > 0 && (
                <div className="image-preview-grid">
                  {formData.images.map((image, index) => (
                    <div key={index} className="image-preview">
                      <img src={image} alt={`Preview ${index + 1}`} />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={() => removeImage(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Included Items */}
            <div className="form-section">
              <h2>What's Included</h2>
              
              {formData.included.map((item, index) => (
                <div key={index} className="included-item">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleIncludedChange(index, e.target.value)}
                    placeholder="Enter included item"
                    required
                  />
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeIncludedItem(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="add-btn"
                onClick={addIncludedItem}
              >
                Add Included Item
              </button>
            </div>

            {/* Itinerary */}
            <div className="form-section">
              <h2>Itinerary</h2>
              
              {formData.itinerary.map((day, index) => (
                <div key={index} className="itinerary-day">
                  <div className="day-header">
                    <h3>Day {day.day}</h3>
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeItineraryDay(index)}
                    >
                      Remove Day
                    </button>
                  </div>
                  <textarea
                    value={day.description}
                    onChange={(e) => handleItineraryChange(index, 'description', e.target.value)}
                    placeholder="Enter day's activities"
                    required
                    rows="3"
                  />
                </div>
              ))}

              <button
                type="button"
                className="add-btn"
                onClick={addItineraryDay}
              >
                Add Day
              </button>
            </div>

            {/* Package Settings */}
            <div className="form-section">
              <h2>Package Settings</h2>
              
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                  />
                  Feature this package
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="available"
                    checked={formData.available}
                    onChange={handleChange}
                  />
                  Make package available for booking
                </label>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/packages')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating Package...' : 'Create Package'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPackage;
