const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const VESSELS_FILE = path.join(DATA_DIR, 'vessels.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');

app.use(cors());
app.use(express.json());

// Ensure data directory and files exist
async function ensureDataFiles() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    // Initialize vessels file if it doesn't exist
    try {
      await fs.access(VESSELS_FILE);
    } catch {
      await fs.writeFile(VESSELS_FILE, JSON.stringify([], null, 2));
    }
    
    // Initialize users file if it doesn't exist
    try {
      await fs.access(USERS_FILE);
    } catch {
      await fs.writeFile(USERS_FILE, JSON.stringify([], null, 2));
    }
    
    // Initialize messages file if it doesn't exist
    try {
      await fs.access(MESSAGES_FILE);
    } catch {
      await fs.writeFile(MESSAGES_FILE, JSON.stringify([], null, 2));
    }
    
    console.log('Data files initialized');
  } catch (error) {
    console.error('Error ensuring data files:', error);
  }
}

// Read JSON file helper
async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
}

// Write JSON file helper
async function writeJsonFile(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MarineTrack backend server running' });
});

// Get all vessels
app.get('/api/vessels', async (req, res) => {
  try {
    const vessels = await readJsonFile(VESSELS_FILE);
    res.json(vessels);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vessels' });
  }
});

// Get nearby vessels
app.get('/api/vessels/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 100 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }
    
    const vessels = await readJsonFile(VESSELS_FILE);
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const radiusKm = parseFloat(radius);
    
    const nearbyVessels = vessels.filter(vessel => {
      const distance = calculateDistance(
        userLat,
        userLng,
        vessel.location.latitude,
        vessel.location.longitude
      );
      return distance <= radiusKm;
    });
    
    res.json(nearbyVessels);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch nearby vessels' });
  }
});

// Save vessel tracking data
app.post('/api/tracking', async (req, res) => {
  try {
    const trackingData = req.body;
    
    if (!trackingData.userId || !trackingData.vesselInfo || !trackingData.location) {
      return res.status(400).json({ error: 'Invalid tracking data' });
    }
    
    const vessels = await readJsonFile(VESSELS_FILE);
    const existingIndex = vessels.findIndex(v => v.userId === trackingData.userId);
    
    const vesselData = {
      id: trackingData.userId, // Add id field for frontend compatibility
      ...trackingData,
      lastUpdate: new Date().toISOString()
    };
    
    if (existingIndex >= 0) {
      vessels[existingIndex] = vesselData;
    } else {
      vessels.push(vesselData);
    }
    
    await writeJsonFile(VESSELS_FILE, vessels);
    
    // Broadcast to all connected clients
    io.emit('vessel_update', vesselData);
    
    res.json({ success: true, message: 'Tracking data saved' });
  } catch (error) {
    console.error('Error saving tracking data:', error);
    res.status(500).json({ error: 'Failed to save tracking data' });
  }
});

// Save user data
app.post('/api/users', async (req, res) => {
  try {
    const userData = req.body;
    
    if (!userData.id) {
      return res.status(400).json({ error: 'User ID required' });
    }
    
    const users = await readJsonFile(USERS_FILE);
    const existingIndex = users.findIndex(u => u.id === userData.id);
    
    if (existingIndex >= 0) {
      users[existingIndex] = { ...userData, lastLogin: new Date().toISOString() };
    } else {
      users.push({ ...userData, createdAt: new Date().toISOString() });
    }
    
    await writeJsonFile(USERS_FILE, users);
    
    res.json({ success: true, message: 'User data saved' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save user data' });
  }
});

// Get messages
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await readJsonFile(MESSAGES_FILE);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Save message
app.post('/api/messages', async (req, res) => {
  try {
    const message = req.body;
    const messages = await readJsonFile(MESSAGES_FILE);
    
    const newMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    
    messages.push(newMessage);
    await writeJsonFile(MESSAGES_FILE, messages);
    
    // Broadcast to all connected clients
    io.emit('new_message', newMessage);
    
    res.json({ success: true, message: newMessage });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save message' });
  }
});

// Calculate distance helper (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('vessel_location', async (data) => {
    try {
      // Save vessel location
      const vessels = await readJsonFile(VESSELS_FILE);
      const existingIndex = vessels.findIndex(v => v.userId === data.userId);
      
      const vesselData = {
        id: data.userId, // Add id field for frontend compatibility
        ...data,
        lastUpdate: new Date().toISOString()
      };
      
      if (existingIndex >= 0) {
        vessels[existingIndex] = vesselData;
      } else {
        vessels.push(vesselData);
      }
      
      await writeJsonFile(VESSELS_FILE, vessels);
      
      // Broadcast to all other clients
      socket.broadcast.emit('vessel_update', vesselData);
    } catch (error) {
      console.error('Error handling vessel location:', error);
    }
  });
  
  socket.on('chat_message', async (data) => {
    try {
      const messages = await readJsonFile(MESSAGES_FILE);
      const newMessage = {
        ...data,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
      };
      
      messages.push(newMessage);
      await writeJsonFile(MESSAGES_FILE, messages);
      
      // Broadcast to all clients
      io.emit('new_message', newMessage);
    } catch (error) {
      console.error('Error handling chat message:', error);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
async function startServer() {
  await ensureDataFiles();
  
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`MarineTrack backend server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`Data directory: ${DATA_DIR}`);
  });
}

startServer();
