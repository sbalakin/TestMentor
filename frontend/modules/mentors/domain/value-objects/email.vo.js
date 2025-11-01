/**
 * Email Value Object
 * Неизменяемое значение с валидацией
 */

class Email {
  constructor(value) {
    this.value = this.validate(value);
  }

  validate(email) {
    if (!email || typeof email !== 'string') {
      throw new Error('Email обязателен');
    }

    const trimmed = email.trim().toLowerCase();
    
    if (trimmed === '') {
      throw new Error('Email не может быть пустым');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      throw new Error('Некорректный формат email');
    }

    return trimmed;
  }

  toString() {
    return this.value;
  }

  equals(other) {
    return other instanceof Email && other.value === this.value;
  }
}

export default Email;

