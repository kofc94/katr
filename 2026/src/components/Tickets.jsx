import React, { useEffect } from 'react';

export default function Tickets() {
  useEffect(() => {
    // Dynamically inject Zeffy embed script
    const scriptId = 'zeffy-embed-script';
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://www.zeffy.com/embed/v2/zeffy-embed.js';
      script.async = true;
      script.onerror = () => {
        document.querySelectorAll('[data-zeffy-embed-fallback]').forEach((el) => {
          el.style.display = 'block';
          el.querySelectorAll('iframe[data-zeffy-embed-src]').forEach((f) => {
            f.src = f.getAttribute('data-zeffy-embed-src');
          });
        });
      };
      document.body.appendChild(script);
    }
  }, []);

  return (
    <section id="tickets" className="section">
      <div className="section-header">
        <div className="section-tag">Online Registration & Checkout</div>
        <h2 className="section-title">Get Tickets Online</h2>
        <p className="section-desc">
          100% of proceeds benefit Knights of Columbus Council #94 local charities. Registration powered securely by Zeffy with zero transaction fees.
        </p>
      </div>

      <div id="zeffy-form" className="zeffy-wrapper">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--accent-gold-light)' }}>
            🔒 Secure Online Ticket Checkout
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Select your tickets below to complete your registration:
          </p>
        </div>

        <div>
          <div data-zeffy-embed data-form-url="/embed/ticketing/2026-knight-at-the-races"></div>
          <div data-zeffy-embed-fallback style={{ display: 'none' }}>
            <div style={{ position: 'relative', overflow: 'hidden', height: '450px', width: '100%', paddingTop: '450px' }}>
              <iframe
                title="Donation form powered by Zeffy"
                style={{ position: 'absolute', border: 0, top: 0, left: 0, bottom: 0, right: 0, width: '100%', height: '100%' }}
                data-zeffy-embed-src="https://www.zeffy.com/embed/ticketing/2026-knight-at-the-races"
                allowPaymentRequest
                allowTransparency="true"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
