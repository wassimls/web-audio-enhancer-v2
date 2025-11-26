/**
 * PWA Manager - Audio Enhancer v2
 * Handles Progressive Web App features: Service Worker, installation, updates
 */

class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.updateAvailable = false;
        this.serviceWorkerRegistration = null;

        this.init();
    }

    /**
     * Initialize PWA features
     */
    async init() {
        // Check if running as PWA
        this.isInstalled = Utils.isRunningAsPWA();

        if (this.isInstalled) {
            Utils.log('Running as installed PWA');
        }

        // Register Service Worker
        if (Utils.isPWASupported()) {
            await this.registerServiceWorker();
            this.setupInstallPrompt();
            this.checkForUpdates();
        } else {
            console.warn('PWA features not supported in this browser');
        }
    }

    /**
     * Register Service Worker
     */
    async registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            this.serviceWorkerRegistration = registration;

            Utils.log('Service Worker registered successfully');

            // Listen for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New update available
                        this.handleUpdateAvailable();
                    }
                });
            });

            // Check for waiting Service Worker
            if (registration.waiting) {
                this.handleUpdateAvailable();
            }

        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }

    /**
     * Setup install prompt
     */
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent default prompt
            e.preventDefault();

            // Store the event
            this.deferredPrompt = e;

            // Show custom install button (if needed)
            this.showInstallButton();

            Utils.log('Install prompt ready');
        });

        // Listen for successful installation
        window.addEventListener('appinstalled', () => {
            this.isInstalled = true;
            this.hideInstallButton();

            showNotification('تم تثبيت التطبيق بنجاح! 🎉', 'success');
            Utils.log('PWA installed successfully');
        });
    }

    /**
     * Show install button
     */
    showInstallButton() {
        // Create install button if doesn't exist
        let installBtn = document.getElementById('pwa-install-btn');

        if (!installBtn) {
            installBtn = document.createElement('button');
            installBtn.id = 'pwa-install-btn';
            installBtn.className = 'btn btn-outline btn-sm';
            installBtn.innerHTML = '📥 تثبيت التطبيق';
            installBtn.onclick = () => this.promptInstall();

            const header = document.querySelector('.header-actions');
            if (header) {
                header.insertBefore(installBtn, header.firstChild);
            }
        }

        Utils.show(installBtn);
    }

    /**
     * Hide install button
     */
    hideInstallButton() {
        const installBtn = document.getElementById('pwa-install-btn');
        if (installBtn) {
            Utils.hide(installBtn);
        }
    }

    /**
     * Prompt installation
     */
    async promptInstall() {
        if (!this.deferredPrompt) {
            console.warn('Install prompt not available');
            return;
        }

        // Show the prompt
        this.deferredPrompt.prompt();

        // Wait for user's response
        const { outcome } = await this.deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            Utils.log('User accepted installation');
        } else {
            Utils.log('User dismissed installation');
        }

        // Clear the prompt
        this.deferredPrompt = null;
        this.hideInstallButton();
    }

    /**
     * Check for updates periodically
     */
    checkForUpdates() {
        // Check immediately
        this.performUpdateCheck();

        // Check every hour
        setInterval(() => {
            this.performUpdateCheck();
        }, 60 * 60 * 1000);
    }

    /**
     * Perform update check
     */
    async performUpdateCheck() {
        if (!this.serviceWorkerRegistration) return;

        try {
            await this.serviceWorkerRegistration.update();
        } catch (error) {
            console.error('Update check failed:', error);
        }
    }

    /**
     * Handle update available
     */
    handleUpdateAvailable() {
        this.updateAvailable = true;

        // Show update notification
        this.showUpdatePrompt();
    }

    /**
     * Show update prompt to user
     */
    showUpdatePrompt() {
        const notification = document.createElement('div');
        notification.className = 'notification info';
        notification.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
        <div>
          <strong>تحديث جديد متاح!</strong>
          <p style="margin: 0; font-size: 0.875rem; opacity: 0.8;">
            يتوفر إصدار جديد من التطبيق
          </p>
        </div>
        <button class="btn btn-primary btn-sm" id="update-btn">
          تحديث الآن
        </button>
      </div>
    `;

        document.body.appendChild(notification);

        // Handle update button click
        document.getElementById('update-btn')?.addEventListener('click', () => {
            this.applyUpdate();
            document.body.removeChild(notification);
        });

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 10000);
    }

    /**
     * Apply update
     */
    async applyUpdate() {
        if (!this.serviceWorkerRegistration || !this.serviceWorkerRegistration.waiting) {
            return;
        }

        // Send skip waiting message
        this.serviceWorkerRegistration.waiting.postMessage({ action: 'skipWaiting' });

        // Reload page when new Service Worker activates
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
        });
    }

    /**
     * Clear all caches (for debugging)
     */
    async clearCaches() {
        if (!this.serviceWorkerRegistration) return;

        try {
            // Send message to Service Worker
            this.serviceWorkerRegistration.active?.postMessage({ action: 'clearCache' });

            // Also clear caches directly
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map(name => caches.delete(name))
            );

            Utils.log('All caches cleared');
            showNotification('تم مسح الذاكرة المؤقتة', 'success');

        } catch (error) {
            console.error('Failed to clear caches:', error);
        }
    }

    /**
     * Get cache size
     */
    async getCacheSize() {
        if (!('storage' in navigator) || !('estimate' in navigator.storage)) {
            return null;
        }

        try {
            const estimate = await navigator.storage.estimate();
            return {
                usage: Utils.formatFileSize(estimate.usage || 0),
                quota: Utils.formatFileSize(estimate.quota || 0),
                percentage: ((estimate.usage || 0) / (estimate.quota || 1) * 100).toFixed(2)
            };
        } catch (error) {
            console.error('Failed to get cache size:', error);
            return null;
        }
    }
}

// Initialize PWA Manager
const pwaManager = new PWAManager();

// Make it globally accessible
window.PWAManager = pwaManager;

console.log('✅ PWA Manager loaded successfully');
