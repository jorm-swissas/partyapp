// Real Firebase Firestore Service for Events
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Event, EventCategory } from '../types';

// Collection reference
const eventsCollection = collection(db, 'events');

// Add a new event to Firestore
export const addEventToFirestore = async (event: Omit<Event, 'id'>): Promise<Event> => {
  try {
    const docRef = await addDoc(eventsCollection, {
      ...event,
      createdAt: event.createdAt || new Date().toISOString()
    });

    return {
      ...event,
      id: docRef.id
    } as Event;
  } catch (error: any) {
    console.error('Error adding event:', error);
    throw new Error(error.message || 'Failed to create event');
  }
};

// Get all events from Firestore
export const getEventsFromFirestore = async (): Promise<Event[]> => {
  try {
    const querySnapshot = await getDocs(eventsCollection);
    const events: Event[] = [];

    querySnapshot.forEach((doc) => {
      events.push({
        id: doc.id,
        ...doc.data()
      } as Event);
    });

    return events;
  } catch (error: any) {
    console.error('Error fetching events:', error);
    throw new Error(error.message || 'Failed to fetch events');
  }
};

// Update an existing event
export const updateEventInFirestore = async (
  eventId: string,
  updates: Partial<Event>
): Promise<void> => {
  try {
    const eventRef = doc(db, 'events', eventId);
    await updateDoc(eventRef, updates);
  } catch (error: any) {
    console.error('Error updating event:', error);
    throw new Error(error.message || 'Failed to update event');
  }
};

// Delete an event
export const deleteEventFromFirestore = async (eventId: string): Promise<void> => {
  try {
    const eventRef = doc(db, 'events', eventId);
    await deleteDoc(eventRef);
  } catch (error: any) {
    console.error('Error deleting event:', error);
    throw new Error(error.message || 'Failed to delete event');
  }
};

// Subscribe to real-time event updates
export const subscribeToEvents = (callback: (events: Event[]) => void) => {
  const unsubscribe = onSnapshot(
    eventsCollection,
    (querySnapshot) => {
      const events: Event[] = [];
      querySnapshot.forEach((doc) => {
        events.push({
          id: doc.id,
          ...doc.data()
        } as Event);
      });
      callback(events);
    },
    (error) => {
      console.error('Error in event subscription:', error);
    }
  );

  return unsubscribe;
};

// Get events by category
export const getEventsByCategory = async (category: EventCategory): Promise<Event[]> => {
  try {
    const q = query(eventsCollection, where('category', '==', category));
    const querySnapshot = await getDocs(q);
    const events: Event[] = [];

    querySnapshot.forEach((doc) => {
      events.push({
        id: doc.id,
        ...doc.data()
      } as Event);
    });

    return events;
  } catch (error: any) {
    console.error('Error fetching events by category:', error);
    throw new Error(error.message || 'Failed to fetch events by category');
  }
};

// Get events by user
export const getEventsByUser = async (userId: string): Promise<Event[]> => {
  try {
    const q = query(eventsCollection, where('createdBy', '==', userId));
    const querySnapshot = await getDocs(q);
    const events: Event[] = [];

    querySnapshot.forEach((doc) => {
      events.push({
        id: doc.id,
        ...doc.data()
      } as Event);
    });

    return events;
  } catch (error: any) {
    console.error('Error fetching events by user:', error);
    throw new Error(error.message || 'Failed to fetch events by user');
  }
};

// Subscribe to events by category
export const subscribeToEventsByCategory = (
  category: EventCategory,
  callback: (events: Event[]) => void
) => {
  const q = query(eventsCollection, where('category', '==', category));

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const events: Event[] = [];
      querySnapshot.forEach((doc) => {
        events.push({
          id: doc.id,
          ...doc.data()
        } as Event);
      });
      callback(events);
    },
    (error) => {
      console.error('Error in category event subscription:', error);
    }
  );

  return unsubscribe;
};