import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { createGuestUser, storeUser, User } from '@/utils/auth';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

// Import database service
import { saveUserToDatabase } from '@/utils/database';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  // Google Sign-In configuration with actual credentials
  const GOOGLE_WEB_CLIENT_ID = '960630751878-tpdhcrjg031td64gt1r0ae59ht856en9.apps.googleusercontent.com';
  const GOOGLE_ANDROID_CLIENT_ID = '960630751878-rmkfkc6pfjutt2qo9n5rguqjc96mncsk.apps.googleusercontent.com';

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleGoogleSignInSuccess(authentication);
    }
  }, [response]);

  const handleGoogleSignInSuccess = async (authentication: any) => {
    setLoading(true);
    try {
      // Fetch user info from Google
      const userInfoResponse = await fetch(
        'https://www.googleapis.com/userinfo/v2/me',
        {
          headers: { Authorization: `Bearer ${authentication.accessToken}` },
        }
      );
      const userInfo = await userInfoResponse.json();

      const user: User = {
        id: `google_${userInfo.id}`,
        email: userInfo.email,
        name: userInfo.name,
        photoUrl: userInfo.picture,
        isGuest: false,
        createdAt: new Date().toISOString()
      };

      // Store user in AsyncStorage and database
      await storeUser(user);

      await saveUserToDatabase({
        id: user.id,
        email: user.email,
        name: user.name,
        photoUrl: user.photoUrl,
        isGuest: false,
        createdAt: user.createdAt,
        lastLogin: new Date().toISOString(),
      });

      setLoading(false);
      router.replace('/(tabs)');
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to sign in with Google. Please try another method.');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await promptAsync();
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to initiate Google sign-in. Please try another method.');
    }
  };

  const handleEmailPasswordSignIn = () => {
    router.push('/auth/email-login');
  };

  const handleGuestMode = async () => {
    setLoading(true);
    try {
      await createGuestUser();
      setLoading(false);
      router.replace('/(tabs)');
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to continue as guest');
    }
  };

  const handleRegister = () => {
    router.push('/auth/register');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        <Text style={styles.logo}>🌊</Text>
        <Text style={[styles.title, { color: colors.primary }]}>MarineTrack</Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Your Safety Companion at Sea - Malaysia
        </Text>

        <View style={styles.form}>
          <TouchableOpacity
            style={[styles.googleButton, { backgroundColor: '#fff', borderColor: colors.border }]}
            onPress={handleGoogleSignIn}
            disabled={loading || !request}
          >
            <Text style={styles.googleIcon}>G</Text>
            <Text style={[styles.googleButtonText, { color: '#000' }]}>
              Continue with Google
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.icon }]}>OR</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          <TouchableOpacity
            style={[styles.emailButton, { backgroundColor: colors.primary }]}
            onPress={handleEmailPasswordSignIn}
            disabled={loading}
          >
            <Text style={styles.emailButtonText}>Sign in with Email</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.guestButton, { borderColor: colors.border }]}
            onPress={handleGuestMode}
            disabled={loading}
          >
            <Text style={[styles.guestButtonText, { color: colors.primary }]}>
              Continue as Guest
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleRegister} disabled={loading}>
            <Text style={[styles.registerText, { color: colors.icon }]}>
              Don't have an account? <Text style={{ color: colors.primary }}>Register</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    fontSize: 80,
    textAlign: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    gap: 16,
  },
  googleButton: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  googleIcon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emailButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emailButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  guestButton: {
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  registerText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
  },
});