import React from 'react';
import { Link } from 'react-router-dom';
export default function AdminUnavailable({ title, description }) {
    return <main style={{padding:'2rem',maxWidth:850}}><h1>{title}</h1><section className="card" style={{padding:'1.5rem',marginTop:'1rem'}}><h2>Not connected to the live site</h2><p>{description}</p><p>This screen previously saved browser-only drafts. It cannot apply changes for visitors, so live controls are unavailable here. Existing drafts have not been deleted.</p><Link to="/admin">Back to admin dashboard</Link></section></main>;
}
