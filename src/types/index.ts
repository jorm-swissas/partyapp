export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  date: string;
  time: string;
  category: EventCategory;
  imageUri?: string;
  maxParticipants?: number;
  price?: number;
  currency?: Currency;
  createdAt: string;
  createdBy?: string; // User ID des Erstellers
}

export type EventCategory = 'Hausparty' | 'Party' | 'Konzert' | 'Club' | 'Outdoor' | 'Gaming';

export interface EventState {
  events: Event[];
  filteredEvents: Event[];
  selectedCategory: EventCategory | 'Alle';
  isLoading: boolean;
  error: string | null;
}

// User Management Types
export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
}

export type RootStackParamList = {
  Home: undefined;
  CreateEvent: undefined;
  EventDetail: { eventId: string };
  Profile: undefined;
  Settings: undefined;
  MapView: undefined;
};

// Theme System Types
export type ThemeMode = 'light' | 'dark' | 'auto';

export interface ThemeColors {
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  primary: string;
  primaryText: string;
  border: string;
  placeholder: string;
  error: string;
  success: string;
}

export interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
}

// Currency System Types
export type Currency = 'CHF' | 'EUR' | 'GBP' | 'USD' | 'SEK' | 'NOK' | 'DKK' | 'PLN' | 'CZK';

export interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name: string;
  country: string;
}

export interface CurrencyState {
  selectedCurrency: Currency;
  currencies: CurrencyInfo[];
}