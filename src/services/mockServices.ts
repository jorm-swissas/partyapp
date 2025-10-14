// Mock Services for Demo Mode
import { Event, EventCategory } from '../types';

// Mock Data Storage
let mockEvents: Event[] = [];
let currentUser: any = null;

// Mock Auth Service
export const mockAuthService = {
  registerUser: async (email: string, password: string, username: string, displayName: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
    
    currentUser = {
      id: Date.now().toString(),
      email,
      username,
      displayName,
      createdAt: new Date().toISOString()
    };
    
    return currentUser;
  },

  loginUser: async (email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
    
    currentUser = {
      id: Date.now().toString(),
      email,
      username: email.split('@')[0],
      displayName: email.split('@')[0],
      createdAt: new Date().toISOString()
    };
    
    return currentUser;
  },

  logoutUser: async () => {
    currentUser = null;
  },

  getCurrentUser: () => currentUser,

  onAuthChange: (callback: (user: any) => void) => {
    // Return mock unsubscribe function
    return () => {};
  }
};

// Mock Event Service
export const mockEventService = {
  addEventToFirestore: async (eventData: Omit<Event, 'id' | 'createdAt'>): Promise<Event> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
    
    const newEvent: Event = {
      ...eventData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    mockEvents.unshift(newEvent);
    return newEvent;
  },

  getEventsFromFirestore: async (): Promise<Event[]> => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
    return [...mockEvents];
  },

  updateEventInFirestore: async (eventId: string, updateData: Partial<Event>): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
    
    const index = mockEvents.findIndex(event => event.id === eventId);
    if (index !== -1) {
      mockEvents[index] = { ...mockEvents[index], ...updateData };
    }
  },

  deleteEventFromFirestore: async (eventId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
    
    mockEvents = mockEvents.filter(event => event.id !== eventId);
  },

  subscribeToEvents: (callback: (events: Event[]) => void) => {
    // Return mock unsubscribe function
    callback([...mockEvents]);
    return () => {};
  }
};