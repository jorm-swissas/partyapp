import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootState } from '../store';
import { deleteEvent } from '../store/eventSlice';
import { RootStackParamList, ThemeColors } from '../types';
import { Ionicons } from '@expo/vector-icons';

type EventDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EventDetail'>;
type EventDetailScreenRouteProp = RouteProp<RootStackParamList, 'EventDetail'>;

const EventDetailScreen: React.FC = () => {
  const navigation = useNavigation<EventDetailScreenNavigationProp>();
  const route = useRoute<EventDetailScreenRouteProp>();
  const dispatch = useDispatch();
  const { colors } = useSelector((state: RootState) => state.theme);
  
  const { eventId } = route.params;
  const event = useSelector((state: RootState) => 
    state.events.events.find(e => e.id === eventId)
  );
  const { user, isLoggedIn } = useSelector((state: RootState) => state.auth);
  
  // Prüfen ob der User der Ersteller des Events ist
  const isEventOwner = isLoggedIn && user && event && event.createdBy === user.id;

  const styles = createStyles(colors);

  if (!event) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Event nicht gefunden</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Event löschen',
      'Möchtest du dieses Event wirklich löschen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteEvent(eventId));
            navigation.goBack();
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Details</Text>
        {isEventOwner ? (
          <TouchableOpacity onPress={handleDelete}>
            <Ionicons name="trash-outline" size={24} color="#ff6b6b" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {event.imageUri && (
          <Image source={{ uri: event.imageUri }} style={styles.heroImage} />
        )}

        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>{event.title || 'Untitled Event'}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{event.category || 'Kategorie'}</Text>
            </View>
          </View>

          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="calendar-outline" size={24} color={colors.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Datum</Text>
                <Text style={styles.detailValue}>{formatDate(event.date)}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="time-outline" size={24} color={colors.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Uhrzeit</Text>
                <Text style={styles.detailValue}>{event.time || 'Keine Zeit angegeben'} Uhr</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="location-outline" size={24} color={colors.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Ort</Text>
                <Text style={styles.detailValue}>{event.location || 'Kein Ort angegeben'}</Text>
              </View>
            </View>

            {event.maxParticipants && (
              <View style={styles.detailRow}>
                <View style={styles.iconContainer}>
                  <Ionicons name="people-outline" size={24} color={colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Max. Teilnehmer</Text>
                  <Text style={styles.detailValue}>{event.maxParticipants} Personen</Text>
                </View>
              </View>
            )}

            {event.price && (
              <View style={styles.detailRow}>
                <View style={styles.iconContainer}>
                  <Ionicons name="card-outline" size={24} color={colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Preis</Text>
                  <Text style={styles.detailValue}>{event.price}€</Text>
                </View>
              </View>
            )}
          </View>

          {event.description && event.description.trim() !== '' && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Beschreibung</Text>
              <Text style={styles.description}>{event.description}</Text>
            </View>
          )}

          <View style={styles.metaSection}>
            <Text style={styles.metaText}>
              Erstellt am {new Date(event.createdAt).toLocaleDateString('de-DE')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  heroImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  content: {
    padding: 20,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    marginRight: 16,
  },
  categoryBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    color: colors.primaryText,
    fontSize: 14,
    fontWeight: '600',
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  detailValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
  metaSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
    marginTop: 16,
  },
  metaText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default EventDetailScreen;