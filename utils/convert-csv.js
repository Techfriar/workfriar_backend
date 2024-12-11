/**
 * Converts transaction data to CSV format
 * @param {Array} transactions - Array of transaction objects
 * @returns {String} CSV formatted string
 */
const convertTransactionsToCSV = (transactions) => {
    // Define headers based on the screenshot
    const headers = [
        'Transaction Date',
        'Subscription Name',
        'Description',
        'Amount',
        'Payment Method',
        'Card Provider',
        'Card Holder Name',
        'Card Last Four',
        'Card Expiry Date',
        'License Count',
        'Next Due Date'
    ];

    // Create CSV rows starting with headers
    let csvContent = headers.join(',') + '\n';

    // Convert each transaction to CSV row
    transactions.forEach(transaction => {
        const row = [
            transaction.transactionDate || 'N/A',
            transaction.subscriptionName || 'N/A',
            transaction.description || 'N/A',
            formatAmount(transaction.amount),
            transaction.paymentMethod || 'N/A',
            transaction.cardProvider || 'N/A',
            transaction.cardHolderName || 'N/A',
            transaction.cardLastFour || 'N/A',
            transaction.cardExpiryDate || 'N/A',
            transaction.licenseCount || 'N/A',
            transaction.nextDueDate || 'N/A'
        ].map(value => formatCSVField(value));

        csvContent += row.join(',') + '\n';
    });

    return csvContent;
};

/**
 * Format amount with dollar sign and proper decimal places
 * @param {Number|String} amount 
 * @returns {String}
 */
const formatAmount = (amount) => {
    if (!amount) return '$0.00';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `$${numAmount.toFixed(2)}`;
};

/**
 * Format a field value for CSV
 * @param {String|Number} value 
 * @returns {String}
 */
const formatCSVField = (value) => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    // Escape quotes and wrap field in quotes if it contains comma, quotes or newline
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
};

/**
 * Save transactions data to a CSV file
 * @param {Array} transactions - Array of transaction objects
 * @param {String} filename - Name of the file to save
 */
const saveTransactionsToCSV = (transactions, filename) => {
    const csvContent = convertTransactionsToCSV(transactions);
    
    if (typeof window !== 'undefined') {
        // Browser environment
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    } else {
        // Node.js environment
        const fs = require('fs');
        fs.writeFileSync(filename, csvContent);
    }
};

module.exports = {
    convertTransactionsToCSV,
    saveTransactionsToCSV
};
