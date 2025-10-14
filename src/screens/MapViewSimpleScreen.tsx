import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  Linking,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import * as Location from 'expo-location';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../store';
import { Event } from '../types';
import { lightTheme } from '../theme/colors';
import { formatPrice } from '../utils/currency';

const { width } = Dimensions.get('window');

export default function MapViewSimpleScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const events = useSelector((state: RootState) => state.events.events);
  const currency = useSelector((state: RootState) => state.currency.selectedCurrency);
  const currencyState = useSelector((state: RootState) => state.currency);
  const { colors } = useSelector((state: RootState) => state.theme);
  
  // Filter events with coordinates
  const eventsWithLocation = events.filter(event => 
    event.latitude !== undefined && event.longitude !== undefined
  );

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Berechtigung verweigert', 'Standortzugriff ist erforderlich für die Kartenansicht.');
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      setLoading(false);
    } catch (error) {
      console.error('Fehler beim Abrufen der Position:', error);
      Alert.alert('Fehler', 'Standort konnte nicht abgerufen werden.');
      setLoading(false);
    }
  };

  const openInMaps = (latitude: number, longitude: number, title: string) => {
    const url = `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&t=m`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Fehler', 'Karten-App konnte nicht geöffnet werden.');
    });
  };

  const openAllEventsInMaps = () => {
    if (eventsWithLocation.length === 0) return;
    
    const coordinates = eventsWithLocation.map(event => 
      `${event.latitude},${event.longitude}`
    ).join('|');
    
    const url = `https://maps.google.com/maps?q=${coordinates}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Fehler', 'Karten-App konnte nicht geöffnet werden.');
    });
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius der Erde in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const renderEventCard = (event: Event) => {
    const price = formatPrice(event.price || 0, currency, currencyState.currencies);
    const distance = location ? 
      calculateDistance(
        location.coords.latitude, 
        location.coords.longitude, 
        event.latitude!, 
        event.longitude!
      ).toFixed(1) 
      : null;

    return (
      <TouchableOpacity
        key={event.id}
        style={styles.eventCard}
        onPress={() => openInMaps(event.latitude!, event.longitude!, event.title)}
      >
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          {distance && (
            <Text style={styles.distance}>{distance} km</Text>
          )}
        </View>
        
        <Text style={styles.eventDate}>
          {new Date(event.date).toLocaleDateString('de-CH')}
        </Text>
        
        <Text style={styles.eventLocation} numberOfLines={2}>
          📍 {event.location}
        </Text>
        
        <View style={styles.eventFooter}>
          <Text style={styles.eventPrice}>{price}</Text>
          <Text style={styles.mapHint}>🗺️ Antippen für Karte</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Lade Standortdaten...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Events Karte</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {eventsWithLocation.length} Events mit Standort
            </Text>
            
            {location && (
              <Text style={[styles.locationText, { color: colors.textSecondary }]}>
                📍 Dein Standort: {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
              </Text>
            )}
          </View>
        </View>
      </View>

      {eventsWithLocation.length > 0 && (
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={openAllEventsInMaps}
        >
          <Text style={styles.viewAllButtonText}>
            🗺️ Alle Events in Karten-App anzeigen
          </Text>
        </TouchableOpacity>
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {eventsWithLocation.length > 0 ? (
          eventsWithLocation
            .sort((a, b) => {
              if (!location) return 0;
              const distanceA = calculateDistance(
                location.coords.latitude, location.coords.longitude, a.latitude!, a.longitude!
              );
              const distanceB = calculateDistance(
                location.coords.latitude, location.coords.longitude, b.latitude!, b.longitude!
              );
              return distanceA - distanceB;
            })
            .map(renderEventCard)
        ) : (
          <View style={styles.noEventsContainer}>
            <Text style={styles.noEventsText}>
              Keine Events mit Standortdaten vorhanden.
            </Text>
            <Text style={styles.noEventsSubtext}>
              Erstelle Events mit Adressen, um sie hier zu sehen.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: lightTheme.background,
  },
  loadingText: {
    fontSize: 18,
    color: lightTheme.text,
  },
  header: {
    backgroundColor: lightTheme.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  viewAllButton: {
    backgroundColor: lightTheme.primary,
    marginHorizontal: 20,
    marginVertical: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewAllButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  eventCard: {
    backgroundColor: lightTheme.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: lightTheme.text,
    flex: 1,
    marginRight: 12,
  },
  distance: {
    fontSize: 14,
    color: lightTheme.primary,
    fontWeight: '600',
  },
  eventDate: {
    fontSize: 14,
    color: lightTheme.textSecondary,
    marginBottom: 8,
  },
  eventLocation: {
    fontSize: 14,
    color: lightTheme.textSecondary,
    marginBottom: 12,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: lightTheme.primary,
  },
  mapHint: {
    fontSize: 12,
    color: lightTheme.textSecondary,
    fontStyle: 'italic',
  },
  noEventsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noEventsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: lightTheme.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  noEventsSubtext: {
    fontSize: 14,
    color: lightTheme.textSecondary,
    textAlign: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTextContainer: {
    flex: 1,
  },
});