import React from 'react';

export default function ActiveLevels({ stats }) {
    if (!stats?.activeLevels?.length) return <span>No past doses</span>;
    return (
        <div style={{ fontSize: '0.85rem' }}>
            {stats.activeLevels.map(level => (
                <div key={`${level.peptide}:${level.unit}`}>
                    <strong>{level.peptide}: </strong>
                    {level.available ? `${level.amount.toFixed(3)} ${level.unit}` : 'Half-life unavailable'}
                </div>
            ))}
            <small>Decay estimates by substance; not measured blood levels.</small>
        </div>
    );
}
