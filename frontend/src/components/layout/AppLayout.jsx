import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
export const AppLayout = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    return (<div className="min-h-screen bg-closr-bg text-closr-text flex flex-col lg:flex-row relative overflow-x-hidden selection:bg-closr-sage selection:text-closr-forest">
      {/* Background organic leaf watermark matching the dashboard screenshot */}
      <div className="fixed top-0 right-0 pointer-events-none opacity-40 select-none z-0 hidden lg:block" aria-hidden="true">
        <svg width="260" height="280" viewBox="0 0 260 280" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M260 0C230 40 180 80 150 140C120 200 135 240 160 280C210 250 240 190 255 120C260 90 260 0 260 0Z" fill="#E2E9DF" fillOpacity="0.7"/>
          <path d="M260 20C240 60 200 100 180 160C160 220 180 250 195 270" stroke="#174F43" strokeOpacity="0.1" strokeWidth="1.5"/>
        </svg>
      </div>

      {/* Main Sidebar */}
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}/>

      {/* Content Area */}
      <main className="flex-1 min-w-0 px-4 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10 max-w-7xl mx-auto w-full relative z-10">
        <Outlet context={{ onOpenMobileMenu: () => setMobileMenuOpen(true) }}/>
      </main>
    </div>);
};
