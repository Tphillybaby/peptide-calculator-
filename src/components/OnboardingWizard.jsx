import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    Syringe, Calculator, Calendar, BookOpen, TrendingDown,
    ChevronLeft, ChevronRight, X, Sparkles, Check,
    Target, Clock, BarChart3, Lightbulb, Rocket, Package
} from 'lucide-react';
import styles from './OnboardingWizard.module.css';

/**
 * OnboardingWizard - A beautiful 3-step wizard to welcome new users
 * 
 * Step 1: Welcome - Introduce the app and core features
 * Step 2: Key Tools - Highlight the main tools available  
 * Step 3: Get Started - Quick actions to begin using the app
 */
const OnboardingWizard = ({ onComplete, onSkip }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        {
            id: 'welcome',
            icon: Rocket,
            iconBg: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            iconColor: '#ffffff',
            title: 'Welcome to PeptideLog',
            subtitle: 'Your all-in-one companion for tracking, calculating, and optimizing your peptide journey.',
            features: [
                {
                    icon: Syringe,
                    color: '#10b981',
                    bgColor: 'rgba(16, 185, 129, 0.15)',
                    title: 'Track Every Dose',
                    description: 'Log injections with precision timing and dosage records'
                },
                {
                    icon: Calculator,
                    color: '#3b82f6',
                    bgColor: 'rgba(59, 130, 246, 0.15)',
                    title: 'Calculate Reconstitution',
                    description: 'Never mess up your BAC water ratios again'
                },
                {
                    icon: BarChart3,
                    color: '#8b5cf6',
                    bgColor: 'rgba(139, 92, 246, 0.15)',
                    title: 'Monitor Progress',
                    description: 'Visualize your journey with detailed analytics'
                }
            ]
        },
        {
            id: 'tools',
            icon: Sparkles,
            iconBg: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            iconColor: '#ffffff',
            title: 'Powerful Tools at Your Fingertips',
            subtitle: 'Everything you need to manage your peptides like a pro.',
            features: [
                {
                    icon: Calendar,
                    color: '#f59e0b',
                    bgColor: 'rgba(245, 158, 11, 0.15)',
                    title: 'Smart Scheduling',
                    description: 'Set reminders and never miss a dose with our calendar'
                },
                {
                    icon: TrendingDown,
                    color: '#06b6d4',
                    bgColor: 'rgba(6, 182, 212, 0.15)',
                    title: 'Price Comparison',
                    description: 'Find the best deals across multiple vendors'
                },
                {
                    icon: BookOpen,
                    color: '#ec4899',
                    bgColor: 'rgba(236, 72, 153, 0.15)',
                    title: 'Peptide Encyclopedia',
                    description: 'Research 50+ peptides with detailed info'
                },
                {
                    icon: Package,
                    color: '#f97316',
                    bgColor: 'rgba(249, 115, 22, 0.15)',
                    title: 'Inventory Management',
                    description: 'Track your stock and get expiration alerts'
                }
            ],
            tip: {
                icon: Lightbulb,
                content: <>All core features are <strong>completely free</strong>. No credit card required!</>
            }
        },
        {
            id: 'start',
            icon: Target,
            iconBg: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
            iconColor: '#ffffff',
            title: "You're All Set!",
            subtitle: 'Choose how you want to get started:',
            celebration: true,
            quickStart: [
                {
                    to: '/log',
                    icon: Syringe,
                    color: '#10b981',
                    bgColor: 'rgba(16, 185, 129, 0.15)',
                    label: 'Log First Injection',
                    hint: 'Start tracking now'
                },
                {
                    to: '/calculator',
                    icon: Calculator,
                    color: '#3b82f6',
                    bgColor: 'rgba(59, 130, 246, 0.15)',
                    label: 'Use Calculator',
                    hint: 'Reconstitute a peptide'
                },
                {
                    to: '/encyclopedia',
                    icon: BookOpen,
                    color: '#8b5cf6',
                    bgColor: 'rgba(139, 92, 246, 0.15)',
                    label: 'Browse Encyclopedia',
                    hint: 'Learn about peptides'
                },
                {
                    to: '/price-checker',
                    icon: TrendingDown,
                    color: '#06b6d4',
                    bgColor: 'rgba(6, 182, 212, 0.15)',
                    label: 'Compare Prices',
                    hint: 'Find the best deals'
                }
            ]
        }
    ];

    const currentStepData = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;
    const isFirstStep = currentStep === 0;
    const progressPercent = ((currentStep + 1) / steps.length) * 100;

    const handleNext = useCallback(() => {
        if (isLastStep) {
            onComplete?.();
        } else {
            setCurrentStep(prev => prev + 1);
        }
    }, [isLastStep, onComplete]);

    const handleBack = useCallback(() => {
        if (!isFirstStep) {
            setCurrentStep(prev => prev - 1);
        }
    }, [isFirstStep]);

    const handleSkip = useCallback(() => {
        onSkip?.();
    }, [onSkip]);

    const handleQuickStart = useCallback((path) => {
        onComplete?.();
    }, [onComplete]);

    const goToStep = useCallback((stepIndex) => {
        setCurrentStep(stepIndex);
    }, []);

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                {/* Progress Bar */}
                <div className={styles.progressBar}>
                    <div
                        className={styles.progressFill}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>

                {/* Header */}
                <div className={styles.header}>
                    <button
                        className={styles.skipButton}
                        onClick={handleSkip}
                        aria-label="Skip onboarding"
                    >
                        Skip <X size={14} />
                    </button>

                    {/* Step Indicators */}
                    <div className={styles.stepIndicators}>
                        {steps.map((step, index) => (
                            <button
                                key={step.id}
                                className={`${styles.stepDot} ${index === currentStep ? styles.stepDotActive : ''
                                    } ${index < currentStep ? styles.stepDotComplete : ''}`}
                                onClick={() => goToStep(index)}
                                aria-label={`Go to step ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className={styles.content}>
                    <div className={styles.stepContent} key={currentStep}>
                        {/* Celebration Animation for Last Step */}
                        {currentStepData.celebration && (
                            <div className={styles.confetti}>
                                <span className={styles.sparkle} />
                                <span className={styles.sparkle} />
                                <span className={styles.sparkle} />
                                <span className={styles.sparkle} />
                                <span className={styles.sparkle} />
                            </div>
                        )}

                        {/* Step Icon */}
                        <div
                            className={styles.stepIcon}
                            style={{ background: currentStepData.iconBg }}
                        >
                            <currentStepData.icon
                                size={36}
                                color={currentStepData.iconColor}
                                className={styles.stepIconInner}
                            />
                        </div>

                        {/* Step Title & Subtitle */}
                        <h2 className={styles.stepTitle}>{currentStepData.title}</h2>
                        <p className={styles.stepSubtitle}>{currentStepData.subtitle}</p>

                        {/* Feature List (Steps 1 & 2) */}
                        {currentStepData.features && (
                            <div className={styles.featureList}>
                                {currentStepData.features.map((feature, index) => (
                                    <div key={index} className={styles.featureItem}>
                                        <div
                                            className={styles.featureIcon}
                                            style={{
                                                background: feature.bgColor,
                                                color: feature.color
                                            }}
                                        >
                                            <feature.icon size={22} />
                                        </div>
                                        <div className={styles.featureContent}>
                                            <h3 className={styles.featureTitle}>
                                                {feature.title}
                                            </h3>
                                            <p className={styles.featureDescription}>
                                                {feature.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Quick Start Options (Step 3) */}
                        {currentStepData.quickStart && (
                            <div className={styles.quickStartOptions}>
                                {currentStepData.quickStart.map((option, index) => (
                                    <Link
                                        key={index}
                                        to={option.to}
                                        className={styles.quickStartCard}
                                        onClick={() => handleQuickStart(option.to)}
                                    >
                                        <div
                                            className={styles.quickStartIcon}
                                            style={{
                                                background: option.bgColor,
                                                color: option.color
                                            }}
                                        >
                                            <option.icon size={28} />
                                        </div>
                                        <span className={styles.quickStartLabel}>
                                            {option.label}
                                        </span>
                                        <span className={styles.quickStartHint}>
                                            {option.hint}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Tip Box */}
                        {currentStepData.tip && (
                            <div className={styles.tipBox}>
                                <currentStepData.tip.icon
                                    size={20}
                                    className={styles.tipIcon}
                                />
                                <p className={styles.tipText}>
                                    {currentStepData.tip.content}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <div className={styles.navigation}>
                    {!isFirstStep ? (
                        <button
                            className={`${styles.navButton} ${styles.navButtonSecondary}`}
                            onClick={handleBack}
                        >
                            <ChevronLeft size={18} />
                            Back
                        </button>
                    ) : (
                        <div className={styles.navSpacer} />
                    )}

                    <button
                        className={`${styles.navButton} ${styles.navButtonPrimary}`}
                        onClick={handleNext}
                    >
                        {isLastStep ? (
                            <>
                                <Check size={18} />
                                Get Started
                            </>
                        ) : (
                            <>
                                Next
                                <ChevronRight size={18} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingWizard;
