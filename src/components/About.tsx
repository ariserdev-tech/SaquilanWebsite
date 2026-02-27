import React from 'react';
import { motion } from 'motion/react';
import { Award, ShieldCheck, Truck } from 'lucide-react';
import FloatingShapes from './FloatingShapes';

export default function About() {
  return (
    <section id="about" className="relative py-24 overflow-hidden">
      <FloatingShapes />
      
      {/* About-specific decorative pattern */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
        <div className="absolute top-20 right-10 w-40 h-40 grid grid-cols-4 gap-2">
          {[...Array(16)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 2, delay: i * 0.1, repeat: Infinity }}
              className="w-2 h-2 bg-primary rounded-full"
            />
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-8 border-white dark:border-slate-800">
              <img
                src="https://picsum.photos/seed/owner/800/800"
                alt="Store Owner"
                className="w-full h-auto object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-accent rounded-3xl -z-10" />
            <div className="absolute -top-6 -left-6 w-32 h-32 border-4 border-primary rounded-3xl -z-10" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-accent font-bold uppercase tracking-widest text-sm mb-4 block">
              Our Story
            </span>
            <h2 className="text-4xl font-extrabold mb-6 leading-tight">
              Quality <span className="text-primary">Merchandises</span> from Kiamba
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
              Located in the heart of Badtasan, Kiamba, we are dedicated to bringing high-quality merchandises to our community in Sarangani Province. Our journey began with a simple goal: to provide accessible, premium products that reflect our commitment to excellence.
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
              Every item in our collection is carefully selected to ensure it meets our standards of durability and style. We believe that everyone deserves the best, and we're here to deliver just that.
            </p>

            <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
              <p className="italic text-primary font-medium">
                "We don't just sell merchandises; we provide value and quality to every home in Sarangani."
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
