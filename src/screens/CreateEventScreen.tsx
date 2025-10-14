import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { addEvent } from '../store/eventSlice';
import { EventCategory, RootStackParamList, ThemeColors, Currency } from '../types';
import { RootState } from '../store';
import { formatPrice } from '../utils/currency';
import * as Location from 'expo-location';
import LocationAutocompleteFree from '../components/LocationAutocompleteFree';

type CreateEventScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreateEvent'>;

const CreateEventScreen: React.FC = () => {
  const navigation = useNavigation<CreateEventScreenNavigationProp>();
  const dispatch = useDispatch();
  const { user, isLoggedIn } = useSelector((state: RootState) => state.auth);
  const { colors } = useSelector((state: RootState) => state.theme);
  const { selectedCurrency, currencies } = useSelector((state: RootState) => state.currency);

  // Kein useEffect Auth Guard mehr - der Check passiert beim Submit

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [category, setCategory] = useState<EventCategory>('Hausparty');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<Currency>(selectedCurrency);
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const categories: EventCategory[] = ['Hausparty', 'Party', 'Gaming', 'Outdoor', 'Konzert', 'Club'];

  const handleSave = () => {
    if (!isLoggedIn || !user) {
      // User hat alles ausgefüllt, aber ist nicht angemeldet
      Alert.alert(
        'Fast geschafft! 🎉',
        'Um dein Event zu veröffentlichen, musst du dich kurz anmelden. Deine Eingaben gehen nicht verloren!',
        [
          { text: 'Abbrechen', style: 'cancel' },
          { 
            text: 'Jetzt anmelden', 
            style: 'default',
            onPress: () => navigation.navigate('Profile')
          },
        ]
      );
      return;
    }

    if (!title.trim() || !location.trim()) {
      Alert.alert('Fehler', 'Bitte fülle alle Pflichtfelder aus.');
      return;
    }

    const eventData = {
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      latitude,
      longitude,
      date: date.toISOString().split('T')[0],
      time: time.toTimeString().slice(0, 5),
      category,
      imageUri,
      maxParticipants: maxParticipants ? parseInt(maxParticipants) : undefined,
      price: price ? parseFloat(price) : undefined,
      currency,
      createdBy: user.id, // Event mit User verknüpfen
    };

    dispatch(addEvent(eventData));
    Alert.alert('Erfolg', 'Event wurde erstellt!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Berechtigung benötigt', 'Zugriff auf Bilder ist erforderlich');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (time: Date) => {
    return time.toTimeString().slice(0, 5);
  };

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Neues Event erstellen</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Titel *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="z.B. Sarah's Geburtstagsparty, WG-Party, Gaming Night"
              placeholderTextColor={colors.placeholder}
              autoComplete="off"
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Beschreibung</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Was wird gefeiert? Was sollen die Gäste mitbringen?"
              placeholderTextColor={colors.placeholder}
              multiline
              numberOfLines={4}
              autoComplete="off"
              autoCorrect={false}
            />
          </View>

          <LocationAutocompleteFree
            value={location}
            onLocationSelect={(address: string, lat?: number, lng?: number) => {
              setLocation(address);
              setLatitude(lat);
              setLongitude(lng);
            }}
            placeholder="z.B. Marktplatz Basel, Rheingasse, Universität..."
            colors={colors}
            style={{ marginBottom: 0 }}
          />
          {latitude && longitude && (
            <Text style={[styles.coordinatesText, { color: colors.textSecondary, marginTop: 8, marginBottom: 16 }]}>
              📍 Koordinaten gesetzt ({latitude.toFixed(4)}, {longitude.toFixed(4)})
            </Text>
          )}

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Datum</Text>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                <Text style={styles.dateTimeText}>{formatDate(date)}</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
              <Text style={styles.label}>Uhrzeit</Text>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons name="time-outline" size={20} color={colors.primary} />
                <Text style={styles.dateTimeText}>{formatTime(time)}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kategorie</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryContainer}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryButton,
                      category === cat && styles.categoryButtonActive,
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        category === cat && styles.categoryButtonTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Max. Teilnehmer</Text>
              <TextInput
                style={styles.input}
                value={maxParticipants}
                onChangeText={setMaxParticipants}
                placeholder="Optional"
                placeholderTextColor={colors.placeholder}
                keyboardType="numeric"
                autoComplete="off"
                autoCorrect={false}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
              <Text style={styles.label}>Preis</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 8 }]}
                  value={price}
                  onChangeText={setPrice}
                  placeholder="Optional"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="decimal-pad"
                  autoComplete="off"
                  autoCorrect={false}
                />
                <TouchableOpacity 
                  style={[styles.currencyButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => {
                    Alert.alert(
                      'Währung wählen',
                      '',
                      [
                        ...currencies.map(curr => ({
                          text: `${curr.symbol} ${curr.name}`,
                          onPress: () => setCurrency(curr.code)
                        })),
                        { text: 'Abbrechen', style: 'cancel' as const }
                      ]
                    );
                  }}
                >
                  <Text style={[styles.currencyText, { color: colors.text }]}>{currency}</Text>
                  <Ionicons name="chevron-down" size={16} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Event-Bild</Text>
            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.selectedImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera-outline" size={32} color={colors.placeholder} />
                  <Text style={styles.imagePlaceholderText}>Foto hinzufügen</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity onPress={handleSave} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Event erstellen</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
        />
      )}
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
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: colors.primaryText,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...(Platform.OS === 'web' && {
      outline: 'none',
      // Überschreibt Webkit AutoFill-Styling
      WebkitBoxShadow: `0 0 0 1000px ${colors.surface} inset`,
      WebkitTextFillColor: colors.text,
    }),
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  dateTimeButton: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateTimeText: {
    color: colors.text,
    fontSize: 16,
    marginLeft: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: colors.primaryText,
    fontWeight: '600',
  },
  imageButton: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: colors.placeholder,
    fontSize: 16,
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 24,
    marginBottom: 20,
  },
  submitButtonText: {
    color: colors.primaryText,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  currencyButton: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 70,
  },
  currencyText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 4,
  },
  coordinatesText: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default CreateEventScreen;