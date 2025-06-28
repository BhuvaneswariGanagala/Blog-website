import mongoose from 'mongoose';

/**
 * Database connection utilities for MongoDB using Mongoose
 * Following Context.md specifications for MongoDB Atlas integration
 */

// MongoDB connection string from environment variables
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://gganagalabhuvaneswari:Bhuvana%40123@cluster0.7id4pfx.mongodb.net/mern_admin?retryWrites=true&w=majority&appName=Cluster0';

// Connection options - removed deprecated options
const connectionOptions = {
  maxPoolSize: 10, // Maximum number of connections in the pool
  serverSelectionTimeoutMS: 10000, // Increased timeout for server selection
  socketTimeoutMS: 45000, // Timeout for socket operations
  connectTimeoutMS: 10000, // Timeout for initial connection
};

/**
 * Connect to MongoDB Atlas
 * @returns {Promise<mongoose.Connection>} Database connection
 */
export const connectToDatabase = async () => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log('✅ Already connected to MongoDB');
      return mongoose.connection;
    }

    console.log('🔄 Connecting to MongoDB Atlas...');
    
    const connection = await mongoose.connect(MONGO_URI, connectionOptions);
    
    console.log('✅ Successfully connected to MongoDB Atlas');
    console.log(`📊 Database: ${connection.connection.name}`);
    console.log(`🌐 Host: ${connection.connection.host}`);
    
    return connection;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    throw error;
  }
};

/**
 * Disconnect from MongoDB
 * @returns {Promise<void>}
 */
export const disconnectFromDatabase = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('✅ Disconnected from MongoDB');
    }
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error.message);
    throw error;
  }
};

/**
 * Check database connection status
 * @returns {Object} Connection status information
 */
export const getConnectionStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  return {
    readyState: mongoose.connection.readyState,
    status: states[mongoose.connection.readyState],
    name: mongoose.connection.name,
    host: mongoose.connection.host,
    port: mongoose.connection.port
  };
};

/**
 * Handle database connection events
 */
export const setupDatabaseEvents = () => {
  mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB connection established');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB connection disconnected');
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    await disconnectFromDatabase();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await disconnectFromDatabase();
    process.exit(0);
  });
};

/**
 * Initialize database connection with event handling
 * @returns {Promise<mongoose.Connection>} Database connection
 */
export const initializeDatabase = async () => {
  setupDatabaseEvents();
  return await connectToDatabase();
};

// Export default connection function
export default connectToDatabase; 