import React from 'react';
import { Calendar, Video } from 'lucide-react';

const Booking = () => {
  return (
    <section id="booking" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#7B3B3B' }}>
            Book a Virtual Meeting
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Schedule a time to discuss speaking opportunities, coaching, or learn more about my services
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-center space-x-3 mb-6">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#E0C4C0' }}
                >
                  <Video className="w-6 h-6" style={{ color: '#7B3B3B' }} />
                </div>
                <h3 className="text-2xl font-bold" style={{ color: '#7B3B3B' }}>
                  30-Minute Discovery Call
                </h3>
              </div>

              {/* Calendly Embed Placeholder */}
              <div className="relative">
                <div
                  className="aspect-[4/3] rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: '#F9F9F9' }}
                >
                  <div className="text-center space-y-4 p-8">
                    <div
                      className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#E0C4C0' }}
                    >
                      <Calendar className="w-10 h-10" style={{ color: '#7B3B3B' }} />
                    </div>
                    <div>
                      <p className="text-lg font-semibold" style={{ color: '#7B3B3B' }}>
                        Calendly Integration Placeholder
                      </p>
                      <p className="text-gray-600 mt-2">
                        This section will contain your Calendly booking widget
                      </p>
                      <p className="text-sm text-gray-500 mt-4">
                        To integrate: Replace this div with your Calendly embed code<br />
                        or Google Meet scheduling link
                      </p>
                    </div>
                  </div>
                </div>

                {/* Example of how Calendly would be integrated:
                <div
                  className="calendly-inline-widget"
                  data-url="https://calendly.com/your-username/30min"
                  style={{ minWidth: '320px', height: '700px' }}
                ></div>
                */}
              </div>

              <div className="mt-8 pt-8 border-t" style={{ borderColor: '#E0C4C0' }}>
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
                      <li>• 30-minute video call</li>
                      <li>• Via Google Meet or Zoom</li>
                      <li>• No obligation consultation</li>
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
