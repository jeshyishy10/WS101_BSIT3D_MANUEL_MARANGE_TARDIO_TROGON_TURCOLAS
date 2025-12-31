import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faBoxOpen,
  faTrash,
  faExclamationCircle,
  faMapMarkerAlt,
  faCalendarAlt,
  faFilter,
  faSort,
  faEye,
  faUser,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faPlusCircle,
  faChevronDown,
  faChevronUp,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import ItemService from "../../services/ItemService";
import RequestService from "../../services/RequestService";

function ItemList() {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("date");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedItem, setExpandedItem] = useState(null);

    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        fetchItemInfo();
    }, []);

    useEffect(() => {
        filterAndSortItems();
    }, [items, searchTerm, statusFilter, sortBy]);

    const formatDate = (dateArray) => {
        if (!Array.isArray(dateArray) || dateArray.length !== 3) return "Invalid Date";
        const date = new Date(dateArray[0], dateArray[1] - 1, dateArray[2]);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        switch(status?.toUpperCase()) {
            case 'FOUND': return '#06d6a0';
            case 'LOST': return '#ff6b6b';
            case 'CLAIMED': return '#118ab2';
            case 'PENDING': return '#ffd166';
            default: return '#8892b0';
        }
    };

    const getStatusIcon = (status) => {
        switch(status?.toUpperCase()) {
            case 'FOUND': return faCheckCircle;
            case 'LOST': return faExclamationCircle;
            case 'CLAIMED': return faClock;
            case 'PENDING': return faClock;
            default: return faInfoCircle;
        }
    };

    const handleDeleteItem = (itemId) => {
        const confirmed = window.confirm("Are you sure you want to delete this item?");

        if (confirmed) {
            setLoading(true);
            ItemService.deleteItem(itemId, token)
                .then(() => {
                    console.log("Item deleted successfully");
                    fetchItemInfo();
                })
                .catch((error) => {
                    console.error('Error deleting item:', error.response?.data || error.message);
                    setError("Failed to delete item");
                    setLoading(false);
                });
        }
    };

    const handleRequestItem = (itemId) => {
        const confirmed = window.confirm("Do you want to request this item?");

        if (confirmed) {
            setLoading(true);
            const requestData = {
                item: itemId,
                user: userId,
            };

            RequestService.requestItem(requestData, token)
                .then(() => {
                    alert("Request sent successfully!");
                    fetchItemInfo();
                })
                .catch((error) => {
                    console.error('Error sending request:', error.response?.data || error.message);
                    setError("Failed to send request");
                    setLoading(false);
                });
        }
    };

    const handleViewDetails = (itemId) => {
        navigate(`/item-details/${itemId}`);
    };

    const fetchItemInfo = async () => {
        try {
            setLoading(true);
            const response = await ItemService.getAllItems(token);
            console.log("API Response:", response);
            setItems(response || []);
            setFilteredItems(response || []);
            setError(null);
        } catch (err) {
            console.error("Error fetching item information:", err);
            setError(err.message || "An error occurred while fetching items.");
            setItems([]);
            setFilteredItems([]);
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortItems = () => {
        let result = [...items];

        // Filter by search term
        if (searchTerm) {
            result = result.filter(item =>
                item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.location?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by status
        if (statusFilter !== "all") {
            result = result.filter(item =>
                item.status?.toLowerCase() === statusFilter.toLowerCase()
            );
        }

        // Sort items
        result.sort((a, b) => {
            switch(sortBy) {
                case "date":
                    return new Date(b.reportedDate) - new Date(a.reportedDate);
                case "name":
                    return a.itemName?.localeCompare(b.itemName);
                case "status":
                    return a.status?.localeCompare(b.status);
                default:
                    return 0;
            }
        });

        setFilteredItems(result);
    };

    const toggleItemDetails = (itemId) => {
        setExpandedItem(expandedItem === itemId ? null : itemId);
    };

    const getCategoryColor = (category) => {
        if (!category) return '#64ffda';
        const colors = {
            'wallet': '#64ffda',
            'phone': '#ff6b6b',
            'keys': '#ffd166',
            'book': '#4ecdc4',
            'id': '#118ab2',
            'clothing': '#ff9a5a',
            'electronic': '#06d6a0',
            'jewelry': '#ff4081'
        };
        return colors[category.toLowerCase()] || '#64ffda';
    };

    const getCategoryIcon = (category) => {
        if (!category) return faBoxOpen;
        const icons = {
            'wallet': faBoxOpen,
            'phone': faBoxOpen,
            'keys': faBoxOpen,
            'book': faBoxOpen,
            'id': faBoxOpen,
            'clothing': faBoxOpen,
            'electronic': faBoxOpen,
            'jewelry': faBoxOpen
        };
        return icons[category.toLowerCase()] || faBoxOpen;
    };

    const handleReportNewItem = () => {
        navigate(`/ReportItem/${userId}`);
    };

    return (
        <div style={styles.container}>
            {/* Navigation */}
            <nav style={styles.navbar}>
                <div style={styles.navContent}>
                    <div style={styles.navLogo}>
                        <FontAwesomeIcon icon={faBoxOpen} style={styles.logoIcon} />
                        <span style={styles.logoText}>UEP Item Recovery</span>
                    </div>

                    <div style={styles.navMenu}>
                        <button style={{...styles.navLink, ...styles.activeNavLink}}>
                            <span>Found Items</span>
                        </button>
                        <button style={styles.navLink} onClick={() => navigate('/my-reports')}>
                            <span>My Reports</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main style={styles.main}>
                {/* Header */}
                <section style={styles.headerSection}>
                    <div>
                        <h1 style={styles.pageTitle}>Found Items Catalog</h1>
                        <p style={styles.pageSubtitle}>
                            Browse through items found around campus. {role !== "ADMIN" && "Request items you believe are yours."}
                        </p>
                    </div>

                    <div style={styles.headerActions}>
                        <button
                            style={styles.reportItemBtn}
                            onClick={handleReportNewItem}
                        >
                            <FontAwesomeIcon icon={faPlusCircle} />
                            <span>Report New Item</span>
                        </button>
                    </div>
                </section>

                {/* Stats */}
                <section style={styles.statsSection}>
                    <div style={styles.statsGrid}>
                        <div style={styles.statCard}>
                            <div style={styles.statIcon} className="stat-icon-found">
                                <FontAwesomeIcon icon={faCheckCircle} />
                            </div>
                            <div>
                                <h3 style={styles.statValue}>
                                    {items.filter(item => item.status?.toUpperCase() === 'FOUND').length}
                                </h3>
                                <p style={styles.statLabel}>Available Items</p>
                            </div>
                        </div>

                        <div style={styles.statCard}>
                            <div style={styles.statIcon} className="stat-icon-lost">
                                <FontAwesomeIcon icon={faExclamationCircle} />
                            </div>
                            <div>
                                <h3 style={styles.statValue}>
                                    {items.filter(item => item.status?.toUpperCase() === 'LOST').length}
                                </h3>
                                <p style={styles.statLabel}>Lost Items</p>
                            </div>
                        </div>

                        <div style={styles.statCard}>
                            <div style={styles.statIcon} className="stat-icon-claimed">
                                <FontAwesomeIcon icon={faCheckCircle} />
                            </div>
                            <div>
                                <h3 style={styles.statValue}>
                                    {items.filter(item => item.status?.toUpperCase() === 'CLAIMED').length}
                                </h3>
                                <p style={styles.statLabel}>Claimed Items</p>
                            </div>
                        </div>

                        <div style={styles.statCard}>
                            <div style={styles.statIcon} className="stat-icon-total">
                                <FontAwesomeIcon icon={faBoxOpen} />
                            </div>
                            <div>
                                <h3 style={styles.statValue}>{items.length}</h3>
                                <p style={styles.statLabel}>Total Items</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Filters & Search */}
                <section style={styles.filtersSection}>
                    <div style={styles.filtersContainer}>
                        <div style={styles.searchContainer}>
                            <FontAwesomeIcon icon={faSearch} style={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search items by name, description, or location..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={styles.searchInput}
                            />
                        </div>

                        <div style={styles.filterControls}>
                            <div style={styles.filterGroup}>
                                <FontAwesomeIcon icon={faFilter} style={styles.filterIcon} />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    style={styles.filterSelect}
                                >
                                    <option value="all">All Status</option>
                                    <option value="found">Found</option>
                                    <option value="lost">Lost</option>
                                    <option value="claimed">Claimed</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>

                            <div style={styles.filterGroup}>
                                <FontAwesomeIcon icon={faSort} style={styles.filterIcon} />
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    style={styles.filterSelect}
                                >
                                    <option value="date">Sort by Date</option>
                                    <option value="name">Sort by Name</option>
                                    <option value="status">Sort by Status</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div style={styles.resultsInfo}>
                        <span style={styles.resultsCount}>
                            {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
                        </span>
                        {searchTerm && (
                            <button
                                style={styles.clearFiltersBtn}
                                onClick={() => {
                                    setSearchTerm("");
                                    setStatusFilter("all");
                                }}
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                </section>

                {/* Items Grid */}
                <section style={styles.itemsSection}>
                    {loading ? (
                        <div style={styles.loadingContainer}>
                            <div style={styles.loadingSpinner}></div>
                            <p style={styles.loadingText}>Loading items...</p>
                        </div>
                    ) : error ? (
                        <div style={styles.errorContainer}>
                            <FontAwesomeIcon icon={faExclamationCircle} style={styles.errorIcon} />
                            <h3 style={styles.errorTitle}>Unable to Load Items</h3>
                            <p style={styles.errorText}>{error}</p>
                            <button
                                style={styles.retryBtn}
                                onClick={fetchItemInfo}
                            >
                                Try Again
                            </button>
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div style={styles.emptyState}>
                            <FontAwesomeIcon icon={faBoxOpen} style={styles.emptyIcon} />
                            <h3 style={styles.emptyTitle}>No Items Found</h3>
                            <p style={styles.emptyText}>
                                {searchTerm || statusFilter !== 'all'
                                    ? 'Try adjusting your filters or search term'
                                    : 'No items have been reported yet'}
                            </p>
                            <button
                                style={styles.emptyBtn}
                                onClick={handleReportNewItem}
                            >
                                <FontAwesomeIcon icon={faPlusCircle} />
                                <span>Report First Item</span>
                            </button>
                        </div>
                    ) : (
                        <div style={styles.itemsGrid}>
                            {filteredItems.map((item, index) => (
                                <div
                                    key={item.itemId || index}
                                    style={styles.itemCard}
                                    className="item-card-hover"
                                >
                                    <div style={styles.itemHeader}>
                                        <div style={styles.itemCategory}>
                                            <div style={{
                                                ...styles.categoryIcon,
                                                backgroundColor: getCategoryColor(item.category) + '20'
                                            }}>
                                                <FontAwesomeIcon
                                                    icon={getCategoryIcon(item.category)}
                                                    style={{ color: getCategoryColor(item.category) }}
                                                />
                                            </div>
                                            <div style={styles.itemCategoryText}>
                                                <span style={styles.itemCategoryLabel}>Category</span>
                                                <span style={styles.itemCategoryName}>
                                                    {item.category || 'General'}
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{
                                            ...styles.statusBadge,
                                            backgroundColor: getStatusColor(item.status) + '20',
                                            color: getStatusColor(item.status)
                                        }}>
                                            <FontAwesomeIcon
                                                icon={getStatusIcon(item.status)}
                                                style={styles.statusIcon}
                                            />
                                            <span>{item.status || 'Unknown'}</span>
                                        </div>
                                    </div>

                                    <div style={styles.itemContent}>
                                        <h3 style={styles.itemTitle}>{item.itemName || 'Unnamed Item'}</h3>
                                        <p style={styles.itemDescription}>
                                            {item.description || 'No description provided'}
                                        </p>

                                        <div style={styles.itemMeta}>
                                            <div style={styles.metaItem}>
                                                <FontAwesomeIcon icon={faMapMarkerAlt} style={styles.metaIcon} />
                                                <span>{item.location || 'Unknown Location'}</span>
                                            </div>
                                            <div style={styles.metaItem}>
                                                <FontAwesomeIcon icon={faCalendarAlt} style={styles.metaIcon} />
                                                <span>Reported: {formatDate(item.reportedDate)}</span>
                                            </div>
                                            {role === "ADMIN" && item.reportedUser && (
                                                <div style={styles.metaItem}>
                                                    <FontAwesomeIcon icon={faUser} style={styles.metaIcon} />
                                                    <span>By: {item.reportedUser}</span>
                                                </div>
                                            )}
                                        </div>

                                        {expandedItem === item.itemId && (
                                            <div style={styles.expandedDetails}>
                                                <div style={styles.detailsSection}>
                                                    <h4 style={styles.detailsTitle}>Additional Information</h4>
                                                    <p style={styles.detailsText}>
                                                        Item ID: <strong>{item.itemId}</strong>
                                                    </p>
                                                    {item.additionalDetails && (
                                                        <p style={styles.detailsText}>{item.additionalDetails}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div style={styles.itemFooter}>
                                        <div style={styles.itemActions}>
                                            <button
                                                style={styles.viewDetailsBtn}
                                                onClick={() => toggleItemDetails(item.itemId)}
                                                title={expandedItem === item.itemId ? "Show less" : "Show more"}
                                            >
                                                <FontAwesomeIcon icon={expandedItem === item.itemId ? faChevronUp : faChevronDown} />
                                                <span>{expandedItem === item.itemId ? "Less" : "More"}</span>
                                            </button>

                                            {role === "ADMIN" ? (
                                                <button
                                                    style={styles.deleteBtn}
                                                    onClick={() => handleDeleteItem(item.itemId)}
                                                    title="Delete Item"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                    <span>Delete</span>
                                                </button>
                                            ) : (
                                                item.status?.toUpperCase() === "FOUND" && (
                                                    <button
                                                        style={styles.requestBtn}
                                                        onClick={() => handleRequestItem(item.itemId)}
                                                        title="Request this item"
                                                    >
                                                        <FontAwesomeIcon icon={faCheckCircle} />
                                                        <span>Request Item</span>
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Help Section */}
                <section style={styles.helpSection}>
                    <div style={styles.helpContent}>
                        <FontAwesomeIcon icon={faInfoCircle} style={styles.helpIcon} />
                        <div style={styles.helpText}>
                            <h2 style={styles.helpTitle}>Need Help?</h2>
                            <p style={styles.helpDesc}>
                                If you've found an item or believe an item belongs to you,
                                contact campus security for assistance.
                            </p>
                        </div>
                        <button
                            style={styles.contactBtn}
                            onClick={() => navigate('/contact')}
                        >
                            <FontAwesomeIcon icon={faInfoCircle} /> Contact Support
                        </button>
                    </div>
                </section>
            </main>

            {/* Floating Action Button */}
            <button
                style={styles.fab}
                onClick={handleReportNewItem}
                title="Report New Item"
                className="fab-hover"
            >
                <FontAwesomeIcon icon={faPlusCircle} />
            </button>

            {/* Interactive Styles */}
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }

                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.5; }
                    }

                    /* Enhanced Shadow Effects */
                    .item-card-hover {
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        cursor: pointer;
                    }

                    .item-card-hover:hover {
                        transform: translateY(-8px);
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(100, 255, 218, 0.2);
                    }

                    .fab-hover {
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    }

                    .fab-hover:hover {
                        transform: scale(1.15);
                        box-shadow: 0 15px 35px rgba(100, 255, 218, 0.7);
                    }

                    .stat-icon-found {
                        background: rgba(6, 214, 160, 0.1);
                        color: #06d6a0;
                    }

                    .stat-icon-lost {
                        background: rgba(255, 107, 107, 0.1);
                        color: #ff6b6b;
                    }

                    .stat-icon-claimed {
                        background: rgba(17, 138, 178, 0.1);
                        color: #118ab2;
                    }

                    .stat-icon-total {
                        background: rgba(100, 255, 218, 0.1);
                        color: #64ffda;
                    }

                    .view-details-btn:hover, .request-btn:hover, .contact-btn:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
                    }

                    .delete-btn:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 8px 20px rgba(255, 107, 107, 0.3);
                    }

                    @media (max-width: 768px) {
                        .items-grid {
                            grid-template-columns: 1fr;
                        }

                        .filters-container {
                            flex-direction: column;
                            gap: 1rem;
                        }

                        .search-container {
                            width: 100%;
                        }

                        .help-content {
                            flex-direction: column;
                            text-align: center;
                            gap: 1.5rem;
                        }
                    }

                    @media (max-width: 480px) {
                        .fab {
                            bottom: 1rem;
                            right: 1rem;
                            width: 50px;
                            height: 50px;
                            font-size: 1.2rem;
                        }

                        .stat-card {
                            flex-direction: column;
                            text-align: center;
                        }
                    }
                `}
            </style>
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
    // Navigation
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
        maxWidth: '1200px',
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
        background: 'transparent',
        border: 'none',
        color: '#8892b0',
        fontSize: '0.95rem',
        fontWeight: '500',
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    activeNavLink: {
        background: 'rgba(100, 255, 218, 0.1)',
        color: '#64ffda',
        border: '1px solid rgba(100, 255, 218, 0.3)',
    },
    // Main Content
    main: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem',
    },
    // Header Section
    headerSection: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '3rem',
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
    headerActions: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    reportItemBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        background: 'linear-gradient(135deg, #64ffda, #4ecdc4)',
        color: '#0a192f',
        border: 'none',
        padding: '1rem 2rem',
        borderRadius: '12px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '600',
    },
    // Stats Section
    statsSection: {
        marginBottom: '3rem',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
    },
    statCard: {
        background: 'rgba(17, 34, 64, 0.6)',
        border: '1px solid rgba(35, 53, 84, 0.5)',
        borderRadius: '16px',
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    statIcon: {
        width: '50px',
        height: '50px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.8rem',
    },
    statValue: {
        fontSize: '2rem',
        fontWeight: '700',
        color: '#e6f1ff',
        margin: '0',
        lineHeight: '1',
    },
    statLabel: {
        color: '#8892b0',
        fontSize: '0.9rem',
        margin: '0.25rem 0 0 0',
    },
    // Filters Section
    filtersSection: {
        marginBottom: '3rem',
    },
    filtersContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
    },
    searchContainer: {
        flex: '1',
        minWidth: '300px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
    },
    searchIcon: {
        position: 'absolute',
        left: '1rem',
        color: '#8892b0',
        fontSize: '1rem',
    },
    searchInput: {
        width: '100%',
        background: 'rgba(17, 34, 64, 0.6)',
        border: '1px solid rgba(35, 53, 84, 0.5)',
        color: '#e6f1ff',
        padding: '0.75rem 1rem 0.75rem 2.5rem',
        borderRadius: '12px',
        fontSize: '0.95rem',
        outline: 'none',
    },
    filterControls: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
    },
    filterGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    filterIcon: {
        color: '#8892b0',
        fontSize: '1rem',
    },
    filterSelect: {
        background: 'rgba(17, 34, 64, 0.6)',
        border: '1px solid rgba(35, 53, 84, 0.5)',
        color: '#e6f1ff',
        padding: '0.75rem',
        borderRadius: '8px',
        fontSize: '0.95rem',
        outline: 'none',
        cursor: 'pointer',
        minWidth: '150px',
    },
    resultsInfo: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    resultsCount: {
        color: '#64ffda',
        fontSize: '0.95rem',
        fontWeight: '600',
    },
    clearFiltersBtn: {
        background: 'transparent',
        border: 'none',
        color: '#ff6b6b',
        fontSize: '0.9rem',
        cursor: 'pointer',
        padding: '0.5rem 0',
    },
    // Items Section
    itemsSection: {
        marginBottom: '3rem',
    },
    itemsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '1.5rem',
    },
    itemCard: {
        background: 'rgba(17, 34, 64, 0.6)',
        border: '1px solid rgba(35, 53, 84, 0.5)',
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
    },
    itemHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 1.5rem',
        borderBottom: '1px solid rgba(35, 53, 84, 0.5)',
    },
    itemCategory: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
    },
    categoryIcon: {
        width: '45px',
        height: '45px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem',
    },
    itemCategoryText: {
        display: 'flex',
        flexDirection: 'column',
    },
    itemCategoryLabel: {
        fontSize: '0.75rem',
        color: '#8892b0',
        marginBottom: '0.25rem',
    },
    itemCategoryName: {
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#ccd6f6',
    },
    statusBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.4rem 0.75rem',
        borderRadius: '12px',
        fontSize: '0.8rem',
        fontWeight: '600',
    },
    statusIcon: {
        fontSize: '0.8rem',
    },
    itemContent: {
        padding: '1.5rem',
        flex: '1',
    },
    itemTitle: {
        fontSize: '1.3rem',
        fontWeight: '600',
        color: '#e6f1ff',
        margin: '0 0 0.75rem 0',
    },
    itemDescription: {
        color: '#8892b0',
        fontSize: '0.9rem',
        lineHeight: '1.5',
        margin: '0 0 1rem 0',
    },
    itemMeta: {
        display: 'grid',
        gap: '0.5rem',
        marginBottom: '1rem',
    },
    metaItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: '#a8b2d1',
        fontSize: '0.85rem',
    },
    metaIcon: {
        fontSize: '0.8rem',
        color: '#64ffda',
        width: '15px',
    },
    expandedDetails: {
        marginTop: '1rem',
        padding: '1rem',
        background: 'rgba(100, 255, 218, 0.05)',
        borderRadius: '8px',
        borderLeft: '2px solid #64ffda',
    },
    detailsSection: {
        marginBottom: '0.5rem',
    },
    detailsTitle: {
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#64ffda',
        margin: '0 0 0.5rem 0',
    },
    detailsText: {
        color: '#8892b0',
        fontSize: '0.85rem',
        lineHeight: '1.4',
        margin: '0 0 0.25rem 0',
    },
    itemFooter: {
        padding: '1rem 1.5rem',
        borderTop: '1px solid rgba(35, 53, 84, 0.5)',
    },
    itemActions: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    viewDetailsBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'rgba(100, 255, 218, 0.1)',
        border: '1px solid rgba(100, 255, 218, 0.3)',
        color: '#64ffda',
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '600',
    },
    deleteBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'rgba(255, 107, 107, 0.1)',
        border: '1px solid rgba(255, 107, 107, 0.3)',
        color: '#ff6b6b',
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '600',
    },
    requestBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'linear-gradient(135deg, #64ffda, #4ecdc4)',
        border: 'none',
        color: '#0a192f',
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '600',
    },
    // Loading & Error States
    loadingContainer: {
        textAlign: 'center',
        padding: '4rem 2rem',
    },
    loadingSpinner: {
        width: '50px',
        height: '50px',
        border: '3px solid rgba(100, 255, 218, 0.3)',
        borderTop: '3px solid #64ffda',
        borderRadius: '50%',
        margin: '0 auto 1.5rem',
        animation: 'spin 1s linear infinite',
    },
    loadingText: {
        color: '#8892b0',
        fontSize: '1.1rem',
    },
    errorContainer: {
        textAlign: 'center',
        padding: '4rem 2rem',
    },
    errorIcon: {
        fontSize: '4rem',
        color: '#ff6b6b',
        marginBottom: '1.5rem',
    },
    errorTitle: {
        fontSize: '1.8rem',
        fontWeight: '700',
        color: '#ccd6f6',
        margin: '0 0 1rem 0',
    },
    errorText: {
        color: '#8892b0',
        fontSize: '1.1rem',
        margin: '0 0 2rem 0',
        maxWidth: '400px',
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    retryBtn: {
        background: 'linear-gradient(135deg, #64ffda, #4ecdc4)',
        color: '#0a192f',
        border: 'none',
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: '600',
    },
    // Empty State
    emptyState: {
        textAlign: 'center',
        padding: '4rem 2rem',
    },
    emptyIcon: {
        fontSize: '4rem',
        color: '#64ffda',
        marginBottom: '1.5rem',
    },
    emptyTitle: {
        fontSize: '1.8rem',
        fontWeight: '700',
        color: '#ccd6f6',
        margin: '0 0 1rem 0',
    },
    emptyText: {
        color: '#8892b0',
        fontSize: '1.1rem',
        margin: '0',
        maxWidth: '400px',
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    emptyBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        background: 'linear-gradient(135deg, #64ffda, #4ecdc4)',
        color: '#0a192f',
        border: 'none',
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '600',
        marginTop: '1rem',
    },
    // Help Section
    helpSection: {
        background: 'rgba(17, 34, 64, 0.6)',
        border: '1px solid rgba(35, 53, 84, 0.5)',
        borderRadius: '16px',
        padding: '2rem',
        marginTop: '3rem',
    },
    helpContent: {
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
    },
    helpIcon: {
        fontSize: '2.5rem',
        color: '#64ffda',
    },
    helpText: {
        flex: '1',
    },
    helpTitle: {
        fontSize: '1.3rem',
        fontWeight: '600',
        color: '#e6f1ff',
        margin: '0 0 0.5rem 0',
    },
    helpDesc: {
        color: '#8892b0',
        fontSize: '0.95rem',
        margin: '0',
    },
    contactBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'rgba(100, 255, 218, 0.1)',
        border: '1px solid rgba(100, 255, 218, 0.3)',
        color: '#64ffda',
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: '600',
    },
    // Floating Action Button
    fab: {
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        width: '60px',
        height: '60px',
        background: 'linear-gradient(135deg, #64ffda, #4ecdc4)',
        border: 'none',
        borderRadius: '50%',
        color: '#0a192f',
        fontSize: '1.5rem',
        cursor: 'pointer',
        boxShadow: '0 10px 25px rgba(100, 255, 218, 0.4)',
        zIndex: 1000,
    },
};

export default ItemList;