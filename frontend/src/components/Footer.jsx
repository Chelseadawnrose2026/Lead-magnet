import React from 'react';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#7B3B3B' }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Chelsea Flynn</h3>
            <p className="text-white/80 mb-4">Catholic Speaker & Life Transformation Coach</p>
            <p className="text-white/70 text-sm italic">
              "Turning your mess into a message, your tests into testimonies"
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#about" className="text-white/80 hover:text-white transition-colors duration-200">
                  About
                </a>
              </li>
              <li>
                <a href="#services" className="text-white/80 hover:text-white transition-colors duration-200">
                  Services
                </a>
              </li>
              <li>
                <a href="#radio" className="text-white/80 hover:text-white transition-colors duration-200">
                  Radio Show
                </a>
              </li>
              <li>
                <a href="#testimonials" className="text-white/80 hover:text-white transition-colors duration-200">
                  Testimonials
                </a>
              </li>
              <li>
                <a href="#contact" className="text-white/80 hover:text-white transition-colors duration-200">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-white/80">
                <Mail className="w-4 h-4" />
                <span className="text-sm">chelsea@chelseaflynn.com</span>
              </div>
              <div className="flex items-center space-x-3 text-white/80">
                <Phone className="w-4 h-4" />
                <span className="text-sm">+1 (345) 555-0123</span>
              </div>
              <div className="flex items-center space-x-3 text-white/80">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Cayman Islands</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8 text-center">
          <p className="text-white/70 text-sm flex items-center justify-center space-x-1">
            <span>© {currentYear} Chelsea Flynn. Made with</span>
            <Heart className="w-4 h-4 fill-white/70" />
            <span>in the Cayman Islands</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
