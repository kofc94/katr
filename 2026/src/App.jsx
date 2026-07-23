import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Tickets from './components/Tickets';
import HowItWorks from './components/HowItWorks';
import Sponsors from './components/Sponsors';
import Schedule from './components/Schedule';
import FAQ from './components/FAQ';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Tickets />
        <HowItWorks />
        <Sponsors />
        <Schedule />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
