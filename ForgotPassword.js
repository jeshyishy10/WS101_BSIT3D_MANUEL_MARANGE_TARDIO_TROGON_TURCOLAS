// ForgotPassword.js
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserService from "../../services/UserService";

function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [activeInput, setActiveInput] = useState(null);
    const [isHovering, setIsHovering] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

    const emailRef = useRef(null);

    useEffect(() => {
        emailRef.current?.focus();

        setTimeout(() => {
            const card = document.querySelector('.forgot-card');
            if (card) {
                card.style.transform = 'translateY(0)';
                card.style.opacity = '1';
            }
        }, 100);
    }, []);

    const handleInputChange = (e) => {
        setEmail(e.target.value);
        if (errors.email) setErrors({});
        if (successMessage) setSuccessMessage('');
    };

    const validateForm = () => {
        const newErrors = {};
        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Please enter a valid email';
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage('');

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            emailRef.current?.focus();
            return;
        }

        setIsLoading(true);

        try {
            // In a real app, you would call your API to send reset password email
            // For now, simulate the process
            await new Promise(resolve => setTimeout(resolve, 1500));

            setShowSuccessAnimation(true);
            setSuccessMessage(`Reset link sent to ${email}! Check your email inbox.`);

            setTimeout(() => {
                setShowSuccessAnimation(false);
            }, 2000);

        } catch (error) {
            setErrors({ submit: 'Failed to send reset link. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const containerStyle = {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: `
            linear-gradient(135deg,
                rgba(15, 23, 42, 0.95) 0%,
                rgba(30, 41, 59, 0.95) 100%
            ),
            radial-gradient(
                circle at 20% 80%,
                rgba(99, 102, 241, 0.2) 0%,
                transparent 50%
            ),
            radial-gradient(
                circle at 80% 20%,
                rgba(139, 92, 246, 0.2) 0%,
                transparent 50%
            )
        `,
        backgroundAttachment: 'fixed',
        position: 'relative',
        overflow: 'hidden',
    };

    const cardStyle = {
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(30, 41, 59, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '1.5rem',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovering ? 'translateY(-8px) scale(1.01)' : 'translateY(0) scale(1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        opacity: 0,
        transform: 'translateY(20px)',
    };

    const successOverlayStyle = showSuccessAnimation ? {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(45deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'successPulse 2s ease-in-out',
    } : { display: 'none' };

    const inputStyle = (hasError, isActive) => ({
        width: '100%',
        padding: '0.75rem 1rem',
        borderRadius: '0.75rem',
        backgroundColor: 'rgba(51, 65, 85, 0.7)',
        border: `2px solid ${hasError ? '#f87171' : isActive ? '#6366f1' : '#475569'}`,
        color: '#e2e8f0',
        fontSize: '1rem',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'all 0.3s ease',
        boxShadow: isActive ? '0 0 0 4px rgba(99, 102, 241, 0.2)' : 'none',
        ...(isActive && !hasError && {
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
        })
    });

    return (
        <div style={containerStyle}>
            {/* Animated Background Particles */}
            <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
            }}>
                {[...Array(15)].map((_, i) => (
                    <div key={i} style={{
                        position: 'absolute',
                        width: Math.random() * 3 + 1 + 'px',
                        height: Math.random() * 3 + 1 + 'px',
                        background: `rgba(99, 102, 241, ${Math.random() * 0.4 + 0.1})`,
                        borderRadius: '50%',
                        left: Math.random() * 100 + '%',
                        top: Math.random() * 100 + '%',
                        animation: `float ${Math.random() * 15 + 10}s linear infinite`,
                        animationDelay: Math.random() * 5 + 's',
                    }} />
                ))}
            </div>

            <div
                className="forgot-card"
                style={cardStyle}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
            >
                {/* Success Animation Overlay */}
                <div style={successOverlayStyle}>
                    <div style={{
                        textAlign: 'center',
                        padding: '2rem',
                        background: 'rgba(30, 41, 59, 0.9)',
                        borderRadius: '1rem',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                    }}>
                        <div style={{
                            fontSize: '4rem',
                            marginBottom: '1rem',
                            animation: 'bounce 1s infinite',
                        }}>
                            ✉️
                        </div>
                        <h3 style={{ color: '#10b981', marginBottom: '0.5rem' }}>
                            Email Sent!
                        </h3>
                        <p style={{ color: '#cbd5e1' }}>Check your inbox for reset instructions</p>
                    </div>
                </div>

                {/* Header */}
                <div style={{
                    background: `
                        linear-gradient(90deg,
                            rgba(79, 70, 229, 0.9) 0%,
                            rgba(99, 102, 241, 0.9) 100%
                        ),
                        repeating-linear-gradient(
                            45deg,
                            transparent,
                            transparent 10px,
                            rgba(255, 255, 255, 0.05) 10px,
                            rgba(255, 255, 255, 0.05) 20px
                        )
                    `,
                    padding: '2rem 1.5rem',
                    textAlign: 'center',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        width: '4rem',
                        height: '4rem',
                        background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        boxShadow: '0 0 40px rgba(99, 102, 241, 0.6)',
                        position: 'relative',
                        animation: 'pulse 2s infinite',
                    }}>
                        <div style={{
                            position: 'absolute',
                            inset: '-2px',
                            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                            borderRadius: '50%',
                            filter: 'blur(8px)',
                            opacity: '0.6',
                        }} />
                        <svg style={{
                            width: '2rem',
                            height: '2rem',
                            color: 'white',
                            position: 'relative',
                            zIndex: '1'
                        }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    </div>

                    <h2 style={{
                        fontSize: '1.875rem',
                        fontWeight: 'bold',
                        marginBottom: '0.5rem',
                        color: 'white',
                        textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
                    }}>
                        Reset Password
                    </h2>

                    <p style={{
                        fontSize: '0.875rem',
                        color: '#e2e8f0',
                    }}>
                        Enter your email to receive a reset link
                    </p>
                </div>

                {/* Form */}
                <div style={{ padding: '2rem' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Success Message */}
                        {successMessage && (
                            <div style={{
                                padding: '1rem',
                                background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                borderRadius: '0.75rem',
                                color: '#a7f3d0',
                                fontSize: '0.875rem',
                                animation: 'slideIn 0.3s ease-out',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '1.2rem' }}>✅</span>
                                    <span>{successMessage}</span>
                                </div>
                            </div>
                        )}

                        {/* Submit Error */}
                        {errors.submit && (
                            <div style={{
                                padding: '1rem',
                                background: 'linear-gradient(90deg, rgba(220, 38, 38, 0.2), rgba(185, 28, 28, 0.2))',
                                border: '1px solid rgba(220, 38, 38, 0.3)',
                                borderRadius: '0.75rem',
                                color: '#fecaca',
                                fontSize: '0.875rem',
                                animation: 'slideIn 0.3s ease-out',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '1.2rem' }}>❌</span>
                                    <span>{errors.submit}</span>
                                </div>
                            </div>
                        )}

                        {/* Email Field */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: activeInput === 'email' ? '#c7d2fe' : '#94a3b8',
                                marginBottom: '0.5rem',
                                transition: 'all 0.3s ease',
                            }}>
                                Email Address
                            </label>
                            <input
                                ref={emailRef}
                                type="email"
                                value={email}
                                onChange={handleInputChange}
                                onFocus={() => setActiveInput('email')}
                                onBlur={() => setActiveInput(null)}
                                style={inputStyle(errors.email, activeInput === 'email')}
                                placeholder="Enter your email address"
                            />
                            {errors.email && (
                                <p style={{
                                    fontSize: '0.75rem',
                                    color: '#fca5a5',
                                    marginTop: '0.25rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                }}>
                                    <span style={{ fontSize: '1rem' }}>⚠️</span> {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Instructions */}
                        <div style={{
                            padding: '1rem',
                            background: 'rgba(51, 65, 85, 0.5)',
                            borderRadius: '0.75rem',
                            border: '1px solid rgba(71, 85, 105, 0.5)',
                            fontSize: '0.75rem',
                            color: '#94a3b8',
                        }}>
                            We'll send you a link to reset your password. Check your email inbox and follow the instructions.
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                padding: '0.875rem 1.5rem',
                                borderRadius: '0.75rem',
                                background: 'linear-gradient(90deg, #4f46e5 0%, #6366f1 100%)',
                                color: 'white',
                                border: 'none',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s ease',
                                position: 'relative',
                                overflow: 'hidden',
                                opacity: isLoading ? 0.8 : 1,
                                transform: isLoading ? 'none' : isHovering ? 'translateY(-2px)' : 'translateY(0)',
                                boxShadow: isLoading ? 'none' : isHovering ? '0 10px 25px rgba(79, 70, 229, 0.4)' : '0 4px 15px rgba(79, 70, 229, 0.3)',
                            }}
                            onMouseOver={(e) => !isLoading && (e.target.style.transform = 'translateY(-2px)')}
                            onMouseOut={(e) => !isLoading && (e.target.style.transform = 'translateY(0)')}
                        >
                            <div style={{
                                position: 'absolute',
                                top: '0',
                                left: '-100%',
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                                transition: 'left 0.5s ease',
                            }} />

                            {isLoading ? (
                                <>
                                    <svg style={{
                                        animation: 'spin 1s linear infinite',
                                        width: '1.25rem',
                                        height: '1.25rem',
                                        marginRight: '0.75rem',
                                        display: 'inline-block',
                                    }} fill="none" viewBox="0 0 24 24">
                                        <circle style={{ opacity: '0.25' }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path style={{ opacity: '0.75' }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Sending...
                                </>
                            ) : 'Send Reset Link'}
                        </button>

                        {/* Back to Login Link */}
                        <div style={{
                            textAlign: 'center',
                            paddingTop: '1rem',
                            borderTop: '1px solid rgba(71, 85, 105, 0.5)'
                        }}>
                            <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                                Remember your password?{' '}
                                <button
                                    type="button"
                                    onClick={() => navigate('/UserLogin')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#c7d2fe',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        padding: '0',
                                        transition: 'all 0.3s ease',
                                    }}
                                    onMouseOver={(e) => {
                                        e.target.style.color = '#a5b4fc';
                                        e.target.style.textDecoration = 'underline';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.color = '#c7d2fe';
                                        e.target.style.textDecoration = 'none';
                                    }}
                                >
                                    Back to Login
                                </button>
                            </p>
                        </div>
                    </form>
                </div>
            </div>

            {/* Animations */}
            <style>
                {`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }

                    @keyframes pulse {
                        0% { transform: scale(1); opacity: 0.8; }
                        50% { transform: scale(1.05); opacity: 1; }
                        100% { transform: scale(1); opacity: 0.8; }
                    }

                    @keyframes float {
                        0% { transform: translateY(0px) rotate(0deg); }
                        100% { transform: translateY(-1000px) rotate(360deg); }
                    }

                    @keyframes bounce {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-10px); }
                    }

                    @keyframes slideIn {
                        from {
                            opacity: 0;
                            transform: translateY(-10px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    @keyframes successPulse {
                        0% { opacity: 0; }
                        50% { opacity: 1; }
                        100% { opacity: 0; }
                    }

                    .forgot-card {
                        animation: slideUp 0.5s ease-out forwards;
                    }

                    @keyframes slideUp {
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `}
            </style>
        </div>
    );
}

export default ForgotPassword;