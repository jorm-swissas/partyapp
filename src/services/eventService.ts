// Mock Event Service for Demo
import { mockEventService } from './mockServices';
import { Event, EventCategory } from '../types';

// Use mock services
export const addEventToFirestore = mockEventService.addEventToFirestore;
export const getEventsFromFirestore = mockEventService.getEventsFromFirestore;
export const updateEventInFirestore = mockEventService.updateEventInFirestore;
export const deleteEventFromFirestore = mockEventService.deleteEventFromFirestore;
export const subscribeToEvents = mockEventService.subscribeToEvents;

// These functions are not needed for basic demo
export const getEventsByCategory = async (category: EventCategory): Promise<Event[]> => {
  const events = await getEventsFromFirestore();
  return events.filter(event => event.category === category);
};

export const getEventsByUser = async (userId: string): Promise<Event[]> => {
  const events = await getEventsFromFirestore();
  return events.filter(event => event.createdBy === userId);
};

export const subscribeToEventsByCategory = (
  category: EventCategory, 
  callback: (events: Event[]) => void
) => {
  return subscribeToEvents((events) => {
    const filtered = events.filter(event => event.category === category);
    callback(filtered);
  });
};