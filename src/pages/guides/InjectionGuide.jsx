import React from 'react';
import { ArrowLeft, Syringe, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

const InjectionGuide = () => {
    return (
        <>
            <SEO
                title="Injection Techniques Guide | Safe Peptide Administration"
                description="Step-by-step visual guide to safe subcutaneous injections. Learn proper technique, injection sites, and best practices."
                canonical="/guides/injection"
            />
            <div className="page-container">
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <Link to="/guides" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '2rem' }}>
                        <ArrowLeft size={20} /> Back to Guides
                    </Link>

                    <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Injection Techniques</h1>
                    <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '3rem' }}>
                        A step-by-step visual guide to performing safe and painless subcutaneous injections.
                    </p>

                    <div className="card glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <Syringe className="text-accent" size={24} />
                            Where to Inject (Subcutaneous)
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center' }}>
                            <div>
                                <p style={{ lineHeight: '1.6', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                    The most common site is the <strong>abdomen</strong>, at least 2 inches away from the belly button.
                                </p>
                                <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                    <li>Abdomen (preferred)</li>
                                    <li>Outer thigh</li>
                                    <li>Back of the upper arm</li>
                                </ul>
                                <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '0.5rem', borderLeft: '4px solid #f59e0b' }}>
                                    <strong style={{ color: '#f59e0b', display: 'block', marginBottom: '0.5rem' }}>Rotate Sites!</strong>
                                    Don't inject in the exact same spot every time to prevent scar tissue buildup.
                                </div>
                            </div>
                            <div style={{
                                height: '300px',
                                background: 'rgba(15, 23, 42, 0.5)',
                                borderRadius: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid var(--glass-border)'
                            }}>
                                {/* Placeholder for an anatomical diagram */}
                                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🧍</div>
                                    <p>Anatomical Diagram Placeholder</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card glass-panel" style={{ padding: '2rem' }}>
                        <h2 style={{ marginBottom: '2rem' }}>The 4-Step Process</h2>

                        <div style={{ display: 'grid', gap: '2rem' }}>
                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    background: 'var(--accent-primary)', color: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.25rem', fontWeight: 'bold', flexShrink: 0
                                }}>1</div>
                                <div>
                                    <h3 style={{ marginBottom: '0.5rem' }}>Pinch</h3>
                                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                        Gently pinch a 1-2 inch fold of skin/fat between your thumb and forefinger. This pulls the fatty tissue away from the muscle.
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    background: 'var(--accent-primary)', color: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.25rem', fontWeight: 'bold', flexShrink: 0
                                }}>2</div>
                                <div>
                                    <h3 style={{ marginBottom: '0.5rem' }}>Insert</h3>
                                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                        Hold the syringe like a dart. Insert the needle quickly and firmly at a <strong>45 to 90-degree angle</strong> into the pinched skin.
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    background: 'var(--accent-primary)', color: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.25rem', fontWeight: 'bold', flexShrink: 0
                                }}>3</div>
                                <div>
                                    <h3 style={{ marginBottom: '0.5rem' }}>Push</h3>
                                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                        Slowly push the plunger all the way down. Wait 5 seconds after injecting to ensure all liquid is absorbed.
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    background: 'var(--accent-primary)', color: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.25rem', fontWeight: 'bold', flexShrink: 0
                                }}>4</div>
                                <div>
                                    <h3 style={{ marginBottom: '0.5rem' }}>Release</h3>
                                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                        Remove the needle at the same angle it went in. Release the skin fold. Do not rub the area. Dispose of the needle in your sharps container.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recommended Supplies — Premium Grid */}
                    <div style={{ marginTop: '2.5rem' }}>
                        {/* Section Header */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '1.25rem',
                            flexWrap: 'wrap',
                            gap: '0.75rem'
                        }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <span>🛒</span> Recommended Supplies
                                </h2>
                                <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    Everything you need for safe, sterile injections — our top picks.
                                </p>
                            </div>
                            <span style={{
                                fontSize: '0.72rem',
                                color: 'var(--text-muted)',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '999px',
                                padding: '0.3rem 0.8rem',
                                whiteSpace: 'nowrap'
                            }}>
                                Affiliate links · Amazon Associate
                            </span>
                        </div>

                        {/* Product Cards Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                            gap: '1rem',
                            marginBottom: '1.5rem'
                        }}>
                            {[
                                {
                                    href: 'https://amzn.to/4eN6a3H',
                                    emoji: '💉',
                                    badge: '⭐ Most Popular',
                                    badgeColor: '#f59e0b',
                                    name: 'Insulin Syringes 31G',
                                    subname: 'Box of 100',
                                    desc: 'Easy Touch 1cc, short needle, bold markings. The gold standard for peptide SubQ injections.',
                                    tag: 'Essential',
                                    tagColor: '#10b981',
                                    accentColor: '#3b82f6',
                                },
                                {
                                    href: 'https://amzn.to/3RKVAAs',
                                    emoji: '🖊️',
                                    badge: '🔥 Top Seller',
                                    badgeColor: '#ef4444',
                                    name: 'Reusable Peptide Pen V2',
                                    subname: '60-Unit Dial',
                                    desc: 'Smooth plunger, precision dosing, includes 50 prep pads + travel case for 3ml cartridges.',
                                    tag: 'Premium',
                                    tagColor: '#8b5cf6',
                                    accentColor: '#8b5cf6',
                                },
                                {
                                    href: 'https://amzn.to/4wzDWjk',
                                    emoji: '🔋',
                                    badge: '✅ Editor\'s Pick',
                                    badgeColor: '#10b981',
                                    name: '3mL Pen Cartridges',
                                    subname: '10-Pack',
                                    desc: 'Steam sterilized, individually packaged. Compatible with V1 & V2 peptide pens.',
                                    tag: 'Refills',
                                    tagColor: '#06b6d4',
                                    accentColor: '#06b6d4',
                                },
                                {
                                    href: 'https://amzn.to/42zQz05',
                                    emoji: '🧊',
                                    badge: '❄️ Must Have',
                                    badgeColor: '#06b6d4',
                                    name: 'Peptide Storage Case',
                                    subname: '63-Slot Organizer',
                                    desc: 'Fridge-ready, fits 3ml vials perfectly. Mesh pocket, labeled slots, keeps your stack organized.',
                                    tag: 'Storage',
                                    tagColor: '#f59e0b',
                                    accentColor: '#f59e0b',
                                },
                                {
                                    href: 'https://amzn.to/4wy1UeP',
                                    emoji: '🧴',
                                    badge: '💊 Sterile Grade',
                                    badgeColor: '#6366f1',
                                    name: 'Alcohol Wipes 70% IPA',
                                    subname: 'Sterile Prep Pads',
                                    desc: 'Medical-grade isopropyl. Use on vial tops and injection sites before every injection.',
                                    tag: 'Safety',
                                    tagColor: '#ec4899',
                                    accentColor: '#ec4899',
                                },
                            ].map((item) => (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        textDecoration: 'none',
                                        background: 'var(--bg-card)',
                                        border: `1px solid ${item.accentColor}30`,
                                        borderRadius: '1rem',
                                        overflow: 'hidden',
                                        transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
                                        position: 'relative',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = `0 12px 40px ${item.accentColor}25`;
                                        e.currentTarget.style.borderColor = `${item.accentColor}60`;
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                        e.currentTarget.style.borderColor = `${item.accentColor}30`;
                                    }}
                                >
                                    {/* Accent top bar */}
                                    <div style={{
                                        height: '3px',
                                        background: `linear-gradient(90deg, ${item.accentColor}, ${item.accentColor}80)`,
                                    }} />

                                    {/* Card body */}
                                    <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {/* Badge row */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{
                                                fontSize: '0.7rem',
                                                fontWeight: '700',
                                                color: item.badgeColor,
                                                background: `${item.badgeColor}18`,
                                                padding: '0.2rem 0.55rem',
                                                borderRadius: '999px',
                                                letterSpacing: '0.02em'
                                            }}>
                                                {item.badge}
                                            </span>
                                            <span style={{
                                                fontSize: '0.68rem',
                                                fontWeight: '600',
                                                color: item.tagColor,
                                                background: `${item.tagColor}15`,
                                                padding: '0.2rem 0.55rem',
                                                borderRadius: '999px',
                                            }}>
                                                {item.tag}
                                            </span>
                                        </div>

                                        {/* Emoji + Name */}
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                            <span style={{
                                                fontSize: '2.2rem',
                                                lineHeight: 1,
                                                background: `${item.accentColor}15`,
                                                borderRadius: '0.6rem',
                                                padding: '0.5rem',
                                                flexShrink: 0
                                            }}>
                                                {item.emoji}
                                            </span>
                                            <div>
                                                <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '1rem', lineHeight: '1.3' }}>
                                                    {item.name}
                                                </div>
                                                <div style={{ fontSize: '0.78rem', color: item.accentColor, fontWeight: '600', marginTop: '0.1rem' }}>
                                                    {item.subname}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <p style={{
                                            margin: 0,
                                            fontSize: '0.82rem',
                                            color: 'var(--text-secondary)',
                                            lineHeight: '1.55',
                                            flex: 1
                                        }}>
                                            {item.desc}
                                        </p>

                                        {/* CTA */}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.4rem',
                                            padding: '0.6rem 1rem',
                                            background: 'linear-gradient(135deg, #ff9900, #ffb347)',
                                            borderRadius: '0.6rem',
                                            color: '#000',
                                            fontWeight: '700',
                                            fontSize: '0.82rem',
                                            letterSpacing: '0.02em',
                                            marginTop: 'auto',
                                        }}>
                                            <span>View on Amazon</span>
                                            <span style={{ fontSize: '1rem' }}>↗</span>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>

                        {/* Disclaimer */}
                        <p style={{
                            fontSize: '0.72rem',
                            color: 'var(--text-muted)',
                            textAlign: 'center',
                            margin: 0,
                            padding: '0.75rem 1rem',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '0.6rem',
                        }}>
                            💛 As an Amazon Associate, PeptideLog earns a small commission from qualifying purchases — at no extra cost to you.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default InjectionGuide;
