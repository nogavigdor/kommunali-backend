import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON
app.use(express.json());

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Welcome to Kommunali Backend API!');
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || '', {
 // useNewUrlParser: true,
  //useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});