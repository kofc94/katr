import React, { useState } from 'react';

export default function FAQ({
  faqItems = [
    {
      question: 'Where is the event located?',
      answer: (
        <>
          The event takes place at <strong>Heritage Hall, 177 Bedford St, Lexington, MA</strong>. Doors open at 6:00 PM.
        </>
      ),
    },
    {
      question: 'What is the dress code?',
      answer:
        'Derby attire is enthusiastically encouraged! Fancy hats, bow ties, and colorful outfits make the evening festive, though smart casual dress is also welcome.',
    },
    {
      question: 'Are children and families welcome?',
      answer:
        "Yes! We have a dedicated Kid's Activity Table featuring crafts, games, and entertainment for children and families.",
    },
    {
      question: 'How can my business become an event sponsor?',
      answer: (
        <>
          We offer sponsorships for key event areas including the Check-In Table, Ticket Windows, Bar, Raffle Table, and Kids Activity Table. Contact our team at{' '}
          <a href="mailto:sponsorships@lexingtonkofc.org">sponsorships@lexingtonkofc.org</a> to secure your sponsorship package!
        </>
      ),
    },
    {
      question: 'Do I need cash for betting?',
      answer:
        'Yes, race wagering windows use cash, in increments of $2 bets. Cash is also accepted at the bar and for raffle tickets. Credit cards are accepted for event registration and ticket purchases online.',
    },
    {
      question: 'Where do event proceeds go?',
      answer:
        '100% of proceeds directly fund local charities supported by the Knights of Columbus Council #94, including local special needs programs, youth counseling services, community scholarships, baby wellness programs, and veteran services. Thank you for your support!',
    },
  ],
}) {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFaq = (index) => {
    setActiveIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section id="faq" className="section">
      <div className="section-header">
        <div className="section-tag">Got Questions?</div>
        <h2 className="section-title">Frequently Asked Questions</h2>
      </div>

      <div className="faq-grid">
        {faqItems.map((item, index) => {
          const isActive = activeIndex === index;
          return (
            <div key={index} className={`faq-item ${isActive ? 'active' : ''}`}>
              <button className="faq-question" onClick={() => toggleFaq(index)}>
                <span>{item.question}</span>
                <span>{isActive ? '▲' : '▼'}</span>
              </button>
              {isActive && <div className="faq-answer">{item.answer}</div>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
