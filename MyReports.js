import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faBoxOpen,
  faCheckCircle,
  faClock,
  faExclamationTriangle,
  faCheck,
  faTimes,
  faEdit,
  faTrash,
  faFilter,
  faSort,
  faPlusCircle,
  faCalendarAlt,
  faMapMarkerAlt,
  faEye,
  faShare,
  faPrint,
  faDownload,
  faArrowLeft,
  faHome,
  faUser,
  faBell,
  faSignOutAlt,
  faBox,
  faList,
  faChartLine,
  faQuestionCircle,
  faEnvelope
} from '@fortawesome/free-solid-svg-icons';

const MyReports = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // REMOVE DUPLICATE DECLARATION
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReports, setSelectedReports] = useState([]);

  // Sample reports data
  const [reports, setReports] = useState([
    {
      id: 1,
      type: 'lost',
      title: 'Black Leather Wallet',
      description: 'Lost my wallet containing IDs and credit cards',
      location: 'Library, 2nd Floor',
      date: '2024-01-15',
      time: '14:30',
      status: 'pending',
      category: 'Wallet',
      value: 'High',
      images: ['wallet1.jpg'],
      tags: ['wallet', 'important', 'id'],
      lastUpdated: '2 hours ago',
      matchScore: 0,
      claimed: false
    },
    {
      id: 2,
      type: 'found',
      title: 'Student ID Card',
      description: 'Found a student ID near the canteen',
      location: 'Main Canteen',
      date: '2024-01-14',
      time: '10:15',
      status: 'matched',
      category: 'ID Card',
      value: 'Medium',
      images: ['id1.jpg'],
      tags: ['id', 'student'],
      lastUpdated: '1 day ago',
      matchScore: 85,
      claimed: false
    },
    {
      id: 3,
      type: 'lost',
      title: 'iPhone 13 Pro',
      description: 'Lost my phone in the auditorium during the seminar',
      location: 'University Auditorium',
      date: '2024-01-12',
      time: '16:45',
      status: 'found',
      category: 'Electronics',
      value: 'Very High',
      images: ['phone1.jpg'],
      tags: ['phone', 'urgent', 'expensive'],
      lastUpdated: '3 days ago',
      matchScore: 92,
      claimed: true
    },
    {
      id: 4,
      type: 'found',
      title: 'Keys with UEP Keychain',
      description: 'Set of keys found near the parking lot',
      location: 'Parking Area B',
      date: '2024-01-10',
      time: '09:20',
      status: 'pending',
      category: 'Keys',
      value: 'Medium',
      images: ['keys1.jpg'],
      tags: ['keys', 'parking'],
      lastUpdated: '5 days ago',
      matchScore: 45,
      claimed: false
    },
    {
      id: 5,
      type: 'lost',
      title: 'Textbook - Calculus',
      description: 'Lost my calculus textbook with personal notes',
      location: 'Math Department',
      date: '2024-01-08',
      time: '11:00',
      status: 'searching',
      category: 'Books',
      value: 'Low',
      images: ['book1.jpg'],
      tags: ['textbook', 'math'],
      lastUpdated: '1 week ago',
      matchScore: 30,
      claimed: false
    },
    {
      id: 6,
      type: 'found',
      title: 'Water Bottle',
      description: 'Blue water bottle left in the gym',
      location: 'University Gym',
      date: '2024-01-07',
      time: '18:30',
      status: 'closed',
      category: 'Personal Items',
      value: 'Low',
      images: ['bottle1.jpg'],
      tags: ['water', 'gym'],
      lastUpdated: '1 week ago',
      matchScore: 15,
      claimed: true
    }
  ]);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    lost: 0,
    found: 0,
    pending: 0,
    matched: 0,
    foundItems: 0,
    successRate: '0%'
  });

  useEffect(() => {
    // Load user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        navigate('/login');
      }
    } else {
      navigate('/login');
    }

    // Calculate statistics
    calculateStats();
  }, [navigate]);

  const calculateStats = () => {
    const total = reports.length;
    const lost = reports.filter(r => r.type === 'lost').length;
    const found = reports.filter(r => r.type === 'found').length;
    const pending = reports.filter(r => r.status === 'pending').length;
    const matched = reports.filter(r => r.status === 'matched').length;
    const foundItems = reports.filter(r => r.type === 'lost' && r.status === 'found').length;
    const successRate = total > 0 ? Math.round((foundItems / lost) * 100) : 0;

    setStats({
      total,
      lost,
      found,
      pending,
      matched,
      foundItems,
      successRate: `${successRate}%`
    });
  };

  const filteredReports = reports.filter(report => {
    // Filter by active tab
    if (activeTab !== 'all' && report.type !== activeTab) return false;

    // Filter by status
    if (filterStatus !== 'all' && report.status !== filterStatus) return false;

    // Filter by search term
    if (searchTerm && !report.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !report.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    // Sort by selected criteria
    switch (sortBy) {
      case 'date':
        return new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time);
      case 'status':
        const statusOrder = { 'pending': 1, 'searching': 2, 'matched': 3, 'found': 4, 'closed': 5 };
        return statusOrder[a.status] - statusOrder[b.status];
      case 'value':
        const valueOrder = { 'Very High': 1, 'High': 2, 'Medium': 3, 'Low': 4 };
        return valueOrder[a.value] - valueOrder[b.value];
      default:
        return 0;
    }
  });

  const handleDeleteReport = (id) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      setReports(reports.filter(report => report.id !== id));
    }
  };

  const handleSelectReport = (id) => {
    setSelectedReports(prev =>
      prev.includes(id) ? prev.filter(reportId => reportId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedReports.length === filteredReports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(filteredReports.map(report => report.id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedReports.length === 0) return;
    if (window.confirm(`Delete ${selectedReports.length} selected reports?`)) {
      setReports(reports.filter(report => !selectedReports.includes(report.id)));
      setSelectedReports([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffd166';
      case 'searching': return '#4ecdc4';
      case 'matched': return '#118ab2';
      case 'found': return '#06d6a0';
      case 'closed': return '#073b4c';
      default: return '#8892b0';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return faClock;
      case 'searching': return faSearch;
      case 'matched': return faCheckCircle;
      case 'found': return faCheck;
      case 'closed': return faTimes;
      default: return faQuestionCircle;
    }
  };

  const getTypeIcon = (type) => {
    return type === 'lost' ? faExclamationTriangle : faBoxOpen;
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const ReportCard = ({ report }) => (
    <div style={styles.reportCard}>
      <div style={styles.reportHeader}>
        <div style={styles.reportTypeBadge}>
          <input
            type="checkbox"
            checked={selectedReports.includes(report.id)}
            onChange={() => handleSelectReport(report.id)}
            style={styles.checkbox}
          />
          <FontAwesomeIcon
            icon={getTypeIcon(report.type)}
            style={{
              ...styles.typeIcon,
              color: report.type === 'lost' ? '#ff6b6b' : '#4ecdc4'
            }}
          />
          <span style={styles.reportType}>{report.type.toUpperCase()}</span>
        </div>
        <div style={styles.reportActions}>
          <button style={styles.iconBtn} onClick={() => navigate(`/report/${report.id}`)}>
            <FontAwesomeIcon icon={faEye} />
          </button>
          <button style={styles.iconBtn} onClick={() => navigate(`/edit-report/${report.id}`)}>
            <FontAwesomeIcon icon={faEdit} />
          </button>
          <button style={styles.iconBtn} onClick={() => handleDeleteReport(report.id)}>
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>

      <div style={styles.reportContent}>
        <h3 style={styles.reportTitle}>{report.title}</h3>
        <p style={styles.reportDescription}>{report.description}</p>

        <div style={styles.reportMeta}>
          <div style={styles.metaItem}>
            <FontAwesomeIcon icon={faCalendarAlt} style={styles.metaIcon} />
            <span>{formatDate(report.date)} at {report.time}</span>
          </div>
          <div style={styles.metaItem}>
            <FontAwesomeIcon icon={faMapMarkerAlt} style={styles.metaIcon} />
            <span>{report.location}</span>
          </div>
          <div style={styles.metaItem}>
            <FontAwesomeIcon icon={faBox} style={styles.metaIcon} />
            <span>{report.category}</span>
          </div>
        </div>

        <div style={styles.reportTags}>
          {report.tags.map((tag, index) => (
            <span key={index} style={styles.tag}>{tag}</span>
          ))}
        </div>
      </div>

      <div style={styles.reportFooter}>
        <div style={{...styles.statusBadge, backgroundColor: getStatusColor(report.status) + '20', color: getStatusColor(report.status)}}>
          <FontAwesomeIcon icon={getStatusIcon(report.status)} style={styles.statusIcon} />
          <span style={styles.statusText}>{report.status.toUpperCase()}</span>
        </div>

        {report.matchScore > 0 && (
          <div style={styles.matchScore}>
            <FontAwesomeIcon icon={faChartLine} style={styles.matchIcon} />
            <span>{report.matchScore}% Match</span>
          </div>
        )}

        <div style={styles.valueBadge}>
          {report.value}
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Navigation */}
      <nav style={styles.navbar}>
        <div style={styles.navContent}>
          <div style={styles.navLogo}>
            <FontAwesomeIcon icon={faBox} style={styles.logoIcon} />
            <span style={styles.logoText}>UEP Item Recovery</span>
          </div>

          <div style={styles.navMenu}>

            <Link to="/my-reports" style={{...styles.navLink, ...styles.activeNavLink}}>
              <FontAwesomeIcon icon={faList} style={styles.navIcon} />
              <span>My Reports</span>
            </Link>
            <Link to="/found-items" style={styles.navLink}>
              <FontAwesomeIcon icon={faBoxOpen} style={styles.navIcon} />
              <span>Found Items</span>
            </Link>
            <Link to="/profile" style={styles.navLink}>
              <FontAwesomeIcon icon={faUser} style={styles.navIcon} />
              <span>Profile</span>
            </Link>
          </div>

          <div style={styles.navActions}>
            <button style={styles.notificationBtn} title="Notifications">
              <FontAwesomeIcon icon={faBell} style={styles.bellIcon} />
              <span style={styles.notificationBadge}>3</span>
            </button>
            <button style={styles.logoutBtn} onClick={handleLogout} title="Logout">
              <FontAwesomeIcon icon={faSignOutAlt} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Header */}
        <div style={styles.headerSection}>
          <div>

            <h1 style={styles.pageTitle}>My Reports</h1>
            <p style={styles.pageSubtitle}>Manage your lost and found reports</p>
          </div>
          <button style={styles.newReportBtn} onClick={() => navigate('/report-item')}>
            <FontAwesomeIcon icon={faPlusCircle} />
            <span>New Report</span>
          </button>
        </div>

        {/* Statistics */}
        <div style={styles.statsSection}>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statHeader}>
                <FontAwesomeIcon icon={faList} style={styles.statIcon} />
                <h3 style={styles.statValue}>{stats.total}</h3>
              </div>
              <p style={styles.statLabel}>Total Reports</p>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statHeader}>
                <FontAwesomeIcon icon={faExclamationTriangle} style={styles.statIcon} />
                <h3 style={styles.statValue}>{stats.lost}</h3>
              </div>
              <p style={styles.statLabel}>Lost Items</p>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statHeader}>
                <FontAwesomeIcon icon={faBoxOpen} style={styles.statIcon} />
                <h3 style={styles.statValue}>{stats.found}</h3>
              </div>
              <p style={styles.statLabel}>Found Items</p>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statHeader}>
                <FontAwesomeIcon icon={faCheckCircle} style={styles.statIcon} />
                <h3 style={styles.statValue}>{stats.successRate}</h3>
              </div>
              <p style={styles.statLabel}>Success Rate</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={styles.controlsSection}>
          {/* Tabs */}
          <div style={styles.tabs}>
            <button
              style={activeTab === 'all' ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab('all')}
            >
              All Reports
            </button>
            <button
              style={activeTab === 'lost' ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab('lost')}
            >
              Lost Items
            </button>
            <button
              style={activeTab === 'found' ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab('found')}
            >
              Found Items
            </button>
          </div>

          {/* Search and Filters */}
          <div style={styles.filterControls}>
            <div style={styles.searchBox}>
              <FontAwesomeIcon icon={faSearch} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            <div style={styles.filterGroup}>
              <FontAwesomeIcon icon={faFilter} style={styles.filterIcon} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="searching">Searching</option>
                <option value="matched">Matched</option>
                <option value="found">Found</option>
                <option value="closed">Closed</option>
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
                <option value="status">Sort by Status</option>
                <option value="value">Sort by Value</option>
              </select>
            </div>

            {selectedReports.length > 0 && (
              <button style={styles.bulkDeleteBtn} onClick={handleBulkDelete}>
                <FontAwesomeIcon icon={faTrash} />
                <span>Delete Selected ({selectedReports.length})</span>
              </button>
            )}
          </div>

          {/* Select All */}
          <div style={styles.selectAllSection}>
            <input
              type="checkbox"
              checked={selectedReports.length === filteredReports.length && filteredReports.length > 0}
              onChange={handleSelectAll}
              style={styles.checkbox}
            />
            <span style={styles.selectAllText}>
              Select All ({filteredReports.length} reports)
            </span>
          </div>
        </div>

        {/* Reports Grid */}
        <div style={styles.reportsGrid}>
          {filteredReports.length > 0 ? (
            filteredReports.map(report => (
              <ReportCard key={report.id} report={report} />
            ))
          ) : (
            <div style={styles.emptyState}>
              <FontAwesomeIcon icon={faBoxOpen} style={styles.emptyIcon} />
              <h3 style={styles.emptyTitle}>No Reports Found</h3>
              <p style={styles.emptyText}>
                {searchTerm || filterStatus !== 'all' || activeTab !== 'all'
                  ? 'Try changing your filters or search term'
                  : 'Start by creating your first report'}
              </p>
              <button
                style={styles.emptyBtn}
                onClick={() => navigate('/report-item')}
              >
                <FontAwesomeIcon icon={faPlusCircle} />
                <span>Create New Report</span>
              </button>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div style={styles.helpSection}>
          <div style={styles.helpContent}>
            <FontAwesomeIcon icon={faQuestionCircle} style={styles.helpIcon} />
            <div style={styles.helpText}>
              <h2 style={styles.helpTitle}>Need Help Managing Reports?</h2>
              <p style={styles.helpDesc}>
                Contact our support team for assistance with report management,
                status updates, or any questions about the process.
              </p>
            </div>
            <div style={styles.helpButtons}>
              <button
                style={styles.primaryBtn}
                onClick={() => navigate('/contact')}
              >
                <FontAwesomeIcon icon={faEnvelope} /> Contact Support
              </button>
              <button
                style={styles.secondaryBtn}
                onClick={() => navigate('/faq')}
              >
                <FontAwesomeIcon icon={faQuestionCircle} /> View FAQ
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerInfo}>
            <FontAwesomeIcon icon={faBox} style={styles.footerIcon} />
            <div>
              <h3 style={styles.footerTitle}>UEP Lost and Found Hub</h3>
              <p style={styles.footerText}>Your reports are securely managed and monitored</p>
            </div>
          </div>
          <div style={styles.footerLinks}>
            <Link to="/privacy" style={styles.footerLink}>Privacy Policy</Link>
            <Link to="/terms" style={styles.footerLink}>Terms of Service</Link>
            <Link to="/contact" style={styles.footerLink}>Contact Us</Link>
            <Link to="/help" style={styles.footerLink}>Help Center</Link>
          </div>
          <p style={styles.copyright}>
            © {new Date().getFullYear()} University of Eastern Philippines. All rights reserved.
          </p>
        </div>
      </footer>
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
    gap: '2rem',
    flex: 1,
    justifyContent: 'center',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#8892b0',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: '500',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
  },
  activeNavLink: {
    background: 'rgba(100, 255, 218, 0.1)',
    color: '#64ffda',
    border: '1px solid rgba(100, 255, 218, 0.3)',
  },
  navIcon: {
    fontSize: '1rem',
  },
  navActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  notificationBtn: {
    background: 'rgba(17, 34, 64, 0.8)',
    border: '1px solid rgba(100, 255, 218, 0.3)',
    color: '#64ffda',
    padding: '0.75rem',
    borderRadius: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    transition: 'all 0.3s ease',
  },
  bellIcon: {
    fontSize: '1.2rem',
  },
  notificationBadge: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    background: '#ff6b6b',
    color: 'white',
    fontSize: '0.7rem',
    padding: '0.15rem 0.4rem',
    borderRadius: '10px',
    minWidth: '18px',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  logoutBtn: {
    background: 'rgba(255, 107, 107, 0.1)',
    border: '1px solid rgba(255, 107, 107, 0.3)',
    color: '#ff6b6b',
    padding: '0.75rem',
    borderRadius: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
  },
  // Main Content
  main: {
    maxWidth: '1400px',
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
    marginBottom: '1rem',
    transition: 'all 0.3s ease',
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
  newReportBtn: {
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
    transition: 'all 0.3s ease',
  },
  // Statistics
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
    transition: 'all 0.3s ease',
  },
  statHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '0.5rem',
  },
  statIcon: {
    fontSize: '2rem',
    color: '#64ffda',
  },
  statValue: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#e6f1ff',
    margin: '0',
    lineHeight: '1',
  },
  statLabel: {
    color: '#8892b0',
    fontSize: '0.9rem',
    margin: '0',
  },
  // Controls
  controlsSection: {
    background: 'rgba(17, 34, 64, 0.6)',
    border: '1px solid rgba(35, 53, 84, 0.5)',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '2rem',
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    paddingBottom: '1.5rem',
    borderBottom: '1px solid rgba(35, 53, 84, 0.5)',
  },
  tab: {
    background: 'transparent',
    border: '1px solid rgba(35, 53, 84, 0.5)',
    color: '#8892b0',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  activeTab: {
    background: 'rgba(100, 255, 218, 0.1)',
    border: '1px solid rgba(100, 255, 218, 0.3)',
    color: '#64ffda',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '600',
  },
  filterControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  searchBox: {
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
    background: 'rgba(10, 25, 47, 0.8)',
    border: '1px solid rgba(35, 53, 84, 0.5)',
    color: '#e6f1ff',
    padding: '0.75rem 1rem 0.75rem 2.5rem',
    borderRadius: '8px',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'all 0.3s ease',
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
    background: 'rgba(10, 25, 47, 0.8)',
    border: '1px solid rgba(35, 53, 84, 0.5)',
    color: '#e6f1ff',
    padding: '0.75rem',
    borderRadius: '8px',
    fontSize: '0.95rem',
    outline: 'none',
    cursor: 'pointer',
    minWidth: '150px',
  },
  bulkDeleteBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(255, 107, 107, 0.1)',
    border: '1px solid rgba(255, 107, 107, 0.3)',
    color: '#ff6b6b',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  selectAllSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    accentColor: '#64ffda',
  },
  selectAllText: {
    color: '#8892b0',
    fontSize: '0.9rem',
  },
  // Reports Grid
  reportsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem',
    marginBottom: '3rem',
  },
  reportCard: {
    background: 'rgba(17, 34, 64, 0.6)',
    border: '1px solid rgba(35, 53, 84, 0.5)',
    borderRadius: '16px',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
  },
  reportHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    borderBottom: '1px solid rgba(35, 53, 84, 0.5)',
  },
  reportTypeBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  typeIcon: {
    fontSize: '1rem',
  },
  reportType: {
    fontSize: '0.8rem',
    fontWeight: '600',
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    background: 'rgba(35, 53, 84, 0.5)',
  },
  reportActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  iconBtn: {
    background: 'transparent',
    border: '1px solid rgba(35, 53, 84, 0.5)',
    color: '#8892b0',
    width: '35px',
    height: '35px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease',
  },
  reportContent: {
    padding: '1.5rem',
  },
  reportTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#ccd6f6',
    margin: '0 0 0.75rem 0',
  },
  reportDescription: {
    color: '#8892b0',
    fontSize: '0.9rem',
    lineHeight: '1.5',
    margin: '0 0 1rem 0',
  },
  reportMeta: {
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
  reportTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  tag: {
    background: 'rgba(100, 255, 218, 0.1)',
    color: '#64ffda',
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '500',
  },
  reportFooter: {
    padding: '1rem 1.5rem',
    borderTop: '1px solid rgba(35, 53, 84, 0.5)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  statusText: {
    fontSize: '0.75rem',
  },
  matchScore: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#4ecdc4',
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  matchIcon: {
    fontSize: '0.9rem',
  },
  valueBadge: {
    background: 'rgba(255, 209, 102, 0.1)',
    color: '#ffd166',
    padding: '0.3rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  // Empty State
  emptyState: {
    gridColumn: '1 / -1',
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
    margin: '0 0 2rem 0',
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
    padding: '1rem 2rem',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    margin: '0 auto',
    transition: 'all 0.3s ease',
  },
  // Help Section
  helpSection: {
    background: 'linear-gradient(135deg, rgba(100, 255, 218, 0.1), rgba(17, 34, 64, 0.6))',
    border: '1px solid rgba(100, 255, 218, 0.3)',
    borderRadius: '20px',
    padding: '2.5rem',
    marginBottom: '3rem',
  },
  helpContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
  },
  helpIcon: {
    fontSize: '3rem',
    color: '#64ffda',
  },
  helpText: {
    flex: '1',
  },
  helpTitle: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#ccd6f6',
    margin: '0 0 1rem 0',
  },
  helpDesc: {
    color: '#8892b0',
    fontSize: '1rem',
    lineHeight: '1.6',
    margin: '0',
  },
  helpButtons: {
    display: 'flex',
    gap: '1rem',
  },
  primaryBtn: {
    background: '#64ffda',
    color: '#0a192f',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.95rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.3s ease',
  },
  secondaryBtn: {
    background: 'transparent',
    color: '#64ffda',
    border: '2px solid #64ffda',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.95rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.3s ease',
  },
  // Footer
  footer: {
    background: '#020c1b',
    padding: '3rem 2rem',
    borderTop: '1px solid #233554',
  },
  footerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  footerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '2rem',
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
  footerLinks: {
    display: 'flex',
    gap: '2rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  footerLink: {
    color: '#64ffda',
    textDecoration: 'none',
    fontSize: '0.95rem',
    transition: 'color 0.3s ease',
  },
  copyright: {
    color: '#8892b0',
    fontSize: '0.9rem',
    margin: '0',
  },
};

export default MyReports;