
import Image from 'next/image';
import './index.css'
import dashboardMockup from '@/app/components/icons/dashboard_mockup.png'

export default function App() {
  return (
    <div className="app-container">
      <header>
        <div className="logo-container">
          <div className="logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
              <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
            </svg>
          </div>
          <div className="logo-text">QMS</div>
        </div>
        <div className="nav-actions">
          <a href="#" className="sign-in-link">Sign in</a>
          <button className="btn-primary">Get Started</button>
        </div>
      </header>

      <main className="hero-section">
        <div className="hero-image-wrapper">
          <Image
            src={dashboardMockup} 
            alt="Advanced Analytics Dashboard" 
            className="hero-image" 
          />
        </div>
        
        <div className="hero-content">
          <div className="badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Secure & Reliable Management</span>
          </div>
          
          <h1>Smarter Quotation<br/>Management<br/>System</h1>
          <p className="subtitle">
            The all-in-one platform for managing vendors, tracking automated expenses, and streamlining quotation approvals seamlessly.
          </p>
        </div>
      </main>
    </div>
  );
}

