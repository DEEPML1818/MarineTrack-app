
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

  // Store message locally
  const stored = await AsyncStorage.getItem(MESSAGES_KEY);
  const messages: ChatMessage[] = stored ? JSON.parse(stored) : [];
  messages.push(message);
  await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));

  // Update chat room
  await updateChatRoom(chatId, message);

  // In production, send to backend:
  // await fetch('https://your-backend/api/messages', {
  //   method: 'POST',
  //   body: JSON.stringify(message)
  // });

  return message;
};

// Get messages for a chat
export const getChatMessages = async (chatId: string): Promise<ChatMessage[]> => {
  const stored = await AsyncStorage.getItem(MESSAGES_KEY);
  const messages: ChatMessage[] = stored ? JSON.parse(stored) : [];
  return messages.filter(m => m.chatId === chatId).sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
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

// Subscribe to new messages (polling simulation)
export const subscribeToMessages = (
  chatId: string,
  callback: (message: ChatMessage) => void
): { unsubscribe: () => void } => {
  let lastCheck = new Date();
  
  const interval = setInterval(async () => {
    const messages = await getChatMessages(chatId);
    const newMessages = messages.filter(m => new Date(m.timestamp) > lastCheck);
    
    newMessages.forEach(callback);
    lastCheck = new Date();
  }, 2000); // Check every 2 seconds

  return {
    unsubscribe: () => clearInterval(interval),
  };
};
