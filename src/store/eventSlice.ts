import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Event, EventCategory, EventState } from '../types';
import {
  addEventToFirestore,
  getEventsFromFirestore,
  updateEventInFirestore,
  deleteEventFromFirestore,
  subscribeToEvents
} from '../services/eventService';

const initialState: EventState = {
  events: [],
  filteredEvents: [],
  selectedCategory: 'Alle',
  isLoading: false,
  error: null,
};

// Firebase Async Thunks
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (_, { rejectWithValue }) => {
    try {
      const events = await getEventsFromFirestore();
      return events;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Subscribe to real-time event updates
export const subscribeToEventsRealtime = createAsyncThunk(
  'events/subscribeToEventsRealtime',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const unsubscribe = subscribeToEvents((events) => {
        dispatch(setEvents(events));
      });

      // Return the unsubscribe function
      return unsubscribe;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (eventData: Omit<Event, 'id' | 'createdAt'>, { rejectWithValue }) => {
    try {
      const newEvent = await addEventToFirestore(eventData);
      return newEvent;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const editEvent = createAsyncThunk(
  'events/editEvent',
  async ({ eventId, updateData }: { eventId: string; updateData: Partial<Event> }, { rejectWithValue }) => {
    try {
      await updateEventInFirestore(eventId, updateData);
      return { eventId, updateData };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeEvent = createAsyncThunk(
  'events/removeEvent',
  async (eventId: string, { rejectWithValue }) => {
    try {
      await deleteEventFromFirestore(eventId);
      return eventId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<EventCategory | 'Alle'>) => {
      state.selectedCategory = action.payload;
      state.filteredEvents = filterEventsByCategory(state.events, action.payload);
    },
    initializeFilters: (state) => {
      state.filteredEvents = filterEventsByCategory(state.events, state.selectedCategory);
    },
    setEvents: (state, action: PayloadAction<Event[]>) => {
      state.events = action.payload;
      state.filteredEvents = filterEventsByCategory(state.events, state.selectedCategory);
    },
  },
  extraReducers: (builder) => {
    // Fetch Events
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.events = action.payload;
        state.filteredEvents = filterEventsByCategory(action.payload, state.selectedCategory);
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Event
      .addCase(createEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        // Don't add event manually - real-time listener will handle it
        state.isLoading = false;
        state.error = null;
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Edit Event
      .addCase(editEvent.fulfilled, (state, action) => {
        const { eventId, updateData } = action.payload;
        const index = state.events.findIndex(event => event.id === eventId);
        if (index !== -1) {
          state.events[index] = { ...state.events[index], ...updateData };
          state.filteredEvents = filterEventsByCategory(state.events, state.selectedCategory);
        }
      })
      // Remove Event
      .addCase(removeEvent.fulfilled, (state, action) => {
        state.events = state.events.filter(event => event.id !== action.payload);
        state.filteredEvents = filterEventsByCategory(state.events, state.selectedCategory);
      });
  },
});

const filterEventsByCategory = (events: Event[], category: EventCategory | 'Alle'): Event[] => {
  return category === 'Alle' ? events : events.filter(event => event.category === category);
};

export const { 
  setSelectedCategory, 
  initializeFilters,
  setEvents 
} = eventSlice.actions;

export default eventSlice.reducer;