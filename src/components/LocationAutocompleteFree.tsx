import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

interface AddressSuggestion {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    house_number?: string;
    road?: string;
    city?: string;
    postcode?: string;
    country?: string;
  };
}

interface LocationAutocompleteProps {
  value: string;
  onLocationSelect: (address: string, latitude?: number, longitude?: number) => void;
  placeholder?: string;
  colors: any;
  style?: any;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onLocationSelect,
  placeholder = "Adresse eingeben...",
  colors,
  style,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // OpenStreetMap Nominatim API (kostenlos!)
  const searchAddresses = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Nominatim API - kostenlos für OpenStreetMap
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ch&limit=8&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'RhyConnect-PartyApp/1.0 (contact@rhyconnect.ch)', // Höflicher User-Agent
          },
        }
      );

      if (response.ok) {
        const data: AddressSuggestion[] = await response.json();
        
        // Filtere und formatiere die Ergebnisse
        const formattedSuggestions = data
          .filter(item => item.display_name && item.lat && item.lon)
          .map(item => ({
            ...item,
            display_name: item.display_name.replace(', Schweiz', '').replace(', Switzerland', ''), // Kürzer machen
          }));

        setSuggestions(formattedSuggestions);
        setShowSuggestions(formattedSuggestions.length > 0);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Adressen:', error);
      // Fallback auf lokale Vorschläge
      showLocalSuggestions(query);
    } finally {
      setIsLoading(false);
    }
  };

  // Lokale Fallback-Vorschläge für Basel
  const showLocalSuggestions = (query: string) => {
    const localSuggestions = [
      { place_id: 'local1', display_name: 'Marktplatz, 4001 Basel', lat: '47.5584', lon: '7.5733' },
      { place_id: 'local2', display_name: 'Münsterplatz, 4001 Basel', lat: '47.5565', lon: '7.5917' },
      { place_id: 'local3', display_name: 'Centralbahnplatz, 4001 Basel', lat: '47.5474', lon: '7.5901' },
      { place_id: 'local4', display_name: 'Rheingasse, 4001 Basel', lat: '47.5606', lon: '7.5909' },
      { place_id: 'local5', display_name: 'Universität Basel, Petersplatz', lat: '47.5584', lon: '7.5804' },
    ].filter(item => 
      item.display_name.toLowerCase().includes(query.toLowerCase())
    );

    setSuggestions(localSuggestions as AddressSuggestion[]);
    setShowSuggestions(localSuggestions.length > 0);
  };

  const handleInputChange = (text: string) => {
    setInputValue(text);
    
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Debounced search
    debounceTimer.current = setTimeout(() => {
      searchAddresses(text);
    }, 500); // 500ms delay um API-Calls zu reduzieren
  };

  const handleSuggestionSelect = (suggestion: AddressSuggestion) => {
    const address = suggestion.display_name;
    const latitude = parseFloat(suggestion.lat);
    const longitude = parseFloat(suggestion.lon);

    setInputValue(address);
    setShowSuggestions(false);
    setSuggestions([]);
    
    onLocationSelect(address, latitude, longitude);
  };

  const handleUseCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Berechtigung benötigt',
          'Um deinen aktuellen Standort zu verwenden, benötigen wir Zugriff auf deine Position.',
          [
            { text: 'Berechtigung erteilen', onPress: handleUseCurrentLocation },
            { text: 'Abbrechen', style: 'cancel' }
          ]
        );
        return;
      }

      setIsLoading(true);
      const currentLocation = await Location.getCurrentPositionAsync({});
      const { latitude: lat, longitude: lng } = currentLocation.coords;

      // Reverse Geocoding mit Nominatim
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'RhyConnect-PartyApp/1.0 (contact@rhyconnect.ch)',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const address = data.display_name?.replace(', Schweiz', '').replace(', Switzerland', '') || 
                         `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          
          setInputValue(address);
          onLocationSelect(address, lat, lng);
          Alert.alert('Standort gesetzt', `Dein aktueller Standort: ${address}`);
        }
      } catch (error) {
        // Fallback ohne Adress-Namen
        const address = `Standort: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        setInputValue(address);
        onLocationSelect(address, lat, lng);
        Alert.alert('Standort gesetzt', 'GPS-Koordinaten wurden verwendet.');
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Fehler', 'Standort konnte nicht ermittelt werden.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.text }]}>Ort *</Text>
        <TouchableOpacity 
          style={[styles.gpsButton, { backgroundColor: colors.primary }]}
          onPress={handleUseCurrentLocation}
          disabled={isLoading}
        >
          <Ionicons 
            name={isLoading ? "sync" : "location"} 
            size={16} 
            color={colors.primaryText} 
          />
          <Text style={[styles.gpsButtonText, { color: colors.primaryText }]}>
            GPS nutzen
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="location-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={inputValue}
          onChangeText={handleInputChange}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          autoComplete="off"
          autoCorrect={false}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
        />
        {isLoading && (
          <Ionicons name="sync" size={20} color={colors.primary} style={styles.loadingIcon} />
        )}
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={[styles.suggestionsContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ScrollView 
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={styles.scrollView}
          >
            {suggestions.map((suggestion) => (
              <TouchableOpacity
                key={suggestion.place_id}
                style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
                onPress={() => handleSuggestionSelect(suggestion)}
              >
                <Ionicons name="location-outline" size={18} color={colors.primary} style={styles.suggestionIcon} />
                <View style={styles.suggestionText}>
                  <Text style={[styles.suggestionMainText, { color: colors.text }]} numberOfLines={2}>
                    {suggestion.display_name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 4,
  },
  gpsButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    minHeight: 24,
  },
  loadingIcon: {
    marginLeft: 8,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderRadius: 8,
    borderWidth: 1,
    maxHeight: 200,
    zIndex: 1001,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
  },
  suggestionMainText: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
});

export default LocationAutocomplete;