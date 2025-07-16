// Test simple pour vérifier notre utilitaire de dates
const { formatDate, formatDateOrDefault, formatTimeAgo, isValidDate } = require('./src/utils/dateHelper.js');

console.log('Test de l\'utilitaire de dates :');
console.log('1. Date valide :', formatDate('2024-01-15'));
console.log('2. Date null :', formatDate(null));
console.log('3. Date undefined :', formatDate(undefined));
console.log('4. Date invalide :', formatDate('invalid-date'));
console.log('5. Date avec default :', formatDateOrDefault(null, 'Jamais'));
console.log('6. Validation date valide :', isValidDate('2024-01-15'));
console.log('7. Validation date invalide :', isValidDate('invalid'));
console.log('8. Temps relatif :', formatTimeAgo('2024-01-15'));
console.log('9. Temps relatif invalide :', formatTimeAgo(null));