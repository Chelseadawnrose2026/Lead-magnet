import React, { useState } from 'react';
import { Calendar, Video, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Booking = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    booking_type: 'Virtual Meeting'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post(`${API}/booking`, formData);
      
      if (response.data) {
        toast.success('Thank you! Your booking request has been received. Chelsea will contact you soon to schedule.');
        setFormData({ name: '', email: '', phone: '', message: '', booking_type: 'Virtual Meeting' });
      }
    } catch (error) {
      console.error('Error submitting booking request:', error);
      toast.error('Sorry, there was an error submitting your booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <div className="flex items-center justify-center space-x-3 mb-8">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#E0C4C0' }}
                >
                  <Video className="w-6 h-6" style={{ color: '#7B3B3B' }} />
                </div>
                <h3 className="text-2xl font-bold" style={{ color: '#7B3B3B' }}>
                  Request a Discovery Call
                </h3>
              </div>

              {/* Booking Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="booking-name" className="text-gray-700">Name *</Label>
                    <Input
                      id="booking-name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="mt-2"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="booking-email" className="text-gray-700">Email *</Label>
                    <Input
                      id="booking-email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="mt-2"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="booking-phone" className="text-gray-700">Phone</Label>
                    <Input
                      id="booking-phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="mt-2"
                      placeholder="+1 (345) 555-0123"
                    />
                  </div>

                  <div>
                    <Label htmlFor="booking-type" className="text-gray-700">Booking Type</Label>
                    <select
                      id="booking-type"
                      name="booking_type"
                      value={formData.booking_type}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#7B3B3B] focus:outline-none focus:ring-2 focus:ring-[#7B3B3B]"
                    >
                      <option value="Virtual Meeting">Virtual Meeting</option>
                      <option value="OCIA Program">OCIA Program</option>
                      <option value="Retreat">Retreat</option>
                      <option value="Conference">Conference</option>
                      <option value="1:1 Coaching">1:1 Life Coaching</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="booking-message" className="text-gray-700">Tell me about your needs *</Label>
                  <Textarea
                    id="booking-message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="mt-2 min-h-[120px]"
                    placeholder="What would you like to discuss? What are your goals or needs?"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full text-lg py-6 hover:opacity-90 transition-opacity duration-200"
                  style={{ backgroundColor: '#7B3B3B' }}
                >
                  <Send className="w-5 h-5 mr-2" />
                  {isSubmitting ? 'Submitting...' : 'Request Booking'}
                </Button>
              </form>

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
