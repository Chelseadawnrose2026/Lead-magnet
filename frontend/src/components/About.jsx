import React from 'react';
import { mockData } from '../mock';
import { Users, Mountain, Heart } from 'lucide-react';
import { Button } from './ui/button';

const About = () => {
  const { about } = mockData;

  const iconMap = {
    'Catholic Convert': Users,
    'Mother of Three': Heart,
    'Radio': Mountain
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F9F9F9' }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Image */}
          <div className="relative">
            <div className="absolute -top-6 -left-6 w-full h-full rounded-2xl" style={{ backgroundColor: '#E0C4C0', opacity: 0.3 }}></div>
            <img
              src={about.image}
              alt="Chelsea Flynn"
              className="relative rounded-2xl shadow-xl w-full h-[600px] object-cover"
            />
          </div>

          {/* Right - Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#7B3B3B' }}>
                {about.title}
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                {about.description}
              </p>
            </div>

            <div className="space-y-6">
              {about.highlights.map((highlight, index) => {
                const Icon = iconMap[highlight.title] || Heart;
                return (
                  <div
                    key={index}
                    className="p-6 rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="flex items-start space-x-4">
                      <div
                        className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: '#E0C4C0' }}
                      >
                        <Icon className="w-6 h-6" style={{ color: '#7B3B3B' }} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2" style={{ color: '#7B3B3B' }}>
                          {highlight.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {highlight.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
