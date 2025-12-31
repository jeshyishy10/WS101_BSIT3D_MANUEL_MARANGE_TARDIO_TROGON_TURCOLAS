// src/components/LandingPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [typedText, setTypedText] = useState('');
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const slides = [
        {
            title: "Lost Something?",
            description: "Report your lost items and let our community help you find them.",
            image: "🔍",
            color: "rgba(99, 102, 241, 0.9)"
        },
        {
            title: "Found Something?",
            description: "Help return lost items to their rightful owners.",
            image: "📦",
            color: "rgba(139, 92, 246, 0.9)"
        },
        {
            title: "Secure & Efficient",
            description: "Our verification system ensures items are returned to the right person.",
            image: "🔒",
            color: "rgba(59, 130, 246, 0.9)"
        }
    ];

    const features = [
        {
            icon: "🚀",
            title: "Fast Reporting",
            description: "Report lost or found items in minutes with our intuitive system."
        },
        {
            icon: "👥",
            title: "Community Powered",
            description: "Leverage the entire UEP community to help find lost items."
        },
        {
            icon: "🔐",
            title: "Secure Verification",
            description: "Multi-step verification process ensures items reach rightful owners."
        },
        {
            icon: "📱",
            title: "Mobile Friendly",
            description: "Access our system from any device, anywhere on campus."
        },
        {
            icon: "📊",
            title: "Real-time Updates",
            description: "Get instant notifications about your reported items."
        },
        {
            icon: "🏆",
            title: "Success Stories",
            description: "Join hundreds of successful item returns in our community."
        }
    ];

    const stats = [
        { number: "500+", label: "Items Reunited" },
        { number: "99%", label: "Success Rate" },
        { number: "24/7", label: "System Uptime" },
        { number: "1000+", label: "Happy Users" }
    ];

    // Typing animation effect
    useEffect(() => {
        const text = "UEP Lost & Found Hub";
        let currentIndex = 0;

        const typingInterval = setInterval(() => {
            if (currentIndex <= text.length) {
                setTypedText(text.substring(0, currentIndex));
                currentIndex++;
            } else {
                clearInterval(typingInterval);
            }
        }, 100);

        return () => clearInterval(typingInterval);
    }, []);

    // Slide rotation
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [slides.length]);

    // Mouse move effect
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth) * 100,
                y: (e.clientY / window.innerHeight) * 100
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleGetStarted = () => {
        navigate('/UserLogin');
    };

    const handleRegister = () => {
        navigate('/UserRegistration');
    };

    return (
        <div className="landing-page">
            {/* Animated Background */}
            <div className="animated-background">
                <div className="particles-container">
                    {[...Array(30)].map((_, i) => (
                        <div
                            key={i}
                            className="particle"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 5}s`,
                                animationDuration: `${Math.random() * 10 + 10}s`
                            }}
                        />
                    ))}
                </div>

                {/* Mouse follow effect */}
                <div
                    className="mouse-follow"
                    style={{
                        left: `${mousePosition.x}%`,
                        top: `${mousePosition.y}%`
                    }}
                />
            </div>

            {/* Navigation Bar */}
            <nav className="landing-nav">
                <div className="nav-container">
                    <div className="nav-brand">
                        <div className="brand-icon">🔍</div>
                        <span className="brand-text">UEP Lost & Found</span>
                    </div>

                    <div className="nav-links">
                        <button className="nav-link" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                            Features
                        </button>
                        <button className="nav-link" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
                            How It Works
                        </button>
                        <button className="nav-link" onClick={() => document.getElementById('stats')?.scrollIntoView({ behavior: 'smooth' })}>
                            Statistics
                        </button>
                        <button className="nav-link" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
                            Contact
                        </button>
                    </div>

                    <div className="nav-actions">
                        <button className="btn-login" onClick={handleGetStarted}>
                            Login
                        </button>
                        <button className="btn-register" onClick={handleRegister}>
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-container">
                    <div className="hero-content">
                        <div className="hero-badge">
                            <span className="badge-icon">🏆</span>
                            <span className="badge-text">Official UEP System</span>
                        </div>

                        <h1 className="hero-title">
                            Welcome to<br />
                            <span className="typing-text">{typedText}</span>
                            <span className="cursor">|</span>
                        </h1>

                        <p className="hero-description">
                            The official lost and found platform for University of Eastern Philippines.
                            Reuniting lost items with their owners through community collaboration and advanced technology.
                        </p>

                        <div className="hero-actions">
                            <button className="hero-btn primary" onClick={handleRegister}>
                                <span className="btn-icon">🚀</span>
                                Get Started Free
                            </button>
                            <button className="hero-btn secondary" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                                <span className="btn-icon">📚</span>
                                Learn More
                            </button>
                        </div>

                        <div className="hero-stats">
                            {stats.map((stat, index) => (
                                <div key={index} className="stat-item">
                                    <div className="stat-number">{stat.number}</div>
                                    <div className="stat-label">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="hero-visual">
                        <div className="slideshow">
                            {slides.map((slide, index) => (
                                <div
                                    key={index}
                                    className={`slide ${index === currentSlide ? 'active' : ''}`}
                                    style={{
                                        backgroundColor: slide.color,
                                        transform: `translateX(${(index - currentSlide) * 100}%)`
                                    }}
                                >
                                    <div className="slide-icon">{slide.image}</div>
                                    <h3>{slide.title}</h3>
                                    <p>{slide.description}</p>
                                </div>
                            ))}
                        </div>

                        {/* Slide indicators */}
                        <div className="slide-indicators">
                            {slides.map((_, index) => (
                                <button
                                    key={index}
                                    className={`indicator ${index === currentSlide ? 'active' : ''}`}
                                    onClick={() => setCurrentSlide(index)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="scroll-indicator">
                    <div className="mouse">
                        <div className="wheel"></div>
                    </div>
                    <span>Scroll to explore</span>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features-section">
                <div className="section-header">
                    <h2 className="section-title">Why Choose Our Platform?</h2>
                    <p className="section-subtitle">Powerful features designed for the UEP community</p>
                </div>

                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="feature-card"
                        >
                            <div className="feature-icon">{feature.icon}</div>
                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-description">{feature.description}</p>
                            <div className="feature-arrow">→</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="works-section">
                <div className="section-header">
                    <h2 className="section-title">How It Works</h2>
                    <p className="section-subtitle">Three simple steps to reunite lost items</p>
                </div>

                <div className="works-steps">
                    <div className="step">
                        <div className="step-number">1</div>
                        <div className="step-content">
                            <h3>Report</h3>
                            <p>Report a lost or found item with details and photos</p>
                        </div>
                        <div className="step-line"></div>
                    </div>

                    <div className="step">
                        <div className="step-number">2</div>
                        <div className="step-content">
                            <h3>Match</h3>
                            <p>Our system matches lost reports with found items</p>
                        </div>
                        <div className="step-line"></div>
                    </div>

                    <div className="step">
                        <div className="step-number">3</div>
                        <div className="step-content">
                            <h3>Reunite</h3>
                            <p>Claim your item after successful verification</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Statistics Section */}
            <section id="stats" className="stats-section">
                <div className="stats-container">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-circle">
                            <div className="circle-progress">
                                <svg width="120" height="120">
                                    <circle
                                        cx="60"
                                        cy="60"
                                        r="54"
                                        fill="none"
                                        stroke="rgba(255,255,255,0.1)"
                                        strokeWidth="4"
                                    />
                                    <circle
                                        cx="60"
                                        cy="60"
                                        r="54"
                                        fill="none"
                                        stroke="rgba(99, 102, 241, 0.8)"
                                        strokeWidth="4"
                                        strokeDasharray="339"
                                        strokeDashoffset="339"
                                        style={{
                                            animation: `progress ${index + 2}s ease-out forwards`
                                        }}
                                    />
                                </svg>
                                <div className="circle-content">
                                    <div className="circle-number">{stat.number}</div>
                                    <div className="circle-label">{stat.label}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-container">
                    <h2 className="cta-title">Ready to Get Started?</h2>
                    <p className="cta-description">
                        Join thousands of UEP students and staff who trust our platform
                    </p>
                    <div className="cta-actions">
                        <button className="cta-btn primary" onClick={handleRegister}>
                            Create Free Account
                        </button>
                        <button className="cta-btn secondary" onClick={() => navigate('/UserLogin')}>
                            Login to Existing Account
                        </button>
                    </div>
                </div>
            </section>

            {/* Contact & Footer Section */}
            <footer id="contact" className="footer-section">
                <div className="footer-container">
                    <div className="footer-info">
                        <div className="footer-brand">
                            <div className="footer-icon">🔍</div>
                            <div>
                                <h3>UEP Lost & Found Hub</h3>
                                <p className="footer-tagline">Reuniting what matters</p>
                            </div>
                        </div>

                        <div className="footer-location">
                            <h4>📍 Location</h4>
                            <p>
                                University of Eastern Philippines<br />
                                University Town, Northern Samar<br />
                                Philippines 6400
                            </p>
                        </div>

                        <div className="footer-contact">
                            <h4>📞 Contact</h4>
                            <p>Email: lostandfound@uep.edu.ph</p>
                            <p>Phone: (63)9 123-456768</p>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <div className="copyright">
                            © 2025 UEP Lost & Found Hub. All rights reserved.
                        </div>

                        <div className="footer-links">
                            <button className="footer-link">Privacy Policy</button>
                            <button className="footer-link">Terms of Service</button>
                            <button className="footer-link">FAQ</button>
                            <button className="footer-link">Help Center</button>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Floating Action Button */}
            <button
                className="fab"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
                ↑
            </button>
        </div>
    );
};

export default LandingPage;