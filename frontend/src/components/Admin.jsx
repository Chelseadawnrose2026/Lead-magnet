import React, { useState, useEffect } from 'react';
import { Mail, Calendar, Phone, MessageSquare, Clock, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Admin = () => {
  const [contacts, setContacts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [contactsRes, bookingsRes] = await Promise.all([
        axios.get(`${API}/contacts`),
        axios.get(`${API}/bookings`)
      ]);
      
      setContacts(contactsRes.data);
      setBookings(bookingsRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F9F9F9' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#7B3B3B' }}>
            Admin Dashboard
          </h1>
          <p className="text-gray-600">View all contact submissions and booking requests</p>
        </div>

        {/* Bookings Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#7B3B3B' }}>
            Booking Requests ({bookings.length})
          </h2>
          <div className="grid gap-6">
            {bookings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  No booking requests yet
                </CardContent>
              </Card>
            ) : (
              bookings.map((booking) => (
                <Card key={booking.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader style={{ backgroundColor: '#E0C4C0' }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2" style={{ color: '#7B3B3B' }}>
                          <User className="w-5 h-5" />
                          {booking.name}
                        </CardTitle>
                        <p className="text-sm font-semibold mt-1" style={{ color: '#7B3B3B' }}>
                          {booking.booking_type}
                        </p>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDate(booking.timestamp)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-700">
                        <Mail className="w-4 h-4 mr-2" style={{ color: '#7B3B3B' }} />
                        <a href={`mailto:${booking.email}`} className="hover:underline">
                          {booking.email}
                        </a>
                      </div>
                      {booking.phone && (
                        <div className="flex items-center text-gray-700">
                          <Phone className="w-4 h-4 mr-2" style={{ color: '#7B3B3B' }} />
                          <a href={`tel:${booking.phone}`} className="hover:underline">
                            {booking.phone}
                          </a>
                        </div>
                      )}
                      <div className="flex items-start text-gray-700">
                        <MessageSquare className="w-4 h-4 mr-2 mt-1" style={{ color: '#7B3B3B' }} />
                        <p className="flex-1">{booking.message}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Contacts Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#7B3B3B' }}>
            Contact Submissions ({contacts.length})
          </h2>
          <div className="grid gap-6">
            {contacts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  No contact submissions yet
                </CardContent>
              </Card>
            ) : (
              contacts.map((contact) => (
                <Card key={contact.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader style={{ backgroundColor: '#E0C4C0' }}>
                    <div className="flex justify-between items-start">
                      <CardTitle className="flex items-center gap-2" style={{ color: '#7B3B3B' }}>
                        <User className="w-5 h-5" />
                        {contact.name}
                      </CardTitle>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDate(contact.timestamp)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-700">
                        <Mail className="w-4 h-4 mr-2" style={{ color: '#7B3B3B' }} />
                        <a href={`mailto:${contact.email}`} className="hover:underline">
                          {contact.email}
                        </a>
                      </div>
                      {contact.phone && (
                        <div className="flex items-center text-gray-700">
                          <Phone className="w-4 h-4 mr-2" style={{ color: '#7B3B3B' }} />
                          <a href={`tel:${contact.phone}`} className="hover:underline">
                            {contact.phone}
                          </a>
                        </div>
                      )}
                      <div className="flex items-start text-gray-700">
                        <MessageSquare className="w-4 h-4 mr-2 mt-1" style={{ color: '#7B3B3B' }} />
                        <p className="flex-1">{contact.message}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
