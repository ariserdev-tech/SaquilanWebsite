import React from 'react';
import { motion } from 'motion/react';
import { Award, ShieldCheck, Truck } from 'lucide-react';
import { SiteSettings } from '../lib/supabaseClient';

interface AboutProps {
  settings: SiteSettings | null;
}

export default function About({ settings }: AboutProps) {
  return (
    <section id="about" className="relative py-24 overflow-hidden">


      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-8 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-800 aspect-square">
              <img
                src={settings?.about_image_url || "https://picsum.photos/seed/owner/800/800"}
                alt="Store Owner"
                loading="lazy"
                className="w-full h-full object-cover"
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
              {settings?.about_slogan || 'Quality Merchandises from Kiamba'}
            </h2>
            <div className="space-y-6">
              {settings?.our_story ? (
                settings.our_story.split('\n').map((para, i) => (
                  <p key={i} className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                    {para}
                  </p>
                ))
              ) : (
                <>
                  <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                    Located in the heart of Badtasan, Kiamba, we are dedicated to bringing high-quality merchandises to our community in Sarangani Province. Our journey began with a simple goal: to provide accessible, premium products that reflect our commitment to excellence.
                  </p>
                  <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                    Every item in our collection is carefully selected to ensure it meets our standards of durability and style. We believe that everyone deserves the best, and we're here to deliver just that.
                  </p>
                </>
              )}
            </div>

            <div className="p-6 bg-slate-800 rounded-2xl border border-slate-700">
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
