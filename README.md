# 🕌 Athan Times - Premium Islamic Prayer Times App

A modern, feature-rich Progressive Web Application (PWA) for accurate Islamic prayer times, Qibla direction, Quran recitation, and nearby mosque finder.

![Athan Times](https://img.shields.io/badge/Version-2.0-blue) ![License](https://img.shields.io/badge/License-MIT-green) ![PWA](https://img.shields.io/badge/PWA-Enabled-orange)

## ✨ Features

### 🕐 Prayer Times
- **Real-time accurate prayer times** using Aladhan API
- **Multiple calculation methods** (ISNA, MWL, Karachi, etc.)
- **Live countdown** to next prayer with urgency indicators
- **Custom notifications** and reminders
- **Offline caching** for uninterrupted access
- **Hijri date display** with Islamic events

### 🧭 Qibla Compass
- **Scientific accuracy** using spherical trigonometry
- **Magnetic declination correction** via NOAA API
- **Real device orientation** support (iOS 13+ compatible)
- **Visual accuracy indicators** with calibration status
- **Distance to Kaaba** calculation
- **Interactive compass** with directional guidance

### 📖 Quran Audio Player
- **High-quality recitations** from renowned reciters
- **Verse-by-verse playback** with auto-progression
- **Multiple reciters** (Mishary Alafasy, Al-Sudais, etc.)
- **Bookmark system** and play history
- **Variable playback speed** (0.5x to 1.5x)
- **Search functionality** for Surahs
- **Keyboard shortcuts** for better accessibility

### 🗺️ Nearby Mosques
- **Interactive map** using Leaflet + OpenStreetMap
- **Real-time mosque data** via Overpass API
- **Distance calculation** and sorting options
- **Custom markers** and search radius
- **Directions integration** with Google Maps
- **No API key required** - completely free

### 📱 Progressive Web App
- **Offline functionality** with service worker
- **Installable** on mobile and desktop
- **Push notifications** for prayer times
- **Responsive design** for all screen sizes
- **Fast loading** with optimized caching

## 🚀 Quick Start

### Prerequisites
- Modern web browser with JavaScript enabled
- Internet connection for initial setup
- Location permission for accurate prayer times

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/athan-times.git
   cd athan-times
   ```

2. **Serve the files**
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

### Alternative: Direct File Access
You can also open `index.html` directly in your browser, though some features may be limited without a server.

## 📖 Usage

### First Launch
1. **Allow location access** when prompted for accurate prayer times
2. **Enable notifications** for prayer reminders
3. **Wait for data loading** - prayer times and location will auto-detect

### Navigation
- **Prayer Times Tab**: View today's prayer schedule with live countdown
- **Qibla Tab**: Find direction to Mecca with precision compass
- **Quran Tab**: Listen to beautiful recitations with advanced controls
- **Mosques Tab**: Discover nearby mosques on interactive map

### Customization
- **Settings**: Access via gear icon to customize prayer methods
- **Notifications**: Set custom reminders for each prayer
- **Display**: Choose between different themes and layouts

## 🔧 Technical Details

### Architecture
```
athan-times/
├── index.html          # Main application HTML
├── styles.css          # Complete styling and animations
├── script.js           # Core JavaScript functionality
├── manifest.json       # PWA configuration
├── sw.js              # Service worker for offline support
├── test.html          # Testing utilities
└── README.md          # This file
```

### APIs Used
- **[Aladhan API](https://aladhan.com/prayer-times-api)** - Prayer times calculation
- **[OpenStreetMap Nominatim](https://nominatim.org/)** - Reverse geocoding
- **[Overpass API](https://overpass-api.de/)** - Mosque location data
- **[NOAA Magnetic Declination](https://www.ngdc.noaa.gov/)** - Compass accuracy
- **[Al Quran Cloud CDN](https://alquran.cloud/cdn)** - Audio recitations

### Browser Support
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ⚠️ IE 11 (limited functionality)

### Device Compatibility
- 📱 **Mobile**: iOS 13+, Android 6+
- 💻 **Desktop**: Windows, macOS, Linux
- 🌐 **Web**: All modern browsers
- 📲 **PWA**: Installable on all platforms

## ⚙️ Configuration

### Prayer Calculation Methods
```javascript
// Available in localStorage
prayerMethod: '2'    // ISNA (default)
madhab: '0'          // Shafi (default)
midnightMode: '0'    // Standard
latitudeRule: '1'    // Angle based
```

### Supported Methods
- **1**: University of Islamic Sciences, Karachi
- **2**: Islamic Society of North America (ISNA)
- **3**: Muslim World League (MWL)
- **4**: Umm Al-Qura University, Makkah
- **5**: Egyptian General Authority of Survey

### Customization Options
```javascript
// Notification preferences
quranAutoRepeat: false
quranPlaybackSpeed: 1.0
quranBookmarks: []
lastPrayerTimes: {...}
```

## 🧪 Testing

### Automated Testing
Run the included test page to verify functionality:
```bash
# Open test.html in browser
open test.html
```

### Test Coverage
- ✅ GPS location detection
- ✅ Prayer times API integration
- ✅ Fallback systems
- ✅ Offline functionality
- ✅ Notification system

### Manual Testing
1. **Location**: Test with/without GPS permission
2. **API**: Test with/without internet connection
3. **Responsive**: Test on different screen sizes
4. **PWA**: Test installation and offline usage

## 🛠️ Development

### Local Development
```bash
# Install development server
npm install -g live-server

# Start development server
live-server --port=8000

# Auto-refresh on file changes
```

### Code Structure
```javascript
// Main initialization
document.addEventListener('DOMContentLoaded', initApp)

// Core functions
initApp()                    // App initialization
getLocationAndPrayerTimes()  // Location & prayer times
fetchPrayerTimes()           // API integration
displayPrayerTimes()         // UI rendering
initQiblaCompass()          // Compass functionality
initQuranPlayer()           // Audio player
initMosqueFinder()          // Map integration
```

### Adding Features
1. **New Prayer Method**: Update `fetchPrayerTimes()` function
2. **New Reciter**: Add to `reciterData` object
3. **New Language**: Update `calculateHijriDate()` for localization
4. **New Theme**: Extend CSS variables and classes

## 🔒 Privacy & Security

### Data Collection
- **Location**: Used only for prayer time calculation (not stored)
- **Preferences**: Stored locally in browser
- **No tracking**: No analytics or third-party trackers
- **No accounts**: No user registration required

### Permissions
- **Location**: Required for accurate prayer times
- **Notifications**: Optional for prayer reminders
- **Device Orientation**: Optional for Qibla compass

### Offline Data
- Prayer times cached for up to 24 hours
- Map tiles cached automatically
- No personal data transmitted

## 🤝 Contributing

### How to Contribute
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow existing code style and patterns
- Add comments for complex functionality
- Test on multiple browsers and devices
- Update documentation for new features
- Ensure offline functionality works

### Bug Reports
Please include:
- Browser and version
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Console errors (if any)

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Athan Times

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

## 🙏 Acknowledgments

### APIs & Services
- **[Aladhan](https://aladhan.com/)** - Islamic prayer times and calendar
- **[OpenStreetMap](https://www.openstreetmap.org/)** - Free map data
- **[Al Quran Cloud](https://alquran.cloud/)** - Quran audio and text
- **[Font Awesome](https://fontawesome.com/)** - Beautiful icons
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS

### Inspiration
- Islamic community needs for accessible prayer tools
- Modern web technology capabilities
- Open source collaboration spirit

### Special Thanks
- All beta testers and early users
- Islamic scholars for guidance on accuracy
- Developer community for open source libraries
- Users providing feedback and suggestions

## 📞 Support

### Getting Help
- **Documentation**: Read this README thoroughly
- **Issues**: [GitHub Issues](https://github.com/yourusername/athan-times/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/athan-times/discussions)
- **Email**: support@athantimes.app

### FAQ

**Q: Why is my location not detected?**
A: Ensure you've allowed location permission and have GPS enabled. The app will fallback to New York coordinates if location fails.

**Q: Prayer times seem incorrect?**
A: Check your location accuracy and try different calculation methods in settings. Some regions may require specific methods.

**Q: Qibla direction is wrong?**
A: Ensure device orientation permission is granted and calibrate your compass by moving the device in a figure-8 pattern.

**Q: Audio not playing?**
A: Check your internet connection and browser's autoplay policy. Some browsers require user interaction before playing audio.

**Q: App not working offline?**
A: Initial data loading requires internet connection. Once loaded, cached prayer times work offline for 24 hours.

---

**Made with ❤️ for the Muslim community**

*May Allah accept our prayers and guide us on the straight path. Ameen.*

**🌙 Athan Times - Your Digital Prayer Companion** 