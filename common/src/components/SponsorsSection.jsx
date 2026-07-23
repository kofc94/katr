import React from 'react';

/**
 * SponsorsSection Panel
 * Wraps section headers and renders sponsor grid children.
 */
export default function SponsorsSection({
  title = "Thank You to Our Sponsors",
  subtitle = "We are deeply grateful to our community partners who make K'night at the Races possible. 100% of event proceeds directly fund Knights of Columbus Council #94 local charities.",
  children,
}) {
  return (
    <section id="sponsors" className="section">
      <div className="section-header">
        <div className="section-tag">Community Partnerships</div>
        <h2 className="section-title">{title}</h2>
        <p className="section-desc">{subtitle}</p>
      </div>

      <div className="sponsors-grid">{children}</div>
    </section>
  );
}
