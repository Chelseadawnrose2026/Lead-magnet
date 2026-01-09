import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
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
      const response = await axios.post(`${API}/contact`, formData);
      
      if (response.data) {
        toast.success('Thank you! Your message has been sent. Chelsea will get back to you soon.');
        setFormData({ name: '', email: '', phone: '', message: '' });
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error('Sorry, there was an error sending your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F9F9F9' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#7B3B3B' }}>
            Get In Touch
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions or want to learn more? I'd love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold mb-6" style={{ color: '#7B3B3B' }}>
                Contact Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: '#E0C4C0' }}
                  >
                    <Mail className="w-5 h-5" style={{ color: '#7B3B3B' }} />
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: '#7B3B3B' }}>Email</p>
                    <p className="text-gray-600">transform@chelseaflynncoaching.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: '#E0C4C0' }}
                  >
                    <Phone className="w-5 h-5" style={{ color: '#7B3B3B' }} />
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: '#7B3B3B' }}>Phone</p>
                    <p className="text-gray-600">1 345 325 3924</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: '#E0C4C0' }}
                  >
                    <MapPin className="w-5 h-5" style={{ color: '#7B3B3B' }} />
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: '#7B3B3B' }}>Location</p>
                    <p className="text-gray-600">Cayman Islands</p>
                    <p className="text-sm text-gray-500">Available for global travel</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <img
                src="https://customer-assets.emergentagent.com/job_messiah-message/artifacts/sxg4ghbz_CL-53.jpg"
                alt="Chelsea Flynn"
                className="rounded-2xl shadow-lg w-full h-64 object-cover"
              />
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold mb-6" style={{ color: '#7B3B3B' }}>
              Send a Message
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-gray-700">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-2"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-gray-700">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-2"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-gray-700">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-2"
                  placeholder="+1 (345) 555-0123"
                />
              </div>

              <div>
                <Label htmlFor="message" className="text-gray-700">Message *</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="mt-2 min-h-[150px]"
                  placeholder="Tell me about what you're looking for..."
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-lg py-6 hover:opacity-90 transition-opacity duration-200"
                style={{ backgroundColor: '#7B3B3B' }}
              >
                <Send className="w-5 h-5 mr-2" />
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
