/**
 * Gets the currency symbol for a given currency code.
 * @param {string} currencyCode - The three-letter currency code (e.g., 'USD', 'INR').
 * @returns {string} The currency symbol for the provided currency code.
 */

function getCurrencySymbol(currencyCode) {
    try {
      // We will be using the `Intl.NumberFormat` to retrieve the currency symbol
      const formatter = new Intl.NumberFormat('en', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 0,
      });

      
      const formattedValue = formatter.format(1);
      return formattedValue.replace(/\d|[.,]/g, '').trim();
    } catch (error) {
      console.error(`Invalid currency code: ${currencyCode}`);
      return currencyCode; // Fallback to returning the code itself
    }
  }
  
  export default getCurrencySymbol;
  
//  Example usage:
//   console.log(getCurrencySymbol('USD')); // Output: $
//   console.log(getCurrencySymbol('INR')); // Output: ₹
//   console.log(getCurrencySymbol('EUR')); // Output: €
//   console.log(getCurrencySymbol('XYZ')); // Output: XYZ (fallback for invalid code)
  