import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Phone, Mail, MapPin, Send, Loader2 } from 'lucide-react';
import L from 'leaflet';

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

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setFormStatus('success');
    setTimeout(() => setFormStatus('idle'), 3000);
  };

  const position: [number, number] = [5.9897, 124.6311]; // Kiamba, Sarangani Coordinates

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
            className="bg-slate-50 dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 flex flex-col"
          >
            <form onSubmit={handleSubmit} className="space-y-6 flex flex-col flex-grow">
              <div>
                <label className="block text-sm font-bold mb-2">Email Address</label>
                <input
                  required
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all"
                />
              </div>
              <div className="flex-grow flex flex-col">
                <label className="block text-sm font-bold mb-2">Your Message</label>
                <textarea
                  required
                  placeholder="How can we help you?"
                  className="w-full flex-grow px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all resize-none min-h-[200px]"
                />
              </div>
              <button
                disabled={isSubmitting}
                className="w-full py-4 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-70 shadow-lg shadow-primary/20 mt-auto"
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
                <p className="text-center text-green-500 font-bold">Message sent successfully!</p>
              )}
            </form>

            <div className="mt-10 pt-10 border-t border-slate-200 dark:border-slate-700 grid sm:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Phone</p>
                  <p className="font-bold">09700636965</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Email</p>
                  <p className="font-bold">ariserdev@gmail.com</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
