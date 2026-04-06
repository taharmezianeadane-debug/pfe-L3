/**
 * API Client - CareerPropulse
 * Gestion centralisée des appels API AJAX
 * Inclut : validation, gestion erreurs, notifications
 */

class APIClient {
    constructor(baseUrl = 'api.php') {
        this.baseUrl = baseUrl;
        this.csrfToken = this.getCsrfToken();
    }

    /**
     * Récupère le token CSRF du DOM
     */
    getCsrfToken() {
        const meta = document.querySelector('meta[name="csrf-token"]');
        return meta ? meta.getAttribute('content') : null;
    }

    /**
     * Effectue une requête API GET
     */
    async get(action, params = {}) {
        const queryString = new URLSearchParams({
            action,
            ...params,
            _t: Date.now() // Cache busting
        }).toString();
        
        const url = `${this.baseUrl}?${queryString}`;
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.csrfToken && { 'X-CSRF-Token': this.csrfToken })
                },
                credentials: 'include'
            });

            return await this.handleResponse(response, url);
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    /**
     * Effectue une requête API POST
     */
    async post(action, data = {}) {
        const url = `${this.baseUrl}?action=${action}`;
        
        // Ajouter le token CSRF aux données
        const payload = {
            ...data,
            ...(this.csrfToken && { '_csrf_token': this.csrfToken })
        };
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.csrfToken && { 'X-CSRF-Token': this.csrfToken })
                },
                body: JSON.stringify(payload),
                credentials: 'include'
            });

            return await this.handleResponse(response, url);
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    /**
     * Gère les réponses du serveur
     */
    async handleResponse(response, url) {
        // Log seulement en développement
        if (this.isDevelopment()) {
            console.log(`[API] ${response.status} @ ${url}`);
        }

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            const message = data.message || `Erreur serveur ${response.status}`;
            throw new APIError(message, response.status, data);
        }

        if (!data.success && data.message) {
            throw new APIError(data.message, response.status, data);
        }

        return data;
    }

    /**
     * Gère les erreurs
     */
    handleError(error) {
        if (error instanceof APIError) {
            showToast(error.message, 'error');
        } else if (error instanceof TypeError) {
            showToast('Erreur de connexion au serveur', 'error');
        } else {
            showToast('Une erreur est survenue', 'error');
        }

        // Log seulement en développement
        if (this.isDevelopment()) {
            console.error('[API Error]', error);
        }
    }

    /**
     * Vérifie si on est en mode développement
     */
    isDevelopment() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               document.body.dataset.dev === 'true';
    }

    /**
     * Valide un email
     */
    validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    /**
     * Valide une longueur de mot de passe
     */
    validatePassword(password) {
        return password && password.length >= 6;
    }

    /**
     * Échappe les caractères HTML pour prévenir les XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Formate une date
     */
    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    }
}

/**
 * Classe personnalisée pour les erreurs API
 */
class APIError extends Error {
    constructor(message, status = 500, data = {}) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.data = data;
    }
}

/**
 * Affiche une notification toast
 */
function showToast(message, type = 'info', duration = 3000) {
    // Vérifier si container existe, sinon le créer
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            z-index: 2000;
            display: flex;
            flex-direction: column;
            gap: 1rem;
        `;
        document.body.appendChild(container);
    }

    // Créer le toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.style.cssText = `
        background: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        border-left: 4px solid;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
    `;

    // Couleur de bordure selon type
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    toast.style.borderLeftColor = colors[type] || colors.info;

    // Contenu du toast
    const strong = document.createElement('strong');
    strong.textContent = {
        success: '✓ Succès',
        error: '✗ Erreur',
        warning: '⚠ Attention',
        info: 'ℹ Info'
    }[type] || 'Info';

    const msg = document.createElement('div');
    msg.textContent = message;
    msg.style.marginTop = '0.5rem';
    msg.style.fontSize = '0.9rem';

    toast.appendChild(strong);
    toast.appendChild(msg);
    container.appendChild(toast);

    // Animation de fermeture
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * Utilitaires pour la gestion des formulaires
 */
const FormUtils = {
    /**
     * Récupère les données d'un formulaire
     */
    getFormData(formId) {
        const form = document.getElementById(formId);
        if (!form) return null;
        return new FormData(form);
    },

    /**
     * Convertit FormData en objet
     */
    formDataToObject(formData) {
        const obj = {};
        for (let [key, value] of formData.entries()) {
            if (obj[key]) {
                // Support pour les champs multi-select
                if (Array.isArray(obj[key])) {
                    obj[key].push(value);
                } else {
                    obj[key] = [obj[key], value];
                }
            } else {
                obj[key] = value;
            }
        }
        return obj;
    },

    /**
     * Affiche les erreurs de validation
     */
    showValidationErrors(errors) {
        Object.entries(errors).forEach(([field, message]) => {
            const element = document.querySelector(`[name="${field}"]`);
            if (element) {
                element.style.borderColor = '#ef4444';
                const errorDiv = document.createElement('small');
                errorDiv.style.cssText = 'color: #ef4444; display: block; margin-top: 0.25rem;';
                errorDiv.textContent = message;
                element.parentNode.insertBefore(errorDiv, element.nextSibling);
            }
        });
    },

    /**
     * Réinitialise les erreurs de validation
     */
    clearValidationErrors() {
        document.querySelectorAll('input, select, textarea').forEach(el => {
            el.style.borderColor = '';
        });
        document.querySelectorAll('small[style*="color: #ef4444"]').forEach(el => {
            el.remove();
        });
    }
};

/**
 * Crée une instance globale du client API
 */
const api = new APIClient('api.php');

// Ajouter l'animation slideOut au CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
