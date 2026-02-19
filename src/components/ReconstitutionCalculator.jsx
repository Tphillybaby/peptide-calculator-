import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Syringe, Info, ChevronDown, Bookmark, BookmarkCheck, Trash2, RotateCcw, Beaker, Droplets, FlaskConical, Sparkles, Share2, X, Twitter, Facebook, Link2, Check } from 'lucide-react';
import styles from './ReconstitutionCalculator.module.css';
import SyringeVisualizer from './SyringeVisualizer';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { usePeptides } from '../hooks/usePeptides';
import { paymentService } from '../services/paymentService';
import SignupPrompt from './SignupPrompt';
import { recordInteraction } from '../utils/signupPromptUtils';
import UpgradeModal from './UpgradeModal';

// Local storage key for saved calculations
const SAVED_CALCS_KEY = 'peptide_saved_calculations';

// Syringe types
const SYRINGE_TYPES = [
  { id: 'u100', name: 'U-100 (1ml)', unitsPerMl: 100, maxUnits: 100 },
  { id: 'u50', name: 'U-50 (0.5ml)', unitsPerMl: 100, maxUnits: 50 },
  { id: 'u40', name: 'U-40', unitsPerMl: 40, maxUnits: 40 },
];

// Common water amounts
const COMMON_WATER_AMOUNTS = [0.5, 1, 1.5, 2, 2.5, 3];

// Get saved calculations from localStorage
const getSavedCalculations = () => {
  try {
    const saved = localStorage.getItem(SAVED_CALCS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// Parse URL params for shared calculations
const getInitialParams = () => {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  return {
    p: params.get('p') ? decodeURIComponent(params.get('p')) : '',
    v: params.get('v') || '5',
    w: params.get('w') || '2',
    d: params.get('d') || '250',
    u: params.get('u') || 'mcg',
    s: params.get('s') || 'u100'
  };
};

const ReconstitutionCalculator = () => {
  const { user } = useAuth();
  const { peptides } = usePeptides();

  // Get initial values from URL or defaults
  const initialParams = useMemo(() => getInitialParams(), []);

  // Form state - use strings to allow empty input and prevent leading zeros
  const [selectedPeptide, setSelectedPeptide] = useState(initialParams.p);
  const [vialAmount, setVialAmount] = useState(initialParams.v);
  const [waterAmount, setWaterAmount] = useState(initialParams.w);
  const [doseAmount, setDoseAmount] = useState(initialParams.d);
  const [doseUnit, setDoseUnit] = useState(initialParams.u); // 'mcg' or 'mg'
  const [syringeType, setSyringeType] = useState(initialParams.s);

  // Helper to get numeric values for calculations
  const numVialAmount = parseFloat(vialAmount) || 0;
  const numWaterAmount = parseFloat(waterAmount) || 0;
  const numDoseAmount = parseFloat(doseAmount) || 0;

  // UI state
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [savedCalcs, setSavedCalcs] = useState([]);
  const [showSaved, setShowSaved] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const autocompleteRef = useRef(null);

  // Load saved calculations on mount
  useEffect(() => {
    const loadSaved = async () => {
      if (user) {
        // Load from Supabase
        const { data, error } = await supabase
          .from('user_calculations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (data && !error) {
          // Map DB snake_case to frontend camelCase
          const formatted = data.map(c => ({
            id: c.id,
            peptide: c.peptide_name,
            vialAmount: c.vial_amount,
            waterAmount: c.water_amount,
            doseAmount: c.dose_amount,
            doseUnit: c.dose_unit,
            syringeType: c.syringe_type
          }));
          setSavedCalcs(formatted);
        }
      } else {
        // Load from LocalStorage
        setSavedCalcs(getSavedCalculations());
      }
    };
    loadSaved();
  }, [user]);

  // Filter peptides for autocomplete
  const filteredPeptides = useMemo(() => {
    const names = peptides.map(p => p.name);
    if (!selectedPeptide) return names.slice(0, 8);
    const search = selectedPeptide.toLowerCase();
    return names.filter(name =>
      name.toLowerCase().includes(search)
    ).slice(0, 8);
  }, [selectedPeptide, peptides]);

  // Get selected peptide data
  const peptideData = useMemo(() => {
    return peptides.find(p => p.name === selectedPeptide) || null;
  }, [selectedPeptide, peptides]);

  // Get common doses for selected peptide
  const commonDoses = useMemo(() => {
    if (!peptideData) return [100, 250, 500, 1000];

    // Parse from commonDosage string (e.g., "250-500mcg daily")
    const dosageStr = peptideData.commonDosage || '';
    const matches = dosageStr.match(/(\d+(?:\.\d+)?)/g);
    if (matches && matches.length > 0) {
      // Convert to numbers and return unique values
      const doses = matches.map(m => parseFloat(m));
      // If doses are in mg (less than 10), convert to mcg for display
      if (doses[0] < 10 && dosageStr.toLowerCase().includes('mg')) {
        return doses.map(d => d * 1000);
      }
      return doses;
    }
    return [100, 250, 500, 1000];
  }, [peptideData]);

  // Close autocomplete on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(e.target)) {
        setShowAutocomplete(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate result
  const result = useMemo(() => {
    if (numVialAmount <= 0 || numWaterAmount <= 0 || numDoseAmount <= 0) return null;

    const syringe = SYRINGE_TYPES.find(s => s.id === syringeType);
    const unitsPerMl = syringe?.unitsPerMl || 100;
    const maxUnits = syringe?.maxUnits || 100;

    // Convert dose to mcg if needed
    const doseMcg = doseUnit === 'mg' ? numDoseAmount * 1000 : numDoseAmount;

    // Convert vial mg to mcg
    const totalMcg = numVialAmount * 1000;

    // Concentration (mcg per ml)
    const concentration = totalMcg / numWaterAmount;

    // Volume to draw (ml)
    const drawMl = doseMcg / concentration;

    // Units on syringe
    const units = drawMl * unitsPerMl;

    // Number of doses per vial
    const dosesPerVial = Math.floor(totalMcg / doseMcg);

    // Check if dose is possible with selected syringe
    const isOverMax = units > maxUnits;

    return {
      concentration,
      drawMl: drawMl.toFixed(4),
      units: units.toFixed(1),
      dosesPerVial,
      isOverMax,
      maxUnits
    };
  }, [numVialAmount, numWaterAmount, numDoseAmount, doseUnit, syringeType]);

  // Select peptide and auto-fill common values
  const selectPeptide = (name) => {
    setSelectedPeptide(name);
    setShowAutocomplete(false);

    const peptide = peptides.find(p => p.name === name);
    if (peptide) {
      // Try to parse common dosage
      const dosageStr = peptide.commonDosage || '';
      const matches = dosageStr.match(/(\d+(?:\.\d+)?)/g);
      if (matches && matches.length > 0) {
        const dose = parseFloat(matches[0]);
        if (dosageStr.toLowerCase().includes('mg') && dose < 10) {
          setDoseAmount(String(dose));
          setDoseUnit('mg');
        } else {
          setDoseAmount(String(dose));
          setDoseUnit('mcg');
        }
      }
    }
  };

  // Save current calculation
  const saveCalculation = async () => {
    const calcData = {
      peptide: selectedPeptide || 'Custom',
      vialAmount: numVialAmount,
      waterAmount: numWaterAmount,
      doseAmount: numDoseAmount,
      doseUnit,
      syringeType
    };

    if (user) {
      // Check limits
      const limitCheck = await paymentService.checkUsageLimits(user.id);
      if (limitCheck.success && limitCheck.usage.savedCalculations.remaining <= 0) {
        setShowUpgradeModal(true);
        return;
      }

      // Save to Supabase
      const { data, error } = await supabase
        .from('user_calculations')
        .insert([{
          user_id: user.id,
          peptide_name: calcData.peptide,
          vial_amount: calcData.vialAmount,
          water_amount: calcData.waterAmount,
          dose_amount: calcData.doseAmount,
          dose_unit: calcData.doseUnit,
          syringe_type: calcData.syringeType
        }])
        .select()
        .single();

      if (data && !error) {
        setSavedCalcs(prev => [{
          id: data.id,
          ...calcData
        }, ...prev]);
      }
    } else {
      // Save to LocalStorage
      const newCalc = {
        id: Date.now(),
        ...calcData
      };
      const updated = [newCalc, ...savedCalcs.slice(0, 9)]; // Keep max 10
      setSavedCalcs(updated);
      localStorage.setItem(SAVED_CALCS_KEY, JSON.stringify(updated));
    }
  };

  // Load saved calculation
  const loadCalculation = (calc) => {
    setSelectedPeptide(calc.peptide);
    setVialAmount(String(calc.vialAmount));
    setWaterAmount(String(calc.waterAmount));
    setDoseAmount(String(calc.doseAmount));
    setDoseUnit(calc.doseUnit || 'mcg');
    setSyringeType(calc.syringeType || 'u100');
    setShowSaved(false);
  };

  // Delete saved calculation
  const deleteCalculation = async (id) => {
    if (user) {
      // Delete from Supabase
      const { error } = await supabase
        .from('user_calculations')
        .delete()
        .eq('id', id);

      if (!error) {
        setSavedCalcs(prev => prev.filter(c => c.id !== id));
      }
    } else {
      // Delete from LocalStorage
      const updated = savedCalcs.filter(c => c.id !== id);
      setSavedCalcs(updated);
      localStorage.setItem(SAVED_CALCS_KEY, JSON.stringify(updated));
    }
  };

  // Reset to defaults
  const resetCalculator = () => {
    setSelectedPeptide('');
    setVialAmount('5');
    setWaterAmount('2');
    setDoseAmount('250');
    setDoseUnit('mcg');
    setSyringeType('u100');
  };

  // Recommend optimal water amount for easy dosing
  const recommendWater = () => {
    if (numVialAmount <= 0 || numDoseAmount <= 0) return;

    const syringe = SYRINGE_TYPES.find(s => s.id === syringeType);
    const unitsPerMl = syringe?.unitsPerMl || 100;
    const maxUnits = syringe?.maxUnits || 100;

    // Convert dose to mcg
    const doseMcg = doseUnit === 'mg' ? numDoseAmount * 1000 : numDoseAmount;
    const totalMcg = numVialAmount * 1000;

    // Target nice round unit values for easy measurement
    // Prefer: 10, 20, 25, 50 units (easy to read on syringe)
    const targetUnits = [10, 20, 25, 50, 5, 15, 30, 40];

    let bestWater = null;

    for (const targetUnit of targetUnits) {
      // Skip if target exceeds syringe capacity
      if (targetUnit > maxUnits) continue;

      // Calculate water needed: water = (totalMcg * targetUnit) / (doseMcg * unitsPerMl)
      const waterNeeded = (totalMcg * targetUnit) / (doseMcg * unitsPerMl);

      // Check if water amount is reasonable (0.5ml - 3ml range)
      if (waterNeeded >= 0.5 && waterNeeded <= 3) {
        // Round to nearest 0.1ml for practicality
        const roundedWater = Math.round(waterNeeded * 10) / 10;

        // Verify this gives us close to our target units
        const actualUnits = (doseMcg / (totalMcg / roundedWater)) * unitsPerMl;

        if (actualUnits <= maxUnits) {
          bestWater = roundedWater;
          break;
        }
      }
    }

    // Fallback: calculate for 2ml if no nice option found
    if (!bestWater) {
      bestWater = 2;
    }

    setWaterAmount(String(bestWater));
  };

  // Track user interactions for signup prompt
  useEffect(() => {
    if (!user && numVialAmount > 0 && numWaterAmount > 0 && numDoseAmount > 0) {
      recordInteraction();
    }
  }, [numVialAmount, numWaterAmount, numDoseAmount, user]);

  // Generate share URL with current calculation values
  const getShareUrl = () => {
    const baseUrl = 'https://peptidelog.net/calculator';
    const params = new URLSearchParams();

    if (selectedPeptide) params.set('p', selectedPeptide);
    if (numVialAmount > 0) params.set('v', String(numVialAmount));
    if (numWaterAmount > 0) params.set('w', String(numWaterAmount));
    if (numDoseAmount > 0) params.set('d', String(numDoseAmount));
    if (doseUnit !== 'mcg') params.set('u', doseUnit);
    if (syringeType !== 'u100') params.set('s', syringeType);

    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  // Share functionality  
  const shareUrl = getShareUrl();
  const shareText = result
    ? `Check out my peptide calculation: ${selectedPeptide || 'Custom'} - ${numDoseAmount}${doseUnit} = ${result.units} units on the syringe!`
    : 'Check out this free peptide reconstitution calculator - makes dosing so much easier!';

  const handleShare = async (platform) => {
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      reddit: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent('Free Peptide Reconstitution Calculator')}`,
    };

    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    } else if (platform === 'native' && navigator.share) {
      try {
        await navigator.share({
          title: 'Peptide Reconstitution Calculator',
          text: shareText,
          url: shareUrl
        });
        setShowShareModal(false);
      } catch {
        // User cancelled or error
      }
    } else {
      window.open(urls[platform], '_blank', 'width=600,height=400');
      setShowShareModal(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Signup Prompt for non-logged-in users */}
      <SignupPrompt trigger="calculator" />

      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <FlaskConical size={28} className={styles.headerIcon} />
          <div>
            <h1>Reconstitution Calculator</h1>
            <p>Calculate exact syringe draw volumes</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button
            className={`${styles.iconBtn} ${showSaved ? styles.iconBtnActive : ''}`}
            onClick={() => setShowSaved(!showSaved)}
            title="Saved calculations"
          >
            <Bookmark size={20} />
            {savedCalcs.length > 0 && <span className={styles.badge}>{savedCalcs.length}</span>}
          </button>
          <button
            className={styles.iconBtn}
            onClick={() => navigator.share ? handleShare('native') : setShowShareModal(true)}
            title="Share this calculator"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
          >
            <Share2 size={20} />
          </button>
          <button className={styles.iconBtn} onClick={resetCalculator} title="Reset">
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      {/* Saved Calculations Panel */}
      {showSaved && (
        <div className={`card glass-panel ${styles.savedPanel}`}>
          <h3>Saved Calculations</h3>
          {savedCalcs.length === 0 ? (
            <p className={styles.noSaved}>No saved calculations yet</p>
          ) : (
            <div className={styles.savedList}>
              {savedCalcs.map(calc => (
                <div key={calc.id} className={styles.savedItem}>
                  <button className={styles.savedItemBtn} onClick={() => loadCalculation(calc)}>
                    <span className={styles.savedPeptide}>{calc.peptide}</span>
                    <span className={styles.savedDetails}>
                      {calc.vialAmount}mg / {calc.waterAmount}ml → {calc.doseAmount}{calc.doseUnit}
                    </span>
                  </button>
                  <button className={styles.deleteBtn} onClick={() => deleteCalculation(calc.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Calculator Card */}
      <div className="card glass-panel">
        {/* Peptide Selection with Autocomplete */}
        <div className={styles.inputGroup} ref={autocompleteRef}>
          <label className={styles.label}>
            <Beaker size={16} />
            Peptide
          </label>
          <div className={styles.autocompleteWrapper}>
            <input
              type="text"
              placeholder="Search or type peptide name..."
              value={selectedPeptide}
              onChange={(e) => setSelectedPeptide(e.target.value)}
              onFocus={() => setShowAutocomplete(true)}
              className={styles.input}
              autoComplete="off"
            />
            <ChevronDown
              size={18}
              className={`${styles.chevron} ${showAutocomplete ? styles.chevronUp : ''}`}
            />
            {showAutocomplete && filteredPeptides.length > 0 && (
              <div className={styles.autocomplete}>
                {filteredPeptides.map(name => (
                  <button
                    key={name}
                    type="button"
                    className={styles.autocompleteItem}
                    onClick={() => selectPeptide(name)}
                  >
                    <span>{name}</span>
                    <span className={styles.peptideCategory}>
                      {peptides.find(p => p.name === name)?.category}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {peptideData && (
            <p className={styles.peptideHint}>
              Common: {peptideData.commonDosage}
            </p>
          )}
        </div>

        {/* Vial Amount */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>
            <FlaskConical size={16} />
            Vial Quantity
          </label>
          <div className={styles.inputWithUnit}>
            <input
              type="number"
              value={vialAmount}
              onChange={(e) => setVialAmount(e.target.value)}
              onWheel={(e) => e.target.blur()}
              step="1"
              min="0"
              className={styles.input}
            />
            <span className={styles.unitLabel}>mg</span>
          </div>
          <div className={styles.quickButtons}>
            {[5, 10, 15, 20].map(v => (
              <button
                key={v}
                className={`${styles.quickBtn} ${numVialAmount === v ? styles.quickBtnActive : ''}`}
                onClick={() => setVialAmount(String(v))}
              >
                {v}mg
              </button>
            ))}
          </div>
        </div>

        {/* Water Amount */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>
            <Droplets size={16} />
            Bacteriostatic Water
          </label>
          <div className={styles.inputWithUnit}>
            <input
              type="number"
              value={waterAmount}
              onChange={(e) => setWaterAmount(e.target.value)}
              onWheel={(e) => e.target.blur()}
              step="0.5"
              min="0"
              className={styles.input}
            />
            <span className={styles.unitLabel}>ml</span>
          </div>
          <div className={styles.quickButtons}>
            {COMMON_WATER_AMOUNTS.map(w => (
              <button
                key={w}
                className={`${styles.quickBtn} ${numWaterAmount === w ? styles.quickBtnActive : ''}`}
                onClick={() => setWaterAmount(String(w))}
              >
                {w}ml
              </button>
            ))}
            <button
              className={`${styles.quickBtn} ${styles.recommendBtn}`}
              onClick={recommendWater}
              title="Calculate optimal water for easy-to-read syringe marks"
            >
              <Sparkles size={14} />
              Recommend
            </button>
          </div>
        </div>

        {/* Desired Dose */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>
            <Syringe size={16} />
            Desired Dose
          </label>
          <div className={styles.doseInputRow}>
            <input
              type="number"
              value={doseAmount}
              onChange={(e) => setDoseAmount(e.target.value)}
              onWheel={(e) => e.target.blur()}
              step={doseUnit === 'mg' ? '0.1' : '50'}
              min="0"
              className={styles.input}
            />
            <div className={styles.unitToggle}>
              <button
                className={`${styles.unitBtn} ${doseUnit === 'mcg' ? styles.unitBtnActive : ''}`}
                onClick={() => setDoseUnit('mcg')}
              >
                mcg
              </button>
              <button
                className={`${styles.unitBtn} ${doseUnit === 'mg' ? styles.unitBtnActive : ''}`}
                onClick={() => setDoseUnit('mg')}
              >
                mg
              </button>
            </div>
          </div>
          <div className={styles.quickButtons}>
            {commonDoses.map(d => (
              <button
                key={d}
                className={`${styles.quickBtn} ${numDoseAmount === d && doseUnit === 'mcg' ? styles.quickBtnActive : ''}`}
                onClick={() => { setDoseAmount(String(d)); setDoseUnit('mcg'); }}
              >
                {d >= 1000 ? `${d / 1000}mg` : `${d}mcg`}
              </button>
            ))}
          </div>
        </div>

        {/* Syringe Type */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>Syringe Type</label>
          <div className={styles.syringeTypes}>
            {SYRINGE_TYPES.map(s => (
              <button
                key={s.id}
                className={`${styles.syringeBtn} ${syringeType === s.id ? styles.syringeBtnActive : ''}`}
                onClick={() => setSyringeType(s.id)}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className={styles.resultContainer}>
            {result.isOverMax && (
              <div className={styles.warning}>
                ⚠️ Dose exceeds syringe capacity ({result.maxUnits} units max).
                Use more water or a larger syringe.
              </div>
            )}

            <div className={styles.resultCard}>
              <span className={styles.resultLabel}>Draw to Tick Mark</span>
              <span className={`${styles.resultValue} ${result.isOverMax ? styles.resultWarning : ''}`}>
                {result.units}
              </span>
              <span className={styles.resultUnit}>Units</span>
            </div>

            <SyringeVisualizer
              units={Math.min(parseFloat(result.units), result.maxUnits)}
              maxUnits={result.maxUnits}
            />

            <div className={styles.details}>
              <div className={styles.detailRow}>
                <span>Volume to Draw:</span>
                <span>{Number(result.drawMl)} mL</span>
              </div>
              <div className={styles.detailRow}>
                <span>Concentration:</span>
                <span>{result.concentration.toFixed(1)} mcg/ml</span>
              </div>
              <div className={styles.detailRow}>
                <span>Doses per Vial:</span>
                <span className={styles.dosesValue}>{result.dosesPerVial} doses</span>
              </div>
            </div>

            <button className={styles.saveBtn} onClick={saveCalculation}>
              <BookmarkCheck size={18} />
              Save This Calculation
            </button>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className={styles.infoBox}>
        <Info size={16} />
        <div>
          <strong>U-100 Insulin Syringe:</strong> Most common. 100 units = 1ml.
          <br />
          <strong>Tip:</strong> Add a little extra BAC water for easier dosing.
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setShowShareModal(false)}
        >
          <div
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '360px',
              width: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Share Calculator</h3>
              <button
                onClick={() => setShowShareModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem' }}>
              Help others discover this free tool!
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => handleShare('twitter')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: 'rgba(29, 161, 242, 0.15)',
                  border: '1px solid rgba(29, 161, 242, 0.3)',
                  borderRadius: '10px',
                  color: '#1DA1F2',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: '500'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Share on X (Twitter)
              </button>

              <button
                onClick={() => handleShare('reddit')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: 'rgba(255, 69, 0, 0.15)',
                  border: '1px solid rgba(255, 69, 0, 0.3)',
                  borderRadius: '10px',
                  color: '#FF4500',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: '500'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                </svg>
                Share on Reddit
              </button>

              <button
                onClick={() => handleShare('facebook')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: 'rgba(24, 119, 242, 0.15)',
                  border: '1px solid rgba(24, 119, 242, 0.3)',
                  borderRadius: '10px',
                  color: '#1877F2',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: '500'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Share on Facebook
              </button>

              <button
                onClick={() => handleShare('copy')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: linkCopied ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  border: linkCopied ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--glass-border)',
                  borderRadius: '10px',
                  color: linkCopied ? '#10b981' : 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: '500'
                }}
              >
                {linkCopied ? <Check size={20} /> : <Link2 size={20} />}
                {linkCopied ? 'Link Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </div>
  );
};

export default ReconstitutionCalculator;
