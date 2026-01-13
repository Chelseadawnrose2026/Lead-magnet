import React from 'react';
import { Heart, Mail, Phone, MapPin, Instagram, Facebook, Youtube } from 'lucide-react';

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
              "He turns your mess into a message, your tests into testimonies"
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
                  Radio
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
                <a href="mailto:transform@chelseaflynncoaching.com" className="text-sm hover:text-white transition-colors">
                  transform@chelseaflynncoaching.com
                </a>
              </div>
              <div className="flex items-center space-x-3 text-white/80">
                <Phone className="w-4 h-4" />
                <a href="tel:13453253924" className="text-sm hover:text-white transition-colors">
                  1 345 325 3924
                </a>
              </div>
              <div className="flex items-center space-x-3 text-white/80">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Cayman Islands</span>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="mt-6">
              <h4 className="text-lg font-bold text-white mb-3">Follow Me</h4>
              <div className="flex items-center space-x-4">
                <a
                  href="https://www.instagram.com/chelseaflynncoaching"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white transition-colors duration-200"
                  aria-label="Instagram"
                >
                  <Instagram className="w-6 h-6" />
                </a>
                <a
                  href="https://l.facebook.com/l.php?u=http%3A%2F%2Fwww.chelseaflynncoaching.com%2F%3Ffbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExbnBacjlxVXVjUXp2VzlGRnNydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR7LVp8T27AaFSV51lP_yG0MwZAIAhrFURIFCoe3YLPFP2x2C8gOZwQL25HJPw_aem_mZZ-6pqH7er2QQlVynGmfQ&h=AT374EokpU-breOzPoOSXlRPI9hwnZcDczP6zlavP7kU3HSHm0g_CZMtsi6xJU98qPScrRZaacfhwzNsLYZHtP-l4H_sxgAknNHk0GXuOHl5r-ifM6lYefP---ZgUDxJH9Sv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white transition-colors duration-200"
                  aria-label="Facebook"
                >
                  <Facebook className="w-6 h-6" />
                </a>
                <a
                  href="https://www.youtube.com/@chelseaflynncoaching"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white transition-colors duration-200"
                  aria-label="YouTube"
                >
                  <Youtube className="w-6 h-6" />
                </a>
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
