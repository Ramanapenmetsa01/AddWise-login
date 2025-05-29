# AddWise Login System

A modern, secure, and responsive login/signup system with multiple authentication methods and a beautiful UI. This system includes both light and dark mode themes, animated backgrounds, and a comprehensive user authentication flow.

## Features

- 🔐 Secure User Authentication
  - Email/Password Login
  - Google OAuth Integration
  - Forgot Password Functionality
  - OTP Verification System

- 🎨 Modern UI/UX
  - Responsive Design
  - Day/Night Theme
  - Animated Cloud Background
  - Smooth Transitions
  - Toast Notifications

- 🛡️ Security Features
  - Password Encryption
  - Session Management
  - Protected Routes
  - Environment Variable Protection

## Tech Stack

- Frontend:
  - HTML5
  - CSS3 (with animations)
  - JavaScript (Vanilla)
  - Google OAuth 2.0

- Backend:
  - Node.js
  - Express.js
  - MongoDB (Database)

## Project Structure

```
├── login.html          # Main login/signup page
├── login.js           # Authentication logic
├── login.css          # Styling for auth pages
├── dashboard.html     # User dashboard
├── dashboard.js       # Dashboard functionality
├── dashboard.css      # Dashboard styling
├── server.js         # Backend server
└── package.json      # Project dependencies
```

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/Ramanapenmetsa01/AddWise-login.git
   cd AddWise-login
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. Open `http://localhost:3000` in your browser

## Features in Detail

### Authentication Flow
- User registration with email verification
- Secure login with JWT tokens
- Password reset via email
- Google OAuth integration
- OTP verification system

### UI/UX Features
- Responsive design that works on all devices
- Animated cloud background
- Smooth transitions between forms
- Toast notifications for user feedback
- Day/Night theme toggle

### Security Measures
- Password hashing
- JWT for session management
- Protected API endpoints
- CORS protection
- Environment variable security

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Ramana Penmetsa - [GitHub Profile](https://github.com/Ramanapenmetsa01)

Project Link: [https://github.com/Ramanapenmetsa01/AddWise-login](https://github.com/Ramanapenmetsa01/AddWise-login)

## login
![Screenshot 2025-05-23 173200](https://github.com/user-attachments/assets/4e81b371-df37-4feb-8c9c-e7d12b0be1ed)

## signup
![Screenshot 2025-05-23 173213](https://github.com/user-attachments/assets/bbe9e90b-5d12-45d8-a8d0-67d3609e398f)

