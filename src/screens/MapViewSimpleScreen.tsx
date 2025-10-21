import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Image,
  Platform,
  Linking,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useSelector } from 'react-redux';
import { useNavigation, StackNavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../store';
import { Event, RootStackParamList } from '../types';
import { formatPrice } from '../utils/currency';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.05;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

type MapViewNavigationProp = StackNavigationProp<RootStackParamList, 'MapView'>;

export default function MapViewSimpleScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [region, setRegion] = useState<Region | null>(null);

  const mapRef = useRef<MapView>(null);
  const navigation = useNavigation<MapViewNavigationProp>();
  const events = useSelector((state: RootState) => state.events.events);
  const { selectedCurrency, currencies } = useSelector((state: RootState) => state.currency);
  const { colors } = useSelector((state: RootState) => state.theme);
  const styles = createStyles(colors);

  // Filter events with coordinates
  const eventsWithLocation = events.filter(event =>
    event.latitude !== undefined && event.longitude !== undefined
  );

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    // Set initial region based on events or user location
    if (eventsWithLocation.length > 0 && !region) {
      fitMapToEvents();
    } else if (location && !region) {
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      });
    }
  }, [eventsWithLocation, location]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Still show map, just without user location
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      setLoading(false);
    } catch (error) {
      console.error('Fehler beim Abrufen der Position:', error);
      setLoading(false);
    }
  };

  const fitMapToEvents = () => {
    if (eventsWithLocation.length === 0) return;

    if (eventsWithLocation.length === 1) {
      const event = eventsWithLocation[0];
      setRegion({
        latitude: event.latitude!,
        longitude: event.longitude!,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      });
      return;
    }

    // Calculate bounding box for all events
    const latitudes = eventsWithLocation.map(e => e.latitude!);
    const longitudes = eventsWithLocation.map(e => e.longitude!);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const latDelta = (maxLat - minLat) * 1.5; // Add padding
    const lngDelta = (maxLng - minLng) * 1.5;

    setRegion({
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.max(latDelta, 0.01),
      longitudeDelta: Math.max(lngDelta, 0.01),
    });
  };

  const handleMarkerPress = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleEventCardPress = (event: Event) => {
    navigation.navigate('EventDetail', { eventId: event.id });
  };

  const openDirections = async (event: Event) => {
    const latitude = event.latitude!;
    const longitude = event.longitude!;
    const label = encodeURIComponent(event.title);

    // Priority order: Google Maps → Apple Maps (iOS) → Waze → Browser

    // 1. Try Google Maps first (works on both iOS and Android)
    const googleMapsUrl = Platform.OS === 'ios'
      ? `comgooglemaps://?daddr=${latitude},${longitude}&directionsmode=driving`
      : `google.navigation:q=${latitude},${longitude}`;

    try {
      const googleMapsSupported = await Linking.canOpenURL(googleMapsUrl);
      if (googleMapsSupported) {
        await Linking.openURL(googleMapsUrl);
        return;
      }
    } catch (err) {
      console.log('Google Maps not available, trying Apple Maps...');
    }

    // 2. Try Apple Maps (iOS only)
    if (Platform.OS === 'ios') {
      const appleMapsUrl = `maps:0,0?q=${label}@${latitude},${longitude}`;
      try {
        const appleMapsSupported = await Linking.canOpenURL(appleMapsUrl);
        if (appleMapsSupported) {
          await Linking.openURL(appleMapsUrl);
          return;
        }
      } catch (err) {
        console.log('Apple Maps not available, trying Waze...');
      }

      // 3. Try Waze (iOS)
      const wazeUrl = `waze://?ll=${latitude},${longitude}&navigate=yes`;
      try {
        const wazeSupported = await Linking.canOpenURL(wazeUrl);
        if (wazeSupported) {
          await Linking.openURL(wazeUrl);
          return;
        }
      } catch (err) {
        console.log('Waze not available, opening browser...');
      }
    } else {
      // Android: Try default maps app
      const geoUrl = `geo:0,0?q=${latitude},${longitude}(${label})`;
      try {
        await Linking.openURL(geoUrl);
        return;
      } catch (err) {
        console.log('Default maps not available, opening browser...');
      }
    }

    // 4. Last resort - open browser-based Google Maps
    const browserUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(browserUrl).catch(() => {
      Alert.alert('Fehler', 'Karten-App konnte nicht geöffnet werden.');
    });
  };

  if (loading || !region) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Lade Karte...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={!!location}
        showsMyLocationButton={true}
      >
        {/* Event Markers */}
        {eventsWithLocation.map((event) => (
          <Marker
            key={event.id}
            coordinate={{
              latitude: event.latitude!,
              longitude: event.longitude!,
            }}
            onPress={() => handleMarkerPress(event)}
            pinColor={selectedEvent?.id === event.id ? '#2E86AB' : '#FF6B6B'}
          >
            <View style={styles.markerContainer}>
              <View style={[
                styles.marker,
                selectedEvent?.id === event.id && styles.markerSelected
              ]}>
                <Ionicons
                  name="location"
                  size={28}
                  color={selectedEvent?.id === event.id ? '#2E86AB' : '#FF6B6B'}
                />
              </View>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Header */}
      <SafeAreaView style={styles.headerContainer}>
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Events Karte</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {eventsWithLocation.length} {eventsWithLocation.length === 1 ? 'Event' : 'Events'}
            </Text>
          </View>
          <TouchableOpacity style={styles.recenterButton} onPress={fitMapToEvents}>
            <Ionicons name="locate" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Selected Event Card */}
      {selectedEvent && (
        <View style={[styles.eventCardContainer, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            style={styles.eventCard}
            onPress={() => handleEventCardPress(selectedEvent)}
          >
            {selectedEvent.imageUri && (
              <Image source={{ uri: selectedEvent.imageUri }} style={styles.eventImage} />
            )}
            <View style={styles.eventDetails}>
              <View style={styles.eventHeader}>
                <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={1}>
                  {selectedEvent.title}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedEvent(null)}
                >
                  <Ionicons name="close-circle" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.eventInfo}>
                <View style={styles.eventInfoRow}>
                  <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                  <Text style={[styles.eventInfoText, { color: colors.textSecondary }]}>
                    {new Date(selectedEvent.date).toLocaleDateString('de-DE')} • {selectedEvent.time}
                  </Text>
                </View>

                <View style={styles.eventInfoRow}>
                  <Ionicons name="location-outline" size={16} color={colors.primary} />
                  <Text style={[styles.eventInfoText, { color: colors.textSecondary }]} numberOfLines={1}>
                    {selectedEvent.location}
                  </Text>
                </View>

                {selectedEvent.price && (
                  <View style={styles.eventInfoRow}>
                    <Ionicons name="cash-outline" size={16} color={colors.primary} />
                    <Text style={[styles.eventPrice, { color: colors.primary }]}>
                      {formatPrice(selectedEvent.price, selectedEvent.currency || selectedCurrency, currencies)}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.directionsButton, { borderColor: colors.primary }]}
                  onPress={() => openDirections(selectedEvent)}
                >
                  <Ionicons name="navigate" size={18} color={colors.primary} />
                  <Text style={[styles.directionsButtonText, { color: colors.primary }]}>
                    Route
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.detailsButton, { backgroundColor: colors.primary }]}
                  onPress={() => handleEventCardPress(selectedEvent)}
                >
                  <Text style={styles.detailsButtonText}>Details</Text>
                  <Ionicons name="arrow-forward" size={16} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* No Events Message */}
      {eventsWithLocation.length === 0 && (
        <View style={[styles.noEventsOverlay, { backgroundColor: colors.card }]}>
          <Ionicons name="map-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.noEventsText, { color: colors.text }]}>
            Keine Events mit Standort
          </Text>
          <Text style={[styles.noEventsSubtext, { color: colors.textSecondary }]}>
            Erstelle Events mit Adressen, um sie auf der Karte zu sehen
          </Text>
        </View>
      )}
    </View>
  );
}


const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 18,
    color: colors.text,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  recenterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginLeft: 8,
  },
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerSelected: {
    transform: [{ scale: 1.2 }],
  },
  eventCardContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    maxHeight: height * 0.4,
  },
  eventCard: {
    padding: 16,
  },
  eventImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginBottom: 12,
  },
  eventDetails: {
    gap: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  eventInfo: {
    gap: 8,
  },
  eventInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventInfoText: {
    fontSize: 14,
    flex: 1,
  },
  eventPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  directionsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'white',
  },
  directionsButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  detailsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  detailsButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  noEventsOverlay: {
    position: 'absolute',
    top: '40%',
    left: 20,
    right: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  noEventsText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  noEventsSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});