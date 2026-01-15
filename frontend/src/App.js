import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Hero from "./components/Hero";
import About from "./components/About";
import Services from "./components/Services";
import RadioShows from "./components/RadioShows";
import Testimonials from "./components/Testimonials";
import Contact from "./components/Contact";
import Booking from "./components/Booking";
import Footer from "./components/Footer";
import Admin from "./components/Admin";
import WhatsAppButton from "./components/WhatsAppButton";
import { Toaster } from "./components/ui/sonner";
import CRMDashboard from "./components/CRMDashboard";
import { CRMLogin, CRMAuthCallback } from "./components/CRMAuth";

const Home = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <About />
        <Services />
        <RadioShows />
        <Testimonials />
        <Booking />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
      <Toaster />
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          {/* CRM Routes */}
          <Route path="/crm" element={<CRMDashboard />} />
          <Route path="/crm/login" element={<CRMLogin />} />
          <Route path="/crm/callback" element={<CRMAuthCallback />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
