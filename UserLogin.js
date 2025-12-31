import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserService from "../../services/UserService";
import { setAuth, checkAuth, isAdmin } from "../../services"; // Add checkAuth and isAdmin here

function UserLogin() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [activeInput, setActiveInput] = useState(null);
    const [isHovering, setIsHovering] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
    const [typedCharacters, setTypedCharacters] = useState(0);

    // Refs
    const emailRef = useRef(null);
    const passwordRef = useRef(null);

    // Auto-focus and animation on mount
    useEffect(() => {
        emailRef.current?.focus();

        // Check for remembered email
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            setFormData(prev => ({ ...prev, email: rememberedEmail, rememberMe: true }));
        }

        // Add entry animation
        setTimeout(() => {
            const card = document.querySelector('.login-card');
            if (card) {
                card.style.transform = 'translateY(0)';
                card.style.opacity = '1';
            }
        }, 100);

        // Check if already logged in
        const user = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (user && token) {
            try {
                const userData = JSON.parse(user);
                if (userData.isLogin) {
                    if (userData.role === 'ADMIN') {
                        navigate('/AdminHome');
                    } else {
                        navigate('/Home');
                    }
                }
            } catch (e) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
    }, [navigate]);

    // Typing animation counter
    useEffect(() => {
        const totalChars = Object.values(formData).join('').length;
        if (totalChars > typedCharacters) {
            setTypedCharacters(totalChars);
        }
    }, [formData]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        if (successMessage) {
            setSuccessMessage('');
        }
    };

    const handleInputFocus = (fieldName) => {
        setActiveInput(fieldName);
        const inputRef = fieldName === 'email' ? emailRef : passwordRef;
        if (inputRef?.current) {
            inputRef.current.style.transform = 'scale(1.02)';
        }
    };

    const handleInputBlur = () => {
        setActiveInput(null);
        [emailRef, passwordRef].forEach(ref => {
            if (ref.current) {
                ref.current.style.transform = 'scale(1)';
            }
        });
    };

    const playSuccessAnimation = () => {
        setShowSuccessAnimation(true);
        setTimeout(() => {
            setShowSuccessAnimation(false);
        }, 1500);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Minimum 6 characters required';
        }

        return newErrors;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSuccessMessage('');
        setErrors({});

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            const firstErrorField = Object.keys(validationErrors)[0];
            const refs = {
                email: emailRef,
                password: passwordRef
            };
            refs[firstErrorField]?.current?.focus();

            const form = document.querySelector('.login-form');
            if (form) {
                form.classList.add('shake');
                setTimeout(() => form.classList.remove('shake'), 500);
            }

            return;
        }

        setIsLoading(true);

        try {
            console.log('📤 Attempting login with:', { email: formData.email, password: '***' });

            const result = await UserService.login(formData.email, formData.password);
            console.log('📥 Login response:', result);
            console.log('📥 Full response structure:', JSON.stringify(result, null, 2));

            if (result.success && result.data) {
                if (formData.rememberMe) {
                    localStorage.setItem('rememberedEmail', formData.email);
                } else {
                    localStorage.removeItem('rememberedEmail');
                }

                playSuccessAnimation();

                const message = result.data.message || "Login successful!";
                setSuccessMessage(message);

                // Handle different response structures
                let token = null;
                let userData = null;

                // Structure 1: token and user object
                if (result.data.token && result.data.user) {
                    token = result.data.token;
                    userData = result.data.user;
                    console.log('📦 Using structure 1: token + user object');
                }
                // Structure 2: token and user properties in data
                else if (result.data.token && (result.data.id || result.data.userId)) {
                    token = result.data.token;
                    userData = {
                        id: result.data.id || result.data.userId,
                        email: formData.email,
                        name: result.data.name || formData.email.split('@')[0],
                        role: result.data.role || 'USER',
                        isLogin: true
                    };
                    console.log('📦 Using structure 2: token + user properties');
                }
                // Structure 3: Only token in data
                else if (result.data.token) {
                    token = result.data.token;
                    userData = {
                        email: formData.email,
                        role: 'USER',
                        isLogin: true
                    };
                    console.log('📦 Using structure 3: token only');
                }
                // Structure 4: Response has token and user directly (not in data)
                else if (result.token && result.user) {
                    token = result.token;
                    userData = result.user;
                    console.log('📦 Using structure 4: direct token + user');
                }
                // Structure 5: Response has token directly
                else if (result.token) {
                    token = result.token;
                    userData = {
                        email: formData.email,
                        role: result.role || 'USER',
                        isLogin: true
                    };
                    console.log('📦 Using structure 5: direct token');
                }

                if (token && userData) {
                    console.log('💾 Setting auth with:', { token, userData });

                    // Use setAuth from services
                    setAuth(token, userData);

                    // Trigger auth change
                    window.dispatchEvent(new Event('authChange'));

                    // Navigate based on role
                    setTimeout(() => {
                        const userRole = userData.role || 'USER';
                        console.log('🚀 Redirecting with role:', userRole);

                        if (userRole === 'ADMIN' || userRole === 'admin') {
                            navigate('/AdminHome');
                        } else {
                            navigate('/Home');
                        }
                    }, 1500);
                } else {
                    console.error('❌ No token found in response');
                    setErrors({ submit: 'Login failed: No authentication token received' });
                }

            } else if (result.token) {
                // Handle case where API returns token directly in result
                console.log('📦 Using direct token structure');

                if (formData.rememberMe) {
                    localStorage.setItem('rememberedEmail', formData.email);
                } else {
                    localStorage.removeItem('rememberedEmail');
                }

                playSuccessAnimation();
                setSuccessMessage("Login successful!");

                const userData = {
                    email: formData.email,
                    role: result.role || 'USER',
                    isLogin: true
                };

                setAuth(result.token, userData);
                window.dispatchEvent(new Event('authChange'));

                setTimeout(() => {
                    const userRole = userData.role || 'USER';
                    console.log('🚀 Redirecting with role:', userRole);

                    if (userRole === 'ADMIN' || userRole === 'admin') {
                        navigate('/AdminHome');
                    } else {
                        navigate('/Home');
                    }
                }, 1500);

            } else {
                // Handle login failure
                const errorMsg = result.message || result.data?.message || "Invalid credentials";
                console.error('❌ Login failed:', errorMsg);
                setErrors({ submit: errorMsg });

                const card = document.querySelector('.login-card');
                if (card) {
                    card.style.borderColor = '#f87171';
                    setTimeout(() => card.style.borderColor = 'rgba(99, 102, 241, 0.3)', 2000);
                }
            }

        } catch (error) {
            console.error('❌ Login Error:', error);

            let errorMessage = "Login failed. Please try again.";

            if (error.result) {
                errorMessage = error.result.message;
            } else if (error.response) {
                errorMessage = error.response.data?.message || `HTTP Error ${error.response.status}`;
            } else if (error.request) {
                errorMessage = "Cannot connect to server. Please check your connection.";
            } else {
                errorMessage = error.message;
            }

            setErrors({ submit: errorMessage });

            const card = document.querySelector('.login-card');
            if (card) {
                card.style.animation = 'networkError 0.5s ease-in-out';
                setTimeout(() => card.style.animation = '', 500);
            }

        } finally {
            setIsLoading(false);
        }
    };

    // Style functions
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

    // Container and card styles
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

    return (
        <div style={containerStyle}>
            {/* Animated Background Particles */}
            <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
            }}>
                {[...Array(20)].map((_, i) => (
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
                className="login-card"
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
                            🔓
                        </div>
                        <h3 style={{ color: '#10b981', marginBottom: '0.5rem' }}>
                            Welcome Back!
                        </h3>
                        <p style={{ color: '#cbd5e1' }}>Login successful! Redirecting...</p>
                    </div>
                </div>

                {/* Progress Indicator */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: `linear-gradient(90deg, #6366f1 ${typedCharacters % 100}%, transparent ${typedCharacters % 100}%)`,
                    transition: 'background 0.3s ease',
                }} />

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
                    {/* Animated Rings */}
                    <div style={{
                        position: 'absolute',
                        width: '300px',
                        height: '300px',
                        top: '-150px',
                        right: '-150px',
                        border: '2px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '50%',
                        animation: 'rotate 20s linear infinite',
                    }} />
                    <div style={{
                        position: 'absolute',
                        width: '200px',
                        height: '200px',
                        bottom: '-100px',
                        left: '-100px',
                        border: '2px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '50%',
                        animation: 'rotate 15s linear infinite reverse',
                    }} />

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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                    </div>

                    <h2 style={{
                        fontSize: '1.875rem',
                        fontWeight: 'bold',
                        marginBottom: '0.5rem',
                        color: 'white',
                        textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
                    }}>
                        Welcome Back
                    </h2>

                    <p style={{
                        fontSize: '0.875rem',
                        color: '#e2e8f0',
                    }}>
                        {typedCharacters > 0
                            ? `${typedCharacters} characters typed...`
                            : 'Sign in to your account'}
                    </p>
                </div>

                {/* Form */}
                <div style={{ padding: '2rem' }}>
                    <form
                        className="login-form"
                        onSubmit={handleSubmit}
                        style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                    >
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
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                onFocus={() => handleInputFocus('email')}
                                onBlur={handleInputBlur}
                                style={inputStyle(errors.email, activeInput === 'email')}
                                placeholder="Enter your email"
                            />
                            {errors.email && (
                                <p style={{
                                    fontSize: '0.75rem',
                                    color: '#fca5a5',
                                    marginTop: '0.25rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    animation: 'shake 0.5s ease-in-out',
                                }}>
                                    <span style={{ fontSize: '1rem' }}>⚠️</span> {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: activeInput === 'password' ? '#c7d2fe' : '#94a3b8',
                                marginBottom: '0.5rem',
                                transition: 'all 0.3s ease',
                            }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    ref={passwordRef}
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    onFocus={() => handleInputFocus('password')}
                                    onBlur={handleInputBlur}
                                    style={{
                                        ...inputStyle(errors.password, activeInput === 'password'),
                                        paddingRight: '3rem'
                                    }}
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '0.75rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: activeInput === 'password' ? '#c7d2fe' : '#94a3b8',
                                        cursor: 'pointer',
                                        fontSize: '1.25rem',
                                        padding: '0.25rem',
                                        transition: 'all 0.3s ease',
                                        borderRadius: '0.25rem',
                                    }}
                                    onMouseOver={(e) => e.target.style.color = '#a5b4fc'}
                                    onMouseOut={(e) => e.target.style.color = activeInput === 'password' ? '#c7d2fe' : '#94a3b8'}
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                            {errors.password && (
                                <p style={{
                                    fontSize: '0.75rem',
                                    color: '#fca5a5',
                                    marginTop: '0.25rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                }}>
                                    <span style={{ fontSize: '1rem' }}>⚠️</span> {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.875rem',
                                color: '#94a3b8',
                                cursor: 'pointer',
                            }}>
                                <input
                                    type="checkbox"
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '1rem',
                                        height: '1rem',
                                        borderRadius: '0.375rem',
                                        border: '2px solid #475569',
                                        backgroundColor: formData.rememberMe ? '#6366f1' : 'transparent',
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer',
                                    }}
                                />
                                Remember me
                            </label>

                            <button
                                type="button"
                                onClick={() => navigate('/forgot-password')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#c7d2fe',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
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
                                Forgot password?
                            </button>
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
                                    Signing In...
                                </>
                            ) : 'Sign In'}
                        </button>

                        {/* Registration Link */}
                        <div style={{
                            textAlign: 'center',
                            paddingTop: '1rem',
                            borderTop: '1px solid rgba(71, 85, 105, 0.5)'
                        }}>
                            <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                                Don't have an account?{' '}
                                <button
                                    type="button"
                                    onClick={() => navigate('/UserRegistration')}
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
                                    Create Account Now →
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

                    @keyframes rotate {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
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

                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                        20%, 40%, 60%, 80% { transform: translateX(5px); }
                    }

                    @keyframes networkError {
                        0%, 100% { border-color: rgba(99, 102, 241, 0.5); }
                        50% { border-color: #f87171; }
                    }

                    .login-form.shake {
                        animation: shake 0.5s ease-in-out;
                    }

                    button:not(:disabled):hover > div {
                        left: 100%;
                    }

                    ::selection {
                        background: rgba(99, 102, 241, 0.3);
                        color: #e2e8f0;
                    }

                    input:focus {
                        outline: none;
                    }

                    input::placeholder {
                        color: #94a3b8;
                        opacity: 0.7;
                    }

                    /* Progress animation for the card */
                    .login-card {
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

export default UserLogin;