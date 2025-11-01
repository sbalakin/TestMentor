/**
 * Theme Manager - Управление темной/светлой темой
 */

class ThemeManager {
    constructor() {
        this.THEME_KEY = 'app_theme';
        this.DARK = 'dark';
        this.LIGHT = 'light';
        
        // Инициализация темы
        this.init();
    }

    /**
     * Инициализация темы при загрузке страницы
     */
    init() {
        // По умолчанию темная тема
        const savedTheme = localStorage.getItem(this.THEME_KEY) || this.DARK;
        this.setTheme(savedTheme, false); // false = не сохранять в localStorage повторно
    }

    /**
     * Установить тему
     * @param {string} theme - 'dark' или 'light'
     * @param {boolean} save - сохранять ли в localStorage (по умолчанию true)
     */
    setTheme(theme, save = true) {
        if (theme === this.DARK) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }

        if (save) {
            localStorage.setItem(this.THEME_KEY, theme);
        }

        // Обновить иконку переключателя, если он есть
        this.updateToggleIcon();
    }

    /**
     * Получить текущую тему
     * @returns {string} 'dark' или 'light'
     */
    getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') === 'dark' 
            ? this.DARK 
            : this.LIGHT;
    }

    /**
     * Переключить тему
     */
    toggle() {
        const currentTheme = this.getCurrentTheme();
        const newTheme = currentTheme === this.DARK ? this.LIGHT : this.DARK;
        this.setTheme(newTheme);
    }

    /**
     * Обновить иконку переключателя
     */
    updateToggleIcon() {
        const toggleBtn = document.getElementById('themeToggle');
        if (!toggleBtn) return;

        const currentTheme = this.getCurrentTheme();
        toggleBtn.textContent = currentTheme === this.DARK ? '☀️' : '🌙';
        toggleBtn.title = currentTheme === this.DARK 
            ? 'Переключить на светлую тему' 
            : 'Переключить на темную тему';
    }

    /**
     * Создать кнопку переключателя темы
     * @param {HTMLElement} container - контейнер, куда добавить кнопку
     * @returns {HTMLElement} - созданная кнопка
     */
    createToggleButton(container = document.body) {
        const existingBtn = document.getElementById('themeToggle');
        if (existingBtn) return existingBtn;

        const button = document.createElement('button');
        button.id = 'themeToggle';
        button.className = 'theme-toggle';
        button.setAttribute('aria-label', 'Переключить тему');
        
        const currentTheme = this.getCurrentTheme();
        button.textContent = currentTheme === this.DARK ? '☀️' : '🌙';
        button.title = currentTheme === this.DARK 
            ? 'Переключить на светлую тему' 
            : 'Переключить на темную тему';

        button.addEventListener('click', () => this.toggle());

        container.appendChild(button);
        return button;
    }
}

// Глобальный экземпляр
const themeManager = new ThemeManager();

// Экспорт для использования в модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = themeManager;
}

// Глобальная доступность
window.themeManager = themeManager;

