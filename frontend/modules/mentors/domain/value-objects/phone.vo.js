/**
 * Phone Value Object
 * Неизменяемое значение телефона с валидацией
 */

class Phone {
  constructor(value) {
    this.value = this.validate(value);
  }

  validate(phone) {
    // Телефон опциональный
    if (!phone || phone.trim() === '') {
      return null;
    }

    // Убираем все символы кроме цифр
    const cleaned = phone.replace(/\D/g, '');

    // Должно быть 11 цифр (начиная с 7 или 8)
    if (cleaned.length !== 11 || !['7', '8'].includes(cleaned[0])) {
      throw new Error('Формат телефона: +7 (999) 999-99-99');
    }

    // Нормализуем к формату 7XXXXXXXXXX
    return '7' + cleaned.slice(1);
  }

  format() {
    if (!this.value) return '';
    
    // Форматируем как +7 (999) 999-99-99
    const phone = this.value;
    return `+${phone[0]} (${phone.slice(1, 4)}) ${phone.slice(4, 7)}-${phone.slice(7, 9)}-${phone.slice(9, 11)}`;
  }

  toString() {
    return this.format();
  }

  equals(other) {
    return other instanceof Phone && other.value === this.value;
  }
}

export default Phone;

