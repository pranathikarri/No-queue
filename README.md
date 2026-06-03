# NoQueue — Digital Queue Management System (Client)

Hey there! Welcome to the frontend repository for **NoQueue**—our project aimed at putting an end to long, frustrating physical lines. This is the React-based client web app that users and shop owners interact with. It's built with React, Vite, Tailwind CSS v4, Socket.io, and some cool 3D elements using React Three Fiber.

---

## ✨ What does it do?

Here is a quick look at the core features built into the app:

*   **⚡ Live, real-time updates**: We use WebSockets (Socket.io) to push queue updates instantly. The moment a shop owner changes a ticket status, it reflects on the customer's device without requiring a manual page refresh.
*   **🕶️ Rotating 3D Tickets**: To make wait tracking a bit more engaging, we built an interactive 3D token using React Three Fiber (`@react-three/fiber` & `@react-three/drei`). It displays your live position in a clean, visual card format.
*   **🏢 Multi-level Dashboards**: 
    *   **For Customers**: Easily search for shops nearby, book time slots, and monitor active queue tickets.
    *   **For Shop Owners**: Configure operating hours, set capacity per slot, call the next customer, or skip slots if needed.
    *   **For Organizations**: Manage multiple shops or clinic branches under one unified portal.
*   **🔍 Easy Discovery**: Filter and search through shops quickly by city and category.
*   **🔑 Secure Authentication**: Simple, secure login using Firebase (supports both Google Sign-in and standard email credentials).
*   **📱 Mobile-First Design**: The interface is fully responsive, looking just as good on a phone screen in line as it does on a desktop.
*   **📷 Check-in Scanner**: Built-in QR scanner and generator to verify customer arrivals and check-in tickets.

---

## 🛠️ What's under the hood?

We used a modern, fast frontend stack to make sure the app feels smooth:

*   **Framework**: React 19 & Vite 8 (for lightning-fast hot-reloading)
*   **Styling**: Tailwind CSS v4 paired with a sleek glassmorphic theme and clean typography (Inter & Outfit fonts)
*   **Animations**: Framer Motion for smooth page transitions and micro-interactions
*   **State & Services**:
    *   **Socket.io-client** for persistent connection to the server
    *   **Firebase SDK** for user auth
    *   **Axios** for clean REST API requests
    *   **React Router v7** for page navigation
    *   **HTML5-QRCode** for scan validation

---

## 🚀 Getting Started

### Prerequisites

Before jumping in, make sure you have:
1.  **Node.js** (`v18+` is recommended).
2.  Your preferred package manager (`npm`, `yarn`, or `pnpm`).
3.  The backend server running in the sibling `/server` directory (it runs on port `5001` by default).

### 1. Grab dependencies

Head into the `client` directory and install the packages:

```bash
cd client
npm install
```

### 2. Configure Firebase

We've configured our Firebase client credentials inside `src/firebase.js`. If you're running this locally, you can use our development keys:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyCUvNLVj7c4uTS97RMzl2cC0SW214OoHEc",
  authDomain: "queue-management-system-59e4b.firebaseapp.com",
  projectId: "queue-management-system-59e4b",
  storageBucket: "queue-management-system-59e4b.firebasestorage.app",
  messagingSenderId: "139979340194",
  appId: "1:139979340194:web:be5e914d395f0fffc31afb",
  measurementId: "G-SB49TWFME2"
};
```

*Note: If you plan to deploy your own instance, make sure to swap these out with your own Firebase Project configuration.*

### 3. Spin up the dev server

Start Vite's local server:

```bash
npm run dev
```

Open up [http://localhost:5173](http://localhost:5173) in your browser and you're good to go!

---

## 📂 Where to find things (Project Structure)

Here is a breakdown of the client directory structure:

```
client/
├── public/                 # Static assets (favicons, manifest files)
├── src/
│   ├── assets/             # Static SVGs, custom images
│   ├── components/         # Reusable UI widgets
│   │   ├── LandingIntro.jsx # The welcome onboarding animation
│   │   └── QueueToken3D.jsx # The 3D rotating queue card
│   ├── context/            # AuthContext holding active login states
│   ├── pages/              # App views / route targets
│   │   ├── Home.jsx         # Main launchpad page
│   │   ├── Login.jsx        # Google/Email Firebase login
│   │   ├── Dashboard.jsx    # User's active queue tracklist
│   │   ├── FindShops.jsx    # Shop search engine
│   │   ├── AdminDashboard.jsx # Tools for individual shop managers
│   │   ├── CreateShop.jsx   # Shop registration wizard
│   │   ├── OrgLanding.jsx   # Organization entry point
│   │   ├── OrgCreateJoin.jsx # Setup tools for organizations
│   │   └── OrgDashboard.jsx  # Multi-location enterprise panel
│   ├── utils/              # Global helpers and network utilities
│   ├── App.jsx             # React router structure & toast notifications
│   ├── firebase.js         # Firebase app configuration
│   ├── index.css           # Custom CSS scrollbars & Tailwind import
│   └── main.jsx            # Entry script mounting React
├── package.json
└── vite.config.js
```

---

## 🔌 Talking to the Backend

The frontend talks directly to the companion Node.js server inside `/server`:
*   **Http Requests**: Standard data fetching and form submissions are handled using Axios, targeting the server at `http://localhost:5001`.
*   **WebSocket Events**: We establish a live socket connection with the backend. When a customer joins a queue or is called forward (`Waiting` ➔ `Serving` ➔ `Completed`), the server fires socket events to refresh client UI instantly.
