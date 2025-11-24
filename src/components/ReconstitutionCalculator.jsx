import React, { useState, useEffect } from 'react';
import { Syringe, Info } from 'lucide-react';
import styles from './ReconstitutionCalculator.module.css';
import SyringeVisualizer from './SyringeVisualizer';

const ReconstitutionCalculator = () => {
  const [vialAmount, setVialAmount] = useState(5); // mg
  const [waterAmount, setWaterAmount] = useState(1); // ml
  const [doseAmount, setDoseAmount] = useState(250); // mcg
  const [result, setResult] = useState(null);

  useEffect(() => {
    calculate();
  }, [vialAmount, waterAmount, doseAmount]);

  const calculate = () => {
    if (vialAmount > 0 && waterAmount > 0 && doseAmount > 0) {
      // Convert vial mg to mcg
      const totalMcg = vialAmount * 1000;

      // Concentration (mcg per ml)
      const concentration = totalMcg / waterAmount;

      // Volume to draw (ml)
      const drawMl = doseAmount / concentration;

      // Units on U-100 syringe (1ml = 100 units)
      const units = drawMl * 100;

      setResult({
        concentration: concentration,
        drawMl: drawMl.toFixed(3),
        units: units.toFixed(1)
      });
    } else {
      setResult(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className="card glass-panel">
        <div className={styles.header}>
          <Syringe className={styles.icon} size={24} />
          <h2>Peptide Calculator</h2>
        </div>

        <div className={styles.inputGroup}>
          <label>
            Vial Quantity (mg)
            <input
              type="number"
              value={vialAmount}
              onChange={(e) => {
                const value = e.target.value;
                // Allow empty string for clearing, otherwise parse as float
                setVialAmount(value === '' ? 0 : parseFloat(value) || 0);
              }}
              onWheel={(e) => e.target.blur()} // Prevent scroll from changing value
              step="1"
            />
          </label>
        </div>

        <div className={styles.inputGroup}>
          <label>
            Bacteriostatic Water (ml)
            <input
              type="number"
              value={waterAmount}
              onChange={(e) => {
                const value = e.target.value;
                setWaterAmount(value === '' ? 0 : parseFloat(value) || 0);
              }}
              onWheel={(e) => e.target.blur()}
              step="0.1"
            />
          </label>
        </div>

        <div className={styles.inputGroup}>
          <label>
            Desired Dose (mcg)
            <input
              type="number"
              value={doseAmount}
              onChange={(e) => {
                const value = e.target.value;
                setDoseAmount(value === '' ? 0 : parseFloat(value) || 0);
              }}
              onWheel={(e) => e.target.blur()}
              step="50"
            />
          </label>
        </div>

        {result && (
          <div className={styles.resultContainer}>
            <div className={styles.resultCard}>
              <span className={styles.resultLabel}>Draw to Tick Mark</span>
              <span className={styles.resultValue}>{result.units}</span>
              <span className={styles.resultUnit}>Units (IU)</span>
            </div>

            <SyringeVisualizer units={parseFloat(result.units)} />

            <div className={styles.details}>
              <div className={styles.detailRow}>
                <span>Volume:</span>
                <span>{result.drawMl} ml</span>
              </div>
              <div className={styles.detailRow}>
                <span>Concentration:</span>
                <span>{result.concentration} mcg/ml</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.infoBox}>
        <Info size={16} />
        <p>Calculation based on U-100 Insulin Syringe.</p>
      </div>
    </div>
  );
};

export default ReconstitutionCalculator;
