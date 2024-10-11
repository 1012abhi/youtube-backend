# This is backend of YouTube project 

Here’s an updated `README.md` for your **YouTube Backend** project, including the new feature for **comment tweets**:

---

# YouTube Backend

This is the backend of a YouTube-like platform where users can subscribe to channels, upload videos, manage their subscriptions, view video content, and engage with comment tweets. It provides a set of RESTful APIs for handling user authentication, video uploads, subscriptions, video management, and user interactions through comments.

## Features

- **User Authentication**: Sign up, log in, and log out with token-based authentication (JWT).
- **Video Management**: Upload, update, delete, and view videos.
- **Subscription System**: Subscribe to channels and manage subscriptions.
- **Profile Management**: Users can update their profile, including changing their name, bio, and profile picture.
- **Tweet System**: Users can comment on videos with tweet-like comments (short text messages).
- **Async and Mongoose Aggregation**: Efficient querying and aggregation of video data and subscriptions.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **cloudinary**: store images and videos in cloudinary and temporary user server 
- **Environment Variables**: `dotenv` for managing sensitive configuration

## Getting Started

### Prerequisites

- **Node.js** (v14+)
- **MongoDB** (local or cloud-based)
- **Postman** (for testing API endpoints)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/1012abhi/youtube-backend.git
   cd youtube-backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the root of your project:

   ```plaintext
   PORT=8000
    MONGODB_URI=mongodb+srv://abhish:password@cluster0.265mq.mongodb.net
    CORS_ORIGIN=*
    ACCESS_TOKEN_SECRET=chai-aur-backend
    ACCESS_TOKEN_EXPIRY=1d
    REFRESH_TOKEN_SECRET=chai-aur-backend
    REFRESH_TOKEN_EXPIRY=10d
    
    CLOUDINARY_CLOUD_NAME=
    CLOUDINARY_API_KEY=
    CLOUDINARY_API_SECRET=
   ```

4. **Run the server:**

   ```bash
   npm dev
   ```

   The backend will be running on `http://localhost:8000`.


## Folder Structure

```plaintext
youtube-backend/
│
├── models/             # Mongoose models (User, Video, Subscription, Comment, playlist, like, tweet)
├── routes/             # Express routes
├── controllers/        # Logic for handling routes
├── middleware/         # Authentication and validation middlewares
├── config/             # Configuration for database 
├── utils/              # Utility functions (e.g., for file uploads)
├── .env                # Environment variables
└── README.md           # This file
```

## Contribution

Feel free to contribute to this project by submitting issues or pull requests. Any kind of help is appreciated!

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

Make sure to adapt the routes and features based on your actual implementation of the comment tweet feature!
