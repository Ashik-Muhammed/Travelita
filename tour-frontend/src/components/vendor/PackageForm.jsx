import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, rtdb } from '../../config/firebase';
import { ref, get, push, set, update } from 'firebase/database';
import './PackageForm.css';

const PackageForm = ({ onSuccess, isEditing = false, packageData = null }) => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    destination: '',
    duration: '',
    price: '',
    included: ['', '', ''],
    available: true,
    featured: false
  });
  const [itinerary, setItinerary] = useState([{ 
    title: 'Day 1', 
    description: '' 
  }]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(isEditing ? true : false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);

  useEffect(() => {
    // If editing, fetch existing package data
    if (isEditing && packageId) {
      fetchPackageData();
    } else if (packageData) {
      // If package data is passed as prop
      populateFormData(packageData);
    }
  }, [isEditing, packageId, packageData]);

  const fetchPackageData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Reference to the specific package in Firebase
      const packageRef = ref(rtdb, `tourPackages/${packageId}`);
      const snapshot = await get(packageRef);
      
      if (!snapshot.exists()) {
        throw new Error('Package not found');
      }
      
      const packageData = snapshot.val();
      populateFormData(packageData);
    } catch (err) {
      console.error('Error fetching package details:', err);
      setError('Failed to fetch package details for editing');
    } finally {
      setLoading(false);
    }
  };

  const populateFormData = (data) => {
    setFormData({
      title: data.title || '',
      description: data.description || '',
      destination: data.destination || '',
      duration: data.duration || '',
      price: data.price || '',
      included: data.included?.length > 0 ? data.included : ['', '', ''],
      available: data.available !== undefined ? data.available : true,
      featured: data.featured || false
    });
    
    setItinerary(data.itinerary?.length > 0 
      ? data.itinerary 
      : [{ title: 'Day 1', description: '' }]
    );
    
    // Set image previews for existing images
    if (data.images && data.images.length > 0) {
      setPreviewImages(data.images.map(img => ({
        url: img.startsWith('http') ? img : 'https://source.unsplash.com/random/800x600/?travel',
        name: typeof img === 'string' ? img.split('/').pop() : 'image',
        isExisting: true
      })));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleIncludedChange = (index, value) => {
    const updatedIncluded = [...formData.included];
    updatedIncluded[index] = value;
    setFormData({
      ...formData,
      included: updatedIncluded
    });
  };

  const addIncludedItem = () => {
    setFormData({
      ...formData,
      included: [...formData.included, '']
    });
  };

  const removeIncludedItem = (index) => {
    const updatedIncluded = [...formData.included];
    updatedIncluded.splice(index, 1);
    setFormData({
      ...formData,
      included: updatedIncluded
    });
  };

  const handleItineraryChange = (index, field, value) => {
    const updatedItinerary = [...itinerary];
    updatedItinerary[index] = {
      ...updatedItinerary[index],
      [field]: value
    };
    setItinerary(updatedItinerary);
  };

  const addItineraryDay = () => {
    setItinerary([
      ...itinerary,
      {
        title: `Day ${itinerary.length + 1}`,
        description: ''
      }
    ]);
  };

  const removeItineraryDay = (index) => {
    const updatedItinerary = [...itinerary];
    updatedItinerary.splice(index, 1);
    
    // Rename remaining days
    const renamedItinerary = updatedItinerary.map((day, i) => ({
      ...day,
      title: day.title.startsWith('Day ') ? `Day ${i + 1}` : day.title
    }));
    
    setItinerary(renamedItinerary);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages([...images, ...files]);
    
    // Add preview URLs
    const newPreviewImages = files.map(file => ({
      url: URL.createObjectURL(file),
      name: file.name,
      isExisting: false
    }));
    
    setPreviewImages([...previewImages, ...newPreviewImages]);
  };

  const removeImage = (index) => {
    const updatedImages = [...images];
    const updatedPreviews = [...previewImages];
    
    // If removing an existing image, just remove from previews
    // Otherwise, remove from both arrays
    if (!updatedPreviews[index].isExisting) {
      const imageIndex = images.findIndex(img => img.name === updatedPreviews[index].name);
      if (imageIndex !== -1) {
        updatedImages.splice(imageIndex, 1);
      }
    }
    
    updatedPreviews.splice(index, 1);
    
    setImages(updatedImages);
    setPreviewImages(updatedPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Check if user is authenticated with Firebase
      const currentUser = auth.currentUser;
      const vendorInfoStr = localStorage.getItem('vendorInfo');
      
      if (!currentUser || !vendorInfoStr) {
        setError('Authentication required');
        setSubmitting(false);
        return;
      }
      
      // Verify that the user is a vendor
      const vendorRef = ref(rtdb, `vendors/${currentUser.uid}`);
      const vendorSnapshot = await get(vendorRef);
      
      if (!vendorSnapshot.exists()) {
        setError('Vendor authentication required');
        setSubmitting(false);
        return;
      }
      
      // Create form data for file upload
      const formDataObj = new FormData();
      formDataObj.append('title', formData.title);
      formDataObj.append('description', formData.description);
      formDataObj.append('destination', formData.destination);
      formDataObj.append('duration', formData.duration);
      formDataObj.append('price', formData.price);
      formDataObj.append('available', formData.available);
      formDataObj.append('featured', formData.featured);
      
      // Add included items (filter out empty ones)
      const filteredIncluded = formData.included.filter(item => item.trim() !== '');
      formDataObj.append('included', JSON.stringify(filteredIncluded));
      
      // Add itinerary (filter out empty descriptions)
      const filteredItinerary = itinerary.filter(day => day.description.trim() !== '');
      formDataObj.append('itinerary', JSON.stringify(filteredItinerary));
      
      // Add existing images to keep
      const existingImages = previewImages
        .filter(img => img.isExisting)
        .map(img => img.name);
      formDataObj.append('existingImages', JSON.stringify(existingImages));
      
      // Add new images
      images.forEach(image => {
        formDataObj.append('images', image);
      });
      
      // Prepare package data for Firebase
      const packageData = {
        title: formData.title,
        description: formData.description,
        destination: formData.destination,
        duration: formData.duration,
        price: parseFloat(formData.price),
        included: filteredIncluded,
        itinerary: filteredItinerary,
        available: formData.available,
        featured: formData.featured,
        vendorId: currentUser.uid,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      let packageId;
      let res;
      
      if (isEditing) {
        // Update existing package in Firebase
        const packageRef = ref(rtdb, `tourPackages/${packageId}`);
        await update(packageRef, {
          ...packageData,
          updatedAt: Date.now()
        });
        
        res = { data: { ...packageData, id: packageId } };
        setSuccess('Package updated successfully');
      } else {
        // Create new package in Firebase
        const packagesRef = ref(rtdb, 'tourPackages');
        const newPackageRef = push(packagesRef);
        packageId = newPackageRef.key;
        
        await set(newPackageRef, packageData);
        
        res = { data: { ...packageData, id: packageId } };
        setSuccess('New package created successfully');
      }
      
      // Call success callback if provided
      if (onSuccess) {
        setTimeout(() => {
          onSuccess(res.data);
        }, 1500);
      }
    } catch (err) {
      console.error('Error saving package:', err);
      setError(
        err.response?.data?.message || 
        'Failed to save package. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="package-form-loading">Loading package data...</div>;
  }

  return (
    <div className="package-form-container">
      <h2>{isEditing ? 'Edit Tour Package' : 'Create New Tour Package'}</h2>
      <p className="form-subtitle">Fill in the details below to {isEditing ? 'update your' : 'create a new'} tour package</p>
      
      {error && <div className="form-error"><i className="fas fa-exclamation-circle"></i> {error}</div>}
      {success && <div className="form-success"><i className="fas fa-check-circle"></i> {success}</div>}
      
      <form onSubmit={handleSubmit} className="package-form">
        <div className="form-group">
          <label htmlFor="title">Package Title*</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter an attractive package title"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description*</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Provide a detailed description of the package, including highlights and unique experiences"
            required
          ></textarea>
          <small className="form-hint">A compelling description helps travelers understand what makes this package special</small>
        </div>
        
        <div className="form-section">
          <h3>Package Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="destination">Destination*</label>
              <input
                type="text"
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                placeholder="e.g. Kerala, Goa, Rajasthan"
                required
              />
              <small className="form-hint">Popular destination name that travelers will search for</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="duration">Duration*</label>
              <input
                type="text"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="e.g. 3 Days / 2 Nights"
                required
              />
              <small className="form-hint">Format as 'X Days / Y Nights'</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="price">Price (₹)*</label>
              <div className="price-input-wrapper">
                <span className="price-currency">₹</span>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  placeholder="e.g. 15000"
                  required
                />
              </div>
              <small className="form-hint">Price per person in Indian Rupees</small>
            </div>
          </div>
        </div>
        
        <div className="form-row checkbox-row">
          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="available"
              name="available"
              checked={formData.available}
              onChange={handleChange}
            />
            <label htmlFor="available">Available for Booking</label>
            <small className="checkbox-hint">Uncheck to hide this package from search results</small>
          </div>
          
          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="featured"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
            />
            <label htmlFor="featured">Featured Package</label>
            <small className="checkbox-hint">Featured packages appear on the homepage</small>
          </div>
        </div>
        
        <div className="form-section">
          <h3>What's Included</h3>
          <p className="section-description">List the amenities, services, and experiences included in this package</p>
          
          <div className="included-items-container">
            {formData.included.map((item, index) => (
              <div key={`included-${index}`} className="included-item">
                <div className="included-item-icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleIncludedChange(index, e.target.value)}
                  placeholder={`e.g. Accommodation, Meals, Transportation, etc.`}
                />
                <button 
                  type="button" 
                  className="remove-button"
                  onClick={() => removeIncludedItem(index)}
                  aria-label="Remove item"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
          </div>
          
          <button 
            type="button" 
            className="add-button"
            onClick={addIncludedItem}
          >
            <i className="fas fa-plus"></i> Add Item
          </button>
        </div>
        
        <div className="form-section">
          <h3>Itinerary Details</h3>
          <p className="section-description">Create a day-by-day breakdown of activities and experiences</p>
          
          <div className="itinerary-container">
            {itinerary.map((day, index) => (
              <div key={`itinerary-${index}`} className="itinerary-item">
                <div className="itinerary-day-number">{index + 1}</div>
                <div className="itinerary-content">
                  <div className="itinerary-header">
                    <input
                      type="text"
                      value={day.title}
                      onChange={(e) => handleItineraryChange(index, 'title', e.target.value)}
                      placeholder={`Day ${index + 1}`}
                      className="itinerary-day-title"
                    />
                    <button
                      type="button"
                      className="remove-button small"
                      onClick={() => removeItineraryDay(index)}
                      aria-label="Remove day"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                  <textarea
                    value={day.description}
                    onChange={(e) => handleItineraryChange(index, 'description', e.target.value)}
                    placeholder="Describe the activities, meals, accommodations, and highlights for this day in detail"
                    rows="3"
                    className="itinerary-description"
                  ></textarea>
                </div>
              </div>
            ))}
          </div>
          
          <button
            type="button"
            className="add-button"
            onClick={addItineraryDay}
          >
            <i className="fas fa-calendar-plus"></i> Add Another Day
          </button>
        </div>
        
        <div className="form-section">
          <h3>Package Images</h3>
          <p className="section-description">Upload high-quality images that showcase the destination and experiences</p>
          
          <div className="image-upload-container">
            <div className="image-upload-input">
              <input
                type="file"
                id="images"
                name="images"
                onChange={handleImageChange}
                multiple
                accept="image/*"
                className="file-input"
              />
              <label htmlFor="images" className="custom-file-upload">
                <i className="fas fa-cloud-upload-alt"></i> Select Images
              </label>
              <small className="form-hint">You can select multiple images at once</small>
            </div>
          
          {previewImages.length > 0 && (
            <div className="image-preview-grid">
              {previewImages.map((image, index) => (
                <div key={`image-${index}`} className="image-preview-item">
                  <img src={image.url} alt={`Preview ${index + 1}`} />
                  <button 
                    type="button" 
                    className="image-preview-remove"
                    onClick={() => removeImage(index)}
                    aria-label="Remove image"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                  <div className="image-preview-info">
                    <span className="image-name">{image.isExisting ? 'Existing: ' : ''}{image.name.length > 15 ? `${image.name.substring(0, 15)}...` : image.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
        
        <div className="form-buttons">
          <button 
            type="button" 
            className="cancel-button"
            onClick={() => {
              if (onSuccess) onSuccess();
              else navigate(-1);
            }}
          >
            <i className="fas fa-times"></i> Cancel
          </button>
          
          <button 
            type="submit" 
            className="submit-button"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="loading-spinner"></span>
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <i className="fas fa-save"></i> {isEditing ? 'Update Package' : 'Create Package'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PackageForm; 