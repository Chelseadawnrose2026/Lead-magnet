import React from 'react';
import { mockData } from '../mock';
import { Quote } from 'lucide-react';
import { Card, CardContent } from './ui/card';

const Testimonials = () => {
  const { testimonials } = mockData;

  return (
    <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#7B3B3B' }}>
            Testimonials
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stories of transformation and faith from those I've had the privilege to serve
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0"
            >
              <CardContent className="p-8 space-y-6">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#E0C4C0' }}
                >
                  <Quote className="w-6 h-6" style={{ color: '#7B3B3B' }} />
                </div>

                <p className="text-gray-700 leading-relaxed italic">
                  "{testimonial.text}"
                </p>

                <div className="flex items-center space-x-4 pt-4 border-t" style={{ borderColor: '#E0C4C0' }}>
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold" style={{ color: '#7B3B3B' }}>
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
