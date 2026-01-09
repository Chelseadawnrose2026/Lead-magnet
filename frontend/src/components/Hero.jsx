import React from 'react';
import { Button } from './ui/button';
import { MapPin, Play } from 'lucide-react';
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
    <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Optional: Translucent background image - uncomment to enable */}
      {/* <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{
            backgroundImage: "url('https://customer-assets.emergentagent.com/job_messiah-message/artifacts/dpav30r7_20250913-YAN02706.jpg')"
          }}
        ></div>
      </div> */}

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Centered Content */}
        <div className="text-center space-y-6 mb-12">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img
              src="https://customer-assets.emergentagent.com/job_messiah-message/artifacts/hhhu4js6_4328b845-5ddb-4309-9762-a6b2dd73cb70.png"
              alt="Chelsea Flynn"
              className="h-24 w-auto md:h-32"
            />
          </div>

          {/* Location Badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full" style={{ backgroundColor: '#E0C4C0' }}>
              <MapPin className="w-4 h-4 mr-2" style={{ color: '#7B3B3B' }} />
              <span className="text-sm font-medium" style={{ color: '#7B3B3B' }}>
                {hero.location}
              </span>
            </div>
          </div>

          {/* Subtitle */}
          <h2 className="text-2xl md:text-3xl font-medium text-gray-700 max-w-3xl mx-auto">
            {hero.subtitle}
          </h2>

          {/* Tagline */}
          <p className="text-xl md:text-2xl italic font-medium max-w-4xl mx-auto" style={{ color: '#7B3B3B' }}>
            "{hero.tagline}"
          </p>

          {/* Description */}
          <p className="text-gray-600 text-lg leading-relaxed max-w-3xl mx-auto">
            {hero.description}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 justify-center">
            <Button
              onClick={() => scrollToSection('booking')}
              size="lg"
              style={{ backgroundColor: '#7B3B3B' }}
              className="hover:opacity-90 transition-all duration-200 text-lg px-8 py-6"
            >
              Book a Virtual Meeting
            </Button>
            <Button
              onClick={() => scrollToSection('contact')}
              size="lg"
              variant="outline"
              style={{ borderColor: '#7B3B3B', color: '#7B3B3B' }}
              className="hover:bg-[#E0C4C0] transition-all duration-200 text-lg px-8 py-6"
            >
              Contact Chelsea
            </Button>
          </div>
        </div>

        {/* Full-Width Video */}
        <div className="w-full max-w-5xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ backgroundColor: '#E0C4C0' }}>
            <div className="aspect-video bg-gray-900 flex items-center justify-center relative group">
              {/* Video placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div
                    className="w-20 h-20 mx-auto rounded-full flex items-center justify-center cursor-pointer transform transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: '#7B3B3B' }}
                  >
                    <Play className="w-10 h-10 text-white fill-white ml-1" />
                  </div>
                  <p className="text-white text-lg font-medium">Watch My Story</p>
                  <p className="text-white/70 text-sm">From Chaos to Christ - My Journey</p>
                </div>
              </div>
              {/* Actual video would go here */}
              {/* <iframe
                className="w-full h-full"
                src={hero.videoPlaceholder}
                title="Chelsea Flynn Introduction"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              /> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
