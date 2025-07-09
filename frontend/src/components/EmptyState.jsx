import React from "react";

const ShieldSVG = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="80" rx="16" fill="#232526"/>
    <path d="M40 12L64 20V36C64 54 40 68 40 68C40 68 16 54 16 36V20L40 12Z" fill="#00ffc3" fillOpacity="0.15" stroke="#00ffc3" strokeWidth="2"/>
    <path d="M40 24V44" stroke="#00ffc3" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="40" cy="52" r="2" fill="#00ffc3"/>
  </svg>
);

const EmptyState = ({ message = "No data to display." }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '2em', color: '#00ffc3', background: 'rgba(34,40,49,0.7)', borderRadius: '12px', margin: '2em auto', maxWidth: 400
  }}>
    <ShieldSVG />
    <div style={{ marginTop: '1em', fontSize: '1.2em', textAlign: 'center' }}>{message}</div>
  </div>
);

export default EmptyState; 