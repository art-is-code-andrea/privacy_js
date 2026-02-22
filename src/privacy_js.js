class Privacy {
    constructor(options = {}) {
        // Default values for the module
        const defaults = {
            containerId: 'AICPrivacy',
            wrapperId: 'AICPrivacy_wrapper',
            cookiePrefix: 'AIC_P_',
            cookieDuration: 395, // In number of days (395 = 13 months)
            cookieVersion: 1,    // Increment this to force a consent refresh (e.g., new law or new vendors)
            language: 'en',
            position: 'bottom', 
            name: 'My Website',
            privacyPolicyURL: '/privacy-policy',
            vendors: [], // List of optional services (e.g., Analytics, Pixel)
            translations: {
                en: {
                    body: "Welcome to {name}. We use cookies to improve your experience. <a href='{privacyPolicyURL}'>Read Policy</a>",
                    acceptall: "Accept All",
                    acceptonlynecessary: "Only Necessary",
                    linktraceurs: "Custom Settings",
                    savesettings: "Save and Close",
                    necessary_title: "Technical Cookies",
                    necessary_desc: "These cookies are essential for the website to function properly and to remember your privacy choices."
                }
            }, 
            triggerClass: 'aic_p_linkcookie' // CSS class to re-open settings
        };

        // Merge user options with defaults
        this.settings = { ...defaults, ...options };
        this.translations = this.settings.translations;
        
        // Safety check: warn if no optional vendors are defined
        if (this.settings.vendors.length === 0) {
            console.warn("Privacy_js: No optional vendors defined. The banner will only handle necessary cookies.");
        }

        this.init();
    }

    init() {
        this.injectStructure();
        this.bindGlobalTriggers();

        // Check version and previous consent status
        const savedVersion = this.getCookieValue(this.settings.cookiePrefix + 'version');
        const cookieDone = this.getCookieValue(this.settings.cookiePrefix + 'done');

        // Show banner if consent is missing or version is outdated
        if (cookieDone !== '1' || savedVersion !== String(this.settings.cookieVersion)) {
            this.showInfos();
        } else {
            this.hide();
        }
    }

    // Injects necessary HTML containers into the body
    injectStructure() {
        if (document.getElementById(this.settings.containerId)) return;

        const inflayer = document.createElement('div');
        inflayer.id = this.settings.containerId;
        inflayer.className = `aic_p_main_container display_${this.settings.position} display_none`;
        document.body.appendChild(inflayer);

        const wrapper = document.createElement('div');
        wrapper.id = this.settings.wrapperId;
        wrapper.className = "aic_p_wrapper";
        inflayer.appendChild(wrapper);
    }

    // Layer 1: Main informational banner
    showInfos() {
        const wrapper = document.getElementById(this.settings.wrapperId);
        const layer = document.getElementById(this.settings.containerId);
        
        layer.classList.remove('display_none');
        layer.className = `aic_p_main_container display_${this.settings.position}`;

        let html = `
            <div class="aic_p_body">
                ${this.trad('body').replace(/{name}/g, this.settings.name).replace(/{privacyPolicyURL}/g, this.settings.privacyPolicyURL)}
            </div>
            <div class="aic_p_buttons">
                <button class="aic_p_acceptall">${this.trad('acceptall')}</button>
                <button class="aic_p_acceptonlynecessary">${this.trad('acceptonlynecessary')}</button>
                <button class="aic_p_linktraceurs">${this.trad('linktraceurs')}</button>
            </div>
        `;
        
        wrapper.innerHTML = html;
        this.bindBannerEvents();
    }

    // Layer 2: Detailed settings panel
    showSettings() {
        const wrapper = document.getElementById(this.settings.wrapperId);
        document.getElementById(this.settings.containerId).className = "aic_p_main_container display_middle";

        let html = `<div class="aic_p_vendors">`;
        
        // Automatically inject Technical Cookies (always active and disabled)
        html += this.renderVendorRow({
            id: 'necessary',
            name: this.trad('necessary_title'),
            description: this.trad('necessary_desc')
        }, true);

        // Inject user-defined vendors
        this.settings.vendors.forEach(vendor => {
            html += this.renderVendorRow(vendor, false);
        });

        html += `<button class="aic_p_save_btn">${this.trad('savesettings')}</button></div>`;
        wrapper.innerHTML = html;

        wrapper.querySelector('.aic_p_save_btn').onclick = () => this.saveCustomSettings();
    }

    // Renders a single vendor row
    renderVendorRow(vendor, isNecessary) {
        const cookieName = this.settings.cookiePrefix + 'setting_' + vendor.id;
        const isChecked = isNecessary || this.getCookieValue(cookieName) === '1';
        
        return `
            <div class="aic_p_vendor_opt">
                <input type="checkbox" id="v_${vendor.id}" name="${cookieName}" 
                       ${isChecked ? 'checked' : ''} ${isNecessary ? 'disabled' : ''}>
                <label for="v_${vendor.id}">
                    <div class="aic_p_vendor_title">${vendor.name}</div>
                    <div class="aic_p_vendor_body">${vendor.description.replace(/{name}/g, this.settings.name)}</div>
                </label>
            </div>
        `;
    }

    // Saves user's custom choices
    saveCustomSettings() {
        this.setCookieValue(this.settings.cookiePrefix + 'setting_necessary', '1');

        this.settings.vendors.forEach(vendor => {
            const cb = document.getElementById(`v_${vendor.id}`);
            if(cb) this.setCookieValue(this.settings.cookiePrefix + 'setting_' + vendor.id, cb.checked ? '1' : '0');
        });
        this.completeConsent();
    }

    // Accept all tracking
    acceptAll() {
        this.setCookieValue(this.settings.cookiePrefix + 'setting_necessary', '1');
        this.settings.vendors.forEach(vendor => {
            this.setCookieValue(this.settings.cookiePrefix + 'setting_' + vendor.id, '1');
        });
        this.completeConsent();
    }

    // Accept only necessary and reject others
    acceptNecessary() {
        this.setCookieValue(this.settings.cookiePrefix + 'setting_necessary', '1');
        this.settings.vendors.forEach(vendor => {
            this.setCookieValue(this.settings.cookiePrefix + 'setting_' + vendor.id, '0');
        });
        this.completeConsent();
    }

    // Finalize consent, save version, and dispatch JS event
    completeConsent() {
        this.setCookieValue(this.settings.cookiePrefix + 'done', '1');
        this.setCookieValue(this.settings.cookiePrefix + 'version', this.settings.cookieVersion);
        
        this.hide();
        // Custom event to allow AJAX/SPA integrations
        window.dispatchEvent(new CustomEvent('artIsPrivacyUpdated', { detail: this }));
    }

    hide() {
        const layer = document.getElementById(this.settings.containerId);
        if(layer) layer.className = "aic_p_main_container display_none";
    }

    // Intelligent translation handler with English fallback
    trad(entity) {
        const lang = this.settings.language;
        
        if (this.translations[lang] && this.translations[lang][entity]) {
            return this.translations[lang][entity];
        }
        
        if (this.translations['en'] && this.translations['en'][entity]) {
            return this.translations['en'][entity];
        }
        
        console.error(`Privacy_js: CRITICAL - Translation key [${entity}] not found!`);
        return `[[MISSING_TRAD:${entity}]]`;
    }

    bindBannerEvents() {
        const container = document.getElementById(this.settings.containerId);
        if(!container) return;
        
        container.querySelector('.aic_p_acceptall').onclick = () => this.acceptAll();
        container.querySelector('.aic_p_acceptonlynecessary').onclick = () => this.acceptNecessary();
        container.querySelector('.aic_p_linktraceurs').onclick = () => this.showSettings();
    }

    // Listen for global clicks for re-opening triggers (Event Delegation)
    bindGlobalTriggers() {
        document.addEventListener('click', (e) => {
            const target = e.target.closest(`.${this.settings.triggerClass}`);
            if (target) {
                e.preventDefault();
                this.showSettings();
            }
        });
    }

    // Public method to check consent for a specific vendor
    hasConsent(vendorId) {
        if(vendorId === 'necessary') return true;
        return this.getCookieValue(this.settings.cookiePrefix + 'setting_' + vendorId) === '1';
    }

    getCookieValue(name) {
        let b = document.cookie.match('(^|[^;]+)\\s*' + name + '\\s*=\\s*([^;]+)');
        return b ? b.pop() : '';
    }

    setCookieValue(name, value) {
        const expiryDate = new Date();
        expiryDate.setTime(expiryDate.getTime() + (this.settings.cookieDuration * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value}; path=/; expires=${expiryDate.toGMTString()}; SameSite=Lax`;
    }
}

// Export for ES6 Modules
export { Privacy };

// Global exposure for <script> tag integration
if (typeof window !== 'undefined') {
    window.AIC_Privacy = Privacy;
}