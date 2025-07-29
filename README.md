# Academic Evaluation & Monitoring System

A full-stack MERN application designed for colleges to manage student-proctor interactions, including document verification, quizzes, project submissions, and performance analytics.

## Features

- **Role-Based Authentication**: Secure login for Students and Proctors.
- **Real-time Notifications**: Instant alerts for important events.
- **Document Management**: Upload, view, and approve/reject documents.
- **Dynamic Quizzes**: Proctors can create timed quizzes, and students can take them and view results instantly.
- **Project Submissions**: Students can submit projects, and proctors can grade them and provide feedback.
- **Real-time Chat**: Instant messaging between students and their assigned proctors.
- **And many more...**

## Built With

* **Frontend**: React, Tailwind CSS, Framer Motion, Socket.IO Client
* **Backend**: Node.js, Express.js, MongoDB (with Mongoose)
* **Real-time**: Socket.IO

## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

* Node.js
* npm
* MongoDB

### Installation

1.  Clone the repo
    ```sh
    git clone https://your_repo_link.com
    ```
2.  Install backend dependencies
    ```sh
    cd server && npm install
    ```
3.  Install frontend dependencies
    ```sh
    cd ../client && npm install
    ```
4.  Create a `.env` file in the `server` directory and add your variables:
    ```
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    PORT=8080
    ```

### Running the Application

1.  Run the backend server from the `/server` directory:
    ```sh
    npm run dev
    ```
2.  Run the frontend client from the `/client` directory:
    ```sh
    npm start
    ```