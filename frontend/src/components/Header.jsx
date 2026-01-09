import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-md' : 'bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0">
            <img
              src="https://customer-assets.emergentagent.com/job_messiah-message/artifacts/hhhu4js6_4328b845-5ddb-4309-9762-a6b2dd73cb70.png"
              alt="Chelsea Flynn"
              className="h-12 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection('about')}
              className="text-gray-700 hover:text-[#7B3B3B] transition-colors duration-200 font-medium"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('services')}
              className="text-gray-700 hover:text-[#7B3B3B] transition-colors duration-200 font-medium"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection('radio')}
              className="text-gray-700 hover:text-[#7B3B3B] transition-colors duration-200 font-medium"
            >
              Radio Show
            </button>
            <button
              onClick={() => scrollToSection('testimonials')}
              className="text-gray-700 hover:text-[#7B3B3B] transition-colors duration-200 font-medium"
            >
              Testimonials
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-gray-700 hover:text-[#7B3B3B] transition-colors duration-200 font-medium"
            >
              Contact
            </button>
            <Button
              onClick={() => scrollToSection('booking')}
              style={{ backgroundColor: '#7B3B3B' }}
              className="hover:opacity-90 transition-opacity duration-200"
            >
              Book Now
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" style={{ color: '#7B3B3B' }} />
            ) : (
              <Menu className="h-6 w-6" style={{ color: '#7B3B3B' }} />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => scrollToSection('about')}
                className="text-left text-gray-700 hover:text-[#7B3B3B] transition-colors duration-200 font-medium"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection('services')}
                className="text-left text-gray-700 hover:text-[#7B3B3B] transition-colors duration-200 font-medium"
              >
                Services
              </button>
              <button
                onClick={() => scrollToSection('radio')}
                className="text-left text-gray-700 hover:text-[#7B3B3B] transition-colors duration-200 font-medium"
              >
                Radio Show
              </button>
              <button
                onClick={() => scrollToSection('testimonials')}
                className="text-left text-gray-700 hover:text-[#7B3B3B] transition-colors duration-200 font-medium"
              >
                Testimonials
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="text-left text-gray-700 hover:text-[#7B3B3B] transition-colors duration-200 font-medium"
              >
                Contact
              </button>
              <Button
                onClick={() => scrollToSection('booking')}
                style={{ backgroundColor: '#7B3B3B' }}
                className="hover:opacity-90 transition-opacity duration-200 w-full"
              >
                Book Now
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
