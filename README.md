# 🕌 Athan Times - Complete Islamic Prayer App

A beautiful, comprehensive Progressive Web App (PWA) for Islamic prayer times, Qibla direction, and Quran recitation with modern design and full offline support.

## ✨ Features

### 🕌 Prayer Times
- **Real-time prayer times** for any location worldwide
- **Automatic location detection** using GPS
- **Beautiful countdown timer** to next prayer
- **Visual prayer cards** with current status indicators
- **Hijri date display** with Islamic calendar
- **Audio Adhan** playback for each prayer
- **Prayer notifications** with custom sounds
- **Multiple calculation methods** for different regions

### 🧭 Qibla Compass
- **Accurate Qibla direction** calculation to Mecca
- **Real-time compass** using device orientation
- **Magnetic declination correction** for precision
- **Distance to Kaaba** display
- **Compass calibration** functionality
- **Visual indicators** with golden Qibla line
- **Works on mobile and desktop**

### 📖 Complete Quran Player
- **All 114 Surahs** with complete verse navigation
- **5 Famous Reciters** including Mishary Alafasy, Abdur-Rahman As-Sudais
- **Verse-by-verse playback** with accurate audio mapping
- **Audio progress tracking** with time display
- **Bookmark system** for favorite verses
- **Share verses** with copy/share functionality
- **Export bookmarks** to text file
- **Random and daily verses** with smart selection

### 🗺️ Nearby Mosques
- **Interactive map** using OpenStreetMap and Leaflet
- **Real mosque data** from Overpass API
- **Distance calculation** and sorting
- **Directions integration** with Google Maps
- **Fallback data** when API is unavailable
- **Mobile-optimized** map controls

### 🎨 Modern Design
- **Glass morphism** design with blur effects
- **Islamic color palette** with gold and brown themes
- **Responsive layout** for all screen sizes
- **Smooth animations** and hover effects
- **Dark/light mode** compatibility
- **Arabic typography** support
- **PWA features** with offline support

## 🏗️ Code Structure

### 📁 File Organization

```
Athan-Times/
├── index.html          # Main HTML structure
├── styles.css          # All CSS styling and animations
├── script.js           # JavaScript functionality and logic
├── manifest.json       # PWA manifest for app installation
├── sw.js              # Service worker for offline support
├── favicon.svg        # App icon in SVG format
├── .nojekyll          # GitHub Pages configuration
└── README.md          # This documentation file
```

### 🔧 Core Components

#### 1. **HTML Structure** (`index.html`)
- **Semantic HTML5** with proper ARIA labels
- **Tab-based navigation** for different features
- **Responsive grid layouts** for prayer times
- **Embedded audio controls** for Quran player
- **Interactive map containers** for mosque finder
- **Bookmark management** interface

#### 2. **CSS Styling** (`styles.css`)
- **CSS Grid and Flexbox** for responsive layouts
- **Custom CSS variables** for consistent theming
- **Gradient backgrounds** and glass morphism effects
- **Smooth transitions** and hover animations
- **Media queries** for mobile responsiveness
- **Arabic font support** for proper text rendering

#### 3. **JavaScript Logic** (`script.js`)

##### 🌍 **Location & Prayer Times**
```javascript
// Main functions for prayer functionality
getLocationAndPrayerTimes()    // GPS location and API calls
fetchPrayerTimes(lat, lng)     // Aladhan API integration
displayPrayerTimes(prayers)    // UI updates for prayer cards
updateNextPrayer(prayers)      // Countdown and next prayer logic
startCountdown()               // Real-time countdown timer
```

##### 🧭 **Qibla Compass**
```javascript
// Compass functionality
initQiblaCompass()             // Initialize compass system
calculateQiblaDirection()      // Geometric calculation to Mecca
handleDeviceOrientation()      // Device sensor integration
fetchMagneticDeclination()     // NOAA API for accuracy
updateCompassNeedle()          // Visual compass updates
```

##### 📖 **Quran Player System**
```javascript
// Complete Quran management
const quranSurahs = [...]      // All 114 Surahs data
initQuranPlayer()              // Player initialization
playCurrentVerse()             // Audio playback with Al-Quran API
onSurahChange()                // Surah selection handling
onVerseChange()                // Verse navigation
updateDisplay()                // UI synchronization
```

##### 🏛️ **Mosque Finder**
```javascript
// Mosque location services
initMosqueFinder(lat, lng)     // Leaflet map initialization
fetchNearbyMosques()           // Overpass API queries
processMosqueData()            // Data processing and sorting
addMosqueMarker()              // Map marker management
displayMosquesList()           // List view updates
```

##### 💾 **Data Management**
```javascript
// Local storage and bookmarks
toggleBookmarks()              // Bookmark UI management
bookmarkCurrentVerse()         // Save verse to localStorage
exportBookmarks()              // File download functionality
loadSavedSettings()            // App state persistence
```

### 🔌 API Integrations

#### 1. **Aladhan Prayer Times API**
- **Endpoint:** `https://api.aladhan.com/v1/timings/{date}`
- **Parameters:** Latitude, longitude, calculation method
- **Response:** All 5 daily prayer times with timezone info
- **Fallback:** Mathematical calculation when API fails

#### 2. **Al-Quran Cloud Audio API**
- **Endpoint:** `https://cdn.islamic.network/quran/audio/128/{reciter}/{surah}{verse}.mp3`
- **Reciters:** 5 famous Quranic reciters
- **Fallback:** Full Surah audio when verse audio unavailable
- **Alternative:** Web Audio API generated tones

#### 3. **OpenStreetMap & Overpass API**
- **Map Tiles:** `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- **Mosque Data:** Overpass API with amenity=place_of_worship filter
- **Geocoding:** Nominatim API for location names
- **Fallback:** Hardcoded mosque data for offline use

#### 4. **NOAA Magnetic Declination**
- **Endpoint:** `https://www.ngdc.noaa.gov/geomag-web/calculators/calculateDeclination`
- **Purpose:** Compass accuracy correction
- **Fallback:** Regional approximation based on coordinates

## 🚀 Installation & Usage

### 📱 **As a PWA (Recommended)**
1. **Visit:** Your deployed app URL
2. **Install:** Click "Add to Home Screen" prompt
3. **Enjoy:** Full-screen app experience with offline support

### 💻 **Local Development**
1. **Clone/Download** the repository
2. **Serve locally:** `python -m http.server 8000` or any local server
3. **Open:** `http://localhost:8000` in your browser
4. **Test:** All features work locally with internet connection

### 🌐 **GitHub Pages Deployment**
1. **Push** all files to your GitHub repository
2. **Enable** GitHub Pages in repository settings
3. **Access:** Your app at `https://username.github.io/repository-name`
4. **Note:** `.nojekyll` file ensures proper SVG favicon support

## 🎯 Feature Usage Guide

### 🕌 **Prayer Times Tab**
- **Automatic:** App detects location and shows prayer times
- **Manual:** Click refresh button to update location
- **Audio:** Click prayer cards to play Adhan
- **Countdown:** Real-time countdown to next prayer
- **Sharing:** Click share button to share prayer times

### 🧭 **Qibla Tab**
- **Calibration:** Move device in figure-8 pattern for accuracy
- **Direction:** Golden line points toward Mecca
- **Distance:** Shows distance to Kaaba in kilometers
- **Compass:** White needle shows device heading
- **Accuracy:** Status indicator shows compass reliability

### 📖 **Quran Tab**
- **Selection:** Choose any Surah (1-114) and verse
- **Reciter:** Select from 5 famous reciters
- **Playback:** Play button starts verse audio
- **Navigation:** Previous/Next buttons for easy browsing
- **Bookmarks:** Save favorite verses for later
- **Export:** Download all bookmarks as text file

### 🗺️ **Mosques Tab**
- **Automatic:** Shows nearby mosques on map
- **Interactive:** Click markers for mosque details
- **List View:** Scrollable list with distances
- **Directions:** Click for Google Maps navigation
- **Search:** Adjustable search radius

## 🔧 Technical Implementation

### 🎨 **Styling Approach**
- **CSS Custom Properties** for consistent theming
- **Flexbox & Grid** for responsive layouts
- **Glass Morphism** with `backdrop-filter: blur()`
- **Smooth Animations** with CSS transitions
- **Mobile-First** responsive design

### 📱 **PWA Features**
- **Manifest:** App metadata and icons
- **Service Worker:** Offline caching strategy
- **Responsive:** Works on all device sizes
- **Installable:** Add to home screen capability

### 🔄 **Error Handling**
- **Network Failures:** Graceful fallbacks to cached data
- **Location Denied:** Manual location input option
- **Audio Failures:** Alternative sources and generated tones
- **API Limits:** Local calculations and cached responses

### 💾 **Data Persistence**
- **LocalStorage:** User preferences and bookmarks
- **Cache API:** Offline prayer times and settings
- **Session Storage:** Temporary app state

## 🌟 Advanced Features

### 🔊 **Audio System**
- **Multiple Sources:** Primary and fallback audio URLs
- **Progress Tracking:** Visual progress bars
- **Volume Control:** System volume integration
- **Format Support:** MP3 with Web Audio fallback

### 📍 **Location Services**
- **High Accuracy GPS:** For precise prayer times
- **IP Geolocation:** Backup location method
- **Manual Input:** Coordinate entry option
- **Location Caching:** Reduced API calls

### 🎨 **Theming System**
- **Islamic Colors:** Gold (#FFD700), Brown (#8B4513), Blue (#3B82F6)
- **Gradient Backgrounds:** Dynamic color transitions
- **Glass Effects:** Modern blur and transparency
- **Dark Mode Support:** Automatic system detection

## 🐛 Troubleshooting

### ❌ **Common Issues**

#### **Prayer Times Not Loading**
- Check internet connection
- Allow location permissions
- Try refresh button
- Check browser console for errors

#### **Audio Not Playing**
- Ensure device volume is up
- Try different reciter
- Check internet connection for streaming
- Some browsers require user interaction first

#### **Compass Not Working**
- Allow motion/orientation permissions
- Calibrate by moving device in figure-8
- Only works on mobile devices with sensors
- Check device compass app functionality

#### **Map Not Loading**
- Check internet connection
- Allow location permissions
- Try refreshing the page
- Fallback mosque data will display

### 🔧 **Development Tips**
- **HTTPS Required:** For GPS and device sensors
- **Permissions:** Always request user permissions gracefully
- **Fallbacks:** Implement for every external dependency
- **Testing:** Test on actual mobile devices for sensors

## 📄 **License & Credits**

### 🙏 **APIs Used**
- **Aladhan API** - Prayer times calculation
- **Al-Quran Cloud** - Quranic audio recitations
- **OpenStreetMap** - Map tiles and mosque data
- **NOAA** - Magnetic declination data

### 🎨 **Design Resources**
- **Font Awesome** - Icons and symbols
- **Google Fonts** - Typography (Amiri for Arabic)
- **Unsplash** - Background inspiration

### 📝 **License**
This project is open source and available under the MIT License.

---

**Built with ❤️ for the Muslim community worldwide** 🌍

For support, issues, or contributions, please visit the GitHub repository. 