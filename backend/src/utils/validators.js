const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isValidEmail = (value = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const isValidPhone = (value = '') => /^[+]?[\d\s()-]{7,20}$/.test(value.trim());

module.exports = { escapeRegex, isValidEmail, isValidPhone };
