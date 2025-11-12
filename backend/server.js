
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
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json');
const BOAT_LIKES_FILE = path.join(DATA_DIR, 'boat_likes.json');
const BOAT_COMMENTS_FILE = path.join(DATA_DIR, 'boat_comments.json');
const PORTS_FILE = path.join(DATA_DIR, 'ports.json');

app.use(cors());
app.use(express.json());

async function ensureDataFiles() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    const files = [
      { path: VESSELS_FILE, data: [] },
      { path: USERS_FILE, data: [] },
      { path: MESSAGES_FILE, data: [] },
      { path: NOTIFICATIONS_FILE, data: [] },
      { path: BOAT_LIKES_FILE, data: [] },
      { path: BOAT_COMMENTS_FILE, data: [] }
    ];
    
    for (const file of files) {
      try {
        await fs.access(file.path);
      } catch {
        await fs.writeFile(file.path, JSON.stringify(file.data, null, 2));
      }
    }
    
    console.log('Data files initialized');
  } catch (error) {
    console.error('Error ensuring data files:', error);
  }
}

async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
}

async function writeJsonFile(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MarineTrack backend server running' });
});

app.get('/api/vessels', async (req, res) => {
  try {
    const vessels = await readJsonFile(VESSELS_FILE);
    res.json(vessels);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vessels' });
  }
});

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

app.post('/api/tracking', async (req, res) => {
  try {
    const trackingData = req.body;
    
    if (!trackingData.userId || !trackingData.vesselInfo || !trackingData.location) {
      return res.status(400).json({ error: 'Invalid tracking data' });
    }
    
    const vessels = await readJsonFile(VESSELS_FILE);
    const existingIndex = vessels.findIndex(v => v.userId === trackingData.userId);
    
    const vesselData = {
      id: trackingData.userId,
      ...trackingData,
      lastUpdate: new Date().toISOString()
    };
    
    if (existingIndex >= 0) {
      vessels[existingIndex] = vesselData;
    } else {
      vessels.push(vesselData);
    }
    
    await writeJsonFile(VESSELS_FILE, vessels);
    io.emit('vessel_update', vesselData);
    
    res.json({ success: true, message: 'Tracking data saved' });
  } catch (error) {
    console.error('Error saving tracking data:', error);
    res.status(500).json({ error: 'Failed to save tracking data' });
  }
});

app.get('/api/messages', async (req, res) => {
  try {
    const messages = await readJsonFile(MESSAGES_FILE);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

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
    
    io.emit('new_message', newMessage);
    
    res.json({ success: true, message: newMessage });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save message' });
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('vessel_location', async (data) => {
    try {
      const vessels = await readJsonFile(VESSELS_FILE);
      const existingIndex = vessels.findIndex(v => v.userId === data.userId);
      
      const vesselData = {
        id: data.userId,
        ...data,
        lastUpdate: new Date().toISOString()
      };
      
      if (existingIndex >= 0) {
        vessels[existingIndex] = vesselData;
      } else {
        vessels.push(vesselData);
      }
      
      await writeJsonFile(VESSELS_FILE, vessels);
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
      io.emit('new_message', newMessage);
    } catch (error) {
      console.error('Error handling chat message:', error);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

async function startServer() {
  await ensureDataFiles();
  
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`MarineTrack backend server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`Data directory: ${DATA_DIR}`);
  });
}

startServer();
