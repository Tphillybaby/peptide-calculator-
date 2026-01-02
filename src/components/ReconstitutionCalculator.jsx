import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Syringe, Info, ChevronDown, Bookmark, BookmarkCheck, Trash2, RotateCcw, Beaker, Droplets, FlaskConical, Sparkles } from 'lucide-react';
import styles from './ReconstitutionCalculator.module.css';
import SyringeVisualizer from './SyringeVisualizer';
import { usePeptides } from '../hooks/usePeptides';

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

const ReconstitutionCalculator = () => {
  const { peptides } = usePeptides();
  // Form state - use strings to allow empty input and prevent leading zeros
  const [selectedPeptide, setSelectedPeptide] = useState('');
  const [vialAmount, setVialAmount] = useState('5');
  const [waterAmount, setWaterAmount] = useState('2');
  const [doseAmount, setDoseAmount] = useState('250');
  const [doseUnit, setDoseUnit] = useState('mcg'); // 'mcg' or 'mg'
  const [syringeType, setSyringeType] = useState('u100');

  // Helper to get numeric values for calculations
  const numVialAmount = parseFloat(vialAmount) || 0;
  const numWaterAmount = parseFloat(waterAmount) || 0;
  const numDoseAmount = parseFloat(doseAmount) || 0;

  // UI state
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [savedCalcs, setSavedCalcs] = useState(getSavedCalculations);
  const [showSaved, setShowSaved] = useState(false);
  const autocompleteRef = useRef(null);

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
  const saveCalculation = () => {
    const newCalc = {
      id: Date.now(),
      peptide: selectedPeptide || 'Custom',
      vialAmount: numVialAmount,
      waterAmount: numWaterAmount,
      doseAmount: numDoseAmount,
      doseUnit,
      syringeType
    };

    const updated = [newCalc, ...savedCalcs.slice(0, 9)]; // Keep max 10
    setSavedCalcs(updated);
    localStorage.setItem(SAVED_CALCS_KEY, JSON.stringify(updated));
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
  const deleteCalculation = (id) => {
    const updated = savedCalcs.filter(c => c.id !== id);
    setSavedCalcs(updated);
    localStorage.setItem(SAVED_CALCS_KEY, JSON.stringify(updated));
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
    let bestUnits = null;

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
          bestUnits = Math.round(actualUnits * 10) / 10;
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

  return (
    <div className={styles.container}>
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
    </div>
  );
};

export default ReconstitutionCalculator;
