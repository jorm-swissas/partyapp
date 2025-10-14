import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootState, AppDispatch } from '../store';
import { setSelectedCategory, initializeFilters, fetchEvents } from '../store/eventSlice';
import { Event, EventCategory, RootStackParamList } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { formatPrice } from '../utils/currency';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { filteredEvents, selectedCategory, isLoading } = useSelector((state: RootState) => state.events);
  const { user, isLoggedIn } = useSelector((state: RootState) => state.auth);
  const { colors } = useSelector((state: RootState) => state.theme);
  const { selectedCurrency, currencies } = useSelector((state: RootState) => state.currency);

  const categories: (EventCategory | 'Alle')[] = ['Alle', 'Hausparty', 'Party', 'Gaming', 'Outdoor'];

  useEffect(() => {
    dispatch(fetchEvents());
    dispatch(initializeFilters());
    dispatch(setSelectedCategory('Alle'));
  }, [dispatch]);

  const handleCategoryPress = (category: EventCategory | 'Alle') => {
    dispatch(setSelectedCategory(category));
  };

  const handleEventPress = (eventId: string) => {
    navigation.navigate('EventDetail', { eventId });
  };

  const handleCreateEvent = () => {
    // Einfach direkt zum CreateEvent navigieren - Auth Check passiert beim Submit
    navigation.navigate('CreateEvent');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const renderEventCard = ({ item }: { item: Event }) => (
    <TouchableOpacity style={styles.eventCard} onPress={() => handleEventPress(item.id)}>
      {item.imageUri && <Image source={{ uri: item.imageUri }} style={styles.eventImage} />}
      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        </View>
        <View style={styles.eventDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#2E86AB" />
            <Text style={styles.detailText}>{formatDate(item.date)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color="#2E86AB" />
            <Text style={styles.detailText}>{item.time}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color="#2E86AB" />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
        </View>
        {item.price && (
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>{formatPrice(item.price, item.currency || selectedCurrency, currencies)}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.text }}>RhyConnect</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity 
            style={{ backgroundColor: colors.card, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' }} 
            onPress={() => navigation.navigate('MapView')}
          >
            <Ionicons name="map-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={{ backgroundColor: isLoggedIn ? colors.card : colors.primary, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' }} 
            onPress={() => navigation.navigate('Profile')}
          >
            {isLoggedIn ? (
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>
                {user?.displayName?.charAt(0).toUpperCase() || 'U'}
              </Text>
            ) : (
              <Ionicons name="person-outline" size={24} color={colors.primaryText} />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={{ backgroundColor: colors.primary, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' }} onPress={handleCreateEvent}>
            <Ionicons name="add" size={28} color={colors.primaryText} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 15 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 5 }}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                { paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, backgroundColor: colors.card, borderRadius: 20, height: 36, justifyContent: 'center', alignItems: 'center' },
                selectedCategory === category && { backgroundColor: colors.primary }
              ]}
              onPress={() => handleCategoryPress(category)}
            >
              <Text style={[
                { color: colors.text, fontSize: 14, fontWeight: '500' },
                selectedCategory === category && { color: colors.primaryText, fontWeight: '600' }
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Events */}
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        showsVerticalScrollIndicator={true}
      >
        {filteredEvents.map((item) => (
          <TouchableOpacity key={item.id} style={{ backgroundColor: colors.card, borderRadius: 12, marginBottom: 16, overflow: 'hidden' }} onPress={() => handleEventPress(item.id)}>
            {item.imageUri && <Image source={{ uri: item.imageUri }} style={{ width: '100%', height: 150 }} />}
            <View style={{ padding: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 12 }}>{item.title || 'Untitled Event'}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 14 }}>{formatDate(item.date)} - {item.time || 'Keine Zeit angegeben'}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 14 }}>{item.location || 'Kein Ort angegeben'}</Text>
              {item.price ? <Text style={{ color: colors.primary, fontSize: 18, fontWeight: 'bold', textAlign: 'right' }}>{formatPrice(item.price, item.currency || selectedCurrency, currencies)}</Text> : null}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 10 },
  titleContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#ffffff' },
  addButton: { backgroundColor: '#2E86AB', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  categoriesContainer: { marginBottom: 0, paddingHorizontal: 20, height: 35 },
  categoryButton: { paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, backgroundColor: '#2a2a2a', borderRadius: 20, height: 36, justifyContent: 'center', alignItems: 'center' },
  categoryButtonActive: { backgroundColor: '#2E86AB' },
  categoryButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '500' },
  categoryButtonTextActive: { color: '#121212', fontWeight: '600' },
  eventsContainer: { paddingHorizontal: 20, paddingBottom: 10 },
  eventsWrapper: { flex: 1 },
  eventCard: { backgroundColor: '#1e1e1e', borderRadius: 12, marginBottom: 16, overflow: 'hidden' },
  eventImage: { width: '100%', height: 150, resizeMode: 'cover' },
  eventContent: { padding: 16 },
  eventHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  eventTitle: { fontSize: 18, fontWeight: 'bold', color: '#ffffff', flex: 1, marginRight: 12 },
  categoryBadge: { backgroundColor: '#2E86AB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  categoryText: { color: '#121212', fontSize: 12, fontWeight: '600' },
  eventDetails: { marginBottom: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  detailText: { color: '#cccccc', fontSize: 14, marginLeft: 8, flex: 1 },
  priceContainer: { alignSelf: 'flex-end' },
  priceText: { color: '#2E86AB', fontSize: 18, fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginTop: 16 },
});

export default HomeScreen;