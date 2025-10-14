import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Event, EventCategory, EventState } from '../types';

const initialState: EventState = {
  events: [],
  filteredEvents: [],
  selectedCategory: 'Alle',
};

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