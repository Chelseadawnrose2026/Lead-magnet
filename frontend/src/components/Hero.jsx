import React from 'react';
import { Button } from './ui/button';
import { MapPin, Globe } from 'lucide-react';
import { mockData } from '../mock';

const Hero = () => {
  const { hero } = mockData;

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Translucent background image */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://customer-assets.emergentagent.com/job_messiah-message/artifacts/2oqtbyq8_20250913-YAN02706.jpg')",
            backgroundPosition: 'center center',
            opacity: 0.6
          }}
        ></div>
        <div className="absolute inset-0 bg-white/40"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Centered Content */}
        <div className="text-center space-y-5 mb-12 pt-8">
          {/* Location Badge */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-3">
            <div className="inline-flex items-center px-4 py-2 rounded-full" style={{ backgroundColor: '#E0C4C0' }}>
              <MapPin className="w-4 h-4 mr-2" style={{ color: '#7B3B3B' }} />
              <span className="text-sm font-medium" style={{ color: '#7B3B3B' }}>
                Based in Cayman Islands
              </span>
            </div>
            <div className="inline-flex items-center px-4 py-2 rounded-full" style={{ backgroundColor: '#E0C4C0' }}>
              <Globe className="w-4 h-4 mr-2" style={{ color: '#7B3B3B' }} />
              <span className="text-sm font-medium" style={{ color: '#7B3B3B' }}>
                Available to Travel Internationally
              </span>
            </div>
          </div>

          {/* Subtitle */}
          <h2 className="text-xl md:text-2xl lg:text-3xl font-medium text-gray-800 max-w-3xl mx-auto px-4">
            {hero.subtitle}
          </h2>

          {/* Tagline */}
          <p className="text-2xl md:text-3xl lg:text-5xl italic font-bold max-w-5xl mx-auto leading-tight px-4" style={{ color: '#7B3B3B' }}>
            He turns your mess into a message, your tests into testimonies
          </p>

          {/* Description */}
          <p className="text-gray-700 text-base md:text-lg leading-relaxed max-w-3xl mx-auto px-4">
            {hero.description}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center px-4">
            <Button
              onClick={() => scrollToSection('booking')}
              size="lg"
              style={{ backgroundColor: '#7B3B3B' }}
              className="hover:opacity-90 transition-all duration-200 text-base md:text-lg px-6 md:px-8 py-5 md:py-6 w-full sm:w-auto"
            >
              Book a Virtual Meeting
            </Button>
            <Button
              onClick={() => scrollToSection('contact')}
              size="lg"
              variant="outline"
              style={{ borderColor: '#7B3B3B', color: '#7B3B3B' }}
              className="hover:bg-[#E0C4C0] transition-all duration-200 text-base md:text-lg px-6 md:px-8 py-5 md:py-6 w-full sm:w-auto"
            >
              Contact Chelsea
            </Button>
          </div>
        </div>

        {/* Full-Width Video */}
        <div className="w-full max-w-5xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ backgroundColor: '#E0C4C0' }}>
            <div className="aspect-video bg-gray-900 flex items-center justify-center relative">
              <video
                className="w-full h-full object-cover"
                controls
                poster=""
                playsInline
                data-testid="hero-intro-video"
              >
                <source 
                  src="https://customer-assets.emergentagent.com/job_faith-speaker/artifacts/xgqvo8vl_copy_9C64AC4D-8D20-455E-8F82-6FD8FB0FFBF9.mov" 
                  type="video/quicktime" 
                />
                <source 
                  src="https://customer-assets.emergentagent.com/job_faith-speaker/artifacts/xgqvo8vl_copy_9C64AC4D-8D20-455E-8F82-6FD8FB0FFBF9.mov" 
                  type="video/mp4" 
                />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
