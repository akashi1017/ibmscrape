# Digit Classification Web Application

A modern React-based web application for digit classification with user authentication.

## Features

- User Login
- User Registration
- Modern, responsive UI
- Form validation
- Error handling

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

### Environment Variables

Create a `.env` file in the root directory (already created) with:

```
REACT_APP_API_URL=http://localhost:8000
```

Update the API URL to match your backend server.

## Project Structure

```
src/
  ├── pages/
  │   ├── Login.js       # Login page component
  │   ├── Register.js    # Register page component
  │   └── Auth.css       # Shared styles for auth pages
  ├── App.js             # Main app component with routing
  ├── App.css            # App styles
  ├── index.js           # Entry point
  └── index.css          # Global styles
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner

## Technologies Used

- React 18
- React Router DOM
- CSS3 (with modern gradients and animations)
