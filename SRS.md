# Software Requirements Specification (SRS) - NoQueue Project

## 1. Introduction
### 1.1 Purpose
The purpose of this document is to specify the software requirements for the **NoQueue** project, a digital queue management system designed to replace physical waiting lines with a virtual booking and tracking system.

### 1.2 Scope
NoQueue provides a platform for service providers (shops, clinics, etc.) to manage their customer flow and for customers to book slots and monitor their status in real-time.

---

## 2. General Description
### 2.1 Product Perspective
NoQueue is a standalone web application built with a React frontend and an Express/Node.js backend, utilizing SQLite for persistent storage and Socket.io for real-time updates.

### 2.2 Product Functions
*   **User Management**: Registration and authentication of customers and shop owners.
*   **Shop Discovery**: Search and filtering of shops based on city and category.
*   **Slot Booking**: Customers can select and book available time slots.
*   **Real-time Queue Management**: Shop owners can update queue statuses (Waiting, Serving, Completed, Skipped) with instant notification to users.
*   **Admin Dashboard**: Comprehensive tools for shop owners to manage their business profile and service offerings.

---

## 3. System Requirements
### 3.1 Tech Stack
*   **Frontend**: React.js, Vite, Tailwind CSS (or Custom CSS), Socket.io-client.
*   **Backend**: Node.js, Express.js, Socket.io.
*   **Database**: SQLite (managed via Sequelize ORM).
*   **Communication**: WebSockets for live status synchronization.

### 3.2 Data Models
*   **User**: Stores user details (Name, Email, Role).
*   **Shop**: Profile information, location, service type, and rating.
*   **Slot**: Defines available time intervals and capacity for a shop.
*   **Queue**: Tracks individual bookings, queue numbers, and live status.

---

## 4. Functional Requirements
### 4.1 User Portal
*   **UC-01: Shop Search**: Users shall be able to filter shops by city and service category.
*   **UC-02: View Shop Profile**: Users shall be able to view shop location, description, and ratings.
*   **UC-03: Book Slot**: Users shall be able to pick a date and time slot from available options.
*   **UC-04: Join Queue**: Users shall receive a unique queue number upon booking.
*   **UC-05: Live Tracking**: Users shall see real-time updates on their current position in the queue.

### 4.2 Admin Portal
*   **UC-06: Shop Creation**: Owners shall be able to register their shops with essential details.
*   **UC-07: Queue Operations**: Admins shall be able to mark users as 'Serving', 'Completed', or 'Skipped'.
*   **UC-08: Slot Configuration**: Admins shall define operating hours and max slots per time interval.
*   **UC-09: Live Dashboard**: Real-time view of current waiting users and active status.

---

## 5. Non-Functional Requirements
### 5.1 Performance
*   Real-time status updates should reflect within 1 second of change via WebSockets.
*   The system should handle concurrent bookings for multiple shops without data race conditions.

### 5.2 Usability
*   The interface must be responsive for both mobile and desktop users.
*   Navigation should be intuitive with minimal steps for booking a slot.

### 5.3 Reliability
*   The system must ensure that slots aren't overbooked beyond the defined capacity.
*   Data persistence must be guaranteed using SQLite.

---

## 6. Future Enhancements
*   Integration with payment gateways for pre-booking fees.
*   AI-based wait time prediction.
*   SMS/Email notifications for queue alerts.
