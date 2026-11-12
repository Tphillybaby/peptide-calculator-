import React, { useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { progressSeries } from '../utils/dailyTools';
import { recentDoses } from '../utils/dailyDashboard';
import styles from './DailyTools.module.css';
export default function DoseProgress({ injections, days }) {
    const choices = useMemo(() => [...new Map(recentDoses(injections).map(i => [JSON.stringify([i.peptide, i.unit]), { peptide: i.peptide, unit: i.unit }])).entries()], [injections]);
    const [selected, setSelected] = useState('');
    const key = choices.some(([k]) => k === selected) ? selected : choices[0]?.[0];
    const choice = choices.find(([k]) => k === key)?.[1];
    const rows = choice ? progressSeries(injections, choice.peptide, choice.unit, Number(days)) : [];
    const weights = rows.map(i => Number(i.bodyWeightLbs) > 0 ? Number(i.bodyWeightLbs) : null);
    const hasWeight = weights.some(w => w !== null);
    const data = { labels: rows.map(i => new Date(i.date).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })), datasets: [{ label: `Dose (${choice?.unit || ''})`, data: rows.map(i => Number(i.dosage)), yAxisID: 'dose', borderColor: '#3b82f6', backgroundColor: '#3b82f6', tension: 0 }, ...(hasWeight ? [{ label: 'Body weight (lb)', data: weights, yAxisID: 'weight', borderColor: '#10b981', backgroundColor: '#10b981', spanGaps: true }] : [])] };
    return <section className={styles.panel}><h2>Dose, weight & notes</h2><p>Compare your records over time. Each chart uses one substance and unit; missing weights stay blank.</p>
        {choices.length ? <><label htmlFor="progress-substance">Substance and dose unit</label><select id="progress-substance" value={key} onChange={e => setSelected(e.target.value)}>{choices.map(([k,c]) => <option key={k} value={k}>{c.peptide} ({c.unit})</option>)}</select>
        {rows.length ? <><div className={styles.chart}><Line data={data} options={{ responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, scales: { dose: { type: 'linear', position: 'left', beginAtZero: true, title: { display: true, text: `Dose (${choice.unit})` } }, ...(hasWeight ? { weight: { type: 'linear', position: 'right', title: { display: true, text: 'Body weight (lb)' }, grid: { drawOnChartArea: false } } } : {}) }, plugins: { tooltip: { callbacks: { afterBody: entries => rows[entries[0]?.dataIndex]?.notes ? `Note: ${rows[entries[0].dataIndex].notes}` : '' } } } }} /></div>
        {!hasWeight && <p>Add optional body weight when logging to compare weight with dose history.</p>}
        <details><summary>View records and notes ({rows.length})</summary><div className={styles.tableScroll}><table><thead><tr><th>Date</th><th>Dose</th><th>Weight (lb)</th><th>Notes</th></tr></thead><tbody>{rows.map(i => <tr key={i.id || i.date}><td>{new Date(i.date).toLocaleString()}</td><td>{i.dosage} {i.unit}</td><td>{Number(i.bodyWeightLbs) > 0 ? i.bodyWeightLbs : '—'}</td><td>{i.notes || '—'}</td></tr>)}</tbody></table></div></details></> : <p>No records for this substance in the selected period.</p>}</> : <p>Log your first injection to see dose history. Add weight and notes when useful.</p>}
    </section>;
}
