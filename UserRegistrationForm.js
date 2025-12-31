import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import UserService from "../../services/UserService";

function UserRegistration() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        department: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordRequirements, setPasswordRequirements] = useState([
        { text: '8+ characters', met: false },
        { text: 'Lowercase letter', met: false },
        { text: 'Uppercase letter', met: false },
        { text: 'Number', met: false }
    ]);
    const [activeInput, setActiveInput] = useState(null);
    const [isHovering, setIsHovering] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [emailAvailable, setEmailAvailable] = useState(null);
    const [checkingEmail, setCheckingEmail] = useState(false);
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
    const [typedCharacters, setTypedCharacters] = useState(0);

    // Refs
    const nameRef = useRef(null);
    const emailRef = useRef(null);
    const deptRef = useRef(null);
    const passRef = useRef(null);
    const confirmRef = useRef(null);
    const emailCheckTimeout = useRef(null);

    // Auto-focus and animation on mount
    useEffect(() => {
        nameRef.current?.focus();

        // Add some initial animation
        setTimeout(() => {
            const card = document.querySelector('.registration-card');
            if (card) {
                card.style.transform = 'translateY(0)';
                card.style.opacity = '1';
            }
        }, 100);

        return () => {
            if (emailCheckTimeout.current) {
                clearTimeout(emailCheckTimeout.current);
            }
        };
    }, []);

    // Password validation effect
    useEffect(() => {
        if (formData.password) {
            const requirements = [
                formData.password.length >= 8,
                /[a-z]/.test(formData.password),
                /[A-Z]/.test(formData.password),
                /\d/.test(formData.password)
            ];

            setPasswordRequirements(prev => prev.map((req, index) => ({
                ...req,
                met: requirements[index]
            })));
        } else {
            setPasswordRequirements(prev => prev.map(req => ({ ...req, met: false })));
        }
    }, [formData.password]);

    // Email availability check
    useEffect(() => {
        if (emailCheckTimeout.current) {
            clearTimeout(emailCheckTimeout.current);
        }

        if (formData.email && /\S+@\S+\.\S+/.test(formData.email)) {
            emailCheckTimeout.current = setTimeout(() => {
                checkEmailAvailability();
            }, 500);
        } else {
            setEmailAvailable(null);
        }

        return () => {
            if (emailCheckTimeout.current) {
                clearTimeout(emailCheckTimeout.current);
            }
        };
    }, [formData.email]);

    // Typing animation counter
    useEffect(() => {
        const totalChars = Object.values(formData).join('').length;
        if (totalChars > typedCharacters) {
            setTypedCharacters(totalChars);
        }
    }, [formData]);

    const checkEmailAvailability = async () => {
        if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) return;

        setCheckingEmail(true);
        try {
            const result = await UserService.checkEmail(formData.email);
            if (result.success) {
                setEmailAvailable(result.data?.available !== false);
                if (result.data?.available === false) {
                    setErrors(prev => ({ ...prev, email: 'Email already registered' }));
                }
            } else {
                setEmailAvailable(null);
            }
        } catch (error) {
            console.log('Email check failed:', error.message);
            setEmailAvailable(null);
        } finally {
            setCheckingEmail(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear specific error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        // Clear success message when form changes
        if (successMessage) {
            setSuccessMessage('');
        }

        // Clear email availability status for email field
        if (name === 'email') {
            setEmailAvailable(null);
        }
    };

    const handleInputFocus = (fieldName) => {
        setActiveInput(fieldName);

        // Add subtle animation to active field
        const inputRefs = {
            name: nameRef,
            email: emailRef,
            department: deptRef,
            password: passRef,
            confirmPassword: confirmRef
        };

        const input = inputRefs[fieldName]?.current;
        if (input) {
            input.style.transform = 'scale(1.02)';
        }
    };

    const handleInputBlur = () => {
        setActiveInput(null);

        // Reset scale for all inputs
        [nameRef, emailRef, deptRef, passRef, confirmRef].forEach(ref => {
            if (ref.current) {
                ref.current.style.transform = 'scale(1)';
            }
        });
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        } else if (emailAvailable === false) {
            newErrors.email = 'Email already registered';
        }

        if (!formData.department.trim()) {
            newErrors.department = 'Department is required';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Minimum 8 characters required';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Include uppercase, lowercase and number';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        return newErrors;
    };

    const playSuccessAnimation = () => {
        setShowSuccessAnimation(true);
        setTimeout(() => {
            setShowSuccessAnimation(false);
        }, 2000);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSuccessMessage('');

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);

            // Focus first error field
            const firstErrorField = Object.keys(validationErrors)[0];
            const refs = {
                name: nameRef,
                email: emailRef,
                department: deptRef,
                password: passRef,
                confirmPassword: confirmRef
            };
            refs[firstErrorField]?.current?.focus();

            // Shake animation for error
            const form = document.querySelector('.registration-form');
            if (form) {
                form.classList.add('shake');
                setTimeout(() => form.classList.remove('shake'), 500);
            }

            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            // Format data according to backend requirements
            const registrationData = {
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
                department: formData.department.trim(),
                password: formData.password, // Backend will hash this
                // Backend will add: userId, registeredDate, registeredTime, role, token
            };

            console.log('📤 Sending registration data:', registrationData);

            // Call UserService.register (which uses authAPI.register)
            const result = await UserService.register(registrationData);

            console.log('📥 Registration response:', result);

            // Handle different response formats
            if (result.success && result.data) {
                // Show success animation
                playSuccessAnimation();

                const message = result.data.message || "Account created successfully!";
                setSuccessMessage(message);

                // Auto-login after successful registration
                try {
                    console.log('🔐 Attempting auto-login...');
                    const loginResult = await UserService.login(registrationData.email, registrationData.password);

                    if (loginResult.success && loginResult.data?.isLogin) {
                        setSuccessMessage(prev => `${prev}\n\nAuto-login successful! Redirecting...`);

                        // Navigate based on user role
                        setTimeout(() => {
                            const user = JSON.parse(localStorage.getItem('user') || '{}');
                            navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard');
                        }, 2000);
                    } else {
                        setSuccessMessage(prev => `${prev}\n\nPlease login with your new credentials.`);
                        setTimeout(() => navigate('/UserLogin'), 2500);
                    }
                } catch (loginError) {
                    console.log('Auto-login failed, redirecting to login page:', loginError.message);
                    setSuccessMessage(prev => `${prev}\n\nPlease login with your new credentials.`);
                    setTimeout(() => navigate('/UserLogin'), 2500);
                }

                // Reset form
                setTimeout(() => {
                    setFormData({
                        name: '',
                        email: '',
                        department: '',
                        password: '',
                        confirmPassword: '',
                    });
                }, 1000);

            } else {
                // Handle registration failure
                const errorMsg = result.data?.message || result.message || "Registration failed";
                setErrors({ submit: errorMsg });

                // Highlight form with error
                const form = document.querySelector('.registration-card');
                if (form) {
                    form.style.borderColor = '#f87171';
                    setTimeout(() => form.style.borderColor = 'rgba(99, 102, 241, 0.5)', 2000);
                }
            }

        } catch (error) {
            console.error('❌ Registration Error:', error);

            let errorMessage = "Registration failed. Please try again.";

            if (error.result) {
                // Handle API error
                errorMessage = error.result.message;
            } else if (error.response) {
                // Handle HTTP error
                errorMessage = error.response.data?.message || `HTTP Error ${error.response.status}`;
            } else if (error.request) {
                errorMessage = "Cannot connect to server. Please check your connection.";
            }

            setErrors({ submit: errorMessage });

            // Network error animation
            const card = document.querySelector('.registration-card');
            if (card) {
                card.style.animation = 'networkError 0.5s ease-in-out';
                setTimeout(() => card.style.animation = '', 500);
            }

        } finally {
            setIsLoading(false);
        }
    };

    // New: Password strength indicator
    const getPasswordStrength = () => {
        if (!formData.password) return 0;
        let strength = 0;
        if (formData.password.length >= 8) strength += 25;
        if (/[a-z]/.test(formData.password)) strength += 25;
        if (/[A-Z]/.test(formData.password)) strength += 25;
        if (/\d/.test(formData.password)) strength += 25;
        return strength;
    };

    const getStrengthColor = (strength) => {
        if (strength < 50) return '#ef4444';
        if (strength < 75) return '#f59e0b';
        return '#10b981';
    };

    const strength = getPasswordStrength();
    const strengthColor = getStrengthColor(strength);

    // Updated Styles with Dark Navy Blue Theme
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
                className="registration-card"
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
                            🎉
                        </div>
                        <h3 style={{ color: '#10b981', marginBottom: '0.5rem' }}>
                            Success!
                        </h3>
                        <p style={{ color: '#cbd5e1' }}>Account created successfully!</p>
                    </div>
                </div>

                {/* Animated Background Elements */}
                <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    background: `
                        radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)
                    `,
                    pointerEvents: 'none',
                }} />

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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>

                    <h2 style={{
                        fontSize: '1.875rem',
                        fontWeight: 'bold',
                        marginBottom: '0.5rem',
                        color: 'white',
                        textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
                    }}>
                        Join Our Community
                    </h2>

                    <p style={{
                        fontSize: '0.875rem',
                        color: '#e2e8f0',
                    }}>
                        {typedCharacters > 0
                            ? `${typedCharacters} characters typed...`
                            : 'Create your account to get started'}
                    </p>
                </div>

                {/* Form */}
                <div style={{ padding: '2rem' }}>
                    <form
                        className="registration-form"
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
                                    <span style={{ flex: 1 }}>{successMessage.split('\n\n').map((line, i) => (
                                        <div key={i}>{line}</div>
                                    ))}</span>
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

                        {/* Name Field */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: activeInput === 'name' ? '#c7d2fe' : '#94a3b8',
                                marginBottom: '0.5rem',
                                transition: 'all 0.3s ease',
                            }}>
                                Full Name
                            </label>
                            <input
                                ref={nameRef}
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                onFocus={() => handleInputFocus('name')}
                                onBlur={handleInputBlur}
                                style={inputStyle(errors.name, activeInput === 'name')}
                                placeholder="Enter your full name"
                            />
                            {errors.name && (
                                <p style={{
                                    fontSize: '0.75rem',
                                    color: '#fca5a5',
                                    marginTop: '0.25rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    animation: 'shake 0.5s ease-in-out',
                                }}>
                                    <span style={{ fontSize: '1rem' }}>⚠️</span> {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Email Field with Availability Check */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    {checkingEmail && (
                                        <span style={{
                                            fontSize: '0.75rem',
                                            color: '#fbbf24',
                                            animation: 'pulse 1s infinite',
                                        }}>
                                            Checking...
                                        </span>
                                    )}
                                    {emailAvailable === true && (
                                        <span style={{
                                            fontSize: '0.75rem',
                                            color: '#34d399',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem',
                                        }}>
                                            ✓ Available
                                        </span>
                                    )}
                                    {emailAvailable === false && (
                                        <span style={{
                                            fontSize: '0.75rem',
                                            color: '#f87171',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem',
                                        }}>
                                            ✗ Already registered
                                        </span>
                                    )}
                                </div>
                            </div>
                            <input
                                ref={emailRef}
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                onFocus={() => handleInputFocus('email')}
                                onBlur={handleInputBlur}
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

                        {/* Department Field */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: activeInput === 'department' ? '#c7d2fe' : '#94a3b8',
                                marginBottom: '0.5rem',
                                transition: 'all 0.3s ease',
                            }}>
                                Department
                            </label>
                            <input
                                ref={deptRef}
                                type="text"
                                name="department"
                                value={formData.department}
                                onChange={handleInputChange}
                                onFocus={() => handleInputFocus('department')}
                                onBlur={handleInputBlur}
                                style={inputStyle(errors.department, activeInput === 'department')}
                                placeholder="Enter your department"
                            />
                            {errors.department && (
                                <p style={{
                                    fontSize: '0.75rem',
                                    color: '#fca5a5',
                                    marginTop: '0.25rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                }}>
                                    <span style={{ fontSize: '1rem' }}>⚠️</span> {errors.department}
                                </p>
                            )}
                        </div>

                        {/* Password Field with Strength Indicator */}
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
                                    ref={passRef}
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
                                    placeholder="Create a strong password"
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

                            {/* Password Strength Bar */}
                            {formData.password && (
                                <div style={{ marginTop: '0.5rem' }}>
                                    <div style={{
                                        width: '100%',
                                        height: '4px',
                                        background: 'rgba(100, 116, 139, 0.5)',
                                        borderRadius: '2px',
                                        overflow: 'hidden',
                                    }}>
                                        <div style={{
                                            width: `${strength}%`,
                                            height: '100%',
                                            background: strengthColor,
                                            transition: 'all 0.3s ease',
                                            borderRadius: '2px',
                                        }} />
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: '0.75rem',
                                        color: '#94a3b8',
                                        marginTop: '0.25rem',
                                    }}>
                                        <span>Weak</span>
                                        <span style={{ color: strengthColor }}>
                                            {strength < 50 ? 'Weak' : strength < 75 ? 'Medium' : 'Strong'}
                                        </span>
                                        <span>Strong</span>
                                    </div>
                                </div>
                            )}

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

                        {/* Password Requirements Grid */}
                        {formData.password && (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '0.5rem',
                                padding: '1rem',
                                background: 'rgba(51, 65, 85, 0.5)',
                                borderRadius: '0.75rem',
                                border: '1px solid rgba(71, 85, 105, 0.5)',
                                animation: 'fadeIn 0.3s ease-out',
                            }}>
                                {passwordRequirements.map((req, index) => (
                                    <div key={index} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        color: req.met ? '#34d399' : '#94a3b8',
                                        fontSize: '0.75rem',
                                        transition: 'all 0.3s ease',
                                        padding: '0.25rem 0',
                                    }}>
                                        <span style={{
                                            fontSize: '0.875rem',
                                            color: req.met ? '#34d399' : '#64748b',
                                            transition: 'all 0.3s ease',
                                        }}>
                                            {req.met ? '✓' : '○'}
                                        </span>
                                        {req.text}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Confirm Password Field */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: activeInput === 'confirmPassword' ? '#c7d2fe' : '#94a3b8',
                                marginBottom: '0.5rem',
                                transition: 'all 0.3s ease',
                            }}>
                                Confirm Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    ref={confirmRef}
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    onFocus={() => handleInputFocus('confirmPassword')}
                                    onBlur={handleInputBlur}
                                    style={{
                                        ...inputStyle(errors.confirmPassword, activeInput === 'confirmPassword'),
                                        paddingRight: '3rem'
                                    }}
                                    placeholder="Confirm your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '0.75rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: activeInput === 'confirmPassword' ? '#c7d2fe' : '#94a3b8',
                                        cursor: 'pointer',
                                        fontSize: '1.25rem',
                                        padding: '0.25rem',
                                        transition: 'all 0.3s ease',
                                        borderRadius: '0.25rem',
                                    }}
                                    onMouseOver={(e) => e.target.style.color = '#a5b4fc'}
                                    onMouseOut={(e) => e.target.style.color = activeInput === 'confirmPassword' ? '#c7d2fe' : '#94a3b8'}
                                >
                                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                            {formData.confirmPassword && formData.password === formData.confirmPassword && (
                                <p style={{
                                    fontSize: '0.75rem',
                                    color: '#34d399',
                                    marginTop: '0.25rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    animation: 'fadeIn 0.3s ease-out',
                                }}>
                                    <span style={{ fontSize: '1rem' }}>✓</span> Passwords match
                                </p>
                            )}
                            {errors.confirmPassword && (
                                <p style={{
                                    fontSize: '0.75rem',
                                    color: '#fca5a5',
                                    marginTop: '0.25rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                }}>
                                    <span style={{ fontSize: '1rem' }}>⚠️</span> {errors.confirmPassword}
                                </p>
                            )}
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
                                    Creating Account...
                                </>
                            ) : 'Create Account'}
                        </button>

                        {/* Login Link */}
                        <div style={{
                            textAlign: 'center',
                            paddingTop: '1rem',
                            borderTop: '1px solid rgba(71, 85, 105, 0.5)'
                        }}>
                            <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                                Already have an account?{' '}
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
                                    Sign In Now →
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

                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
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

                    .registration-form.shake {
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
                    .registration-card {
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

export default UserRegistration;