import React, { useEffect } from 'react';
import { Calendar, Video } from 'lucide-react';

const Booking = () => {
  useEffect(() => {
    // Load Calendly widget script
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <section id="booking" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#7B3B3B' }}>
            Book a Virtual Meeting
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Schedule a time to discuss speaking opportunities, coaching, or learn more about my services
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-center space-x-3 mb-6">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#E0C4C0' }}
                >
                  <Video className="w-6 h-6" style={{ color: '#7B3B3B' }} />
                </div>
                <h3 className="text-2xl font-bold" style={{ color: '#7B3B3B' }}>
                  Schedule a Discovery Call
                </h3>
              </div>

              {/* Calendly Inline Widget */}
              <div 
                className="calendly-inline-widget" 
                data-url="https://calendly.com/chelseaflynncoaching?hide_gdpr_banner=1&primary_color=7B3B3B"
                style={{ minWidth: '320px', height: '700px' }}
                data-testid="calendly-widget"
              ></div>

              <div className="mt-8 pt-6 border-t" style={{ borderColor: '#E0C4C0' }}>
                <div className="grid md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <p className="font-semibold mb-2" style={{ color: '#7B3B3B' }}>What to expect:</p>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Discussion of your needs and goals</li>
                      <li>• Overview of available services</li>
                      <li>• Q&A about speaking or coaching</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold mb-2" style={{ color: '#7B3B3B' }}>Meeting details:</p>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Video call via your preferred platform</li>
                      <li>• No obligation consultation</li>
                      <li>• Flexible scheduling options</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Booking;
