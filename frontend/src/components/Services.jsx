import React from 'react';
import { mockData } from '../mock';
import { Users, Mountain, Mic, Heart } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';

const Services = () => {
  const { services } = mockData;

  const iconMap = {
    users: Users,
    mountain: Mountain,
    mic: Mic,
    heart: Heart
  };

  return (
    <section id="services" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#7B3B3B' }}>
            Speaking & Coaching Services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Bringing Christ-centered transformation through authentic testimony, biblical wisdom, and practical guidance
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => {
            const Icon = iconMap[service.icon] || Heart;
            return (
              <Card
                key={index}
                className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 overflow-hidden"
              >
                <div
                  className="h-2 w-full transition-all duration-300 group-hover:h-3"
                  style={{ backgroundColor: '#7B3B3B' }}
                ></div>
                <CardHeader className="text-center pt-8">
                  <div
                    className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: '#E0C4C0' }}
                  >
                    <Icon className="w-8 h-8" style={{ color: '#7B3B3B' }} />
                  </div>
                  <CardTitle className="text-xl font-bold" style={{ color: '#7B3B3B' }}>
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-gray-600 leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
