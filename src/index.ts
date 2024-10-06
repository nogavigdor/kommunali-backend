import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';
import storeRoutes from './routes/storeRoutes';
import productRoutes from './routes/productRoutes';
import setupSwagger from './swagger'; // Import Swagger setup
import cors from 'cors';


// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware to parse JSON
app.use(express.json());

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Welcome to Kommunali Backend API!');
});

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/stores/:storeId/products', productRoutes);

// Enable CORS
app.use(cors({
  origin: "*", // Allow requests from any origin
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Allowed methods
  allowedHeaders: "Origin,X-Requested-With,Content-Type,Accept,auth-token" // Allowed headers
}));
// Set up Swagger UI
setupSwagger(app);

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