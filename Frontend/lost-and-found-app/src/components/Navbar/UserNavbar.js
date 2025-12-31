import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faBoxOpen,
  faUser,
  faSignOutAlt,
  faSearch,
  faBars,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import './UserNavbar.css';

const UserNavbar = () => {
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('email');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            localStorage.removeItem("email");
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("isLogin");
            localStorage.removeItem("userId");
            navigate('/');
        }
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const getInitials = (email) => {
        if (!email) return 'U';
        return email.charAt(0).toUpperCase();
    };

    return (
        <>
            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div
                    className="mobile-menu-overlay"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''} ${isMenuOpen ? 'menu-open' : ''}`}>
                <div className="navbar-container">
                    {/* Logo/Brand */}
                    <div className="navbar-brand">
                        <Link to="/Home" className="logo-link">
                            <div className="logo-icon">
                                <FontAwesomeIcon icon={faBoxOpen} />
                            </div>
                            <div className="logo-text">
                                <span className="logo-main">UEP</span>
                                <span className="logo-sub">Lost & Found</span>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="navbar-links">
                        <Link to="/Home" className="nav-link">
                            <FontAwesomeIcon icon={faHome} className="nav-icon" />
                            <span className="nav-text">Home</span>
                        </Link>
                        <Link to="/ItemList" className="nav-link">
                            <FontAwesomeIcon icon={faSearch} className="nav-icon" />
                            <span className="nav-text">Browse Items</span>
                        </Link>
                    </div>

                    {/* User Section */}
                    <div className="navbar-user-section">
                        {/* User Profile */}
                        <Link to={`/Profile/${userId}`} className="user-profile">
                            <div className="user-avatar">
                                <span className="user-initials">
                                    {getInitials(userEmail)}
                                </span>
                            </div>
                            <div className="user-info">
                                <span className="user-greeting">Hello,</span>
                                <span className="user-email">
                                    {userEmail ? userEmail.split('@')[0] : 'User'}
                                </span>
                            </div>
                        </Link>

                        {/* Logout Button */}
                        <button
                            className="logout-btn"
                            onClick={handleLogout}
                            title="Logout"
                        >
                            <FontAwesomeIcon icon={faSignOutAlt} />
                            <span className="logout-text">Logout</span>
                        </button>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="mobile-menu-toggle"
                            onClick={toggleMenu}
                            aria-label="Toggle menu"
                        >
                            <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    <div className={`mobile-menu ${isMenuOpen ? 'show' : ''}`}>
                        <div className="mobile-user-info">
                            <div className="user-avatar mobile">
                                <span className="user-initials">
                                    {getInitials(userEmail)}
                                </span>
                            </div>
                            <div className="mobile-user-details">
                                <span className="mobile-user-email">{userEmail}</span>
                                <span className="mobile-user-id">ID: {userId}</span>
                            </div>
                        </div>

                        <div className="mobile-nav-links">
                            <Link
                                to="/Home"
                                className="mobile-nav-link"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <FontAwesomeIcon icon={faHome} />
                                <span>Home</span>
                            </Link>
                            <Link
                                to="/ItemList"
                                className="mobile-nav-link"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <FontAwesomeIcon icon={faSearch} />
                                <span>Browse Items</span>
                            </Link>
                            <Link
                                to={`/Profile/${userId}`}
                                className="mobile-nav-link"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <FontAwesomeIcon icon={faUser} />
                                <span>My Profile</span>
                            </Link>
                        </div>

                        <div className="mobile-menu-footer">
                            <button
                                className="mobile-logout-btn"
                                onClick={handleLogout}
                            >
                                <FontAwesomeIcon icon={faSignOutAlt} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default UserNavbar;