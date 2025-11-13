import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TasksLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: isDark ? '#1C1C1E' : '#FFF',
        },
        headerTintColor: isDark ? '#FFF' : '#000',
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="[id]" 
        options={{ 
          title: 'Task Details',
          headerBackTitle: 'Tasks'
        }} 
      />
    </Stack>
  );
}
