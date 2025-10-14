import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

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
        onLocationSelect(locationString, lat, lng);
        Alert.alert('Standort gesetzt', `Dein aktueller Standort wurde verwendet: ${locationString}`);
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Fehler', 'Standort konnte nicht ermittelt werden.');
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.text }]}>Ort *</Text>
        <TouchableOpacity 
          style={[styles.gpsButton, { backgroundColor: colors.primary }]}
          onPress={handleUseCurrentLocation}
        >
          <Ionicons name="location" size={16} color={colors.primaryText} />
          <Text style={[styles.gpsButtonText, { color: colors.primaryText }]}>
            GPS nutzen
          </Text>
        </TouchableOpacity>
      </View>
      
      <GooglePlacesAutocomplete
        placeholder={placeholder}
        onPress={(data, details = null) => {
          const latitude = details?.geometry?.location?.lat;
          const longitude = details?.geometry?.location?.lng;
          onLocationSelect(data.description, latitude, longitude);
        }}
        query={{
          key: 'DEMO_KEY', // Demo - für Produktion brauchst du einen echten Google API Key
          language: 'de',
          components: 'country:ch', // Beschränkt auf Schweiz
        }}
        fetchDetails={true}
        styles={{
          container: {
            flex: 0,
          },
          textInputContainer: {
            backgroundColor: colors.surface,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 16,
            paddingVertical: 12,
          },
          textInput: {
            height: 24,
            color: colors.text,
            fontSize: 16,
            backgroundColor: 'transparent',
          },
          listView: {
            backgroundColor: colors.surface,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.border,
            marginTop: 4,
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
          },
          row: {
            backgroundColor: colors.surface,
            padding: 13,
            height: 'auto',
            flexDirection: 'row',
            alignItems: 'center',
          },
          separator: {
            height: 1,
            backgroundColor: colors.border,
          },
          description: {
            color: colors.text,
            fontSize: 16,
          },
          predefinedPlacesDescription: {
            color: colors.textSecondary,
          },
        }}
        nearbyPlacesAPI="GooglePlacesSearch"
        GooglePlacesSearchQuery={{
          rankby: 'distance',
        }}
        GooglePlacesDetailsQuery={{
          fields: 'formatted_address,geometry',
        }}
        filterReverseGeocodingByTypes={[
          'locality',
          'administrative_area_level_3',
        ]}
        debounce={300}
        enablePoweredByContainer={false}
        textInputProps={{
          placeholderTextColor: colors.placeholder,
          defaultValue: value,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
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
});

export default LocationAutocomplete;