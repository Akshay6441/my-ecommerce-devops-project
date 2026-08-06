import React from 'react';

export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="bg-gradient-to-r from-primary-50 via-white to-accent-50 border-b border-gray-100 py-10">
      <div className="container-page">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="section-title">{title}</h1>
            {subtitle && <p className="section-subtitle">{subtitle}</p>}
          </div>
          {children && <div>{children}</div>}
        </div>
      </div>
    </div>
  );
}
