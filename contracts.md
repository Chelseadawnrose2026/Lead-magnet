# API Contracts - Chelsea Flynn Website

## Backend Implementation Plan

### Database Models

#### 1. ContactSubmission
- `id`: String (UUID)
- `name`: String (required)
- `email`: String (required)
- `phone`: String (optional)
- `message`: String (required)
- `timestamp`: DateTime (auto)

#### 2. BookingRequest
- `id`: String (UUID)
- `name`: String (required)
- `email`: String (required)
- `phone`: String (optional)
- `message`: String (required)
- `booking_type`: String (e.g., "Virtual Meeting", "OCIA", "Retreat", "Coaching")
- `timestamp`: DateTime (auto)

### API Endpoints

#### Contact Form
- **POST** `/api/contact`
  - Body: `{ name, email, phone?, message }`
  - Response: `{ success: true, message: "Contact form submitted successfully" }`

#### Booking Form
- **POST** `/api/booking`
  - Body: `{ name, email, phone?, message, booking_type? }`
  - Response: `{ success: true, message: "Booking request submitted successfully" }`

#### Admin Endpoints (Optional - for viewing submissions)
- **GET** `/api/contacts` - Get all contact submissions
- **GET** `/api/bookings` - Get all booking requests

### Frontend Integration

#### Contact.jsx
- Remove mock submission in `handleSubmit`
- Call `POST /api/contact` with form data
- Show success/error toast based on response

#### Booking.jsx
- Create booking form (currently placeholder)
- Call `POST /api/booking` with form data
- Show success/error toast based on response

### Mock Data to Remove
- `mock.js` - Keep for radio shows and testimonials (static content)
- Contact form - Switch to backend API
- Booking form - Switch to backend API
