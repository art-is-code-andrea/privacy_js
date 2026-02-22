# @art_is_code/privacy_js

A lightweight, zero-dependency, and professional cookie consent manager. Designed for developers who want full control without the bloat of external tracking scripts.

## 🚀 Key Features

* **Zero Dependencies**: Pure Vanilla JS, no jQuery or external libraries required.
* **Privacy First**: No external scripts or styles are loaded unless the user grants consent.
* **Cookie Versioning**: Easily refresh user consent when your tracking tools or privacy laws change.
* **Smart Fallback**: Built-in English translations as a safety net for missing strings.
* **Highly Flexible**: Native support for Static sites, WordPress, and SPAs (Vue, React, etc.).

---

## 🛠  Installation

1. Include the minified JS and CSS in your project:


```bash
npm install @art_is_code/privacy_js
```
Alternatively, you can include it manually:
```html
<link rel="stylesheet" href="dist/privacy_js.min.css">
<script type="module" src="dist/privacy_js.min.js"></script>
```
##  💡 Quick Start

Choose the method that best fits your project's architecture:
**Option A: Template Integration** (Recommended for PHP/WordPress/Laravel)
Initialize directly in your footer. This is ideal if you want to inject translations directly from your server-side engine.

```html
<script src="dist/privacy_js.min.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', () => {
        new AIC_Privacy({
            name: 'ArtIsCode Studio',
            language: '<?= $current_lang ?>',
            translations: {
                <?= $current_lang ?>: {
                    body: "<?= trad('privacy_body') ?>",
                    // ...
                }
            }
        });
    });
</script>
```
**Option B: Module Integration** (Vite/Webpack/Laravel Mix)
Perfect for SPA or modern frontend stacks where you have JS translation helpers.
```javascript
import { Privacy } from '@art_is_code/privacy_js';

const myPrivacy = new Privacy({
    name: 'ArtIsCode Studio',
    language: currentLang, 
    translations: {
        en: {
            body: lang.get('privacy.body'), // Example using a JS translation helper
            // ...
        }
    }
});
```
**Option C: CDN Integration** (No installation required)
Just drop these links into your HTML:

```html
<link rel="stylesheet" href="[https://cdn.jsdelivr.net/npm/@art_is_code/privacy_js/dist/privacy_js.min.css](https://cdn.jsdelivr.net/npm/@art_is_code/privacy_js/dist/privacy_js.min.css)">
<script src="[https://cdn.jsdelivr.net/npm/@art_is_code/privacy_js/dist/privacy_js.min.js](https://cdn.jsdelivr.net/npm/@art_is_code/privacy_js/dist/privacy_js.min.js)"></script>
```
## ⚙️ Configuration Options
You can pass these options to the AIC_Privacy constructor to customize the behavior and appearance of the module.
| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| **name** | `string` | 'My Website' | The name of your website/studio used in translations. |
| **language** | `string` | 'en' | The active language code (e.g., 'it', 'fr'). |
| **cookiePrefix** | `string` | 'AIC_P_' | Prefix for the cookies stored in the browser. |
| **cookieDuration** | `number` | 395 | Consent duration in days (13 months). |
| **cookieVersion** | `number` | 1 | Increment this to force all users to re-accept the consent. |
| **position** | `string` | 'bottom' | Banner position: 'bottom', 'top', or 'middle'. |
| **privacyPolicyURL** | `string` | '/privacy-policy' | Link to your detailed privacy policy page. |
| **triggerClass** | `string` | 'aic_p_linkcookie' | The CSS class used to re-open the settings panel. |
| **vendors** | `array` | [] | List of optional trackers (e.g., `[{id:'analytics'}]`). |
| **translations** | `object` | `{ en: {...} }` | Dictionary of strings for each supported language. |
## 🔄 Cookie Versioning & Duration

One of the most powerful features of PrivacyJS is the ability to force a consent refresh when your tracking stack changes.

* **`cookieVersion`**: Increment this number (e.g., from `1` to `2`) in your config whenever you add a new vendor or change your privacy policy. The banner will reappear for all users.
* **`cookieDuration`**: Set the lifetime of the consent cookie in days (default is 395 days / 13 months, as per GDPR recommendations).

```javascript
new AIC_Privacy({
    cookieVersion: 2,    // Force refresh
    cookieDuration: 180, // 6 months duration
    // ...
});
```

## 🛠 Technical Implementations
1. Server-Side (PHP / WordPress / Laravel)
Check consent before rendering scripts to ensure 100% compliance and performance.
```php
<?php if(isset($_COOKIE['AIC_P_setting_analytics']) && $_COOKIE['AIC_P_setting_analytics'] === '1'): ?>
   here your google analytics code
    <?php endif; ?>

```
2. Client-Side (AJAX / SPAs)
Listen for the custom event to trigger trackers dynamically without page reloads.
```javascript
window.addEventListener('artIsPrivacyUpdated', (e) => {
    if (window.AIC_Privacy.hasConsent('analytics')) {
        initAnalytics();
    }
});
```
## 🎨 Custom Styling
### Font Inheritance
By default, the module uses font-family: inherit. This ensures the banner perfectly matches your website's typography without loading extra assets.

Modern Toggle Switches (Optional)
If you prefer iOS-style switches over standard checkboxes, add this snippet to your CSS:

```css
.aic_p_vendor_opt input[type="checkbox"] {
    appearance: none;
    -webkit-appearance: none;
    width: 36px;
    height: 20px;
    background: #ccc;
    border-radius: 20px;
    position: relative;
    cursor: pointer;
    transition: background 0.3s;
}

.aic_p_vendor_opt input[type="checkbox"]:checked {
    background: #000; /* ArtIsCode Black */
}

.aic_p_vendor_opt input[type="checkbox"]::before {
    content: "";
    position: absolute;
    width: 14px; height: 14px;
    background: white;
    border-radius: 50%;
    top: 3px; left: 3px;
    transition: transform 0.3s;
}

.aic_p_vendor_opt input[type="checkbox"]:checked::before {
    transform: translateX(16px);
}
```
---

## 💡 Pro Tips

* **Dynamic Placeholders**: Use `{name}` and `{privacyPolicyURL}` in your translation strings. They will be automatically replaced by the values defined in your configuration.
* **Event Detail**: The `artIsPrivacyUpdated` event carries the Privacy instance in `e.detail`, allowing you to access methods like `hasConsent()` directly from the event.
* **Accessibility**: The module uses native checkboxes and semantic buttons, ensuring basic compatibility with screen readers.

##  👁️ Live Demo
You can find a complete working example in the demo.html file included in this repository.
View Online: [Live Demo](https://art-is-code-andrea.github.io/privacy_js/demo.html)

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
MIT © Andrea D'Agostino (art is code)
