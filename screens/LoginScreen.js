import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { Lock, Mail } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../config/firebase';

// 🟢 Pull your custom theme colors directly from your styles file
import { COLORS } from '../styles/appStyles';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthentication = async () => {
    if (!email || !password) {
      Alert.alert("Hold up!", "Please fill in both your email and password.");
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      // Clean up Firebase error messages to be user-friendly
      let errorMessage = error.message;
      if (error.code === 'auth/invalid-credential') errorMessage = "Invalid email or password.";
      if (error.code === 'auth/email-already-in-use') errorMessage = "An account with this email already exists.";
      if (error.code === 'auth/weak-password') errorMessage = "Password should be at least 6 characters.";
      
      Alert.alert("Authentication Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={localStyles.container}
    >
      <View style={localStyles.innerContainer}>
        
        {/* Header Section */}
        <View style={localStyles.headerContainer}>
          <Text style={localStyles.title}>MF Advisor</Text>
          <Text style={localStyles.subtitle}>
            {isLogin ? 'Welcome back, Investor.' : 'Start growing your wealth today.'}
          </Text>
        </View>

        {/* Input Section */}
        <View style={localStyles.formContainer}>
          <View style={localStyles.inputWrapper}>
            <Mail color={COLORS.textMuted} size={20} style={localStyles.inputIcon} />
            <TextInput
              style={localStyles.input}
              placeholder="Email Address"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={localStyles.inputWrapper}>
            <Lock color={COLORS.textMuted} size={20} style={localStyles.inputIcon} />
            <TextInput
              style={localStyles.input}
              placeholder="Password"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Main Action Button */}
          <TouchableOpacity 
            style={localStyles.button} 
            onPress={handleAuthentication}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={localStyles.buttonText}>{isLogin ? 'Log In' : 'Create Account'}</Text>
            )}
          </TouchableOpacity>

          {/* Toggle Login/Signup */}
          <TouchableOpacity 
            style={localStyles.switchButton} 
            onPress={() => setIsLogin(!isLogin)}
          >
            <Text style={localStyles.switchTextPrimary}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <Text style={localStyles.switchTextHighlight}>
                {isLogin ? "Sign Up" : "Log In"}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

// 🟢 Custom styles mapped to your appStyles.js variables
const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // Deep black background
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  headerContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.textPrimary, // White text
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary, // Light grey text
    letterSpacing: 0.2,
  },
  formContainer: {
    gap: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground, // Dark grey input
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    color: COLORS.textPrimary,
    fontSize: 16,
  },
  button: {
    backgroundColor: COLORS.primary, // Your signature Purple!
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 10,
  },
  switchTextPrimary: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  switchTextHighlight: {
    color: COLORS.primaryLight,
    fontWeight: 'bold',
  }
});