import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeImg from '../Pictures/UserHome.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faBell,
  faBoxOpen,
  faCheckCircle,
  faMapMarkerAlt,
  faUserCircle,
  faChartLine,
  faShieldAlt,
  faClock,
  faCogs,
  faHistory,
  faPlusCircle,
  faQrcode,
  faQuestionCircle,
  faEnvelope,
  faKey,
  faWallet,
  faUserEdit,
  faCalendarAlt,
  faStar,
  faBox,
  faHome,
  faList,
  faUser,
  faSignOutAlt,
  faChevronRight,
  faExclamationCircle,
  faSync
} from '@fortawesome/free-solid-svg-icons';

const UserHome = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "Your lost wallet report has been matched!", time: "2 hours ago", read: false, type: 'match' },
    { id: 2, message: "New items found in Library area", time: "5 hours ago", read: true, type: 'update' },
    { id: 3, message: "Report verification completed", time: "1 day ago", read: true, type: 'verification' }
  ]);
  const [activeNotifications, setActiveNotifications] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    memberSince: '2023',
    totalReports: 5,
    foundItems: 3,
    successRate: '89%'
  });

  // Interactive Platform statistics
  const [platformStats, setPlatformStats] = useState([
    {
      label: "Items Found Today",
      value: "12",
      change: "+2",
      icon: faChartLine,
      color: "#64ffda",
      desc: "Across all campus areas",
      loading: false
    },
    {
      label: "Total Reunited",
      value: "348",
      change: "+15",
      icon: faCheckCircle,
      color: "#ff6b6b",
      desc: "Successfully returned items",
      loading: false
    },
    {
      label: "Active Searches",
      value: "56",
      change: "-3",
      icon: faSearch,
      color: "#4ecdc4",
      desc: "Currently being tracked",
      loading: false
    },
    {
      label: "Success Rate",
      value: "89%",
      change: "+2%",
      icon: faShieldAlt,
      color: "#ffd166",
      desc: "Of reported items found",
      loading: false
    },
  ]);

  // Interactive Quick actions
  const [quickActions, setQuickActions] = useState([
    {
      id: 1,
      title: "Report Lost Item",
      icon: faSearch,
      link: "/report-item",
      color: "#64ffda",
      description: "Report something you lost",
      gradient: "linear-gradient(135deg, rgba(100, 255, 218, 0.15), rgba(100, 255, 218, 0.05))",
      loading: false
    },
    {
      id: 2,
      title: "Browse Found Items",
      icon: faBoxOpen,
      link: "/found-items",
      color: "#ff6b6b",
      description: "View items found by others",
      gradient: "linear-gradient(135deg, rgba(255, 107, 107, 0.15), rgba(255, 107, 107, 0.05))",
      loading: false
    },
    {
      id: 3,
      title: "My Reports",
      icon: faCheckCircle,
      link: "/my-reports",
      color: "#4ecdc4",
      description: "Check your submitted reports",
      gradient: "linear-gradient(135deg, rgba(78, 205, 196, 0.15), rgba(78, 205, 196, 0.05))",
      loading: false
    },
    {
      id: 4,
      title: "Scan QR Code",
      icon: faQrcode,
      link: "/scan",
      color: "#ffd166",
      description: "Scan item QR for quick report",
      gradient: "linear-gradient(135deg, rgba(255, 209, 102, 0.15), rgba(255, 209, 102, 0.05))",
      loading: false
    },
  ]);

  // Features
  const features = [
    {
      title: "Smart Matching AI",
      desc: "Advanced algorithms connect lost items with found reports in real-time",
      icon: faCogs,
      color: "#64ffda"
    },
    {
      title: "Campus Coverage",
      desc: "Specific locations across all UEP departments and buildings",
      icon: faMapMarkerAlt,
      color: "#ff6b6b"
    },
    {
      title: "Secure Verification",
      desc: "Multi-step verification process ensures item safety",
      icon: faShieldAlt,
      color: "#4ecdc4"
    },
    {
      title: "24/7 Support",
      desc: "Round-the-clock assistance and notifications",
      icon: faBell,
      color: "#ffd166"
    }
  ];

  // Interactive Recent activity
  const [recentActivity, setRecentActivity] = useState([
    { id: 1, action: "Reported lost keys", icon: faKey, time: "2 hours ago", status: "pending", expanded: false },
    { id: 2, action: "Found item claimed", icon: faWallet, time: "1 day ago", status: "completed", expanded: false },
    { id: 3, action: "Profile updated", icon: faUserEdit, time: "2 days ago", status: "completed", expanded: false },
    { id: 4, action: "New match found", icon: faCheckCircle, time: "3 days ago", status: "active", expanded: false },
  ]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Simulate loading user stats
        setTimeout(() => {
          setStats(prev => ({
            ...prev,
            memberSince: parsedUser.createdAt?.split('-')[0] || '2023'
          }));
        }, 500);

        // Refresh platform stats periodically
        const interval = setInterval(refreshStats, 30000);

        return () => clearInterval(interval);
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const refreshStats = async () => {
    setPlatformStats(prev => prev.map(stat => ({ ...stat, loading: true })));

    setTimeout(() => {
      setPlatformStats(prev => prev.map(stat => ({
        ...stat,
        loading: false,
        value: Math.floor(Math.random() * 20 + 10).toString(),
        change: `+${Math.floor(Math.random() * 5)}`
      })));
    }, 1000);
  };

  const handleNotificationClick = (id) => {
    setNotifications(prev => prev.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const toggleNotifications = () => {
    setActiveNotifications(!activeNotifications);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
    setActiveNotifications(false);
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const handleQuickAction = async (actionId, link) => {
    setQuickActions(prev => prev.map(action =>
      action.id === actionId ? { ...action, loading: true } : action
    ));

    setTimeout(() => {
      setQuickActions(prev => prev.map(action =>
        action.id === actionId ? { ...action, loading: false } : action
      ));
      navigate(link);
    }, 800);
  };

  const handleLogout = () => {
    setLoading(true);
    setTimeout(() => {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/login');
    }, 500);
  };

  const handleStatRefresh = async (index) => {
    const newStats = [...platformStats];
    newStats[index].loading = true;
    setPlatformStats(newStats);

    setTimeout(() => {
      const updatedStats = [...platformStats];
      updatedStats[index] = {
        ...updatedStats[index],
        loading: false,
        value: Math.floor(Math.random() * 100 + 50).toString(),
        change: `+${Math.floor(Math.random() * 10)}`
      };
      setPlatformStats(updatedStats);
    }, 800);
  };

  const toggleActivityDetails = (id) => {
    setRecentActivity(prev => prev.map(activity =>
      activity.id === id ? { ...activity, expanded: !activity.expanded } : activity
    ));
  };

  const handleViewAllActivity = () => {
    navigate('/my-reports');
  };

  const handleContactSupport = () => {
    alert('Contacting campus security support... Redirecting to support chat.');
  };

  const handleFAQ = () => {
    navigate('/faq');
  };

  const getUserName = () => {
    if (user?.name) return user.name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'match': return faCheckCircle;
      case 'update': return faExclamationCircle;
      case 'verification': return faShieldAlt;
      default: return faBell;
    }
  };

  const getNotificationColor = (type) => {
    switch(type) {
      case 'match': return '#64ffda';
      case 'update': return '#ffd166';
      case 'verification': return '#4ecdc4';
      default: return '#8892b0';
    }
  };

  return (
    <div style={styles.container}>
      {/* Main Content */}
      <main style={styles.main}>
        {/* Welcome Section */}
        <section style={styles.welcomeSection}>
          <div style={styles.welcomeHeader}>
            <div>
              <h1 style={styles.greeting}>
                {getGreeting()}, <span style={styles.userName}>{getUserName()}!</span>
              </h1>
              <p style={styles.welcomeText}>
                Welcome back to your dashboard. Here's what's happening today.
              </p>
            </div>
            <div style={styles.headerActions}>
              <div style={styles.notificationWrapper}>
                <button
                  style={styles.notificationBtn}
                  onClick={toggleNotifications}
                  title="Notifications"
                  aria-label="Notifications"
                >
                  <FontAwesomeIcon icon={faBell} style={styles.bellIcon} />
                  {unreadNotifications > 0 && (
                    <span style={styles.notificationBadge}>{unreadNotifications}</span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {activeNotifications && (
                  <div style={styles.notificationsDropdown}>
                    <div style={styles.notificationsHeader}>
                      <h3 style={styles.notificationsTitle}>Notifications</h3>
                      <div style={styles.notificationsActions}>
                        <button onClick={markAllAsRead} style={styles.notificationActionBtn}>
                          Mark all read
                        </button>
                        <button onClick={clearNotifications} style={styles.notificationClearBtn}>
                          Clear all
                        </button>
                      </div>
                    </div>
                    <div style={styles.notificationsList}>
                      {notifications.length > 0 ? (
                        notifications.map(notification => (
                          <div
                            key={notification.id}
                            style={{
                              ...styles.notificationItem,
                              opacity: notification.read ? 0.7 : 1
                            }}
                            onClick={() => handleNotificationClick(notification.id)}
                          >
                            <div style={styles.notificationIcon}>
                              <FontAwesomeIcon
                                icon={getNotificationIcon(notification.type)}
                                style={{ color: getNotificationColor(notification.type) }}
                              />
                            </div>
                            <div style={styles.notificationContent}>
                              <p style={styles.notificationMessage}>{notification.message}</p>
                              <span style={styles.notificationTime}>{notification.time}</span>
                            </div>
                            {!notification.read && (
                              <div style={styles.notificationUnread}></div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div style={styles.noNotifications}>
                          <FontAwesomeIcon icon={faCheckCircle} style={styles.noNotificationsIcon} />
                          <p style={styles.noNotificationsText}>No notifications</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>


        </section>

        {/* Statistics Overview */}
        <section style={styles.statsSection}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Platform Overview</h2>
              <p style={styles.sectionSubtitle}>Real-time campus statistics</p>
            </div>
            <button style={styles.refreshAllBtn} onClick={refreshStats} title="Refresh all stats">
              <FontAwesomeIcon icon={faSync} />
              <span style={styles.refreshText}>Refresh</span>
            </button>
          </div>
          <div style={styles.statsGrid}>
            {platformStats.map((stat, index) => (
              <div
                key={index}
                style={{...styles.statCard, borderLeft: `4px solid ${stat.color}`}}
                onClick={() => handleStatRefresh(index)}
                className="stat-card-hover"
              >
                <div style={styles.statHeader}>
                  <div style={{...styles.statIconBox, backgroundColor: `${stat.color}20`}}>
                    {stat.loading ? (
                      <span style={styles.statLoading}></span>
                    ) : (
                      <FontAwesomeIcon icon={stat.icon} style={{...styles.statIcon, color: stat.color}} />
                    )}
                  </div>
                  <div>
                    <h3 style={styles.statValue}>
                      {stat.loading ? (
                        <span style={styles.loadingDots}>...</span>
                      ) : (
                        stat.value
                      )}
                    </h3>
                    <p style={styles.statLabel}>{stat.label}</p>
                  </div>
                </div>
                <div style={styles.statFooter}>
                  <span style={{
                    ...styles.changeBadge,
                    backgroundColor: stat.change.startsWith('+') ? 'rgba(100, 255, 218, 0.1)' : 'rgba(255, 107, 107, 0.1)',
                    color: stat.change.startsWith('+') ? '#64ffda' : '#ff6b6b'
                  }}>
                    {stat.change}
                  </span>
                  <span style={styles.statDesc}>{stat.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section style={styles.actionsSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Quick Actions</h2>
            <p style={styles.sectionSubtitle}>Start here to report or find items</p>
          </div>
          <div style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <button
                key={action.id}
                style={{
                  ...styles.actionCard,
                  background: action.gradient,
                  border: `1px solid ${action.color}30`,
                  opacity: action.loading ? 0.8 : 1
                }}
                onClick={() => handleQuickAction(action.id, action.link)}
                disabled={action.loading}
                className="action-card-hover"
              >
                <div style={{...styles.actionIconBox, backgroundColor: `${action.color}20`}}>
                  {action.loading ? (
                    <span style={styles.actionLoading}></span>
                  ) : (
                    <FontAwesomeIcon icon={action.icon} style={{ color: action.color, fontSize: '1.8rem' }} />
                  )}
                </div>
                <div style={styles.actionContent}>
                  <h3 style={{...styles.actionTitle, color: action.color}}>
                    {action.title}
                    {action.loading && <span style={styles.loadingDots}>...</span>}
                  </h3>
                  <p style={styles.actionDesc}>{action.description}</p>
                </div>
                <div style={{...styles.actionArrow, color: action.color}}>
                  {action.loading ? (
                    <span style={styles.loadingSpinnerSmall}></span>
                  ) : (
                    <FontAwesomeIcon icon={faChevronRight} />
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Campus Banner */}
        <section style={styles.bannerSection}>
          <div style={styles.banner}>
            <img
              src={HomeImg}
              alt="Campus Recovery System"
              style={styles.bannerImage}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
              }}
            />
            <div style={styles.bannerOverlay}>
              <h2 style={styles.bannerTitle}>Recover Lost Items Faster</h2>
              <p style={styles.bannerText}>
                Our campus-wide system helps students and staff recover lost belongings
                through community collaboration and smart technology.
              </p>
              <div style={styles.bannerStats}>
                <div style={styles.bannerStat}>
                  <FontAwesomeIcon icon={faClock} style={styles.bannerStatIcon} />
                  <span>Average recovery time: <strong>2.5 days</strong></span>
                </div>
                <div style={styles.bannerStat}>
                  <FontAwesomeIcon icon={faMapMarkerAlt} style={styles.bannerStatIcon} />
                  <span>Campus coverage: <strong>15+ locations</strong></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features & Activity */}
        <div style={styles.featuresActivityWrapper}>
          {/* Features */}
          <section style={styles.featuresSection}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>System Features</h2>
              <p style={styles.sectionSubtitle}>What makes our system effective</p>
            </div>
            <div style={styles.featuresGrid}>
              {features.map((feature, index) => (
                <div key={index} style={styles.featureCard} className="feature-card-hover">
                  <div style={{...styles.featureIconBox, backgroundColor: `${feature.color}15`}}>
                    <FontAwesomeIcon icon={feature.icon} style={{ color: feature.color }} />
                  </div>
                  <h3 style={styles.featureTitle}>{feature.title}</h3>
                  <p style={styles.featureDesc}>{feature.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Activity */}
          <section style={styles.activitySection}>
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>Your Activity</h2>
                <p style={styles.sectionSubtitle}>Recent interactions</p>
              </div>
              <button
                style={styles.viewAllBtn}
                onClick={handleViewAllActivity}
                className="button-hover"
              >
                View All
              </button>
            </div>
            <div style={styles.activityList}>
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  style={styles.activityItem}
                  onClick={() => toggleActivityDetails(activity.id)}
                  className="activity-item-hover"
                >
                  <div style={styles.activityIconBox}>
                    <FontAwesomeIcon icon={activity.icon} style={{ color: '#64ffda' }} />
                  </div>
                  <div style={styles.activityContent}>
                    <p style={styles.activityText}>{activity.action}</p>
                    <span style={styles.activityTime}>{activity.time}</span>
                    {activity.expanded && (
                      <div style={styles.activityDetails}>
                        <p style={styles.activityDetailText}>
                          {activity.status === 'pending' && 'Your report is being reviewed by our team.'}
                          {activity.status === 'completed' && 'This item has been successfully returned.'}
                          {activity.status === 'active' && 'We found a potential match for your lost item.'}
                        </p>
                      </div>
                    )}
                  </div>
                  <span style={{
                    ...styles.activityStatus,
                    backgroundColor: activity.status === 'completed' ? 'rgba(40, 167, 69, 0.1)' :
                                   activity.status === 'active' ? 'rgba(0, 123, 255, 0.1)' :
                                   'rgba(255, 193, 7, 0.1)',
                    color: activity.status === 'completed' ? '#28a745' :
                           activity.status === 'active' ? '#007bff' : '#ffc107'
                  }}>
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Help Section */}
        <section style={styles.helpSection}>
          <div style={styles.helpContent}>
            <FontAwesomeIcon icon={faQuestionCircle} style={styles.helpIcon} />
            <div style={styles.helpText}>
              <h2 style={styles.helpTitle}>Need Assistance?</h2>
              <p style={styles.helpDesc}>
                Contact campus security or visit the administration office for urgent help with lost items.
              </p>
            </div>
            <div style={styles.helpButtons}>
              <button
                style={styles.primaryBtn}
                onClick={handleContactSupport}
                className="button-hover"
              >
                <FontAwesomeIcon icon={faEnvelope} /> Contact Support
              </button>
              <button
                style={styles.secondaryBtn}
                onClick={handleFAQ}
                className="button-hover"
              >
                <FontAwesomeIcon icon={faQuestionCircle} /> FAQ
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Action Button */}
      <button
        style={styles.fab}
        onClick={() => navigate('/report-item')}
        title="Report Lost Item"
        className="fab-hover"
      >
        <FontAwesomeIcon icon={faPlusCircle} />
      </button>

      {/* Interactive CSS Styles */}
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
          .stat-card-hover {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
          }

          .stat-card-hover:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(100, 255, 218, 0.2);
          }

          .action-card-hover {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .action-card-hover:hover:not(:disabled) {
            transform: translateY(-8px);
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5), 0 0 0 2px rgba(100, 255, 218, 0.3);
          }

          .feature-card-hover {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
          }

          .feature-card-hover:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(100, 255, 218, 0.1);
          }

          .activity-item-hover {
            transition: all 0.3s ease;
            cursor: pointer;
          }

          .activity-item-hover:hover {
            background: rgba(100, 255, 218, 0.05);
            box-shadow: inset 0 0 0 1px rgba(100, 255, 218, 0.2);
          }

          .button-hover {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .button-hover:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
          }

          .notification-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(100, 255, 218, 0.3);
          }

          .logout-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(255, 107, 107, 0.3);
          }

          .fab-hover {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .fab-hover:hover {
            transform: scale(1.15);
            box-shadow: 0 15px 35px rgba(100, 255, 218, 0.7);
          }

          /* Refresh button animation */
          .refresh-btn:hover .fa-sync {
            animation: spin 1s linear infinite;
          }

          @media (max-width: 768px) {
            .features-activity-wrapper {
              grid-template-columns: 1fr;
            }

            .features-grid {
              grid-template-columns: 1fr;
            }

            .welcome-header {
              flex-direction: column;
              align-items: flex-start;
              gap: 1.5rem;
            }

            .help-content {
              flex-direction: column;
              text-align: center;
              gap: 1.5rem;
            }

            .help-buttons {
              flex-direction: column;
              width: 100%;
            }

            .help-buttons button {
              width: 100%;
              justify-content: center;
            }
          }

          @media (max-width: 480px) {
            .banner-overlay {
              padding: 1.5rem;
            }

            .banner-title {
              font-size: 1.5rem;
            }

            .banner-stats {
              flex-direction: column;
              gap: 1rem;
            }

            .fab {
              bottom: 1rem;
              right: 1rem;
              width: 50px;
              height: 50px;
              font-size: 1.2rem;
            }
          }
        `}
      </style>
    </div>
  );
};

// Cleaner Interactive Styles
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a192f 0%, #112240 100%)',
    color: '#e6f1ff',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
  },
  // Welcome Section
  welcomeSection: {
    marginBottom: '3rem',
  },
  welcomeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  greeting: {
    fontSize: '2.2rem',
    fontWeight: '700',
    color: '#e6f1ff',
    margin: '0 0 0.5rem 0',
  },
  userName: {
    color: '#64ffda',
    textShadow: '0 0 10px rgba(100, 255, 218, 0.3)',
  },
  welcomeText: {
    color: '#8892b0',
    fontSize: '1.1rem',
    margin: '0',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  notificationWrapper: {
    position: 'relative',
  },
  notificationBtn: {
    background: 'rgba(100, 255, 218, 0.1)',
    border: '1px solid rgba(100, 255, 218, 0.3)',
    color: '#64ffda',
    padding: '0.75rem',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '50px',
    height: '50px',
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
    animation: 'pulse 2s infinite',
  },
  notificationsDropdown: {
    position: 'absolute',
    top: '60px',
    right: '0',
    background: 'rgba(17, 34, 64, 0.95)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(35, 53, 84, 0.5)',
    borderRadius: '12px',
    width: '350px',
    zIndex: 1000,
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
  },
  notificationsHeader: {
    padding: '1rem',
    borderBottom: '1px solid rgba(35, 53, 84, 0.5)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationsTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#e6f1ff',
    margin: '0',
  },
  notificationsActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  notificationActionBtn: {
    background: 'transparent',
    border: 'none',
    color: '#64ffda',
    fontSize: '0.8rem',
    cursor: 'pointer',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
  },
  notificationClearBtn: {
    background: 'transparent',
    border: 'none',
    color: '#ff6b6b',
    fontSize: '0.8rem',
    cursor: 'pointer',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
  },
  notificationsList: {
    maxHeight: '300px',
    overflowY: 'auto',
  },
  notificationItem: {
    padding: '1rem',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    cursor: 'pointer',
    borderBottom: '1px solid rgba(35, 53, 84, 0.3)',
  },
  notificationIcon: {
    fontSize: '1.2rem',
    marginTop: '0.25rem',
  },
  notificationContent: {
    flex: '1',
  },
  notificationMessage: {
    color: '#ccd6f6',
    fontSize: '0.9rem',
    margin: '0 0 0.25rem 0',
  },
  notificationTime: {
    color: '#8892b0',
    fontSize: '0.8rem',
  },
  notificationUnread: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#64ffda',
    marginTop: '0.5rem',
  },
  noNotifications: {
    padding: '2rem',
    textAlign: 'center',
    color: '#8892b0',
  },
  noNotificationsIcon: {
    fontSize: '2rem',
    marginBottom: '0.5rem',
    color: '#64ffda',
  },
  noNotificationsText: {
    fontSize: '0.9rem',
    margin: '0',
  },
  userInfoCard: {
    background: 'rgba(17, 34, 64, 0.6)',
    borderRadius: '16px',
    padding: '1.5rem',
    border: '1px solid rgba(35, 53, 84, 0.5)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  userAvatar: {
    fontSize: '2.5rem',
    color: '#64ffda',
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  userEmail: {
    fontSize: '0.95rem',
    fontWeight: '500',
    color: '#e6f1ff',
  },
  userStats: {
    fontSize: '0.85rem',
    color: '#8892b0',
    marginTop: '0.25rem',
  },
  userActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  logoutBtn: {
    background: 'rgba(255, 107, 107, 0.1)',
    border: '1px solid rgba(255, 107, 107, 0.3)',
    color: '#ff6b6b',
    padding: '0.75rem 1.25rem',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  logoutText: {
    marginLeft: '0.5rem',
  },
  loadingSpinner: {
    width: '20px',
    height: '20px',
    border: '2px solid rgba(255, 107, 107, 0.3)',
    borderTop: '2px solid #ff6b6b',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  // Section Styles
  sectionHeader: {
    marginBottom: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#ccd6f6',
    margin: '0 0 0.5rem 0',
  },
  sectionSubtitle: {
    color: '#8892b0',
    fontSize: '1rem',
    margin: '0',
  },
  refreshAllBtn: {
    background: 'rgba(100, 255, 218, 0.1)',
    border: '1px solid rgba(100, 255, 218, 0.3)',
    color: '#64ffda',
    padding: '0.75rem 1.25rem',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  refreshText: {
    marginLeft: '0.5rem',
  },
  // Stats Section
  statsSection: {
    marginBottom: '3rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
  },
  statCard: {
    background: 'rgba(17, 34, 64, 0.6)',
    borderRadius: '16px',
    padding: '1.5rem',
    border: '1px solid rgba(35, 53, 84, 0.5)',
  },
  statHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem',
  },
  statIconBox: {
    width: '50px',
    height: '50px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  statIcon: {
    fontSize: '1.8rem',
  },
  statLoading: {
    width: '30px',
    height: '30px',
    border: '2px solid rgba(100, 255, 218, 0.3)',
    borderTop: '2px solid #64ffda',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#e6f1ff',
    margin: '0',
    lineHeight: '1',
  },
  loadingDots: {
    display: 'inline-block',
    animation: 'pulse 1.5s infinite',
  },
  statLabel: {
    color: '#8892b0',
    fontSize: '0.9rem',
    margin: '0.25rem 0 0 0',
  },
  statFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '1rem',
  },
  changeBadge: {
    padding: '0.3rem 0.8rem',
    borderRadius: '15px',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  statDesc: {
    color: '#8892b0',
    fontSize: '0.8rem',
  },
  // Actions Section
  actionsSection: {
    marginBottom: '3rem',
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
  },
  actionCard: {
    borderRadius: '16px',
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
  },
  actionIconBox: {
    width: '60px',
    height: '60px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  actionLoading: {
    width: '30px',
    height: '30px',
    border: '2px solid rgba(100, 255, 218, 0.3)',
    borderTop: '2px solid #64ffda',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  actionContent: {
    flex: '1',
  },
  actionTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    margin: '0 0 0.5rem 0',
  },
  actionDesc: {
    fontSize: '0.9rem',
    color: '#a8b2d1',
    margin: '0',
  },
  actionArrow: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
  },
  loadingSpinnerSmall: {
    width: '20px',
    height: '20px',
    border: '2px solid rgba(100, 255, 218, 0.3)',
    borderTop: '2px solid #64ffda',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  // Banner Section
  bannerSection: {
    marginBottom: '3rem',
  },
  banner: {
    position: 'relative',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
  },
  bannerImage: {
    width: '100%',
    height: '350px',
    objectFit: 'cover',
    filter: 'brightness(0.6) contrast(1.1)',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: '0',
    left: '0',
    right: '0',
    background: 'linear-gradient(transparent, rgba(10, 25, 47, 0.95))',
    padding: '2.5rem',
  },
  bannerTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: 'white',
    margin: '0 0 1rem 0',
  },
  bannerText: {
    color: '#ccd6f6',
    fontSize: '1.1rem',
    maxWidth: '600px',
    margin: '0 0 1.5rem 0',
    lineHeight: '1.6',
  },
  bannerStats: {
    display: 'flex',
    gap: '2rem',
  },
  bannerStat: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#64ffda',
    fontSize: '0.95rem',
  },
  bannerStatIcon: {
    fontSize: '1rem',
  },
  // Features & Activity
  featuresActivityWrapper: {
    display: 'grid',
    gridTemplateColumns: '1fr 350px',
    gap: '2rem',
    marginBottom: '3rem',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1.5rem',
  },
  featureCard: {
    background: 'rgba(17, 34, 64, 0.6)',
    border: '1px solid rgba(35, 53, 84, 0.5)',
    borderRadius: '16px',
    padding: '1.5rem',
  },
  featureIconBox: {
    width: '50px',
    height: '50px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    marginBottom: '1rem',
  },
  featureTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#ccd6f6',
    margin: '0 0 0.75rem 0',
  },
  featureDesc: {
    color: '#8892b0',
    fontSize: '0.9rem',
    lineHeight: '1.5',
    margin: '0',
  },
  activitySection: {},
  activityList: {
    background: 'rgba(17, 34, 64, 0.6)',
    border: '1px solid rgba(35, 53, 84, 0.5)',
    borderRadius: '16px',
    overflow: 'hidden',
  },
  viewAllBtn: {
    background: 'rgba(100, 255, 218, 0.1)',
    border: '1px solid rgba(100, 255, 218, 0.3)',
    color: '#64ffda',
    padding: '0.75rem 1.25rem',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  activityItem: {
    padding: '1rem 1.5rem',
    borderBottom: '1px solid rgba(35, 53, 84, 0.3)',
    cursor: 'pointer',
  },
  activityIconBox: {
    marginRight: '1rem',
    fontSize: '1.2rem',
  },
  activityContent: {
    flex: '1',
  },
  activityText: {
    color: '#ccd6f6',
    margin: '0 0 0.25rem 0',
    fontSize: '0.95rem',
    fontWeight: '500',
  },
  activityTime: {
    color: '#8892b0',
    fontSize: '0.8rem',
  },
  activityDetails: {
    marginTop: '0.5rem',
    padding: '0.5rem',
    background: 'rgba(100, 255, 218, 0.05)',
    borderRadius: '6px',
    borderLeft: '2px solid #64ffda',
  },
  activityDetailText: {
    color: '#8892b0',
    fontSize: '0.85rem',
    margin: '0',
    lineHeight: '1.4',
  },
  activityStatus: {
    fontSize: '0.75rem',
    fontWeight: '600',
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
  },
  // Help Section
  helpSection: {
    background: 'linear-gradient(135deg, rgba(100, 255, 218, 0.1), rgba(17, 34, 64, 0.6))',
    border: '1px solid rgba(100, 255, 218, 0.3)',
    borderRadius: '20px',
    padding: '2.5rem',
    marginBottom: '3rem',
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.3)',
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
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '0.95rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  secondaryBtn: {
    background: 'transparent',
    color: '#64ffda',
    border: '2px solid #64ffda',
    padding: '0.75rem 1.5rem',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '0.95rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  // FAB
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 30px rgba(100, 255, 218, 0.5)',
    zIndex: '1000',
  },
};

export default UserHome;