import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Event, EventCategory, EventState } from '../types';

const initialState: EventState = {
  events: [
    {
      id: '1',
      title: 'Sarah\'s Geburtstagsparty 🎂',
      description: 'Gemütliche Hausparty mit Freunden, Pizza und guter Musik. Bringt gerne eure Lieblings-Snacks mit!',
      location: 'Bei Sarah zu Hause, Musterstraße 12',
      date: '2024-10-15',
      time: '19:00',
      category: 'Hausparty',
      imageUri: 'https://picsum.photos/300/200?random=1',
      maxParticipants: 15,
      price: 0,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'WG-Party - Semesterende feiern 🎉',
      description: 'Das Semester ist geschafft! Lasst uns das bei einer entspannten WG-Party feiern.',
      location: 'WG in der Studentenstraße 5',
      date: '2024-10-20',
      time: '21:00',
      category: 'Hausparty',
      imageUri: 'https://picsum.photos/300/200?random=2',
      maxParticipants: 25,
      price: 5,
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'Gaming Night - FIFA & Pizza 🎮',
      description: 'Entspannte Gaming-Session mit FIFA-Turnier, Pizza und Getränken. Controller sind vorhanden!',
      location: 'Bei Max, Gamerstraße 8',
      date: '2024-10-22',
      time: '18:30',
      category: 'Gaming',
      imageUri: 'https://picsum.photos/300/200?random=3',
      maxParticipants: 8,
      price: 0,
      createdAt: new Date().toISOString(),
    },
    {
      id: '4',
      title: 'Grillparty im Garten 🔥',
      description: 'Gemütliches Grillen im Garten mit selbstgemachten Salaten und kalten Getränken.',
      location: 'Garten bei Familie Müller',
      date: '2024-10-18',
      time: '16:00',
      category: 'Outdoor',
      imageUri: 'https://picsum.photos/300/200?random=4',
      maxParticipants: 20,
      price: 8,
      createdAt: new Date().toISOString(),
    },
    {
      id: '5',
      title: 'Kleine Cocktailparty 🍹',
      description: 'Lernt neue Cocktails kennen und genießt einen entspannten Abend mit Freunden.',
      location: 'Bei Anna, Cocktailstraße 15',
      date: '2024-10-25',
      time: '20:00',
      category: 'Party',
      imageUri: 'https://picsum.photos/300/200?random=5',
      maxParticipants: 12,
      price: 10,
      createdAt: new Date().toISOString(),
    },
  ],
  filteredEvents: [],
  selectedCategory: 'Alle',
};

// Initialize filteredEvents with all events for 'Alle' category
initialState.filteredEvents = initialState.events;

const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    addEvent: (state, action: PayloadAction<Omit<Event, 'id' | 'createdAt'>>) => {
      const newEvent: Event = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      state.events.push(newEvent);
      state.filteredEvents = filterEventsByCategory(state.events, state.selectedCategory);
    },
    updateEvent: (state, action: PayloadAction<Event>) => {
      const index = state.events.findIndex(event => event.id === action.payload.id);
      if (index !== -1) {
        state.events[index] = action.payload;
        state.filteredEvents = filterEventsByCategory(state.events, state.selectedCategory);
      }
    },
    deleteEvent: (state, action: PayloadAction<string>) => {
      state.events = state.events.filter(event => event.id !== action.payload);
      state.filteredEvents = filterEventsByCategory(state.events, state.selectedCategory);
    },
    setSelectedCategory: (state, action: PayloadAction<EventCategory | 'Alle'>) => {
      state.selectedCategory = action.payload;
      state.filteredEvents = filterEventsByCategory(state.events, action.payload);
    },
    initializeFilters: (state) => {
      state.filteredEvents = filterEventsByCategory(state.events, state.selectedCategory);
    },
  },
});

const filterEventsByCategory = (events: Event[], category: EventCategory | 'Alle'): Event[] => {
  return category === 'Alle' ? events : events.filter(event => event.category === category);
};

export const { 
  addEvent, 
  updateEvent, 
  deleteEvent, 
  setSelectedCategory, 
  initializeFilters 
} = eventSlice.actions;

export default eventSlice.reducer;