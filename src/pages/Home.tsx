import React from 'react';
import Hero from '../components/Hero';
import Products from '../components/Products';
import About from '../components/About';
import Contact from '../components/Contact';

export default function Home() {
  return (
    <main>
      <Hero />
      <Products />
      <About />
      <Contact />
    </main>
  );
}
