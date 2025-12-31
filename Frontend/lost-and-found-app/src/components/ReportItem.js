import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faCamera,
  faMapMarkerAlt,
  faCalendarAlt,
  faTag,
  faCommentDots,
  faPaperPlane,
  faImage,
  faTimes,
  faExclamationTriangle,
  faCheckCircle,
  faSpinner,
  faQrcode,
  faSearch,
  faUpload,
  faShieldAlt,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const ReportItem = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [scanningQR, setScanningQR] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    itemName: '',
    category: 'personal',
    location: '',
    dateLost: '',
    description: '',
    contactPreference: 'email',
    urgency: 'medium',
    specificLocation: '',
    tags: []
  });

  // Validation errors
  const [errors, setErrors] = useState({});

  // Available categories
  const categories = [
    { value: 'personal', label: 'Personal Items', icon: '👤' },
    { value: 'electronics', label: 'Electronics', icon: '💻' },
    { value: 'documents', label: 'Documents', icon: '📄' },
    { value: 'accessories', label: 'Accessories', icon: '👜' },
    { value: 'academic', label: 'Academic', icon: '📚' },
    { value: 'other', label: 'Other', icon: '🔍' }
  ];

  // Campus locations
  const campusLocations = [
    'Main Library',
    'Science Building',
    'Student Center',
    'Engineering Hall',
    'Gymnasium',
    'Cafeteria',
    'Administration Building',
    'Parking Lot',
    'Dormitory Area',
    'Sports Field',
    'Computer Lab',
    'Auditorium'
  ];

  // Urgency levels
  const urgencyLevels = [
    { value: 'low', label: 'Low', color: '#4ecdc4', description: 'Not urgent' },
    { value: 'medium', label: 'Medium', color: '#ffd166', description: 'Important but not critical' },
    { value: 'high', label: 'High', color: '#ff6b6b', description: 'Need it back soon' },
    { value: 'critical', label: 'Critical', color: '#ff4757', description: 'Contains sensitive/urgent items' }
  ];

  // Recent tags for quick selection
  const recentTags = ['wallet', 'keys', 'phone', 'laptop', 'books', 'id card', 'backpack', 'charger'];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Pre-fill date with today's date
        const today = new Date().toISOString().split('T')[0];
        setFormData(prev => ({ ...prev, dateLost: today }));
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCategorySelect = (category) => {
    setFormData(prev => ({ ...prev, category }));
  };

  const handleUrgencySelect = (urgency) => {
    setFormData(prev => ({ ...prev, urgency }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({ ...prev, image: 'Image size should be less than 5MB' }));
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Clear image error
      if (errors.image) {
        setErrors(prev => ({ ...prev, image: '' }));
      }
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleTagSelect = (tag) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleLocationSelect = (location) => {
    setFormData(prev => ({ ...prev, location }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.itemName.trim()) {
      newErrors.itemName = 'Item name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.location) {
      newErrors.location = 'Please select a location';
    }

    if (!formData.dateLost) {
      newErrors.dateLost = 'Please select the date lost';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Please provide a description';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description should be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      // In a real application, this would be an API call
      const reportData = {
        ...formData,
        userId: user?.id,
        userEmail: user?.email,
        userName: user?.name,
        reportedAt: new Date().toISOString(),
        status: 'pending',
        reportId: `REP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Save to localStorage (in real app, send to backend)
      const existingReports = JSON.parse(localStorage.getItem('userReports') || '[]');
      existingReports.push(reportData);
      localStorage.setItem('userReports', JSON.stringify(existingReports));

      setSuccess(true);

      // Redirect after success
      setTimeout(() => {
        navigate('/my-reports');
      }, 2000);

    } catch (error) {
      console.error('Error submitting report:', error);
      setErrors(prev => ({ ...prev, submit: 'Failed to submit report. Please try again.' }));
    } finally {
      setSubmitting(false);
    }
  };

  const simulateQRScan = () => {
    setScanningQR(true);

    // Simulate QR scanning process
    setTimeout(() => {
      const mockQRData = {
        itemName: 'Student ID Card',
        category: 'documents',
        description: 'University student ID with photo'
      };

      setFormData(prev => ({
        ...prev,
        itemName: mockQRData.itemName,
        category: mockQRData.category,
        description: mockQRData.description
      }));

      setScanningQR(false);

      // Show success message
      alert('QR Code scanned successfully! Item details have been auto-filled.');
    }, 1500);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // In a real app, you would reverse geocode to get location name
          setFormData(prev => ({
            ...prev,
            specificLocation: `Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)}`
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to retrieve your location. Please select from the list.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const getUserName = () => {
    if (user?.name) return user.name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <button
          style={styles.backButton}
          onClick={() => navigate(-1)}
          title="Go back"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <div style={styles.headerContent}>
          <h1 style={styles.headerTitle}>Report Lost Item</h1>
          <p style={styles.headerSubtitle}>
            Help us help you find your lost belongings
          </p>
        </div>
        <div style={styles.userInfo}>
          <span style={styles.userGreeting}>Hi, {getUserName()}</span>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {success ? (
          <div style={styles.successCard}>
            <div style={styles.successIcon}>
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
            <h2 style={styles.successTitle}>Report Submitted Successfully!</h2>
            <p style={styles.successMessage}>
              Your lost item report has been recorded. Our system will now start searching for matches.
              You'll be notified when there's an update.
            </p>
            <div style={styles.successDetails}>
              <p><strong>Report ID:</strong> REP-{Date.now().toString().slice(-8)}</p>
              <p><strong>Status:</strong> <span style={styles.statusPending}>Pending Review</span></p>
              <p><strong>Submitted:</strong> {new Date().toLocaleDateString()}</p>
            </div>
            <div style={styles.successActions}>
              <button
                style={styles.viewReportsBtn}
                onClick={() => navigate('/my-reports')}
              >
                View My Reports
              </button>
              <button
                style={styles.newReportBtn}
                onClick={() => {
                  setSuccess(false);
                  setFormData({
                    itemName: '',
                    category: 'personal',
                    location: '',
                    dateLost: new Date().toISOString().split('T')[0],
                    description: '',
                    contactPreference: 'email',
                    urgency: 'medium',
                    specificLocation: '',
                    tags: []
                  });
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
              >
                Report Another Item
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Form Sections */}
            <div style={styles.formGrid}>
              {/* Left Column */}
              <div style={styles.formColumn}>
                {/* Item Details Card */}
                <div style={styles.formCard}>
                  <div style={styles.cardHeader}>
                    <FontAwesomeIcon icon={faTag} style={styles.cardIcon} />
                    <h2 style={styles.cardTitle}>Item Details</h2>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Item Name *
                      {errors.itemName && (
                        <span style={styles.errorText}> - {errors.itemName}</span>
                      )}
                    </label>
                    <input
                      type="text"
                      name="itemName"
                      value={formData.itemName}
                      onChange={handleInputChange}
                      placeholder="e.g., Blue wallet, iPhone 13, Student ID"
                      style={{
                        ...styles.input,
                        borderColor: errors.itemName ? '#ff6b6b' : 'rgba(35, 53, 84, 0.5)'
                      }}
                      maxLength={100}
                    />
                    <div style={styles.characterCount}>
                      {formData.itemName.length}/100 characters
                    </div>
                  </div>

                  {/* Category Selection */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Category *
                      {errors.category && (
                        <span style={styles.errorText}> - {errors.category}</span>
                      )}
                    </label>
                    <div style={styles.categoryGrid}>
                      {categories.map(cat => (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => handleCategorySelect(cat.value)}
                          style={{
                            ...styles.categoryButton,
                            background: formData.category === cat.value
                              ? 'rgba(100, 255, 218, 0.2)'
                              : 'rgba(17, 34, 64, 0.6)',
                            border: `2px solid ${formData.category === cat.value ? '#64ffda' : 'rgba(35, 53, 84, 0.5)'}`
                          }}
                        >
                          <span style={styles.categoryIcon}>{cat.icon}</span>
                          <span style={styles.categoryLabel}>{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Description *
                      {errors.description && (
                        <span style={styles.errorText}> - {errors.description}</span>
                      )}
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe your item in detail. Include brand, color, size, unique features, contents (if wallet/bag), etc."
                      style={{
                        ...styles.textarea,
                        borderColor: errors.description ? '#ff6b6b' : 'rgba(35, 53, 84, 0.5)'
                      }}
                      rows={5}
                      maxLength={500}
                    />
                    <div style={styles.characterCount}>
                      {formData.description.length}/500 characters
                    </div>
                  </div>

                  {/* Tags */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Tags (Optional)</label>
                    <div style={styles.tagsContainer}>
                      {formData.tags.map(tag => (
                        <span key={tag} style={styles.tag}>
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            style={styles.tagRemove}
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
                        </span>
                      ))}
                      {formData.tags.length === 0 && (
                        <span style={styles.noTags}>No tags added yet</span>
                      )}
                    </div>
                    <div style={styles.recentTags}>
                      <p style={styles.recentTagsLabel}>Quick add:</p>
                      {recentTags.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagSelect(tag)}
                          style={styles.recentTag}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Location Details Card */}
                <div style={styles.formCard}>
                  <div style={styles.cardHeader}>
                    <FontAwesomeIcon icon={faMapMarkerAlt} style={styles.cardIcon} />
                    <h2 style={styles.cardTitle}>Location & Time</h2>
                  </div>

                  {/* Location Selection */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Campus Location *
                      {errors.location && (
                        <span style={styles.errorText}> - {errors.location}</span>
                      )}
                    </label>
                    <div style={styles.locationGrid}>
                      {campusLocations.map(loc => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => handleLocationSelect(loc)}
                          style={{
                            ...styles.locationButton,
                            background: formData.location === loc
                              ? 'rgba(255, 107, 107, 0.2)'
                              : 'rgba(17, 34, 64, 0.6)',
                            border: `2px solid ${formData.location === loc ? '#ff6b6b' : 'rgba(35, 53, 84, 0.5)'}`
                          }}
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Specific Location */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Specific Location Details (Optional)</label>
                    <div style={styles.locationInputGroup}>
                      <input
                        type="text"
                        name="specificLocation"
                        value={formData.specificLocation}
                        onChange={handleInputChange}
                        placeholder="e.g., Room 205, Near water fountain, Under desk"
                        style={styles.input}
                      />
                      <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        style={styles.locationButtonSmall}
                        title="Use current location"
                      >
                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                      </button>
                    </div>
                  </div>

                  {/* Date Lost */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Date Lost *
                      {errors.dateLost && (
                        <span style={styles.errorText}> - {errors.dateLost}</span>
                      )}
                    </label>
                    <div style={styles.dateInputGroup}>
                      <FontAwesomeIcon icon={faCalendarAlt} style={styles.dateIcon} />
                      <input
                        type="date"
                        name="dateLost"
                        value={formData.dateLost}
                        onChange={handleInputChange}
                        style={{
                          ...styles.input,
                          borderColor: errors.dateLost ? '#ff6b6b' : 'rgba(35, 53, 84, 0.5)'
                        }}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  {/* Time Estimate */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Approximate Time Lost (Optional)</label>
                    <div style={styles.timeGrid}>
                      {['Morning', 'Afternoon', 'Evening', 'Night', "Don't remember"].map(time => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, timeLost: time }))}
                          style={{
                            ...styles.timeButton,
                            background: formData.timeLost === time
                              ? 'rgba(255, 209, 102, 0.2)'
                              : 'rgba(17, 34, 64, 0.6)',
                            border: `1px solid ${formData.timeLost === time ? '#ffd166' : 'rgba(35, 53, 84, 0.5)'}`
                          }}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div style={styles.formColumn}>
                {/* Image Upload Card */}
                <div style={styles.formCard}>
                  <div style={styles.cardHeader}>
                    <FontAwesomeIcon icon={faCamera} style={styles.cardIcon} />
                    <h2 style={styles.cardTitle}>Item Photo</h2>
                  </div>

                  <div style={styles.imageUploadSection}>
                    {imagePreview ? (
                      <div style={styles.imagePreviewContainer}>
                        <img
                          src={imagePreview}
                          alt="Preview"
                          style={styles.imagePreview}
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          style={styles.removeImageButton}
                          title="Remove image"
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    ) : (
                      <div style={styles.uploadArea}>
                        <input
                          type="file"
                          id="imageUpload"
                          accept="image/*"
                          onChange={handleImageUpload}
                          style={styles.fileInput}
                        />
                        <label htmlFor="imageUpload" style={styles.uploadLabel}>
                          <FontAwesomeIcon icon={faUpload} style={styles.uploadIcon} />
                          <p style={styles.uploadText}>Click to upload photo</p>
                          <p style={styles.uploadSubtext}>or drag and drop</p>
                          <p style={styles.uploadHint}>PNG, JPG up to 5MB</p>
                        </label>
                      </div>
                    )}

                    {errors.image && (
                      <p style={styles.errorText}>{errors.image}</p>
                    )}

                    <div style={styles.imageTips}>
                      <p style={styles.tipsTitle}>
                        <FontAwesomeIcon icon={faExclamationTriangle} /> Photo Tips:
                      </p>
                      <ul style={styles.tipsList}>
                        <li>Upload clear, well-lit photos</li>
                        <li>Show unique features or damages</li>
                        <li>Include multiple angles if possible</li>
                        <li>Photos increase recovery chances by 70%</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Urgency & Contact Card */}
                <div style={styles.formCard}>
                  <div style={styles.cardHeader}>
                    <FontAwesomeIcon icon={faCommentDots} style={styles.cardIcon} />
                    <h2 style={styles.cardTitle}>Urgency & Contact</h2>
                  </div>

                  {/* Urgency Level */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Urgency Level</label>
                    <div style={styles.urgencyGrid}>
                      {urgencyLevels.map(level => (
                        <button
                          key={level.value}
                          type="button"
                          onClick={() => handleUrgencySelect(level.value)}
                          style={{
                            ...styles.urgencyButton,
                            background: formData.urgency === level.value
                              ? `${level.color}20`
                              : 'rgba(17, 34, 64, 0.6)',
                            border: `2px solid ${formData.urgency === level.value ? level.color : 'rgba(35, 53, 84, 0.5)'}`,
                            color: formData.urgency === level.value ? level.color : '#8892b0'
                          }}
                        >
                          <div style={styles.urgencyContent}>
                            <span style={styles.urgencyLabel}>{level.label}</span>
                            <span style={styles.urgencyDescription}>{level.description}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Contact Preference */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Preferred Contact Method</label>
                    <div style={styles.contactGrid}>
                      {['email', 'phone', 'both'].map(method => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, contactPreference: method }))}
                          style={{
                            ...styles.contactButton,
                            background: formData.contactPreference === method
                              ? 'rgba(100, 255, 218, 0.2)'
                              : 'rgba(17, 34, 64, 0.6)',
                            border: `2px solid ${formData.contactPreference === method ? '#64ffda' : 'rgba(35, 53, 84, 0.5)'}`
                          }}
                        >
                          {method.charAt(0).toUpperCase() + method.slice(1)}
                        </button>
                      ))}
                    </div>
                    <p style={styles.contactNote}>
                      We'll contact you at: {user?.email || 'Your registered email'}
                      {user?.phone && ` or ${user.phone}`}
                    </p>
                  </div>

                  {/* Additional Notes */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Additional Notes (Optional)</label>
                    <textarea
                      placeholder="Any additional information that might help in recovery..."
                      style={styles.textarea}
                      rows={3}
                      maxLength={200}
                      value={formData.additionalNotes || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                    />
                  </div>
                </div>

                {/* QR Scan Card */}
                <div style={styles.formCard}>
                  <div style={styles.cardHeader}>
                    <FontAwesomeIcon icon={faQrcode} style={styles.cardIcon} />
                    <h2 style={styles.cardTitle}>Quick Report</h2>
                  </div>

                  <div style={styles.qrSection}>
                    <p style={styles.qrDescription}>
                      Scan a QR code from a previously registered item to auto-fill details.
                    </p>
                    <button
                      type="button"
                      onClick={simulateQRScan}
                      disabled={scanningQR}
                      style={styles.qrButton}
                    >
                      {scanningQR ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} spin />
                          <span>Scanning...</span>
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faQrcode} />
                          <span>Scan QR Code</span>
                        </>
                      )}
                    </button>
                    <p style={styles.qrHint}>
                      Don't have a QR code? You can still submit the form manually.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Section */}
            <div style={styles.submitSection}>
              <div style={styles.submitTips}>
                <div style={styles.tipCard}>
                  <FontAwesomeIcon icon={faShieldAlt} style={styles.tipIcon} />
                  <div>
                    <h3 style={styles.tipTitle}>Secure & Private</h3>
                    <p style={styles.tipText}>Your personal information is protected</p>
                  </div>
                </div>
                <div style={styles.tipCard}>
                  <FontAwesomeIcon icon={faClock} style={styles.tipIcon} />
                  <div>
                    <h3 style={styles.tipTitle}>24/7 Monitoring</h3>
                    <p style={styles.tipText}>Our system continuously searches for matches</p>
                  </div>
                </div>
                <div style={styles.tipCard}>
                  <FontAwesomeIcon icon={faCheckCircle} style={styles.tipIcon} />
                  <div>
                    <h3 style={styles.tipTitle}>89% Success Rate</h3>
                    <p style={styles.tipText}>Most items are recovered within 48 hours</p>
                  </div>
                </div>
              </div>

              <div style={styles.submitActions}>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  style={styles.cancelButton}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={styles.submitButton}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faPaperPlane} />
                      <span>Submit Report</span>
                    </>
                  )}
                </button>
              </div>

              {errors.submit && (
                <div style={styles.submitError}>
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  <span>{errors.submit}</span>
                </div>
              )}

              <p style={styles.termsNote}>
                By submitting, you agree to our <a href="/terms" style={styles.link}>Terms of Service</a> and
                confirm that the information provided is accurate to the best of your knowledge.
              </p>
            </div>
          </form>
        )}
      </main>

      {/* Interactive CSS Styles */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }

          @keyframes slideIn {
            from { transform: translateX(-20px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }

          .form-card-hover {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            animation: fadeIn 0.5s ease-out;
          }

          .form-card-hover:hover {
            transform: translateY(-4px);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(100, 255, 218, 0.1);
          }

          .button-hover {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .button-hover:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
          }

          .upload-area-hover {
            transition: all 0.3s ease;
          }

          .upload-area-hover:hover {
            border-color: #64ffda;
            background: rgba(100, 255, 218, 0.05);
          }

          .category-button-hover:hover:not(:disabled) {
            transform: scale(1.05);
            border-color: #64ffda !important;
          }

          .location-button-hover:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(255, 107, 107, 0.2);
          }

          .urgency-button-hover:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
          }

          .tag-hover:hover {
            background: rgba(255, 107, 107, 0.2);
            transform: scale(1.05);
          }

          .recent-tag-hover:hover {
            background: rgba(100, 255, 218, 0.2);
            border-color: #64ffda;
          }

          .submit-button-hover:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(100, 255, 218, 0.4);
          }

          .cancel-button-hover:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
          }

          @media (max-width: 1024px) {
            .form-grid {
              grid-template-columns: 1fr;
              gap: 2rem;
            }
          }

          @media (max-width: 768px) {
            .header {
              flex-direction: column;
              align-items: flex-start;
              gap: 1rem;
            }

            .category-grid {
              grid-template-columns: repeat(2, 1fr);
            }

            .location-grid {
              grid-template-columns: repeat(2, 1fr);
            }

            .urgency-grid {
              grid-template-columns: 1fr;
            }

            .submit-tips {
              flex-direction: column;
              gap: 1rem;
            }

            .submit-actions {
              flex-direction: column;
              gap: 1rem;
            }

            .submit-actions button {
              width: 100%;
            }
          }

          @media (max-width: 480px) {
            .category-grid,
            .location-grid {
              grid-template-columns: 1fr;
            }

            .time-grid {
              grid-template-columns: repeat(2, 1fr);
            }

            .contact-grid {
              flex-direction: column;
            }

            .header-content {
              text-align: center;
            }
          }
        `}
      </style>
    </div>
  );
};

// Styles
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a192f 0%, #112240 100%)',
    color: '#e6f1ff',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    padding: '2rem',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '2rem',
    paddingBottom: '1.5rem',
    borderBottom: '1px solid rgba(35, 53, 84, 0.5)',
  },
  backButton: {
    background: 'rgba(100, 255, 218, 0.1)',
    border: '1px solid rgba(100, 255, 218, 0.3)',
    color: '#64ffda',
    padding: '0.75rem',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '50px',
    height: '50px',
  },
  headerContent: {
    flex: 1,
    textAlign: 'center',
  },
  headerTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#e6f1ff',
    margin: '0 0 0.5rem 0',
  },
  headerSubtitle: {
    color: '#8892b0',
    fontSize: '1rem',
    margin: '0',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  userGreeting: {
    color: '#64ffda',
    fontWeight: '600',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  // Success Card
  successCard: {
    background: 'rgba(17, 34, 64, 0.8)',
    border: '1px solid rgba(100, 255, 218, 0.3)',
    borderRadius: '20px',
    padding: '3rem',
    textAlign: 'center',
    animation: 'fadeIn 0.5s ease-out',
  },
  successIcon: {
    fontSize: '4rem',
    color: '#64ffda',
    marginBottom: '1.5rem',
  },
  successTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#e6f1ff',
    margin: '0 0 1rem 0',
  },
  successMessage: {
    color: '#8892b0',
    fontSize: '1.1rem',
    lineHeight: '1.6',
    maxWidth: '600px',
    margin: '0 auto 2rem auto',
  },
  successDetails: {
    background: 'rgba(10, 25, 47, 0.5)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem',
    textAlign: 'left',
  },
  statusPending: {
    color: '#ffd166',
    fontWeight: '600',
  },
  successActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
  },
  viewReportsBtn: {
    background: '#64ffda',
    color: '#0a192f',
    border: 'none',
    padding: '0.75rem 2rem',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  newReportBtn: {
    background: 'transparent',
    color: '#64ffda',
    border: '2px solid #64ffda',
    padding: '0.75rem 2rem',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  // Form Styles
  form: {
    animation: 'fadeIn 0.5s ease-out',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
    marginBottom: '3rem',
  },
  formColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  formCard: {
    background: 'rgba(17, 34, 64, 0.6)',
    border: '1px solid rgba(35, 53, 84, 0.5)',
    borderRadius: '16px',
    padding: '1.5rem',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid rgba(35, 53, 84, 0.3)',
  },
  cardIcon: {
    fontSize: '1.5rem',
    color: '#64ffda',
  },
  cardTitle: {
    fontSize: '1.3rem',
    fontWeight: '600',
    color: '#ccd6f6',
    margin: '0',
  },
  formGroup: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    color: '#ccd6f6',
    fontSize: '0.95rem',
    fontWeight: '500',
    marginBottom: '0.5rem',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    background: 'rgba(10, 25, 47, 0.5)',
    border: '1px solid rgba(35, 53, 84, 0.5)',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    color: '#e6f1ff',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.3s ease',
  },
  textarea: {
    width: '100%',
    background: 'rgba(10, 25, 47, 0.5)',
    border: '1px solid rgba(35, 53, 84, 0.5)',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    color: '#e6f1ff',
    fontSize: '0.95rem',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
    transition: 'border-color 0.3s ease',
  },
  characterCount: {
    textAlign: 'right',
    color: '#8892b0',
    fontSize: '0.8rem',
    marginTop: '0.25rem',
  },
  // Category Grid
  categoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.75rem',
  },
  categoryButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '1rem',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: 'none',
  },
  categoryIcon: {
    fontSize: '1.5rem',
    marginBottom: '0.5rem',
  },
  categoryLabel: {
    fontSize: '0.85rem',
    color: '#e6f1ff',
    fontWeight: '500',
  },
  // Tags
  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  tag: {
    background: 'rgba(255, 107, 107, 0.1)',
    color: '#ff6b6b',
    padding: '0.35rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  tagRemove: {
    background: 'none',
    border: 'none',
    color: 'inherit',
    cursor: 'pointer',
    padding: '0',
    fontSize: '0.8rem',
  },
  noTags: {
    color: '#8892b0',
    fontSize: '0.9rem',
    fontStyle: 'italic',
  },
  recentTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    alignItems: 'center',
  },
  recentTagsLabel: {
    color: '#8892b0',
    fontSize: '0.9rem',
    marginRight: '0.5rem',
  },
  recentTag: {
    background: 'rgba(100, 255, 218, 0.1)',
    color: '#64ffda',
    border: '1px solid rgba(100, 255, 218, 0.3)',
    padding: '0.25rem 0.75rem',
    borderRadius: '15px',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  // Location
  locationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.75rem',
  },
  locationButton: {
    padding: '0.75rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    border: 'none',
    color: '#e6f1ff',
    textAlign: 'left',
    transition: 'all 0.3s ease',
  },
  locationInputGroup: {
    display: 'flex',
    gap: '0.5rem',
  },
  locationButtonSmall: {
    background: 'rgba(255, 107, 107, 0.1)',
    border: '1px solid rgba(255, 107, 107, 0.3)',
    color: '#ff6b6b',
    padding: '0.75rem',
    borderRadius: '8px',
    cursor: 'pointer',
    minWidth: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Date
  dateInputGroup: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  dateIcon: {
    position: 'absolute',
    left: '1rem',
    color: '#8892b0',
    pointerEvents: 'none',
  },
  // Time
  timeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.5rem',
  },
  timeButton: {
    padding: '0.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    border: 'none',
    color: '#e6f1ff',
    transition: 'all 0.3s ease',
  },
  // Image Upload
  imageUploadSection: {
    marginBottom: '1rem',
  },
  uploadArea: {
    border: '2px dashed rgba(100, 255, 218, 0.3)',
    borderRadius: '12px',
    padding: '2rem',
    textAlign: 'center',
    cursor: 'pointer',
    marginBottom: '1rem',
  },
  fileInput: {
    display: 'none',
  },
  uploadLabel: {
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  uploadIcon: {
    fontSize: '2rem',
    color: '#64ffda',
  },
  uploadText: {
    color: '#64ffda',
    fontWeight: '600',
    fontSize: '1rem',
    margin: '0',
  },
  uploadSubtext: {
    color: '#8892b0',
    fontSize: '0.9rem',
    margin: '0',
  },
  uploadHint: {
    color: '#8892b0',
    fontSize: '0.8rem',
    margin: '0',
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: '1rem',
  },
  imagePreview: {
    width: '100%',
    borderRadius: '12px',
    maxHeight: '300px',
    objectFit: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: '0.5rem',
    right: '0.5rem',
    background: 'rgba(0, 0, 0, 0.7)',
    color: '#ff6b6b',
    border: 'none',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageTips: {
    background: 'rgba(255, 209, 102, 0.1)',
    border: '1px solid rgba(255, 209, 102, 0.3)',
    borderRadius: '8px',
    padding: '1rem',
  },
  tipsTitle: {
    color: '#ffd166',
    fontSize: '0.9rem',
    fontWeight: '600',
    margin: '0 0 0.5rem 0',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  tipsList: {
    color: '#8892b0',
    fontSize: '0.85rem',
    margin: '0',
    paddingLeft: '1.2rem',
    lineHeight: '1.5',
  },
  // Urgency
  urgencyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.75rem',
  },
  urgencyButton: {
    padding: '1rem',
    borderRadius: '12px',
    cursor: 'pointer',
    border: 'none',
    textAlign: 'left',
    transition: 'all 0.3s ease',
  },
  urgencyContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  urgencyLabel: {
    fontSize: '0.95rem',
    fontWeight: '600',
  },
  urgencyDescription: {
    fontSize: '0.8rem',
    opacity: 0.8,
  },
  // Contact
  contactGrid: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  contactButton: {
    flex: 1,
    padding: '0.75rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    border: 'none',
    color: '#e6f1ff',
    transition: 'all 0.3s ease',
  },
  contactNote: {
    color: '#8892b0',
    fontSize: '0.85rem',
    margin: '0',
  },
  // QR Section
  qrSection: {
    textAlign: 'center',
  },
  qrDescription: {
    color: '#8892b0',
    fontSize: '0.95rem',
    marginBottom: '1rem',
  },
  qrButton: {
    background: 'rgba(100, 255, 218, 0.1)',
    border: '2px solid #64ffda',
    color: '#64ffda',
    padding: '0.75rem 1.5rem',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.5rem',
  },
  qrHint: {
    color: '#8892b0',
    fontSize: '0.85rem',
    margin: '0',
  },
  // Submit Section
  submitSection: {
    background: 'rgba(17, 34, 64, 0.6)',
    border: '1px solid rgba(35, 53, 84, 0.5)',
    borderRadius: '16px',
    padding: '2rem',
  },
  submitTips: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem',
    marginBottom: '2rem',
  },
  tipCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flex: 1,
  },
  tipIcon: {
    fontSize: '1.5rem',
    color: '#64ffda',
  },
  tipTitle: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#ccd6f6',
    margin: '0 0 0.25rem 0',
  },
  tipText: {
    fontSize: '0.85rem',
    color: '#8892b0',
    margin: '0',
  },
  submitActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    marginBottom: '1rem',
  },
  cancelButton: {
    background: 'rgba(136, 146, 176, 0.1)',
    border: '1px solid rgba(136, 146, 176, 0.3)',
    color: '#8892b0',
    padding: '0.75rem 2rem',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  submitButton: {
    background: 'linear-gradient(135deg, #64ffda, #4ecdc4)',
    border: 'none',
    color: '#0a192f',
    padding: '0.75rem 3rem',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  submitError: {
    background: 'rgba(255, 107, 107, 0.1)',
    border: '1px solid rgba(255, 107, 107, 0.3)',
    color: '#ff6b6b',
    padding: '1rem',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  termsNote: {
    color: '#8892b0',
    fontSize: '0.85rem',
    textAlign: 'center',
    margin: '1rem 0 0 0',
  },
  link: {
    color: '#64ffda',
    textDecoration: 'none',
  },
};

export default ReportItem;