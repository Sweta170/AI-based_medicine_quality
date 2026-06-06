/**
 * Check the status of a medicine based on its expiry date.
 * @param {Date|string} expiryDate - The expiry date of the medicine.
 * @returns {string} The status of the medicine: EXPIRED, CRITICAL, WARNING, CAUTION, SAFE
 */
export const checkExpiryStatus = (expiryDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const exp = new Date(expiryDate);
  exp.setHours(0, 0, 0, 0);

  const diffTime = exp.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'EXPIRED';
  } else if (diffDays <= 30) {
    return 'CRITICAL';
  } else if (diffDays <= 60) {
    return 'WARNING';
  } else if (diffDays <= 90) {
    return 'CAUTION';
  } else {
    return 'SAFE';
  }
};
