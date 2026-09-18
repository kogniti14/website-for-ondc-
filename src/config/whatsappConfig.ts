/**
 * WhatsApp Business Configuration for Kogniti Minds Private Limited
 * 
 * Instructions:
 * - WHATSAPP_NUMBER stores only the 10-digit number without "+91" or country code.
 * - When generating WhatsApp Click-to-Chat URLs, India's country code "91" is automatically prepended.
 * - Use this configuration everywhere across the website so the number is never hardcoded.
 */

export const WHATSAPP_NUMBER = "9931648595";
export const WHATSAPP_COUNTRY_CODE = "91";

/**
 * Returns the full WhatsApp number with country code (e.g., '919931648595')
 * Strips any spaces, dashes, or non-digit characters.
 */
export const getWhatsAppFullNumber = (number: string = WHATSAPP_NUMBER): string => {
  const cleanNumber = number.replace(/\D/g, '');
  // If the number already starts with country code 91 and has 12 digits, return it
  if (cleanNumber.length === 12 && cleanNumber.startsWith('91')) {
    return cleanNumber;
  }
  // If user provided a 10-digit number, prepend 91
  return `${WHATSAPP_COUNTRY_CODE}${cleanNumber.slice(-10)}`;
};

/**
 * Generates the official WhatsApp Click-to-Chat URL.
 * Example: https://wa.me/919931648595
 * Or with message: https://wa.me/919931648595?text=Hello%20Kogniti%20Minds...
 */
export const getWhatsAppUrl = (message?: string, number: string = WHATSAPP_NUMBER): string => {
  const fullNumber = getWhatsAppFullNumber(number);
  const baseUrl = `https://wa.me/${fullNumber}`;
  if (message && message.trim()) {
    return `${baseUrl}?text=${encodeURIComponent(message.trim())}`;
  }
  return baseUrl;
};

/**
 * Formats the phone number for standard tel: links.
 * Example: tel:+919931648595
 */
export const getTelUrl = (number: string = WHATSAPP_NUMBER): string => {
  const fullNumber = getWhatsAppFullNumber(number);
  return `tel:+${fullNumber}`;
};

/**
 * Human-readable display format.
 * Example: "+91 9931648595" or "+91 99316 48595"
 */
export const getWhatsAppDisplayNumber = (number: string = WHATSAPP_NUMBER, formattedSpaced: boolean = false): string => {
  const cleanNumber = number.replace(/\D/g, '').slice(-10);
  if (formattedSpaced && cleanNumber.length === 10) {
    return `+${WHATSAPP_COUNTRY_CODE} ${cleanNumber.slice(0, 5)} ${cleanNumber.slice(5)}`;
  }
  return `+${WHATSAPP_COUNTRY_CODE} ${cleanNumber}`;
};
