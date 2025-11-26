# Audio Enhancer v2 | محسّن الصوت الاحترافي 🎵

[![PWA](https://img.shields.io/badge/PWA-enabled-blue)](https://developers.google.com/web/progressive-web-apps/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

**تطبيق ويب ت progressieve متقدم لتحسين الصوت مع تنقية وفلاتر صوتية احترافية. يعمل أوفلاين 100% بعد التثبيت.**

**Advanced Progressive Web App for audio enhancement with professional noise reduction and audio filters. Works 100% offline after installation.**

---

## ✨ المميزات | Features

### 🎯 الميزات الأساسية | Core Features

- **📁 رفع ملفات متعددة الصيغ** - دعم MP3, WAV, OGG, M4A, FLAC
- **🎯 تنقية الصوت** - إزالة الضوضاء والهسهسة
- **🎛️ معادل صوتي 3-نطاقات** - Bass, Mid, Treble
- **📊 ضاغط ديناميكي** - توازن مستوى الصوت
- **🎪 صدى وتأثيرات** - Reverb وتأثيرات صوتية
- **🔊 تعزيز الباص** - تحسين الترددات المنخفضة
- **👁️ موجة صوتية حية** - Waveform Visualizer
- **⏯️ تحكم كامل بالتشغيل** - Play, Pause, Stop, Loop

### 🎨 القوالب الجاهزة | Presets

- **🎙️ Voice Enhancement** - لتسجيلات الصوت والبودكاست
- **🎵 Music** - إعدادات متوازنة للموسيقى
- **🎧 Podcast** - كلام واضح مع تقليل الضوضاء
- **⚙️ Custom** - إعدادات يدوية مخصصة

### 📱 PWA Features

- ✅ **يعمل أوفلاين 100%** - بعد التحميل الأول
- ✅ **قابل للتثبيت** - على سطح المكتب والموبايل
- ✅ **تحديثات تلقائية** - Service Worker
- ✅ **سريع جداً** - تحميل فوري من الكاش
- ✅ **قابل للتحويل لـ APK** - Capacitor أو TWA

---

## 🚀 البدء السريع | Quick Start

### المتطلبات | Requirements

- متصفح حديث يدعم Web Audio API
  - ✅ Chrome (recommended)
  - ✅ Firefox
  - ✅ Edge
  - ✅ Safari

### التشغيل | Run Locally

1. **Clone أو Download المشروع**
   ```bash
   git clone <repository-url>
   cd web-audio-enhancer-v2
   ```

2. **تشغيل خادم محلي**
   
   **Using Python:**
   ```bash
   # Python 3
   python -m http.server 8000
   ```
   
   **Using Node.js:**
   ```bash
   npx serve
   ```
   
   **Using VS Code:**
   - Install "Live Server" extension
   - Right-click `index.html` → "Open with Live Server"

3. **فتح التطبيق**
   - Navigate to `http://localhost:8000` (or the port shown)
   - أو افتح `index.html` مباشرة في المتصفح

---

## 📖 دليل الاستخدام | User Guide

### 1. رفع ملف صوتي | Upload Audio File

- اسحب وأفلت الملف على منطقة الرفع
- أو انقر للاختيار من جهازك
- الصيغ المدعومة: MP3, WAV, OGG, M4A, FLAC

### 2. اختيار قالب | Select Preset

- **Voice Enhancement**: للتسجيلات الصوتية
- **Music**: للمقطوعات الموسيقية
- **Podcast**: للمحادثات والبودكاست
- **Custom**: لتخصيص يدوي

### 3. ضبط الفلاتر | Adjust Filters

#### تنقية الصوت | Noise Reduction
- فعّل الفلتر وحدد مستوى التنقية (0-100%)

#### معادل الصوت | Equalizer
- Bass: الترددات المنخفضة
- Mid: الترددات المتوسطة
- Treble: الترددات العالية

#### الضاغط | Compressor
- Threshold: حد التفعيل
- Ratio: نسبة الضغط

#### تأثيرات إضافية | Additional Effects
- Reverb: صدى
- Bass Boost: تعزيز الباص

### 4. التصدير | Export

- اختر الصيغة: MP3, WAV, OGG
- اختر الجودة: 128-320 kbps
- انقر "تحميل الملف المحسّن"

---

## 📱 تثبيت التطبيق | Install as PWA

### على الحاسوب | Desktop

**Chrome / Edge:**
1. افتح التطبيق
2. انقر على أيقونة التثبيت في شريط العنوان
3. أو: القائمة → "تثبيت Audio Enhancer"

**Firefox:**
1. استخدم "Add to Home Screen" من القائمة

### على الموبايل | Mobile

**Android (Chrome):**
1. افتح التطبيق
2. القائمة → "Add to Home Screen"
3. أو انتظر البانر التلقائي

**iOS (Safari):**
1. افتح التطبيق
2. زر المشاركة → "Add to Home Screen"

---

## 🔧 التحويل إلى APK | Convert to APK

### الطريقة 1: Capacitor ⭐ (الموصى بها)

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli
npx cap init "Audio Enhancer" "com.audioenhancer.app"

# Add Android platform
npm install @capacitor/android
npx cap add android

# Sync files
npx cap sync

# Open in Android Studio
npx cap open android

# Build APK
cd android
./gradlew assembleRelease
```

الملف: `android/app/build/outputs/apk/release/app-release.apk`

### الطريقة 2: TWA (Trusted Web Activity)

**المتطلبات:**
- استضافة HTTPS
- نشر التطبيق على الإنترنت

```bash
# Using Bubblewrap
npx @bubblewrap/cli init --manifest https://yoursite.com/manifest.json
npx @bubblewrap/cli build
```

---

## 🏗️ البنية التقنية | Technical Architecture

### Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Audio**: Web Audio API
- **PWA**: Service Worker, Cache API
- **Fonts**: Google Fonts (Inter, Fira Code)

### File Structure

```
web-audio-enhancer-v2/
├── index.html              # Main page
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker
├── offline.html            # Offline fallback
├── css/
│   ├── variables.css       # Design system
│   ├── styles.css          # Main styles
│   └── animations.css      # Animations
├── js/
│   ├── app.js              # Main application
│   ├── audio-processor.js  # Audio engine
│   ├── filters.js          # Audio filters
│   ├── noise-reduction.js  # Noise reduction
│   ├── ui-controller.js    # UI management
│   ├── presets.js          # Presets manager
│   ├── pwa-manager.js      # PWA features
│   └── utils.js            # Utilities
└── assets/
    └── icons/              # PWA icons
```

---

## 🎨 التخصيص | Customization

### إضافة قالب جديد | Add New Preset

في `js/presets.js`:

```javascript
PRESETS.myPreset = {
  name: 'My Preset',
  nameAr: 'قالبي',
  description: 'Custom settings',
  descriptionAr: 'إعدادات مخصصة',
  settings: {
    noise: { enabled: true, level: 50 },
    equalizer: { enabled: true, bass: 0, mid: 2, treble: 1 },
    // ...
  }
};
```

### تخصيص الألوان | Customize Colors

في `css/variables.css`:

```css
:root {
  --accent-primary: #your-color;
  --gradient-primary: linear-gradient(135deg, #color1 0%, #color2 100%);
}
```

---

## 🐛 استكشاف الأخطاء | Troubleshooting

### التطبيق لا يعمل
- تأكد من استخدام HTTPS أو localhost
- تحقق من دعم المتصفح لـ Web Audio API
- افتح Console للتحقق من الأخطاء

### الصوت لا يشتغل
- تأكد من الصيغة مدعومة
- جرّب ملف آخر
- تحقق من إعدادات الصوت في المتصفح

### Service Worker لا يعمل
- تأكد من HTTPS أو localhost
- امسح الكاش وأعد تحميل الصفحة
- تحقق من Application → Service Workers في DevTools

---

## 📝 الترخيص | License

MIT License - استخدم بحرية!

---

## 🤝 المساهمة | Contributing

المساهمات مرحب بها! افتح Issue أو Pull Request.

---

## 📞 تواصل | Contact

للدعم أو الأسئلة، افتح Issue في المشروع.

---

**🎵 استمتع بتحسين ملفاتك الصوتية! | Enjoy enhancing your audio files!**
