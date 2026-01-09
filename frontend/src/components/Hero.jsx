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
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-5">
        <div className="absolute top-20 right-20 w-96 h-96 rounded-full" style={{ backgroundColor: '#E0C4C0' }}></div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 z-10">
            <div className="inline-flex items-center px-4 py-2 rounded-full" style={{ backgroundColor: '#E0C4C0' }}>
              <MapPin className="w-4 h-4 mr-2" style={{ color: '#7B3B3B' }} />
              <span className="text-sm font-medium" style={{ color: '#7B3B3B' }}>
                {hero.location}
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span style={{ color: '#7B3B3B' }}>{hero.title}</span>
            </h1>

            <p className="text-xl md:text-2xl font-medium text-gray-700">
              {hero.subtitle}
            </p>

            <p className="text-lg italic" style={{ color: '#7B3B3B' }}>
              "{hero.tagline}"
            </p>

            <p className="text-gray-600 text-lg leading-relaxed">
              {hero.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
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

          {/* Right Video */}
          <div className="relative z-10">
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
                    <p className="text-white text-lg font-medium">Watch Introduction Video</p>
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
      </div>
    </section>
  );
};

export default Hero;
