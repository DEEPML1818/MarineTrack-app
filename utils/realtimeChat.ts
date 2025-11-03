
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

interface ChatRoom {
  id: string;
  participants: string[];
  lastMessage?: ChatMessage;
}

const MESSAGES_KEY = '@marinetrack_messages';
const CHAT_ROOMS_KEY = '@marinetrack_chat_rooms';

// Send a message
export const sendMessage = async (
  chatId: string,
  senderId: string,
  senderName: string,
  text: string
): Promise<ChatMessage> => {
  const message: ChatMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    chatId,
    senderId,
    senderName,
    text,
    timestamp: new Date().toISOString(),
  };

  try {
    // Send to backend server
    const { getBackendUrl } = await import('../config');
    const backendUrl = getBackendUrl();
    
    const response = await fetch(`${backendUrl}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const result = await response.json();
    
    // Also store locally as backup
    const stored = await AsyncStorage.getItem(MESSAGES_KEY);
    const messages: ChatMessage[] = stored ? JSON.parse(stored) : [];
    messages.push(message);
    await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));

    // Update chat room
    await updateChatRoom(chatId, message);

    return result.message || message;
  } catch (error) {
    console.error('Error sending message to backend:', error);
    
    // Fallback to local storage only
    const stored = await AsyncStorage.getItem(MESSAGES_KEY);
    const messages: ChatMessage[] = stored ? JSON.parse(stored) : [];
    messages.push(message);
    await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    
    await updateChatRoom(chatId, message);
    return message;
  }
};

// Get messages for a chat
export const getChatMessages = async (chatId: string): Promise<ChatMessage[]> => {
  try {
    // Try to fetch from backend server first
    const { getBackendUrl } = await import('../config');
    const backendUrl = getBackendUrl();
    
    const response = await fetch(`${backendUrl}/api/messages`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const allMessages: ChatMessage[] = await response.json();
    
    // Filter messages for this chat room
    const chatMessages = allMessages.filter(m => m.chatId === chatId).sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    // Store locally as backup
    await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(allMessages));
    
    return chatMessages;
  } catch (error) {
    console.error('Error fetching messages from backend:', error);
    
    // Fallback to local storage
    const stored = await AsyncStorage.getItem(MESSAGES_KEY);
    const messages: ChatMessage[] = stored ? JSON.parse(stored) : [];
    return messages.filter(m => m.chatId === chatId).sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }
};

// Create or get chat room between two users
export const getChatRoom = async (user1Id: string, user2Id: string): Promise<string> => {
  const chatId = [user1Id, user2Id].sort().join('_');
  
  const stored = await AsyncStorage.getItem(CHAT_ROOMS_KEY);
  const rooms: ChatRoom[] = stored ? JSON.parse(stored) : [];
  
  const existing = rooms.find(r => r.id === chatId);
  if (existing) return chatId;

  const newRoom: ChatRoom = {
    id: chatId,
    participants: [user1Id, user2Id],
  };
  
  rooms.push(newRoom);
  await AsyncStorage.setItem(CHAT_ROOMS_KEY, JSON.stringify(rooms));
  
  return chatId;
};

// Update chat room with last message
const updateChatRoom = async (chatId: string, message: ChatMessage): Promise<void> => {
  const stored = await AsyncStorage.getItem(CHAT_ROOMS_KEY);
  const rooms: ChatRoom[] = stored ? JSON.parse(stored) : [];
  
  const room = rooms.find(r => r.id === chatId);
  if (room) {
    room.lastMessage = message;
    await AsyncStorage.setItem(CHAT_ROOMS_KEY, JSON.stringify(rooms));
  }
};

// Subscribe to new messages (polling from backend every 2 seconds)
export const subscribeToMessages = (
  chatId: string,
  callback: (message: ChatMessage) => void
): { unsubscribe: () => void } => {
  let lastMessageTimestamp: string | null = null;
  
  const interval = setInterval(async () => {
    try {
      // Fetch from backend to get real-time messages from other devices
      const messages = await getChatMessages(chatId);
      
      // Filter messages based on the last seen message timestamp, not local clock
      let newMessages: ChatMessage[] = [];
      if (lastMessageTimestamp) {
        const lastTimestamp = new Date(lastMessageTimestamp);
        newMessages = messages.filter(m => new Date(m.timestamp) > lastTimestamp);
      }
      
      newMessages.forEach(callback);
      
      // Update last message timestamp if we have messages
      if (messages.length > 0) {
        const latestMessage = messages[messages.length - 1];
        lastMessageTimestamp = latestMessage.timestamp;
      }
    } catch (error) {
      // Silently fail - will retry on next poll
    }
  }, 2000); // Check every 2 seconds

  return {
    unsubscribe: () => clearInterval(interval),
  };
};
