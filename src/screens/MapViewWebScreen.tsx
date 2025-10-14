import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Event } from '../types';
import { lightTheme } from '../theme/colors';
import { formatPrice } from '../utils/currency';

const { width, height } = Dimensions.get('window');

export default function MapViewWebScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const events = useSelector((state: RootState) => state.events.events);
  const currency = useSelector((state: RootState) => state.currency.selectedCurrency);
  const currencyState = useSelector((state: RootState) => state.currency);
  const currencies = useSelector((state: RootState) => state.currency.currencies);
  
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

  const createMapHTML = () => {
    const centerLat = location?.coords.latitude || 47.3769;
    const centerLng = location?.coords.longitude || 8.5417;

    const markers = eventsWithLocation.map((event, index) => {
      const price = formatPrice(event.price || 0, currency, currencyState.currencies);
      return `
        L.marker([${event.latitude}, ${event.longitude}])
          .addTo(map)
          .bindPopup(\`
            <div style="font-family: Arial, sans-serif;">
              <h3 style="margin: 0 0 8px 0; color: #333;">${event.title}</h3>
              <p style="margin: 4px 0; color: #666;"><strong>Datum:</strong> ${new Date(event.date).toLocaleDateString('de-CH')}</p>
              <p style="margin: 4px 0; color: #666;"><strong>Ort:</strong> ${event.location}</p>
              <p style="margin: 4px 0; color: #666;"><strong>Preis:</strong> ${price}</p>
              ${event.description ? `<p style="margin: 4px 0; color: #666;">${event.description}</p>` : ''}
            </div>
          \`);
      `;
    }).join('\n');

    const userLocationMarker = location ? `
      L.marker([${centerLat}, ${centerLng}], {
        icon: L.icon({
          iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiMwMDdBRkYiLz4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iNCIgZmlsbD0id2hpdGUiLz4KPC9zdmc+',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })
      })
      .addTo(map)
      .bindPopup('Dein Standort');
    ` : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Events Map</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      </head>
      <body style="margin: 0; padding: 0;">
        <div id="map" style="width: 100%; height: 100vh;"></div>
        <script>
          var map = L.map('map').setView([${centerLat}, ${centerLng}], 13);
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          ${userLocationMarker}
          ${markers}
        </script>
      </body>
      </html>
    `;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Lade Karte...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Events Karte</Text>
        <Text style={styles.headerSubtitle}>
          {eventsWithLocation.length} Events mit Standort
        </Text>
      </View>
      
      <WebView
        source={{ html: createMapHTML() }}
        style={styles.webView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
      />
      
      {eventsWithLocation.length === 0 && (
        <View style={styles.noEventsContainer}>
          <Text style={styles.noEventsText}>
            Keine Events mit Standortdaten vorhanden.
          </Text>
          <Text style={styles.noEventsSubtext}>
            Erstelle Events mit Adressen, um sie auf der Karte zu sehen.
          </Text>
        </View>
      )}
    </View>
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
    paddingTop: 50, // Account for status bar
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
  },
  webView: {
    flex: 1,
  },
  noEventsContainer: {
    position: 'absolute',
    top: '50%',
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
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
});