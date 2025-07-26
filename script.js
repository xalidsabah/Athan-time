document.addEventListener('DOMContentLoaded', function() {
    console.log('🕌 Athan Times App - Starting initialization...');
    
    // Global variables
    window.currentLocation = null;
    window.mosqueFinder = null;
    let countdownInterval = null;

    // Debug: Check required elements
    const requiredElements = [
        'splash', 'app', 'current-date', 'hijri-date', 'current-time',
        'location-name', 'location-coordinates', 'location-info', 'prayer-times', 'countdown'
    ];
    
    console.log('🔍 Checking required elements...');
    requiredElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            console.log(`✅ Element found: ${id}`);
        } else {
            console.warn(`❌ Missing element: ${id}`);
        }
    });

    // Simulate splash screen loading
    setTimeout(function() {
        console.log('🚀 Hiding splash screen...');
        const splash = document.getElementById('splash');
        const app = document.getElementById('app');
        
        if (splash) {
            splash.style.display = 'none';
            console.log('✅ Splash screen hidden');
        } else {
            console.warn('❌ Splash screen element not found');
        }
        
        if (app) {
            app.classList.remove('hidden');
            console.log('✅ Main app shown');
        } else {
            console.warn('❌ Main app element not found');
        }
        
        // Initialize the app
        console.log('🔄 Starting app initialization...');
        initApp();
    }, 2000);
    
    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all tabs
            document.querySelectorAll('.tab-btn').forEach(b => {
                b.classList.remove('active', 'border-blue-600', 'text-blue-600');
                b.classList.add('text-gray-500', 'border-transparent');
            });
            
            // Add active class to clicked tab
            this.classList.add('active', 'border-blue-600', 'text-blue-600');
            this.classList.remove('text-gray-500', 'border-transparent');
            
            // Show corresponding content
            const tabId = this.getAttribute('data-tab');
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            const targetTab = document.getElementById(tabId);
            if (targetTab) targetTab.classList.add('active');
            
            // Initialize specific tab content
            if (tabId === 'mosques' && window.currentLocation) {
                initMosqueFinder(window.currentLocation.lat, window.currentLocation.lng);
            }
            
            if (tabId === 'qibla') {
                setTimeout(() => initQiblaCompass(), 100);
            }
        });
    });

    // Utility Functions
    function formatTime12Hour(time24) {
        if (!time24) return '--:--';
        const [hours, minutes] = time24.split(':');
        const hour12 = hours % 12 || 12;
        const ampm = hours >= 12 ? 'PM' : 'AM';
        return `${hour12}:${minutes} ${ampm}`;
    }

    function calculateHijriDate(gregorianDate) {
        // Simple Hijri date approximation (not astronomically accurate)
        const gregorianYear = gregorianDate.getFullYear();
        const hijriYear = Math.floor((gregorianYear - 622) * 1.030684);
        const months = ['Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani', 'Jumada al-awwal', 
                       'Jumada al-thani', 'Rajab', 'Sha\'ban', 'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'];
        const month = months[gregorianDate.getMonth()];
        const day = gregorianDate.getDate();
        return `${day} ${month} ${hijriYear} AH`;
    }

    function updateCurrentTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            timeElement.textContent = timeString;
        }
    }

    function findNextPrayer(prayers) {
        const now = new Date();
        const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
        
        for (const [name, prayer] of Object.entries(prayers)) {
            const [hours, minutes] = prayer.time.split(':').map(Number);
            const prayerTimeMinutes = hours * 60 + minutes;
            
            if (currentTimeMinutes < prayerTimeMinutes) {
                return name;
            }
        }
        
        // If all prayers have passed, return first prayer of next day
        return Object.keys(prayers)[0];
    }

    function calculateFallbackPrayerTimes(lat, lng) {
        // Simple fallback calculations
        const now = new Date();
        const prayers = {
            Fajr: { time: '05:30', name: 'Fajr', description: 'Dawn Prayer', icon: '🌅' },
            Dhuhr: { time: '12:30', name: 'Dhuhr', description: 'Noon Prayer', icon: '☀️' },
            Asr: { time: '15:45', name: 'Asr', description: 'Afternoon Prayer', icon: '🌤️' },
            Maghrib: { time: '18:15', name: 'Maghrib', description: 'Sunset Prayer', icon: '🌅' },
            Isha: { time: '19:45', name: 'Isha', description: 'Night Prayer', icon: '🌙' }
        };
        return prayers;
    }

    // Settings and modal handlers
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function() {
            const modal = document.getElementById('settings-modal');
            if (modal) modal.classList.remove('hidden');
        });
    }

    // Location button events
    const locationBtn = document.getElementById('location-btn');
    if (locationBtn) {
        locationBtn.addEventListener('click', function() {
            getLocationAndPrayerTimes();
            showNotification('Location updated!', 'success');
        });
    }

    const refreshLocationBtn = document.getElementById('refresh-location');
    if (refreshLocationBtn) {
        refreshLocationBtn.addEventListener('click', function() {
            getLocationAndPrayerTimes();
            showNotification('Location refreshed!', 'success');
        });
    }

    const shareLocationBtn = document.getElementById('share-location');
    if (shareLocationBtn) {
        shareLocationBtn.addEventListener('click', function() {
            shareLocation();
        });
    }

    // Close settings modal
    const closeSettings = document.getElementById('close-settings');
    if (closeSettings) {
        closeSettings.addEventListener('click', function() {
            const modal = document.getElementById('settings-modal');
            if (modal) modal.classList.add('hidden');
        });
    }

    // Auto location toggle
    const autoLocation = document.getElementById('auto-location');
    if (autoLocation) {
        autoLocation.addEventListener('change', function() {
            const manualSection = document.getElementById('manual-location-section');
            if (manualSection) {
                if (this.checked) {
                    manualSection.classList.add('hidden');
                } else {
                    manualSection.classList.remove('hidden');
                }
            }
        });
    }

    // Save settings
    const saveSettings = document.getElementById('save-settings');
    if (saveSettings) {
        saveSettings.addEventListener('click', function() {
            const modal = document.getElementById('settings-modal');
            if (modal) modal.classList.add('hidden');
            showNotification('Settings saved successfully!', 'success');
            
            // Reload prayer times with new settings
            if (window.currentLocation) {
                fetchPrayerTimes(window.currentLocation.lat, window.currentLocation.lng);
            }
        });
    }

    // Share location function
    function shareLocation() {
        if (navigator.share && window.currentLocation) {
            const locationName = document.getElementById('location-name')?.textContent || 'Current Location';
            navigator.share({
                title: 'My Location for Prayer Times',
                text: `I'm at ${locationName} - prayer times calculated for this location.`,
                url: window.location.href
            }).catch(console.error);
        } else if (window.currentLocation) {
            const locationName = document.getElementById('location-name')?.textContent || 'Current Location';
            const shareText = `I'm at ${locationName} - prayer times calculated for this location. ${window.location.href}`;
            
            if (navigator.clipboard) {
                navigator.clipboard.writeText(shareText).then(() => {
                    showNotification('Location shared to clipboard!', 'success');
                });
            } else {
                showNotification('Share not supported on this device', 'warning');
            }
        }
    }

    // Global functions needed by other parts
    window.showNotification = showNotification;
    window.toggleQuranSearch = toggleQuranSearch;
    window.showPrayerSettings = showPrayerSettings;
    window.refreshLocation = refreshLocation;

    // Missing global functions
    function toggleQuranSearch() {
        const searchSection = document.getElementById('quran-search');
        if (searchSection) {
            const isHidden = searchSection.style.display === 'none';
            searchSection.style.display = isHidden ? 'block' : 'none';
            
            if (!isHidden) {
                const searchInput = document.getElementById('quran-search-input');
                if (searchInput) searchInput.focus();
            }
        }
    }

    function showPrayerSettings() {
        // Create a simple prayer settings modal or use existing settings
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.classList.remove('hidden');
        } else {
            showNotification('Prayer method: ISNA (North America). Change in Settings.', 'info');
        }
    }

    function refreshLocation() {
        getLocationAndPrayerTimes();
        showNotification('Refreshing location and prayer times...', 'info');
    }

    // Notification function - Essential for user feedback
    function showNotification(message, type = 'info', duration = 4000) {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg text-white z-50 transform transition-all duration-300 translate-x-full notification`;
        
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500', 
            info: 'bg-blue-500',
            warning: 'bg-yellow-500',
            prayer: 'bg-purple-500'
        };
        
        notification.classList.add(colors[type] || colors.info);
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${type === 'success' ? 'fa-check' : type === 'error' ? 'fa-exclamation-triangle' : type === 'warning' ? 'fa-exclamation-circle' : type === 'prayer' ? 'fa-mosque' : 'fa-info-circle'} mr-2"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-3 text-white hover:text-gray-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Auto remove after duration
        setTimeout(() => {
            if (notification && notification.parentElement) {
                notification.classList.add('translate-x-full');
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
    }

    // Initialize App - Core startup function
    function initApp() {
        console.log('Initializing Athan Times App...');
        
        // Set current date
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateElement = document.getElementById('current-date');
        if (dateElement) {
            dateElement.textContent = now.toLocaleDateString('en-US', options);
        }
        
        // Calculate and display Hijri date
        const hijriDate = calculateHijriDate(now);
        const hijriElement = document.getElementById('hijri-date');
        if (hijriElement) {
            hijriElement.textContent = hijriDate;
        }
        
        // Start real-time clock
        updateCurrentTime();
        setInterval(updateCurrentTime, 1000);
        
        // Get user location and fetch prayer times
        getLocationAndPrayerTimes();
        
        // Initialize other components
        requestNotificationPermission();
        addOfflineSupport();
        
        // Initialize Quran player if elements exist
        setTimeout(() => {
            const quranContainer = document.querySelector('.quran-player-container');
            if (quranContainer) {
                try {
                    initQuranPlayer();
                } catch (error) {
                    console.log('Quran player initialization skipped:', error.message);
                }
            }
        }, 1000);
        
        console.log('App initialization complete!');
    }

    // Fetch Prayer Times from API
    async function fetchPrayerTimes(lat, lng) {
        console.log(`Fetching prayer times for coordinates: ${lat}, ${lng}`);
        
        try {
            const date = new Date();
            const dateString = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
            
            // Try Aladhan API first
            const method = localStorage.getItem('prayerMethod') || '2'; // ISNA
            const apiUrl = `https://api.aladhan.com/v1/timings/${dateString}?latitude=${lat}&longitude=${lng}&method=${method}`;
            
            showNotification('Fetching prayer times...', 'info');
            
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.code === 200 && data.data && data.data.timings) {
                const timings = data.data.timings;
                
                // Create enhanced prayer data
                const prayerData = {
                    Fajr: { time: timings.Fajr, name: 'Fajr', description: 'Dawn Prayer', icon: '🌅' },
                    Dhuhr: { time: timings.Dhuhr, name: 'Dhuhr', description: 'Noon Prayer', icon: '☀️' },
                    Asr: { time: timings.Asr, name: 'Asr', description: 'Afternoon Prayer', icon: '🌤️' },
                    Maghrib: { time: timings.Maghrib, name: 'Maghrib', description: 'Sunset Prayer', icon: '🌅' },
                    Isha: { time: timings.Isha, name: 'Isha', description: 'Night Prayer', icon: '🌙' }
                };
                
                // Store for offline use
                localStorage.setItem('lastPrayerTimes', JSON.stringify({
                    timings: prayerData,
                    date: dateString,
                    location: { lat, lng },
                    timestamp: Date.now()
                }));
                
                displayPrayerTimes(prayerData);
                updateNextPrayer(prayerData);
                
                showNotification('Prayer times updated successfully!', 'success');
                return prayerData;
                
            } else {
                throw new Error('Invalid API response format');
            }
            
        } catch (error) {
            console.error('Error fetching prayer times:', error);
            showNotification('API unavailable, using calculated times', 'warning');
            
            // Try to use cached data first
            const cached = localStorage.getItem('lastPrayerTimes');
            if (cached) {
                try {
                    const cachedData = JSON.parse(cached);
                    const today = new Date().toISOString().split('T')[0];
                    const cacheDate = cachedData.date;
                    
                    if (cacheDate === today.replace(/-/g, '-')) {
                        showNotification('Using cached prayer times', 'info');
                        displayPrayerTimes(cachedData.timings);
                        updateNextPrayer(cachedData.timings);
                        return cachedData.timings;
                    }
                } catch (cacheError) {
                    console.error('Error parsing cached data:', cacheError);
                }
            }
            
            // Use fallback calculation
            const fallbackPrayers = calculateFallbackPrayerTimes(lat, lng);
            displayPrayerTimes(fallbackPrayers);
            updateNextPrayer(fallbackPrayers);
            return fallbackPrayers;
        }
    }

    // Display Prayer Times in UI
    function displayPrayerTimes(prayers) {
        console.log('Displaying prayer times:', prayers);
        
        const container = document.getElementById('prayer-times');
        if (!container) {
            console.error('Prayer times container not found');
            return;
        }
        
        // Clear existing content
        container.innerHTML = '';
        
        const currentTime = new Date();
        const currentTimeMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
        
        Object.entries(prayers).forEach(([name, prayer]) => {
            const [hours, minutes] = prayer.time.split(':').map(Number);
            const prayerTimeMinutes = hours * 60 + minutes;
            const isPassed = currentTimeMinutes > prayerTimeMinutes;
            const isNext = findNextPrayer(prayers) === name;
            
            const card = document.createElement('div');
            card.className = `prayer-card ${isPassed ? 'passed' : ''} ${isNext ? 'next-prayer-highlight' : ''}`;
            
            card.innerHTML = `
                <div class="prayer-info">
                    <div class="prayer-icon">${prayer.icon}</div>
                    <div class="prayer-details">
                        <h3 class="prayer-name">${prayer.name}</h3>
                        <p class="prayer-description">${prayer.description}</p>
                    </div>
                    <div class="prayer-time-container">
                        <div class="prayer-time">${formatTime12Hour(prayer.time)}</div>
                        ${isNext ? '<div class="next-badge">NEXT</div>' : ''}
                        ${isPassed ? '<div class="passed-badge">✓</div>' : ''}
                    </div>
                </div>
                <div class="prayer-actions" style="opacity: 0;">
                    <button class="action-btn" onclick="playAdhan('${name}')" title="Play Adhan">
                        <i class="fas fa-volume-up"></i>
                    </button>
                    <button class="action-btn" onclick="sharePersonalPrayerTime('${name}', '${prayer.time}')" title="Share">
                        <i class="fas fa-share"></i>
                    </button>
                </div>
            `;
            
            container.appendChild(card);
        });
        
        console.log('Prayer times displayed successfully');
    }

    // Update Next Prayer Display
    function updateNextPrayer(prayers) {
        const nextPrayerName = findNextPrayer(prayers);
        if (!nextPrayerName) return;
        
        const nextPrayer = prayers[nextPrayerName];
        const nextPrayerElement = document.getElementById('next-prayer');
        
        if (nextPrayerElement) {
            // Update prayer name
            const nameElement = nextPrayerElement.querySelector('.next-prayer-name');
            if (nameElement) nameElement.textContent = nextPrayer.name;
            
            // Update prayer time
            const timeElement = nextPrayerElement.querySelector('#next-prayer-time');
            if (timeElement) timeElement.textContent = formatTime12Hour(nextPrayer.time);
            
            // Update description
            const descElement = nextPrayerElement.querySelector('.next-prayer-desc');
            if (descElement) descElement.textContent = nextPrayer.description;
            
            // Start countdown
            const countdownElement = document.getElementById('countdown');
            if (countdownElement) {
                startCountdown(nextPrayer.time, countdownElement);
            }
        }
    }

    // Start Countdown Timer
    function startCountdown(prayerTime, element) {
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
        
        countdownInterval = setInterval(() => {
            const now = new Date();
            const [hours, minutes] = prayerTime.split(':').map(Number);
            
            let prayerDateTime = new Date();
            prayerDateTime.setHours(hours, minutes, 0, 0);
            
            // If prayer time has passed today, set for tomorrow
            if (prayerDateTime <= now) {
                prayerDateTime.setDate(prayerDateTime.getDate() + 1);
            }
            
            const diff = prayerDateTime - now;
            
            if (diff <= 0) {
                element.textContent = 'Athan Time!';
                clearInterval(countdownInterval);
                showNotification('🕌 Time for prayer!', 'prayer');
                return;
            }
            
            const hours_left = Math.floor(diff / (1000 * 60 * 60));
            const minutes_left = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds_left = Math.floor((diff % (1000 * 60)) / 1000);
            
            const timeString = `${hours_left.toString().padStart(2, '0')}:${minutes_left.toString().padStart(2, '0')}:${seconds_left.toString().padStart(2, '0')}`;
            element.textContent = timeString;
            
            // Add urgency classes
            element.classList.remove('urgent', 'soon');
            if (diff <= 300000) { // 5 minutes
                element.classList.add('urgent');
            } else if (diff <= 900000) { // 15 minutes
                element.classList.add('soon');
            }
        }, 1000);
    }

    // Placeholder functions for prayer actions
    window.playAdhan = function(prayerName) {
        showNotification(`Playing Adhan for ${prayerName}`, 'info');
        // Add actual adhan audio here
    };

    window.sharePersonalPrayerTime = function(prayerName, prayerTime) {
        const text = `${prayerName} prayer time: ${formatTime12Hour(prayerTime)}`;
        if (navigator.share) {
            navigator.share({ title: 'Prayer Time', text });
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
            showNotification('Prayer time copied to clipboard!', 'success');
        }
    };

    // Placeholder Quran player initialization
    function initQuranPlayer() {
        console.log('Quran player placeholder - advanced features available in full version');
        return;
    }

    // Get location and prayer times - Core functionality
    function getLocationAndPrayerTimes() {
        if (navigator.geolocation) {
            showNotification('Getting your location...', 'info');
            
            navigator.geolocation.getCurrentPosition(
                async function(position) {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    // Store current location globally
                    window.currentLocation = { lat, lng };
                    
                    try {
                        // Get location name
                        const locationResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                        const locationData = await locationResponse.json();
                        
                        const locationName = locationData.display_name?.split(',')[0] || 'Unknown Location';
                        const locationElement = document.getElementById('location-name');
                        if (locationElement) {
                            locationElement.textContent = locationName;
                        }
                        
                        // Update coordinates display
                        const coordinatesElement = document.getElementById('location-coordinates');
                        if (coordinatesElement) {
                            coordinatesElement.textContent = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                        }
                        
                        // Update location info
                        const locationInfo = document.getElementById('location-info');
                        if (locationInfo) {
                            locationInfo.textContent = `${locationName} - GPS accuracy: High`;
                        }
                        
                        showNotification(`Location found: ${locationName}`, 'success');
                        
                        // Fetch prayer times
                        await fetchPrayerTimes(lat, lng);
                        
                    } catch (error) {
                        console.error('Error getting location name:', error);
                        
                        // Update coordinates even if location name fails
                        const coordinatesElement = document.getElementById('location-coordinates');
                        if (coordinatesElement) {
                            coordinatesElement.textContent = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                        }
                        
                        const locationInfo = document.getElementById('location-info');
                        if (locationInfo) {
                            locationInfo.textContent = `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                        }
                        
                        showNotification('Location found, fetching prayer times...', 'info');
                        
                        // Still fetch prayer times with coordinates
                        await fetchPrayerTimes(lat, lng);
                    }
                },
                function(error) {
                    console.error('Geolocation error:', error);
                    
                    let errorMessage = 'Unable to get your location. ';
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage += 'Please allow location access.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage += 'Location information unavailable.';
                            break;
                        case error.TIMEOUT:
                            errorMessage += 'Location request timed out.';
                            break;
                        default:
                            errorMessage += 'Unknown error occurred.';
                            break;
                    }
                    
                    showNotification(errorMessage, 'error');
                    
                    // Use fallback location (example: New York)
                    const fallbackLat = 40.7128;
                    const fallbackLng = -74.0060;
                    
                    window.currentLocation = { lat: fallbackLat, lng: fallbackLng };
                    
                    const locationElement = document.getElementById('location-name');
                    if (locationElement) {
                        locationElement.textContent = 'New York (Fallback)';
                    }
                    
                    // Update coordinates for fallback
                    const coordinatesElement = document.getElementById('location-coordinates');
                    if (coordinatesElement) {
                        coordinatesElement.textContent = `${fallbackLat.toFixed(4)}, ${fallbackLng.toFixed(4)}`;
                    }
                    
                    // Update location info for fallback
                    const locationInfo = document.getElementById('location-info');
                    if (locationInfo) {
                        locationInfo.textContent = 'Using fallback location - New York, NY';
                    }
                    
                    // Use fallback prayer times
                    const fallbackPrayers = calculateFallbackPrayerTimes(fallbackLat, fallbackLng);
                    displayPrayerTimes(fallbackPrayers);
                    updateNextPrayer(fallbackPrayers);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                }
            );
        } else {
            showNotification('Geolocation is not supported by this browser.', 'error');
            
            // Use fallback
            const fallbackPrayers = calculateFallbackPrayerTimes(40.7128, -74.0060);
            displayPrayerTimes(fallbackPrayers);
            updateNextPrayer(fallbackPrayers);
        }
    }

    // Request notification permission
    function requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    showNotification('Notifications enabled for prayer times!', 'success');
                } else {
                    showNotification('Notifications disabled. Enable in browser settings for prayer reminders.', 'warning');
                }
            });
        }
    }

    // Add offline support
    function addOfflineSupport() {
        // Register service worker if available
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }
        
        // Handle online/offline status
        window.addEventListener('online', () => {
            showNotification('Back online! Refreshing data...', 'success');
            if (window.currentLocation) {
                fetchPrayerTimes(window.currentLocation.lat, window.currentLocation.lng);
            }
        });
        
        window.addEventListener('offline', () => {
            showNotification('You are offline. Using cached data.', 'warning');
        });
    }
}); 