import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootState, AppDispatch } from '../store';
import { firebaseLogin, firebaseRegister, firebaseLogout, clearError } from '../store/authSlice';
import { RootStackParamList, LoginForm, RegisterForm } from '../types';
import { Ionicons } from '@expo/vector-icons';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoggedIn, isLoading, error } = useSelector((state: RootState) => state.auth);
  const { colors } = useSelector((state: RootState) => state.theme);
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loginForm, setLoginForm] = useState<LoginForm>({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });

  const handleLogin = () => {
    dispatch(clearError());
    dispatch(firebaseLogin(loginForm));
  };

  const handleRegister = () => {
    dispatch(clearError());
    dispatch(firebaseRegister(registerForm));
  };

  const handleLogout = () => {
    Alert.alert(
      'Abmelden',
      'Möchten Sie sich wirklich abmelden?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        { text: 'Abmelden', style: 'destructive', onPress: () => dispatch(firebaseLogout()) },
      ]
    );
  };

  const resetForms = () => {
    setLoginForm({ email: '', password: '' });
    setRegisterForm({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      displayName: '',
    });
    dispatch(clearError());
  };

  const switchMode = () => {
    setIsLoginMode(!isLoginMode);
    resetForms();
  };

  if (isLoggedIn && user) {
    // User ist eingeloggt - Profil anzeigen
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>Profil</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={28} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* User Info */}
        <View style={{ backgroundColor: colors.surface, margin: 20, borderRadius: 12, padding: 20 }}>
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <View style={{ backgroundColor: colors.primary, width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 15 }}>
              <Text style={{ color: colors.primaryText, fontSize: 32, fontWeight: 'bold' }}>
                {user.displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold' }}>{user.displayName}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 16 }}>@{user.username}</Text>
          </View>

          <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Ionicons name="mail-outline" size={20} color={colors.primary} />
              <Text style={{ color: colors.textSecondary, fontSize: 16, marginLeft: 12 }}>{user.email}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <Text style={{ color: colors.textSecondary, fontSize: 16, marginLeft: 12 }}>
                Mitglied seit {new Date(user.createdAt).toLocaleDateString('de-DE')}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="person-outline" size={20} color={colors.primary} />
              <Text style={{ color: colors.textSecondary, fontSize: 16, marginLeft: 12 }}>User ID: {user.id}</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 40 }}>
          <TouchableOpacity 
            style={{ backgroundColor: colors.primary, padding: 15, borderRadius: 10, marginBottom: 10 }}
            onPress={() => navigation.navigate('CreateEvent')}
          >
            <Text style={{ color: colors.primaryText, fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}>
              Event erstellen
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={{ backgroundColor: colors.card, padding: 15, borderRadius: 10 }}
            onPress={handleLogout}
          >
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}>
              Abmelden
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // User ist nicht eingeloggt - Login/Register Forms
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>
          {isLoginMode ? 'Anmelden' : 'Registrieren'}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Form */}
      <View style={{ backgroundColor: colors.surface, margin: 20, borderRadius: 12, padding: 20 }}>
        <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
          {isLoginMode ? 'Willkommen zurück!' : 'Account erstellen'}
        </Text>

        {error && (
          <View style={{ backgroundColor: '#ff4444', padding: 12, borderRadius: 8, marginBottom: 20 }}>
            <Text style={{ color: '#ffffff', textAlign: 'center' }}>{error}</Text>
          </View>
        )}

        {isLoginMode ? (
          // Login Form
          <View>
            <TextInput
              style={{ backgroundColor: colors.card, color: colors.text, padding: 15, borderRadius: 8, marginBottom: 15, fontSize: 16 }}
              placeholder="E-Mail"
              placeholderTextColor={colors.textSecondary}
              value={loginForm.email}
              onChangeText={(text) => setLoginForm({ ...loginForm, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={{ backgroundColor: colors.card, color: colors.text, padding: 15, borderRadius: 8, marginBottom: 20, fontSize: 16 }}
              placeholder="Passwort"
              placeholderTextColor={colors.textSecondary}
              value={loginForm.password}
              onChangeText={(text) => setLoginForm({ ...loginForm, password: text })}
              secureTextEntry
            />
            <TouchableOpacity
              style={{ backgroundColor: colors.primary, padding: 15, borderRadius: 8, marginBottom: 15 }}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={{ color: colors.primaryText, fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}>
                {isLoading ? 'Anmelden...' : 'Anmelden'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Register Form
          <View>
            <TextInput
              style={{ backgroundColor: colors.card, color: colors.text, padding: 15, borderRadius: 8, marginBottom: 15, fontSize: 16 }}
              placeholder="Benutzername"
              placeholderTextColor={colors.textSecondary}
              value={registerForm.username}
              onChangeText={(text) => setRegisterForm({ ...registerForm, username: text })}
              autoCapitalize="none"
            />
            <TextInput
              style={{ backgroundColor: colors.card, color: colors.text, padding: 15, borderRadius: 8, marginBottom: 15, fontSize: 16 }}
              placeholder="Anzeigename"
              placeholderTextColor={colors.textSecondary}
              value={registerForm.displayName}
              onChangeText={(text) => setRegisterForm({ ...registerForm, displayName: text })}
            />
            <TextInput
              style={{ backgroundColor: colors.card, color: colors.text, padding: 15, borderRadius: 8, marginBottom: 15, fontSize: 16 }}
              placeholder="E-Mail"
              placeholderTextColor={colors.textSecondary}
              value={registerForm.email}
              onChangeText={(text) => setRegisterForm({ ...registerForm, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={{ backgroundColor: colors.card, color: colors.text, padding: 15, borderRadius: 8, marginBottom: 15, fontSize: 16 }}
              placeholder="Passwort"
              placeholderTextColor={colors.textSecondary}
              value={registerForm.password}
              onChangeText={(text) => setRegisterForm({ ...registerForm, password: text })}
              secureTextEntry
            />
            <TextInput
              style={{ backgroundColor: colors.card, color: colors.text, padding: 15, borderRadius: 8, marginBottom: 20, fontSize: 16 }}
              placeholder="Passwort bestätigen"
              placeholderTextColor={colors.textSecondary}
              value={registerForm.confirmPassword}
              onChangeText={(text) => setRegisterForm({ ...registerForm, confirmPassword: text })}
              secureTextEntry
            />
            <TouchableOpacity
              style={{ backgroundColor: colors.primary, padding: 15, borderRadius: 8, marginBottom: 15 }}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text style={{ color: colors.primaryText, fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}>
                {isLoading ? 'Registrieren...' : 'Account erstellen'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Switch Mode */}
        <TouchableOpacity onPress={switchMode}>
          <Text style={{ color: colors.primary, textAlign: 'center', fontSize: 16 }}>
            {isLoginMode ? 'Noch kein Account? Registrieren' : 'Bereits registriert? Anmelden'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;