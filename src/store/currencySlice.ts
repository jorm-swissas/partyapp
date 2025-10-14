import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CurrencyState, Currency, CurrencyInfo } from '../types';

const currencies: CurrencyInfo[] = [
  { code: 'CHF', symbol: 'CHF', name: 'Schweizer Franken', country: 'Schweiz' },
  { code: 'EUR', symbol: '€', name: 'Euro', country: 'Eurozone' },
  { code: 'GBP', symbol: '£', name: 'Britisches Pfund', country: 'Großbritannien' },
  { code: 'USD', symbol: '$', name: 'US-Dollar', country: 'USA' },
  { code: 'SEK', symbol: 'kr', name: 'Schwedische Krone', country: 'Schweden' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegische Krone', country: 'Norwegen' },
  { code: 'DKK', symbol: 'kr', name: 'Dänische Krone', country: 'Dänemark' },
  { code: 'PLN', symbol: 'zł', name: 'Polnischer Złoty', country: 'Polen' },
  { code: 'CZK', symbol: 'Kč', name: 'Tschechische Krone', country: 'Tschechien' },
];

const initialState: CurrencyState = {
  selectedCurrency: 'CHF', // Default für Basel/Schweiz
  currencies,
};

const currencySlice = createSlice({
  name: 'currency',
  initialState,
  reducers: {
    setCurrency: (state, action: PayloadAction<Currency>) => {
      state.selectedCurrency = action.payload;
    },
  },
});

export const { setCurrency } = currencySlice.actions;
export default currencySlice.reducer;