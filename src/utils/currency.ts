import { Currency, CurrencyInfo } from '../types';

// Utility function to format price with currency
export const formatPrice = (price: number | string, currency: Currency, currencyInfo: CurrencyInfo[]): string => {
  if (!price || price === '') return '';
  
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice)) return '';
  
  const currencyData = currencyInfo.find(c => c.code === currency);
  if (!currencyData) return `${numPrice}`;
  
  // Format based on currency
  switch (currency) {
    case 'CHF':
      return `CHF ${numPrice.toFixed(2)}`;
    case 'EUR':
      return `${numPrice.toFixed(2)}€`;
    case 'GBP':
      return `£${numPrice.toFixed(2)}`;
    case 'USD':
      return `$${numPrice.toFixed(2)}`;
    case 'SEK':
    case 'NOK':
    case 'DKK':
      return `${numPrice.toFixed(2)} ${currencyData.symbol}`;
    case 'PLN':
      return `${numPrice.toFixed(2)} ${currencyData.symbol}`;
    case 'CZK':
      return `${numPrice.toFixed(2)} ${currencyData.symbol}`;
    default:
      return `${numPrice.toFixed(2)} ${currencyData.symbol}`;
  }
};

// Get currency symbol only
export const getCurrencySymbol = (currency: Currency, currencyInfo: CurrencyInfo[]): string => {
  const currencyData = currencyInfo.find(c => c.code === currency);
  return currencyData?.symbol || currency;
};