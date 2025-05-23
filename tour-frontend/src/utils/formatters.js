/**
 * Format a number as a currency string
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (e.g., 'USD', 'EUR')
 * @param {number} decimals - Number of decimal places to show
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD', decimals = 0) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
};

/**
 * Format a duration in days
 * @param {number} days - Number of days
 * @returns {string} Formatted duration string
 */
export const formatDuration = (days) => {
  if (days === 1) return '1 day';
  return `${days} days`;
};

/**
 * Format a date string to a more readable format
 * @param {string} dateString - Date string to format
 * @param {string} locale - Locale string (e.g., 'en-US')
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, locale = 'en-US') => {
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  };
  return new Date(dateString).toLocaleDateString(locale, options);
};

/**
 * Truncate text to a specified length and add ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text with ellipsis if needed
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Generate a slug from a string
 * @param {string} str - String to convert to a slug
 * @returns {string} URL-friendly slug
 */
export const slugify = (str) => {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

/**
 * Get the first paragraph from HTML content
 * @param {string} html - HTML content
 * @returns {string} First paragraph text
 */
export const getFirstParagraph = (html) => {
  if (!html) return '';
  const temp = document.createElement('div');
  temp.innerHTML = html;
  const firstParagraph = temp.querySelector('p');
  return firstParagraph ? firstParagraph.textContent : '';
};
