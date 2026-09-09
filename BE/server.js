import dotenv from 'dotenv';
// Load environment variables immediately before other imports
dotenv.config();

import connectDB from './config/db';
import app from './app';

//port number is static
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
