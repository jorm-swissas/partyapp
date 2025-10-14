import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Keyboard,
} from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

interface AddressSuggestion {
  id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
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
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Realistische Basel/Schweiz Adressen für Demo
  const generateMockSuggestions = (query: string): AddressSuggestion[] => {
    if (query.length < 2) return [];
    
    const allAddresses = [
      // Basel Zentrum
      { id: 'basel1', description: 'Marktplatz, 4001 Basel, Schweiz', structured_formatting: { main_text: 'Marktplatz', secondary_text: '4001 Basel, Schweiz' }},
      { id: 'basel2', description: 'Münsterplatz, 4001 Basel, Schweiz', structured_formatting: { main_text: 'Münsterplatz', secondary_text: '4001 Basel, Schweiz' }},
      { id: 'basel3', description: 'Rheingasse, 4001 Basel, Schweiz', structured_formatting: { main_text: 'Rheingasse', secondary_text: '4001 Basel, Schweiz' }},
      { id: 'basel4', description: 'Centralbahnplatz, 4001 Basel, Schweiz', structured_formatting: { main_text: 'Centralbahnplatz', secondary_text: '4001 Basel, Schweiz' }},
      { id: 'basel5', description: 'Barfüsserplatz, 4001 Basel, Schweiz', structured_formatting: { main_text: 'Barfüsserplatz', secondary_text: '4001 Basel, Schweiz' }},
      
      // Basel Quartiere
      { id: 'basel6', description: 'Steinenvorstadt, 4001 Basel, Schweiz', structured_formatting: { main_text: 'Steinenvorstadt', secondary_text: '4001 Basel, Schweiz' }},
      { id: 'basel7', description: 'Claraplatz, 4001 Basel, Schweiz', structured_formatting: { main_text: 'Claraplatz', secondary_text: '4001 Basel, Schweiz' }},
      { id: 'basel8', description: 'Johanniterbrücke, 4001 Basel, Schweiz', structured_formatting: { main_text: 'Johanniterbrücke', secondary_text: '4001 Basel, Schweiz' }},
      
      // Universitäten & Hochschulen
      { id: 'uni1', description: 'Universität Basel, Petersplatz 1, 4001 Basel, Schweiz', structured_formatting: { main_text: 'Universität Basel', secondary_text: 'Petersplatz 1, Basel' }},
      { id: 'uni2', description: 'Fachhochschule Nordwestschweiz, 4001 Basel, Schweiz', structured_formatting: { main_text: 'FHNW', secondary_text: 'Basel' }},
      
      // Andere Schweizer Städte
      { id: 'zh1', description: 'Bahnhofstrasse, 8001 Zürich, Schweiz', structured_formatting: { main_text: 'Bahnhofstrasse', secondary_text: '8001 Zürich, Schweiz' }},
      { id: 'zh2', description: 'ETH Zürich, 8092 Zürich, Schweiz', structured_formatting: { main_text: 'ETH Zürich', secondary_text: '8092 Zürich, Schweiz' }},
      { id: 'be1', description: 'Bundesplatz, 3001 Bern, Schweiz', structured_formatting: { main_text: 'Bundesplatz', secondary_text: '3001 Bern, Schweiz' }},
      { id: 'lu1', description: 'Kapellbrücke, 6002 Luzern, Schweiz', structured_formatting: { main_text: 'Kapellbrücke', secondary_text: '6002 Luzern, Schweiz' }},
    ];

    // Filter basierend auf Query - sehr permissiv
    const queryLower = query.toLowerCase();
    const filtered = allAddresses.filter(addr => {
      const descLower = addr.description.toLowerCase();
      const mainTextLower = addr.structured_formatting.main_text.toLowerCase();
      const secondaryTextLower = addr.structured_formatting.secondary_text.toLowerCase();
      
      return descLower.includes(queryLower) || 
             mainTextLower.includes(queryLower) ||
             secondaryTextLower.includes(queryLower) ||
             mainTextLower.startsWith(queryLower) ||
             // Auch Teilwörter matchen
             queryLower.split('').every(char => mainTextLower.includes(char));
    });

    // Falls keine Treffer, zeige Basel-Standards
    if (filtered.length === 0) {
      return allAddresses.filter(addr => addr.description.includes('Basel')).slice(0, 5);
    }

    return filtered.slice(0, 8); // Maximal 8 Vorschläge
  };

  const handleInputChange = (text: string) => {
    setInputValue(text);
    
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer for debounced search
    debounceTimer.current = setTimeout(() => {
      if (text.length >= 2) {
        setIsLoading(true);
        const mockSuggestions = generateMockSuggestions(text);
        setSuggestions(mockSuggestions);
        setShowSuggestions(true);
        setIsLoading(false);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
  };

  const handleSuggestionSelect = async (suggestion: AddressSuggestion) => {
    setInputValue(suggestion.description);
    setShowSuggestions(false);
    Keyboard.dismiss();

    // Echte Koordinaten für bekannte Orte
    let lat: number | undefined;
    let lng: number | undefined;

    // Basel Zentrum - exakte Koordinaten
    if (suggestion.description.includes('Marktplatz')) {
      lat = 47.5584; lng = 7.5733;
    } else if (suggestion.description.includes('Münsterplatz')) {
      lat = 47.5565; lng = 7.5917;
    } else if (suggestion.description.includes('Rheingasse')) {
      lat = 47.5606; lng = 7.5909;
    } else if (suggestion.description.includes('Centralbahnplatz')) {
      lat = 47.5474; lng = 7.5901;
    } else if (suggestion.description.includes('Barfüsserplatz')) {
      lat = 47.5576; lng = 7.5891;
    } else if (suggestion.description.includes('Steinenvorstadt')) {
      lat = 47.5561; lng = 7.5870;
    } else if (suggestion.description.includes('Claraplatz')) {
      lat = 47.5614; lng = 7.5927;
    } else if (suggestion.description.includes('Johanniterbrücke')) {
      lat = 47.5593; lng = 7.5938;
    } else if (suggestion.description.includes('Universität Basel')) {
      lat = 47.5584; lng = 7.5804;
    } else if (suggestion.description.includes('FHNW')) {
      lat = 47.5352; lng = 7.6144;
    }
    // Andere Schweizer Städte
    else if (suggestion.description.includes('Bahnhofstrasse') && suggestion.description.includes('Zürich')) {
      lat = 47.3769; lng = 8.5417;
    } else if (suggestion.description.includes('ETH Zürich')) {
      lat = 47.3774; lng = 8.5486;
    } else if (suggestion.description.includes('Bundesplatz') && suggestion.description.includes('Bern')) {
      lat = 46.9463; lng = 7.4444;
    } else if (suggestion.description.includes('Kapellbrücke')) {
      lat = 47.0518; lng = 8.3095;
    }
    // Fallback für Basel allgemein
    else if (suggestion.description.includes('Basel')) {
      lat = 47.5596; lng = 7.5886;
    } else if (suggestion.description.includes('Zürich')) {
      lat = 47.3769; lng = 8.5417;
    } else if (suggestion.description.includes('Bern')) {
      lat = 46.9480; lng = 7.4474;
    } else if (suggestion.description.includes('Luzern')) {
      lat = 47.0502; lng = 8.3093;
    }

    onLocationSelect(suggestion.description, lat, lng);
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

      // Reverse Geocoding für Adresse
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const locationString = `${address.street || ''} ${address.streetNumber || ''}, ${address.city || ''}`.trim();
        setInputValue(locationString);
        onLocationSelect(locationString, lat, lng);
        Alert.alert('Standort gesetzt', `Dein aktueller Standort wurde verwendet: ${locationString}`);
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Error getting current location:', error);
      Alert.alert('Fehler', 'Standort konnte nicht ermittelt werden.');
    }
  };

  const renderSuggestion = ({ item }: { item: AddressSuggestion }) => (
    <TouchableOpacity
      style={[styles.suggestionItem, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
      onPress={() => handleSuggestionSelect(item)}
    >
      <Ionicons name="location-outline" size={20} color={colors.primary} style={styles.suggestionIcon} />
      <View style={styles.suggestionText}>
        {item.structured_formatting ? (
          <>
            <Text style={[styles.suggestionMainText, { color: colors.text }]}>
              {item.structured_formatting.main_text}
            </Text>
            <Text style={[styles.suggestionSecondaryText, { color: colors.textSecondary }]}>
              {item.structured_formatting.secondary_text}
            </Text>
          </>
        ) : (
          <Text style={[styles.suggestionMainText, { color: colors.text }]}>
            {item.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputContainer}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
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
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={[styles.suggestionsContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {suggestions.map((item) => renderSuggestion({ item }))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  inputContainer: {
    position: 'relative',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
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
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderRadius: 8,
    borderWidth: 1,
    maxHeight: 250,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
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
    fontSize: 16,
    fontWeight: '500',
  },
  suggestionSecondaryText: {
    fontSize: 14,
    marginTop: 2,
  },
});

export default LocationAutocomplete;