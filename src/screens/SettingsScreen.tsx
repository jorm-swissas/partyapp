import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootState } from '../store';
import { setThemeMode } from '../store/themeSlice';
import { RootStackParamList, ThemeMode } from '../types';
import { Ionicons } from '@expo/vector-icons';

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const dispatch = useDispatch();
  const { colors, mode } = useSelector((state: RootState) => state.theme);
  const { user } = useSelector((state: RootState) => state.auth);

  const themeOptions: { mode: ThemeMode; label: string; icon: string }[] = [
    { mode: 'auto', label: 'Gerätedefiniert', icon: 'phone-portrait-outline' },
    { mode: 'light', label: 'Hell', icon: 'sunny-outline' },
    { mode: 'dark', label: 'Dunkel', icon: 'moon-outline' },
  ];

  const handleThemeChange = (newMode: ThemeMode) => {
    dispatch(setThemeMode(newMode));
  };

  const handleAbout = () => {
    Alert.alert(
      'Über RhyConnect',
      'Version 1.0.0\n\nEine App zum Organisieren und Entdecken von Events in deiner Nähe.\n\nEntwickelt mit React Native & Expo.',
      [{ text: 'OK' }]
    );
  };

  const handleSupport = () => {
    Alert.alert(
      'Support',
      'Bei Fragen oder Problemen kannst du uns gerne kontaktieren:\n\nsupport@rhyconnect.app',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingHorizontal: 20, 
        paddingTop: 50, 
        paddingBottom: 20,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>Einstellungen</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Theme Section */}
        <View style={{ backgroundColor: colors.card, margin: 20, borderRadius: 12, padding: 20 }}>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>
            Darstellung
          </Text>
          
          {themeOptions.map((option) => (
            <TouchableOpacity
              key={option.mode}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 16,
                marginBottom: 8,
                backgroundColor: mode === option.mode ? colors.primary : colors.surface,
                borderRadius: 8,
              }}
              onPress={() => handleThemeChange(option.mode)}
            >
              <Ionicons 
                name={option.icon as any} 
                size={24} 
                color={mode === option.mode ? colors.primaryText : colors.primary} 
              />
              <Text style={{
                color: mode === option.mode ? colors.primaryText : colors.text,
                fontSize: 16,
                fontWeight: mode === option.mode ? '600' : '500',
                marginLeft: 12,
                flex: 1
              }}>
                {option.label}
              </Text>
              {mode === option.mode && (
                <Ionicons name="checkmark" size={20} color={colors.primaryText} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* App Settings */}
        <View style={{ backgroundColor: colors.card, marginHorizontal: 20, marginBottom: 20, borderRadius: 12, padding: 20 }}>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>
            App-Einstellungen
          </Text>
          
          <TouchableOpacity style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            paddingHorizontal: 16,
            marginBottom: 8,
            backgroundColor: colors.surface,
            borderRadius: 8,
          }}>
            <Ionicons name="notifications-outline" size={24} color={colors.primary} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '500' }}>
                Benachrichtigungen
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                Über neue Events informiert werden
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            paddingHorizontal: 16,
            marginBottom: 8,
            backgroundColor: colors.surface,
            borderRadius: 8,
          }}>
            <Ionicons name="location-outline" size={24} color={colors.primary} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '500' }}>
                Standort
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                Events in deiner Nähe finden
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={{ backgroundColor: colors.card, marginHorizontal: 20, marginBottom: 20, borderRadius: 12, padding: 20 }}>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>
            Über die App
          </Text>
          
          <TouchableOpacity 
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
              paddingHorizontal: 16,
              marginBottom: 8,
              backgroundColor: colors.surface,
              borderRadius: 8,
            }}
            onPress={handleAbout}
          >
            <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '500', marginLeft: 12, flex: 1 }}>
              App-Info
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
              paddingHorizontal: 16,
              marginBottom: 8,
              backgroundColor: colors.surface,
              borderRadius: 8,
            }}
            onPress={handleSupport}
          >
            <Ionicons name="help-circle-outline" size={24} color={colors.primary} />
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '500', marginLeft: 12, flex: 1 }}>
              Hilfe & Support
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            paddingHorizontal: 16,
            backgroundColor: colors.surface,
            borderRadius: 8,
          }}>
            <Ionicons name="shield-checkmark-outline" size={24} color={colors.primary} />
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '500', marginLeft: 12, flex: 1 }}>
              Datenschutz
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* User Info */}
        {user && (
          <View style={{ backgroundColor: colors.card, marginHorizontal: 20, marginBottom: 40, borderRadius: 12, padding: 20 }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>
              Account-Info
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="person-outline" size={20} color={colors.primary} />
              <Text style={{ color: colors.textSecondary, fontSize: 14, marginLeft: 8 }}>
                Angemeldet als: {user.displayName}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="mail-outline" size={20} color={colors.primary} />
              <Text style={{ color: colors.textSecondary, fontSize: 14, marginLeft: 8 }}>
                {user.email}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;