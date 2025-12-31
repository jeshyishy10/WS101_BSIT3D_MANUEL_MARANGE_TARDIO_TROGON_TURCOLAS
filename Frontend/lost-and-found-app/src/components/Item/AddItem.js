import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ItemService from "../../services/ItemService";

function AddItem() {
    const navigate = useNavigate();
    const { userId } = useParams();
    const token = localStorage.getItem("token");
    const [user, setUser] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');

    const [formData, setFormData] = useState({
        itemName: '',
        description: '',
        location: '',
        status: 'LOST',
        category: '',
        date: '',
        time: '',
        value: 'MEDIUM',
        contactInfo: '',
        tags: ''
    });

    const categories = [
        { value: 'ELECTRONICS', label: 'Electronics', icon: '📱' },
        { value: 'WALLET', label: 'Wallet/Purse', icon: '👛' },
        { value: 'KEYS', label: 'Keys', icon: '🔑' },
        { value: 'DOCUMENTS', label: 'Documents', icon: '📄' },
        { value: 'JEWELRY', label: 'Jewelry', icon: '💍' },
        { value: 'BAGS', label: 'Bags/Backpacks', icon: '🎒' },
        { value: 'CLOTHING', label: 'Clothing', icon: '👕' },
        { value: 'BOOKS', label: 'Books/Notes', icon: '📚' },
        { value: 'STATIONERY', label: 'Stationery', icon: '✏️' },
        { value: 'WATER_BOTTLE', label: 'Water Bottle', icon: '💧' },
        { value: 'SPORTS', label: 'Sports Equipment', icon: '⚽' },
        { value: 'OTHER', label: 'Other', icon: '📦' }
    ];

    const locationSuggestions = [
        'Library - Ground Floor',
        'Library - 1st Floor',
        'Library - 2nd Floor',
        'Main Canteen',
        'University Auditorium',
        'Admin Building - Lobby',
        'Science Building - Lab 101',
        'Engineering Building - Room 201',
        'Parking Area A',
        'Parking Area B',
        'Student Center',
        'Gymnasium',
        'Computer Lab 1',
        'Classroom 301',
        'Cafeteria',
        'Garden Area',
        'Sports Field'
    ];

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);

                // Set current date and time
                const now = new Date();
                const currentDate = now.toISOString().split('T')[0];
                const currentTime = now.toTimeString().slice(0, 5);

                setFormData(prev => ({
                    ...prev,
                    date: currentDate,
                    time: currentTime,
                    contactInfo: parsedUser.email || parsedUser.phone || ''
                }));
            } catch (error) {
                console.error('Error parsing user data:', error);
                navigate('/UserLogin');
            }
        } else {
            navigate('/UserLogin');
        }
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleCategorySelect = (category) => {
        setSelectedCategory(category.value);
        setFormData({ ...formData, category: category.value });
    };

    const handleLocationSelect = (location) => {
        setFormData({ ...formData, location });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert('File size should be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        // Clear file input
        const fileInput = document.getElementById('itemImage');
        if (fileInput) fileInput.value = '';
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            // Prepare data for submission
            const submissionData = {
                ...formData,
                userId: userId,
                reportedBy: user?.name || user?.email || 'Anonymous',
                imageData: imagePreview // In real app, upload to server first
            };

            await ItemService.reportItem(submissionData, userId, token);

            // Reset form
            setFormData({
                itemName: '',
                description: '',
                location: '',
                status: 'LOST',
                category: '',
                date: '',
                time: '',
                value: 'MEDIUM',
                contactInfo: '',
                tags: ''
            });
            setImagePreview(null);
            setSelectedCategory('');

            alert("✅ Item Reported Successfully!");
            navigate('/my-reports');
        } catch (error) {
            console.error('Error Reporting Item: ', error);
            alert("❌ An Error Occurred While Reporting Item. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
            navigate('/Home');
        }
    };

    const isFormValid = () => {
        return formData.itemName.trim() &&
               formData.description.trim() &&
               formData.location.trim() &&
               formData.category &&
               formData.date &&
               formData.time;
    };

    return (
        <div style={styles.container}>
            {/* Navigation */}
            <nav style={styles.navbar}>
                <div style={styles.navContent}>
                    <div style={styles.navLogo}>
                        <span style={styles.logoIcon}>📦</span>
                        <span style={styles.logoText}>UEP Item Recovery</span>
                    </div>

                    <div style={styles.navMenu}>
                        <button style={styles.navLink} onClick={() => navigate('/Home')}>
                            🏠 <span>Dashboard</span>
                        </button>
                        <button style={styles.navLink} onClick={() => navigate('/my-reports')}>
                            📋 <span>My Reports</span>
                        </button>
                        <button style={styles.navLink} onClick={() => navigate('/ItemList')}>
                            🔍 <span>Browse Items</span>
                        </button>
                        <button style={styles.navLink} onClick={() => navigate(`/Profile/${userId}`)}>
                            👤 <span>Profile</span>
                        </button>
                    </div>
                </div>
            </nav>

            <main style={styles.main}>
                <div style={styles.contentWrapper}>
                    {/* Header */}
                    <div style={styles.headerSection}>
                        <button style={styles.backBtn} onClick={() => navigate('/Home')}>
                            ↩️ <span>Back to Dashboard</span>
                        </button>
                        <div style={styles.headerContent}>
                            <h1 style={styles.pageTitle}>
                                {formData.status === 'LOST' ? '🚨 Report Lost Item' : '📦 Report Found Item'}
                            </h1>
                            <p style={styles.pageSubtitle}>
                                {formData.status === 'LOST'
                                    ? 'Help us find your lost item by providing detailed information'
                                    : 'Help reunite found items with their owners'}
                            </p>
                        </div>
                        <div style={styles.statusToggle}>
                            <button
                                style={formData.status === 'LOST' ? styles.activeStatusBtn : styles.statusBtn}
                                onClick={() => setFormData({...formData, status: 'LOST'})}
                            >
                                🚨 I Lost Something
                            </button>
                            <button
                                style={formData.status === 'FOUND' ? styles.activeStatusBtn : styles.statusBtn}
                                onClick={() => setFormData({...formData, status: 'FOUND'})}
                            >
                                📦 I Found Something
                            </button>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.formGrid}>
                            {/* Left Column */}
                            <div style={styles.formColumn}>
                                {/* Item Name */}
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        <span style={styles.labelIcon}>🏷️</span>
                                        Item Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="itemName"
                                        value={formData.itemName}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Black Leather Wallet, iPhone 13 Pro, Calculus Textbook"
                                        style={styles.input}
                                        required
                                        maxLength={100}
                                    />
                                    <div style={styles.charCount}>
                                        {formData.itemName.length}/100 characters
                                    </div>
                                </div>

                                {/* Description */}
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        <span style={styles.labelIcon}>📝</span>
                                        Description *
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Provide detailed description including color, brand, distinguishing marks, contents, etc."
                                        style={styles.textarea}
                                        rows={4}
                                        required
                                        maxLength={500}
                                    />
                                    <div style={styles.charCount}>
                                        {formData.description.length}/500 characters
                                    </div>
                                </div>

                                {/* Location */}
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        <span style={styles.labelIcon}>📍</span>
                                        Location *
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        placeholder="Where did you lose/find the item?"
                                        style={styles.input}
                                        required
                                        list="locationSuggestions"
                                    />
                                    <datalist id="locationSuggestions">
                                        {locationSuggestions.map((loc, index) => (
                                            <option key={index} value={loc} />
                                        ))}
                                    </datalist>
                                    <div style={styles.suggestions}>
                                        {locationSuggestions.slice(0, 3).map((loc, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                style={styles.suggestionBtn}
                                                onClick={() => handleLocationSelect(loc)}
                                            >
                                                {loc}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Date & Time */}
                                <div style={styles.dateTimeGroup}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>
                                            <span style={styles.labelIcon}>📅</span>
                                            Date *
                                        </label>
                                        <input
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleInputChange}
                                            style={styles.input}
                                            required
                                            max={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>
                                            <span style={styles.labelIcon}>⏰</span>
                                            Time *
                                        </label>
                                        <input
                                            type="time"
                                            name="time"
                                            value={formData.time}
                                            onChange={handleInputChange}
                                            style={styles.input}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div style={styles.formColumn}>
                                {/* Category Selection */}
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        <span style={styles.labelIcon}>🏷️</span>
                                        Category *
                                    </label>
                                    <div style={styles.categoryGrid}>
                                        {categories.map((category) => (
                                            <button
                                                key={category.value}
                                                type="button"
                                                style={
                                                    selectedCategory === category.value
                                                        ? styles.activeCategoryBtn
                                                        : styles.categoryBtn
                                                }
                                                onClick={() => handleCategorySelect(category)}
                                            >
                                                <span style={styles.categoryIcon}>{category.icon}</span>
                                                <span style={styles.categoryLabel}>{category.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                    {selectedCategory && (
                                        <div style={styles.selectedCategory}>
                                            Selected: {categories.find(c => c.value === selectedCategory)?.label}
                                        </div>
                                    )}
                                </div>



                                {/* Contact Info */}
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        <span style={styles.labelIcon}>📞</span>
                                        Contact Information
                                    </label>
                                    <input
                                        type="text"
                                        name="contactInfo"
                                        value={formData.contactInfo}
                                        onChange={handleInputChange}
                                        placeholder="Email or phone number for contact"
                                        style={styles.input}
                                    />
                                </div>

                                {/* Tags */}
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        <span style={styles.labelIcon}>🏷️</span>
                                        Tags (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        name="tags"
                                        value={formData.tags}
                                        onChange={handleInputChange}
                                        placeholder="e.g., black, leather, student-id, urgent"
                                        style={styles.input}
                                    />
                                    <div style={styles.tagsHint}>
                                        Separate tags with commas
                                    </div>
                                </div>

                                {/* Image Upload */}
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        <span style={styles.labelIcon}>🖼️</span>
                                        Upload Image (Optional)
                                    </label>
                                    <div style={styles.imageUploadArea}>
                                        {imagePreview ? (
                                            <div style={styles.imagePreviewContainer}>
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    style={styles.imagePreview}
                                                />
                                                <button
                                                    type="button"
                                                    style={styles.removeImageBtn}
                                                    onClick={handleRemoveImage}
                                                >
                                                    ❌ Remove
                                                </button>
                                            </div>
                                        ) : (
                                            <label style={styles.uploadLabel}>
                                                <input
                                                    type="file"
                                                    id="itemImage"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    style={styles.fileInput}
                                                />
                                                <div style={styles.uploadContent}>
                                                    <span style={styles.uploadIcon}>📤</span>
                                                    <span>Click to upload image</span>
                                                    <span style={styles.uploadHint}>Max 5MB (JPG, PNG)</span>
                                                </div>
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div style={styles.formActions}>
                            <button
                                type="button"
                                style={styles.cancelBtn}
                                onClick={handleCancel}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                style={styles.submitBtn}
                                disabled={!isFormValid() || isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span style={styles.spinner}></span>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        📝 {formData.status === 'LOST' ? 'Report Lost Item' : 'Report Found Item'}
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Form Tips */}
                        <div style={styles.tipsSection}>
                            <h4 style={styles.tipsTitle}>💡 Tips for Better Results:</h4>
                            <ul style={styles.tipsList}>
                                <li>Provide detailed and accurate descriptions</li>
                                <li>Include specific location details</li>
                                <li>Upload clear photos if available</li>
                                <li>Select the correct category for better matching</li>
                                <li>Keep your contact information updated</li>
                            </ul>
                        </div>
                    </form>
                </div>
            </main>

            {/* Footer */}
            <footer style={styles.footer}>
                <div style={styles.footerContent}>
                    <div style={styles.footerInfo}>
                        <span style={styles.footerIcon}>📦</span>
                        <div>
                            <h3 style={styles.footerTitle}>UEP Item Recovery</h3>
                            <p style={styles.footerText}>Report lost or found items securely</p>
                        </div>
                    </div>
                    <p style={styles.copyright}>
                        © {new Date().getFullYear()} University of Eastern Philippines
                    </p>
                </div>
            </footer>
        </div>
    );
}

// Styles
const styles = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a192f 0%, #112240 100%)',
        color: '#e6f1ff',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    navbar: {
        background: 'rgba(17, 34, 64, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(35, 53, 84, 0.5)',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
    },
    navContent: {
        maxWidth: '1400px',
        margin: '0 auto',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    navLogo: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
    },
    logoIcon: {
        fontSize: '1.8rem',
        color: '#64ffda',
    },
    logoText: {
        fontSize: '1.3rem',
        fontWeight: '700',
        color: '#e6f1ff',
    },
    navMenu: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    navLink: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'transparent',
        border: '1px solid rgba(35, 53, 84, 0.5)',
        color: '#8892b0',
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: '500',
        transition: 'all 0.3s ease',
        ':hover': {
            background: 'rgba(100, 255, 218, 0.1)',
            color: '#64ffda',
        }
    },
    main: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem',
    },
    contentWrapper: {
        background: 'rgba(17, 34, 64, 0.3)',
        borderRadius: '20px',
        padding: '2rem',
        border: '1px solid rgba(35, 53, 84, 0.5)',
    },
    headerSection: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem',
        paddingBottom: '2rem',
        borderBottom: '1px solid rgba(35, 53, 84, 0.5)',
    },
    backBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'transparent',
        border: '1px solid rgba(100, 255, 218, 0.3)',
        color: '#64ffda',
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: '600',
        transition: 'all 0.3s ease',
        ':hover': {
            background: 'rgba(100, 255, 218, 0.1)',
        }
    },
    headerContent: {
        flex: '1',
        textAlign: 'center',
    },
    pageTitle: {
        fontSize: '2.5rem',
        fontWeight: '700',
        color: '#e6f1ff',
        margin: '0 0 0.5rem 0',
    },
    pageSubtitle: {
        color: '#8892b0',
        fontSize: '1.1rem',
        margin: '0',
    },
    statusToggle: {
        display: 'flex',
        gap: '1rem',
    },
    statusBtn: {
        background: 'transparent',
        border: '1px solid rgba(35, 53, 84, 0.5)',
        color: '#8892b0',
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: '600',
        transition: 'all 0.3s ease',
        ':hover': {
            background: 'rgba(35, 53, 84, 0.3)',
        }
    },
    activeStatusBtn: {
        background: 'rgba(100, 255, 218, 0.1)',
        border: '1px solid rgba(100, 255, 218, 0.3)',
        color: '#64ffda',
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: '600',
    },
    form: {
        marginTop: '2rem',
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem',
        '@media (max-width: 992px)': {
            gridTemplateColumns: '1fr',
        }
    },
    formColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    formGroup: {
        marginBottom: '1rem',
    },
    label: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: '#ccd6f6',
        fontSize: '0.95rem',
        fontWeight: '600',
        marginBottom: '0.75rem',
    },
    labelIcon: {
        fontSize: '1.2rem',
    },
    input: {
        width: '100%',
        background: 'rgba(10, 25, 47, 0.8)',
        border: '1px solid rgba(35, 53, 84, 0.5)',
        color: '#e6f1ff',
        padding: '0.75rem 1rem',
        borderRadius: '8px',
        fontSize: '0.95rem',
        outline: 'none',
        transition: 'all 0.3s ease',
        ':focus': {
            borderColor: '#64ffda',
            boxShadow: '0 0 0 2px rgba(100, 255, 218, 0.2)',
        }
    },
    textarea: {
        width: '100%',
        background: 'rgba(10, 25, 47, 0.8)',
        border: '1px solid rgba(35, 53, 84, 0.5)',
        color: '#e6f1ff',
        padding: '0.75rem 1rem',
        borderRadius: '8px',
        fontSize: '0.95rem',
        outline: 'none',
        resize: 'vertical',
        minHeight: '100px',
        transition: 'all 0.3s ease',
        ':focus': {
            borderColor: '#64ffda',
            boxShadow: '0 0 0 2px rgba(100, 255, 218, 0.2)',
        }
    },
    charCount: {
        textAlign: 'right',
        color: '#8892b0',
        fontSize: '0.8rem',
        marginTop: '0.25rem',
    },
    suggestions: {
        display: 'flex',
        gap: '0.5rem',
        marginTop: '0.5rem',
        flexWrap: 'wrap',
    },
    suggestionBtn: {
        background: 'rgba(35, 53, 84, 0.5)',
        border: '1px solid rgba(35, 53, 84, 0.7)',
        color: '#a8b2d1',
        padding: '0.25rem 0.75rem',
        borderRadius: '4px',
        fontSize: '0.8rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        ':hover': {
            background: 'rgba(100, 255, 218, 0.1)',
            color: '#64ffda',
        }
    },
    dateTimeGroup: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
    },
    categoryGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.75rem',
        '@media (max-width: 768px)': {
            gridTemplateColumns: 'repeat(2, 1fr)',
        }
    },
    categoryBtn: {
        background: 'rgba(35, 53, 84, 0.5)',
        border: '1px solid rgba(35, 53, 84, 0.7)',
        color: '#a8b2d1',
        padding: '0.75rem',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'all 0.3s ease',
        ':hover': {
            background: 'rgba(100, 255, 218, 0.1)',
            borderColor: 'rgba(100, 255, 218, 0.3)',
        }
    },
    activeCategoryBtn: {
        background: 'rgba(100, 255, 218, 0.1)',
        border: '1px solid rgba(100, 255, 218, 0.3)',
        color: '#64ffda',
        padding: '0.75rem',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
    },
    categoryIcon: {
        fontSize: '1.5rem',
    },
    categoryLabel: {
        fontSize: '0.8rem',
        textAlign: 'center',
    },
    selectedCategory: {
        marginTop: '0.5rem',
        color: '#64ffda',
        fontSize: '0.9rem',
        fontWeight: '600',
    },
    select: {
        width: '100%',
        background: 'rgba(10, 25, 47, 0.8)',
        border: '1px solid rgba(35, 53, 84, 0.5)',
        color: '#e6f1ff',
        padding: '0.75rem 1rem',
        borderRadius: '8px',
        fontSize: '0.95rem',
        outline: 'none',
        cursor: 'pointer',
        ':focus': {
            borderColor: '#64ffda',
            boxShadow: '0 0 0 2px rgba(100, 255, 218, 0.2)',
        }
    },
    tagsHint: {
        color: '#8892b0',
        fontSize: '0.8rem',
        marginTop: '0.25rem',
    },
    imageUploadArea: {
        border: '2px dashed rgba(35, 53, 84, 0.7)',
        borderRadius: '8px',
        padding: '1.5rem',
        textAlign: 'center',
        transition: 'all 0.3s ease',
        ':hover': {
            borderColor: '#64ffda',
            background: 'rgba(100, 255, 218, 0.05)',
        }
    },
    uploadLabel: {
        cursor: 'pointer',
        display: 'block',
    },
    fileInput: {
        display: 'none',
    },
    uploadContent: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
    },
    uploadIcon: {
        fontSize: '2.5rem',
        color: '#64ffda',
    },
    uploadHint: {
        color: '#8892b0',
        fontSize: '0.8rem',
    },
    imagePreviewContainer: {
        position: 'relative',
    },
    imagePreview: {
        width: '100%',
        maxHeight: '200px',
        objectFit: 'contain',
        borderRadius: '8px',
        border: '1px solid rgba(35, 53, 84, 0.5)',
    },
    removeImageBtn: {
        position: 'absolute',
        top: '0.5rem',
        right: '0.5rem',
        background: 'rgba(255, 107, 107, 0.9)',
        color: 'white',
        border: 'none',
        padding: '0.25rem 0.75rem',
        borderRadius: '4px',
        fontSize: '0.8rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        ':hover': {
            background: '#ff6b6b',
        }
    },
    formActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '1rem',
        marginTop: '3rem',
        paddingTop: '2rem',
        borderTop: '1px solid rgba(35, 53, 84, 0.5)',
    },
    cancelBtn: {
        background: 'transparent',
        border: '1px solid rgba(255, 107, 107, 0.3)',
        color: '#ff6b6b',
        padding: '0.75rem 2rem',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        ':hover': {
            background: 'rgba(255, 107, 107, 0.1)',
        },
        ':disabled': {
            opacity: 0.5,
            cursor: 'not-allowed',
        }
    },
    submitBtn: {
        background: 'linear-gradient(135deg, #64ffda, #4ecdc4)',
        border: 'none',
        color: '#0a192f',
        padding: '0.75rem 2rem',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'all 0.3s ease',
        ':hover:not(:disabled)': {
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 25px rgba(100, 255, 218, 0.4)',
        },
        ':disabled': {
            opacity: 0.5,
            cursor: 'not-allowed',
        }
    },
    spinner: {
        width: '16px',
        height: '16px',
        border: '2px solid #0a192f',
        borderTop: '2px solid transparent',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        display: 'inline-block',
        marginRight: '0.5rem',
    },
    tipsSection: {
        marginTop: '3rem',
        padding: '1.5rem',
        background: 'rgba(17, 34, 64, 0.5)',
        borderRadius: '12px',
        border: '1px solid rgba(35, 53, 84, 0.5)',
    },
    tipsTitle: {
        color: '#64ffda',
        margin: '0 0 1rem 0',
        fontSize: '1.1rem',
    },
    tipsList: {
        color: '#8892b0',
        margin: '0',
        paddingLeft: '1.5rem',
        lineHeight: '1.6',
    },
    tipsList: {
        color: '#8892b0',
        margin: '0',
        paddingLeft: '1.5rem',
        lineHeight: '1.6',
    },
    footer: {
        background: '#020c1b',
        padding: '2rem',
        marginTop: '3rem',
        borderTop: '1px solid #233554',
    },
    footerContent: {
        maxWidth: '1400px',
        margin: '0 auto',
        textAlign: 'center',
    },
    footerInfo: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        marginBottom: '1rem',
    },
    footerIcon: {
        fontSize: '2rem',
        color: '#64ffda',
    },
    footerTitle: {
        fontSize: '1.3rem',
        fontWeight: '700',
        color: '#e6f1ff',
        margin: '0 0 0.5rem 0',
    },
    footerText: {
        color: '#8892b0',
        fontSize: '0.95rem',
        margin: '0',
    },
    copyright: {
        color: '#8892b0',
        fontSize: '0.9rem',
        margin: '0',
    },
};

// Add CSS animation for spinner
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    @media (max-width: 992px) {
        .form-grid {
            grid-template-columns: 1fr;
        }
    }

    @media (max-width: 768px) {
        .category-grid {
            grid-template-columns: repeat(2, 1fr);
        }

        .header-section {
            flex-direction: column;
            gap: 1.5rem;
        }

        .status-toggle {
            width: 100%;
            justify-content: center;
        }
    }

    @media (max-width: 480px) {
        .date-time-group {
            grid-template-columns: 1fr;
        }

        .form-actions {
            flex-direction: column;
        }

        .form-actions button {
            width: 100%;
        }
    }
`;
document.head.appendChild(styleSheet);

export default AddItem;