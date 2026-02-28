import React, { useState } from 'react';
import { motion } from 'motion/react';
import emailjs from '@emailjs/browser';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Phone, Mail, MapPin, Send, Loader2 } from 'lucide-react';
import L from 'leaflet';
import { SiteSettings } from '../lib/supabaseClient';

// Fix for default marker icons in Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface ContactProps {
  settings: SiteSettings | null;
}

export default function Contact({ settings }: ContactProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormStatus('idle');

    const form = e.target as HTMLFormElement;

    // Add current time for the {{time}} variable in the template
    const timeField = document.createElement('input');
    timeField.type = 'hidden';
    timeField.name = 'time';
    timeField.value = new Date().toLocaleString();
    form.appendChild(timeField);

    // Get keys from environment variables
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      console.error('EmailJS keys are missing in .env file');
      setFormStatus('error');
      setIsSubmitting(false);
      // Clean up the temporary field if keys are missing
      if (form.contains(timeField)) form.removeChild(timeField);
      return;
    }

    try {
      const response = await emailjs.sendForm(
        serviceId,
        templateId,
        form,
        publicKey
      );

      if (response.status === 200) {
        setFormStatus('success');
        form.reset();
      } else {
        throw new Error(`EmailJS service responded with status: ${response.status} - ${response.text}`);
      }
    } catch (error) {
      console.error('Failed to send feedback:', error);
      setFormStatus('error');
    } finally {
      setIsSubmitting(false);
      // Clean up the temporary field
      if (form.contains(timeField)) form.removeChild(timeField);
      setTimeout(() => setFormStatus('idle'), 5000);
    }
  };

  const position: [number, number] = [settings?.lat || 5.9897, settings?.lng || 124.6311];

  return (
    <section id="contact" className="py-24 bg-white dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold mb-4">Visit Us <span className="text-accent">Today</span></h2>
          <p className="text-slate-600 dark:text-slate-400">Located in Badtasan, Kiamba. Reach out to us for any inquiries.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-stretch">
          {/* Map Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col"
          >
            <div className="flex-grow min-h-[400px]">
              <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position}>
                  <Popup>
                    SaquilanMerchandise <br /> Badtasan, Kiamba, Sarangani
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col"
          >
            <form onSubmit={handleSubmit} className="space-y-6 flex flex-col flex-grow">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-2 ml-1">Full Name</label>
                  <input
                    required
                    name="name"
                    type="text"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="words"
                    spellCheck="false"
                    placeholder="John Doe"
                    className="w-full px-4 py-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-2 ml-1">Email Address</label>
                  <input
                    required
                    name="email"
                    type="email"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    placeholder="your@email.com"
                    className="w-full px-4 py-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>
              <div className="flex-grow flex flex-col">
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2 ml-1">Your Message</label>
                <textarea
                  required
                  name="message"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                  placeholder="How can we help you?"
                  className="w-full flex-grow px-4 py-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all resize-none min-h-[150px]"
                />
              </div>
              <button
                disabled={isSubmitting}
                className="w-full py-4 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-70 shadow-lg shadow-primary/20 mt-auto"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <Send size={20} />
                    Send Message
                  </>
                )}
              </button>
              {formStatus === 'success' && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-green-500 font-bold bg-green-500/10 py-3 rounded-xl border border-green-500/20"
                >
                  Message sent successfully!
                </motion.p>
              )}
              {formStatus === 'error' && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-red-500 font-bold bg-red-500/10 py-3 rounded-xl border border-red-500/20"
                >
                  Oops! Something went wrong. Please check your keys.
                </motion.p>
              )}
            </form>

            <div className="mt-10 pt-10 border-t border-slate-200 dark:border-slate-800 grid sm:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Phone</p>
                  <p className="font-bold">{settings?.phone || '09700636965'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Email</p>
                  <p className="font-bold">{settings?.email || 'ariserdev@gmail.com'}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
