
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, TextInput } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { router } from 'expo-router';

interface Message {
  id: string;
  name: string;
  message: string;
  time: string;
  unread?: boolean;
}

export default function ChatScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const messages: Message[] = [
    { id: '1', name: 'Sarah Thomas', message: "Hello! I've arrived the location. I'd start the engine...", time: '10:24 PM', unread: true },
    { id: '2', name: 'Sarah Thomas', message: 'Great! Please let me know if you have any...', time: '10:24 PM' },
    { id: '3', name: 'Simone Adani', message: 'I appreciate it.', time: '10:24 PM' },
    { id: '4', name: 'Michael Thompson', message: 'See you later!', time: '10:24 PM' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}>
      <View style={[styles.header, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color={isDark ? '#FFF' : '#000'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#000' }]}>Messages</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {messages.map((msg) => (
          <TouchableOpacity 
            key={msg.id}
            style={[styles.messageCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}
          >
            <Image 
              source={require('@/assets/images/partial-react-logo.png')}
              style={styles.avatar}
            />
            <View style={styles.messageContent}>
              <View style={styles.messageHeader}>
                <Text style={[styles.messageName, { color: isDark ? '#FFF' : '#000' }]}>{msg.name}</Text>
                <Text style={[styles.messageTime, { color: isDark ? '#8E8E93' : '#6C6C70' }]}>{msg.time}</Text>
              </View>
              <Text 
                style={[styles.messageText, { color: isDark ? '#8E8E93' : '#6C6C70' }]}
                numberOfLines={1}
              >
                {msg.message}
              </Text>
            </View>
            {msg.unread && <View style={styles.unreadBadge} />}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messageCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  messageName: {
    fontSize: 16,
    fontWeight: '600',
  },
  messageTime: {
    fontSize: 12,
  },
  messageText: {
    fontSize: 14,
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
});
