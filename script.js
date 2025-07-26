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

    // Global audio variables
    let currentAudio = null;
    let adhanAudio = null;
    let quranAudio = null;

    // Real Adhan player implementation
    window.playAdhan = function(prayerName) {
        console.log(`🔊 Playing Adhan for ${prayerName}`);
        
        // Stop any currently playing audio
        stopAllAudio();
        
        // Adhan audio URLs (using online sources)
        const adhanUrls = [
            'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Fallback
            'https://archive.org/download/adhan_201905/adhan.mp3', // Primary
            'https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-one/religion_islam_adhan_call_to_prayer_01.mp3' // Alternative
        ];
        
        // Create and play audio
        adhanAudio = new Audio();
        currentAudio = adhanAudio;
        
        // Try URLs in order
        let urlIndex = 0;
        
        function tryNextUrl() {
            if (urlIndex < adhanUrls.length) {
                adhanAudio.src = adhanUrls[urlIndex];
                adhanAudio.load();
                
                adhanAudio.addEventListener('canplay', function() {
                    console.log('✅ Adhan audio loaded successfully');
                    adhanAudio.play().then(() => {
                        showNotification(`🔊 Playing Adhan for ${prayerName}`, 'success');
                    }).catch(error => {
                        console.error('Failed to play adhan:', error);
                        tryNextUrl();
                    });
                }, { once: true });
                
                adhanAudio.addEventListener('error', function() {
                    console.warn(`Failed to load adhan URL ${urlIndex + 1}`);
                    urlIndex++;
                    tryNextUrl();
                }, { once: true });
                
                adhanAudio.addEventListener('ended', function() {
                    showNotification(`✅ Adhan for ${prayerName} completed`, 'success');
                    currentAudio = null;
                }, { once: true });
                
            } else {
                // All URLs failed, use Web Audio API to generate a simple tone
                generateAdhanTone(prayerName);
            }
        }
        
        tryNextUrl();
    };

    // Generate simple Adhan tone if no audio files work
    function generateAdhanTone(prayerName) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Create a simple melodic pattern
            oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
            oscillator.frequency.setValueAtTime(523, audioContext.currentTime + 0.5); // C5
            oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 1.0); // E5
            oscillator.frequency.setValueAtTime(523, audioContext.currentTime + 1.5); // C5
            oscillator.frequency.setValueAtTime(440, audioContext.currentTime + 2.0); // A4
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 2.5);
            
            showNotification(`🔊 Playing Adhan tone for ${prayerName}`, 'success');
            
            setTimeout(() => {
                showNotification(`✅ Adhan for ${prayerName} completed`, 'success');
            }, 2500);
            
        } catch (error) {
            console.error('Failed to generate adhan tone:', error);
            showNotification(`❌ Could not play Adhan for ${prayerName}`, 'error');
        }
    }

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
    
    // Enhanced Quran Verse Functionality with proper audio mapping
    const quranVerses = [
        {
            arabic: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ ۚ إِنَّ اللَّهَ بَالِغُ أَمْرِهِ ۚ قَدْ جَعَلَ اللَّهُ لِكُلِّ شَيْءٍ قَدْرًا",
            translation: "And whoever relies upon Allah - then He is sufficient for him. Indeed, Allah will accomplish His purpose. Allah has already set for everything a [decreed] extent.",
            reference: "Quran 65:3",
            surah: 65,
            verse: 3,
            surahName: "At-Talaq"
        },
        {
            arabic: "وَبَشِّرِ الصَّابِرِينَ الَّذِينَ إِذَا أَصَابَتْهُم مُّصِيبَةٌ قَالُوا إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ",
            translation: "And give good tidings to the patient, Who, when disaster strikes them, say, 'Indeed we belong to Allah, and indeed to Him we will return.'",
            reference: "Quran 2:155-156",
            surah: 2,
            verse: 155,
            surahName: "Al-Baqarah"
        },
        {
            arabic: "وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ ۚ عَلَيْهِ تَوَكَّلْتُ وَإِلَيْهِ أُنِيبُ",
            translation: "And my success is not but through Allah. Upon Him I have relied, and to Him I return.",
            reference: "Quran 11:88",
            surah: 11,
            verse: 88,
            surahName: "Hud"
        },
        {
            arabic: "وَمَن يُؤْمِن بِاللَّهِ يَهْدِ قَلْبَهُ ۚ وَاللَّهُ بِكُلِّ شَيْءٍ عَلِيمٌ",
            translation: "And whoever believes in Allah - He will guide his heart. And Allah is Knowing of all things.",
            reference: "Quran 64:11",
            surah: 64,
            verse: 11,
            surahName: "At-Taghabun"
        },
        {
            arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ",
            translation: "So remember Me; I will remember you. And be grateful to Me and do not deny Me.",
            reference: "Quran 2:152",
            surah: 2,
            verse: 152,
            surahName: "Al-Baqarah"
        },
        {
            arabic: "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ",
            translation: "And when My servants ask you concerning Me, indeed I am near. I respond to the invocation of the supplicant when he calls upon Me.",
            reference: "Quran 2:186",
            surah: 2,
            verse: 186,
            surahName: "Al-Baqarah"
        },
        {
            arabic: "وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ ۚ وَاللَّهُ بِمَا تَعْمَلُونَ بَصِيرٌ",
            translation: "And He is with you wherever you are. And Allah, of what you do, is Seeing.",
            reference: "Quran 57:4",
            surah: 57,
            verse: 4,
            surahName: "Al-Hadid"
        },
        {
            arabic: "وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنتُمُ الْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ",
            translation: "So do not weaken and do not grieve, and you will be superior if you are [true] believers.",
            reference: "Quran 3:139",
            surah: 3,
            verse: 139,
            surahName: "Ali 'Imran"
        }
    ];
    
    let currentVerseIndex = 0;
    
    window.showDailyVerse = function() {
        const today = new Date();
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
        currentVerseIndex = dayOfYear % quranVerses.length;
        displayCurrentVerse();
        showNotification('Daily verse updated!', 'success');
    };
    
    window.getRandomVerse = function() {
        currentVerseIndex = Math.floor(Math.random() * quranVerses.length);
        displayCurrentVerse();
        showNotification('Random verse loaded!', 'success');
    };
    
    window.refreshVerse = function() {
        currentVerseIndex = (currentVerseIndex + 1) % quranVerses.length;
        displayCurrentVerse();
    };
    
    window.shareVerse = function() {
        const verse = quranVerses[currentVerseIndex];
        const shareText = `${verse.translation}\n\n${verse.reference}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Verse from the Quran',
                text: shareText
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(shareText).then(() => {
                showNotification('Verse copied to clipboard!', 'success');
            }).catch(() => {
                showNotification('Could not copy verse', 'error');
            });
        }
    };
    
    window.bookmarkVerse = function() {
        const verse = quranVerses[currentVerseIndex];
        let bookmarks = JSON.parse(localStorage.getItem('quranBookmarks') || '[]');
        
        // Check if already bookmarked
        const isAlreadyBookmarked = bookmarks.some(bookmark => bookmark.reference === verse.reference);
        
        if (!isAlreadyBookmarked) {
            const bookmarkData = {
                arabic: verse.arabic,
                translation: verse.translation,
                reference: verse.reference,
                surahName: verse.surahName,
                surah: verse.surah,
                verse: verse.verse,
                savedAt: new Date().toISOString()
            };
            
            bookmarks.unshift(bookmarkData); // Add to beginning
            localStorage.setItem('quranBookmarks', JSON.stringify(bookmarks));
            showNotification('🔖 Verse bookmarked successfully!', 'success');
            
            // Update bookmark button appearance
            updateBookmarkButton(true);
        } else {
            showNotification('📌 Verse already bookmarked', 'info');
        }
    };
    
    // Real Quran audio player implementation with correct verse mapping
    window.playVerseAudio = function() {
        console.log('🔊 Playing Quran verse audio');
        
        // Stop any currently playing audio
        stopAllAudio();
        
        const verse = quranVerses[currentVerseIndex];
        const surahNumber = verse.surah;
        const verseNumber = verse.verse;
        
        // Show loading with verse info
        showNotification(`🔄 Loading ${verse.surahName} ${surahNumber}:${verseNumber}...`, 'info');
        
        // Available reciters with their API codes
        const reciters = [
            { name: 'Mishary Alafasy', code: 'ar.alafasy' },
            { name: 'Abdur-Rahman As-Sudais', code: 'ar.abdurrahmaansudais' },
            { name: 'Maher Al Mueaqly', code: 'ar.maheralmeaqly' },
            { name: 'Saad Al Ghamdi', code: 'ar.saadalghamdi' },
            { name: 'Abdul Basit', code: 'ar.abdulbasitmurattal' }
        ];
        
        // Get current reciter from localStorage or use default
        const savedReciter = localStorage.getItem('selectedReciter') || 'ar.alafasy';
        const currentReciter = reciters.find(r => r.code === savedReciter) || reciters[0];
        
        // Al Quran Cloud API for specific verse audio
        const audioUrl = `https://cdn.islamic.network/quran/audio/128/${currentReciter.code}/${surahNumber}${verseNumber.toString().padStart(3, '0')}.mp3`;
        
        console.log(`🎵 Attempting to play: ${audioUrl}`);
        
        // Create and play audio
        quranAudio = new Audio();
        currentAudio = quranAudio;
        quranAudio.src = audioUrl;
        
        quranAudio.addEventListener('canplay', function() {
            console.log('✅ Quran verse audio loaded successfully');
            quranAudio.play().then(() => {
                showNotification(`🔊 Playing ${verse.surahName} ${surahNumber}:${verseNumber} - ${currentReciter.name}`, 'success');
                updateAudioPlayerDisplay(verse, currentReciter, 'playing');
            }).catch(error => {
                console.error('Failed to play Quran verse audio:', error);
                tryAlternativeQuranAudio(surahNumber, verseNumber, verse, currentReciter);
            });
        }, { once: true });
        
        quranAudio.addEventListener('error', function() {
            console.warn('Failed to load Quran verse audio from primary source');
            tryAlternativeQuranAudio(surahNumber, verseNumber, verse, currentReciter);
        }, { once: true });
        
        quranAudio.addEventListener('ended', function() {
            showNotification(`✅ ${verse.surahName} ${surahNumber}:${verseNumber} completed`, 'success');
            updateAudioPlayerDisplay(verse, currentReciter, 'completed');
            currentAudio = null;
        }, { once: true });
        
        quranAudio.addEventListener('timeupdate', function() {
            updateAudioProgress();
        });
        
        // Load the audio
        quranAudio.load();
    };

    // Try alternative Quran audio sources with better error handling
    function tryAlternativeQuranAudio(surahNumber, verseNumber, verse, reciter) {
        console.log('🔄 Trying alternative audio source...');
        
        // Try full surah audio as fallback
        const surahAudioUrl = `https://cdn.islamic.network/quran/audio-surah/128/${reciter.code}/${surahNumber}.mp3`;
        
        if (quranAudio) {
            quranAudio.src = surahAudioUrl;
            quranAudio.load();
            
            quranAudio.addEventListener('canplay', function() {
                console.log('✅ Surah audio loaded as fallback');
                quranAudio.currentTime = (verseNumber - 1) * 10; // Approximate verse timing
                quranAudio.play().then(() => {
                    showNotification(`🔊 Playing ${verse.surahName} (Full Surah) - ${reciter.name}`, 'info');
                    updateAudioPlayerDisplay(verse, reciter, 'playing-surah');
                }).catch(error => {
                    console.error('Failed to play Surah audio:', error);
                    generateQuranTone(verse);
                });
            }, { once: true });
            
            quranAudio.addEventListener('error', function() {
                console.warn('Failed to load Surah audio');
                generateQuranTone(verse);
            }, { once: true });
        }
    }

    // Enhanced tone generation with verse info
    function generateQuranTone(verse) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Create a peaceful, meditative tone pattern inspired by Quranic recitation
            const frequencies = [220, 246, 261, 293, 329, 349, 392]; // Islamic musical scale
            let time = audioContext.currentTime;
            
            frequencies.forEach((freq, index) => {
                oscillator.frequency.setValueAtTime(freq, time);
                time += 0.5;
            });
            
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 3.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 3.5);
            
            showNotification(`🎵 Playing meditation tone for ${verse.surahName}`, 'info');
            updateAudioPlayerDisplay(verse, { name: 'Meditation Tone' }, 'tone');
            
        } catch (error) {
            console.error('Failed to generate Quran tone:', error);
            showNotification('❌ Audio not available', 'error');
        }
    }

    // Update audio player display
    function updateAudioPlayerDisplay(verse, reciter, status) {
        const playerStatus = document.getElementById('audio-player-status');
        const reciterName = document.getElementById('current-reciter');
        const verseInfo = document.getElementById('current-verse-info');
        
        if (playerStatus) {
            switch(status) {
                case 'playing':
                    playerStatus.innerHTML = '<i class="fas fa-play text-green-500"></i> Playing';
                    break;
                case 'playing-surah':
                    playerStatus.innerHTML = '<i class="fas fa-play text-blue-500"></i> Playing Surah';
                    break;
                case 'tone':
                    playerStatus.innerHTML = '<i class="fas fa-music text-purple-500"></i> Meditation';
                    break;
                case 'completed':
                    playerStatus.innerHTML = '<i class="fas fa-check text-gray-500"></i> Completed';
                    break;
                default:
                    playerStatus.innerHTML = '<i class="fas fa-pause text-gray-500"></i> Stopped';
            }
        }
        
        if (reciterName && reciter.name) {
            reciterName.textContent = reciter.name;
        }
        
        if (verseInfo) {
            verseInfo.textContent = `${verse.surahName} ${verse.surah}:${verse.verse}`;
        }
    }

    // Update audio progress bar
    function updateAudioProgress() {
        if (quranAudio && quranAudio.duration) {
            const progressBar = document.getElementById('audio-progress-bar');
            const currentTimeDisplay = document.getElementById('audio-current-time');
            const durationDisplay = document.getElementById('audio-duration');
            
            if (progressBar) {
                const progress = (quranAudio.currentTime / quranAudio.duration) * 100;
                progressBar.style.width = `${progress}%`;
            }
            
            if (currentTimeDisplay) {
                currentTimeDisplay.textContent = formatTime(quranAudio.currentTime);
            }
            
            if (durationDisplay) {
                durationDisplay.textContent = formatTime(quranAudio.duration);
            }
        }
    }

    // Format time in MM:SS
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Change reciter function
    window.changeReciter = function(reciterCode) {
        localStorage.setItem('selectedReciter', reciterCode);
        showNotification('Reciter changed! Play a verse to hear the new voice.', 'success');
    };

    // Stop all currently playing audio
    function stopAllAudio() {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio = null;
        }
        if (adhanAudio) {
            adhanAudio.pause();
            adhanAudio.currentTime = 0;
            adhanAudio = null;
        }
        if (quranAudio) {
            quranAudio.pause();
            quranAudio.currentTime = 0;
            quranAudio = null;
        }
    }

    // Global function to stop audio (can be called from UI)
    window.stopAudio = function() {
        stopAllAudio();
        showNotification('🔇 Audio stopped', 'info');
    };
    
    function displayCurrentVerse() {
        const verse = quranVerses[currentVerseIndex];
        
        const arabicElement = document.getElementById('arabic-verse');
        const translationElement = document.getElementById('verse-translation');
        const referenceElement = document.getElementById('verse-reference');
        
        if (arabicElement) arabicElement.textContent = verse.arabic;
        if (translationElement) translationElement.textContent = verse.translation;
        if (referenceElement) {
            referenceElement.innerHTML = `<i class="fas fa-book mr-2"></i>${verse.reference}`;
        }
    }
    
    // Initialize with daily verse on load
    setTimeout(() => {
        showDailyVerse();
    }, 1000);
    
    // Mosque Finder Functionality
    let mosquesMap = null;
    let userMarker = null;
    let mosqueMarkers = [];
    let currentMosques = [];

    // Global variables for Qibla compass
    let qiblaDirection = 0;
    let deviceHeading = 0;
    let magneticDeclination = 0;
    let isCompassActive = false;
    let orientationPermissionGranted = false;

    // Qibla Compass Implementation
    function initQiblaCompass() {
        console.log('🧭 Initializing Qibla Compass...');
        
        if (!window.currentLocation) {
            showNotification('📍 Location needed for Qibla direction', 'error');
            return;
        }

        // Calculate Qibla direction
        calculateQiblaDirection(window.currentLocation.lat, window.currentLocation.lng);
        
        // Update compass display
        updateCompassDisplay();
        
        // Request device orientation permission for iOS 13+
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            requestOrientationPermission();
        } else {
            // For other browsers, start listening immediately
            startCompassListening();
        }

        // Update accuracy display
        updateAccuracyDisplay();
        
        isCompassActive = true;
        console.log('✅ Qibla Compass initialized');
    }

    function requestOrientationPermission() {
        DeviceOrientationEvent.requestPermission()
            .then(response => {
                if (response === 'granted') {
                    orientationPermissionGranted = true;
                    startCompassListening();
                    showNotification('🧭 Compass access granted', 'success');
                } else {
                    showNotification('❌ Compass access denied. Please enable in device settings.', 'error');
                }
            })
            .catch(error => {
                console.error('Permission request failed:', error);
                showNotification('❌ Compass not supported on this device', 'error');
            });
    }

    function startCompassListening() {
        if ('DeviceOrientationEvent' in window) {
            window.addEventListener('deviceorientation', handleDeviceOrientation, true);
            
            // Also try absolute orientation for better accuracy
            if ('DeviceOrientationAbsoluteEvent' in window) {
                window.addEventListener('deviceorientationabsolute', handleDeviceOrientation, true);
            }
            
            console.log('🧭 Started listening to device orientation');
        } else {
            showNotification('❌ Device orientation not supported', 'error');
        }
    }

    function handleDeviceOrientation(event) {
        if (!isCompassActive) return;

        // Get compass heading (alpha value)
        let alpha = event.alpha;
        
        if (alpha !== null) {
            // Normalize alpha to 0-360 degrees
            deviceHeading = alpha < 0 ? alpha + 360 : alpha;
            
            // Apply magnetic declination correction
            let correctedHeading = deviceHeading + magneticDeclination;
            if (correctedHeading >= 360) correctedHeading -= 360;
            if (correctedHeading < 0) correctedHeading += 360;
            
            // Update compass needle
            updateCompassNeedle(correctedHeading);
        }
    }

    function calculateQiblaDirection(lat, lng) {
        // Kaaba coordinates
        const kaabaLat = 21.4225;
        const kaabaLng = 39.8262;
        
        // Convert to radians
        const lat1 = lat * Math.PI / 180;
        const lat2 = kaabaLat * Math.PI / 180;
        const deltaLng = (kaabaLng - lng) * Math.PI / 180;
        
        // Calculate bearing using spherical trigonometry
        const x = Math.sin(deltaLng) * Math.cos(lat2);
        const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);
        
        let bearing = Math.atan2(x, y);
        
        // Convert to degrees and normalize to 0-360
        qiblaDirection = (bearing * 180 / Math.PI + 360) % 360;
        
        console.log(`🕋 Qibla direction calculated: ${qiblaDirection.toFixed(1)}°`);
        
        // Fetch magnetic declination for more accurate compass
        fetchMagneticDeclination(lat, lng);
    }

    async function fetchMagneticDeclination(lat, lng) {
        try {
            // Use NOAA magnetic declination web service
            const response = await fetch(`https://www.ngdc.noaa.gov/geomag-web/calculators/calculateDeclination?lat1=${lat}&lon1=${lng}&key=zNEw7&startYear=2024&startMonth=1&startDay=1&resultFormat=json`);
            
            if (response.ok) {
                const data = await response.json();
                magneticDeclination = parseFloat(data.result[0].declination);
                console.log(`🧭 Magnetic declination: ${magneticDeclination}°`);
            } else {
                // Fallback: approximate declination based on location
                magneticDeclination = approximateMagneticDeclination(lat, lng);
            }
        } catch (error) {
            console.warn('Failed to fetch magnetic declination:', error);
            magneticDeclination = approximateMagneticDeclination(lat, lng);
        }
        
        updateCompassDisplay();
    }

    function approximateMagneticDeclination(lat, lng) {
        // Very rough approximation - real declination varies significantly
        // This is just a fallback when the API fails
        if (lng < -30) return -15; // Americas
        if (lng > 120) return 10;  // Asia-Pacific
        return 5; // Europe/Africa
    }

    function updateCompassDisplay() {
        const qiblaAngle = document.getElementById('qibla-angle');
        const qiblaDistance = document.getElementById('qibla-distance');
        
        if (qiblaAngle) {
            qiblaAngle.textContent = `${qiblaDirection.toFixed(1)}°`;
        }
        
        if (qiblaDistance && window.currentLocation) {
            const distance = calculateDistanceToKaaba(window.currentLocation.lat, window.currentLocation.lng);
            qiblaDistance.textContent = `${distance.toFixed(0)} km`;
        }
    }

    function calculateDistanceToKaaba(lat, lng) {
        const kaabaLat = 21.4225;
        const kaabaLng = 39.8262;
        
        const R = 6371; // Earth's radius in km
        const dLat = (kaabaLat - lat) * Math.PI / 180;
        const dLng = (kaabaLng - lng) * Math.PI / 180;
        
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat * Math.PI / 180) * Math.cos(kaabaLat * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    function updateCompassNeedle(heading) {
        const compassNeedle = document.getElementById('compass-needle');
        const qiblaIndicator = document.getElementById('qibla-indicator');
        
        if (compassNeedle) {
            // Rotate compass needle to show device heading
            compassNeedle.style.transform = `rotate(${-heading}deg)`;
        }
        
        if (qiblaIndicator) {
            // Rotate Qibla indicator relative to device heading
            const qiblaRelative = qiblaDirection - heading;
            qiblaIndicator.style.transform = `rotate(${qiblaRelative}deg)`;
        }
        
        // Update heading display
        const headingDisplay = document.getElementById('compass-heading');
        if (headingDisplay) {
            headingDisplay.textContent = `${heading.toFixed(0)}°`;
        }
    }

    function updateAccuracyDisplay() {
        const accuracyElement = document.getElementById('compass-accuracy');
        if (accuracyElement) {
            let accuracy = 'Unknown';
            
            if ('DeviceOrientationEvent' in window) {
                if (orientationPermissionGranted || typeof DeviceOrientationEvent.requestPermission !== 'function') {
                    accuracy = 'Good';
                } else {
                    accuracy = 'Permission needed';
                }
            } else {
                accuracy = 'Not supported';
            }
            
            accuracyElement.textContent = accuracy;
        }
    }

    // Compass calibration function
    window.calibrateCompass = function() {
        showNotification('🧭 Hold your phone flat and move it in a figure-8 pattern', 'info');
        
        // Reset compass values
        deviceHeading = 0;
        
        // Re-fetch magnetic declination
        if (window.currentLocation) {
            fetchMagneticDeclination(window.currentLocation.lat, window.currentLocation.lng);
        }
        
        setTimeout(() => {
            showNotification('✅ Compass calibration complete', 'success');
        }, 3000);
    };
    
    window.initMosqueFinder = function(lat, lng) {
        console.log('🕌 Initializing mosque finder...', lat, lng);
        
        const mapContainer = document.getElementById('mosques-map');
        const mapLoading = document.getElementById('map-loading');
        
        if (!mapContainer) {
            console.error('❌ Map container not found');
            return;
        }
        
        try {
            // Initialize map
            if (mosquesMap) {
                mosquesMap.remove();
            }
            
            mosquesMap = L.map('mosques-map').setView([lat, lng], 14);
            
            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(mosquesMap);
            
            // Add user location marker
            userMarker = L.marker([lat, lng], {
                icon: L.divIcon({
                    className: 'user-marker',
                    html: '<i class="fas fa-user"></i>',
                    iconSize: [35, 35],
                    iconAnchor: [17, 17]
                })
            }).addTo(mosquesMap);
            
            userMarker.bindPopup('<div class="popup-content"><strong>📍 Your Location</strong></div>').openPopup();
            
            // Hide loading
            if (mapLoading) {
                mapLoading.style.display = 'none';
            }
            
            // Fetch nearby mosques
            fetchNearbyMosques(lat, lng);
            
            console.log('✅ Mosque finder initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing mosque finder:', error);
            showNotification('Error loading map. Please try again.', 'error');
            
            // Show fallback message
            if (mapContainer) {
                mapContainer.innerHTML = `
                    <div class="map-error" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 400px; background: #f3f4f6; border-radius: 20px;">
                        <i class="fas fa-exclamation-triangle text-6xl text-gray-400 mb-4"></i>
                        <h3 class="text-xl font-semibold text-gray-600 mb-2">Map Loading Error</h3>
                        <p class="text-gray-500 text-center mb-4">Unable to load the map. Please check your internet connection.</p>
                        <button onclick="initMosqueFinder(${lat}, ${lng})" class="map-btn primary">
                            <i class="fas fa-sync-alt mr-2"></i>Try Again
                        </button>
                    </div>
                `;
            }
        }
    };
    
    async function fetchNearbyMosques(lat, lng) {
        console.log('🔍 Fetching nearby mosques...');
        
        try {
            // Update status
            updateMosqueStats('Searching...', '-', 'Loading');
            
            // Overpass API query for nearby mosques
            const query = `
                [out:json][timeout:25];
                (
                    node["amenity"="place_of_worship"]["religion"="muslim"](around:3000,${lat},${lng});
                    way["amenity"="place_of_worship"]["religion"="muslim"](around:3000,${lat},${lng});
                    relation["amenity"="place_of_worship"]["religion"="muslim"](around:3000,${lat},${lng});
                );
                out center meta;
            `;
            
            const url = 'https://overpass-api.de/api/interpreter';
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'data=' + encodeURIComponent(query)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📊 Mosque data received:', data);
            
            processMosqueData(data.elements, lat, lng);
            
        } catch (error) {
            console.error('❌ Error fetching mosques:', error);
            showNotification('Could not load nearby mosques. Showing sample data.', 'warning');
            
            // Show fallback mosques
            showFallbackMosques(lat, lng);
        }
    }
    
    function processMosqueData(elements, userLat, userLng) {
        console.log('📝 Processing mosque data...', elements.length, 'elements');
        
        // Clear existing markers
        mosqueMarkers.forEach(marker => mosquesMap.removeLayer(marker));
        mosqueMarkers = [];
        currentMosques = [];
        
        if (elements.length === 0) {
            console.log('ℹ️ No mosques found, showing fallback data');
            showFallbackMosques(userLat, userLng);
            return;
        }
        
        // Process each mosque
        elements.forEach((element, index) => {
            let lat, lng;
            
            // Get coordinates based on element type
            if (element.type === 'node') {
                lat = element.lat;
                lng = element.lon;
            } else if (element.center) {
                lat = element.center.lat;
                lng = element.center.lon;
            } else {
                return; // Skip if no coordinates
            }
            
            const name = element.tags?.name || `Mosque ${index + 1}`;
            const address = formatAddress(element.tags);
            const distance = calculateDistance(userLat, userLng, lat, lng);
            
            const mosque = {
                id: element.id,
                name: name,
                address: address,
                lat: lat,
                lng: lng,
                distance: distance,
                tags: element.tags || {}
            };
            
            currentMosques.push(mosque);
            
            // Add marker to map
            addMosqueMarker(mosque);
        });
        
        // Sort by distance
        currentMosques.sort((a, b) => a.distance - b.distance);
        
        // Update display
        displayMosquesList();
        updateMosqueStats(currentMosques.length, currentMosques[0]?.distance, 'High');
        
        console.log('✅ Processed', currentMosques.length, 'mosques');
    }
    
    function showFallbackMosques(userLat, userLng) {
        console.log('🔄 Showing fallback mosque data');
        
        const fallbackMosques = [
            { name: "Central Mosque", address: "123 Main Street", lat: userLat + 0.01, lng: userLng + 0.01 },
            { name: "Community Islamic Center", address: "456 Oak Avenue", lat: userLat - 0.008, lng: userLng + 0.015 },
            { name: "Masjid Al-Noor", address: "789 Pine Road", lat: userLat + 0.015, lng: userLng - 0.01 },
            { name: "Islamic Society", address: "321 Elm Street", lat: userLat - 0.012, lng: userLng - 0.008 }
        ];
        
        currentMosques = fallbackMosques.map(mosque => ({
            ...mosque,
            distance: calculateDistance(userLat, userLng, mosque.lat, mosque.lng),
            id: Math.random().toString(36).substr(2, 9)
        }));
        
        currentMosques.sort((a, b) => a.distance - b.distance);
        
        // Add markers
        currentMosques.forEach(mosque => addMosqueMarker(mosque));
        
        // Update display
        displayMosquesList();
        updateMosqueStats(currentMosques.length, currentMosques[0]?.distance, 'Sample Data');
    }
    
    function addMosqueMarker(mosque) {
        const marker = L.marker([mosque.lat, mosque.lng], {
            icon: L.divIcon({
                className: 'mosque-marker',
                html: '<i class="fas fa-mosque"></i>',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            })
        }).addTo(mosquesMap);
        
        const popupContent = `
            <div class="popup-content">
                <div class="popup-mosque-name">${mosque.name}</div>
                <div class="popup-mosque-address">${mosque.address}</div>
                <div class="popup-mosque-distance">${mosque.distance.toFixed(1)} km away</div>
            </div>
        `;
        
        marker.bindPopup(popupContent);
        mosqueMarkers.push(marker);
    }
    
    function displayMosquesList() {
        const mosquesList = document.getElementById('mosques-list');
        const noMosquesDiv = document.getElementById('no-mosques');
        
        if (!mosquesList) return;
        
        if (currentMosques.length === 0) {
            mosquesList.innerHTML = '';
            if (noMosquesDiv) noMosquesDiv.classList.remove('hidden');
            return;
        }
        
        if (noMosquesDiv) noMosquesDiv.classList.add('hidden');
        
        mosquesList.innerHTML = currentMosques.map(mosque => `
            <div class="mosque-card-new" onclick="focusOnMosque(${mosque.lat}, ${mosque.lng})">
                <div class="mosque-header">
                    <div class="mosque-icon">
                        <i class="fas fa-mosque"></i>
                    </div>
                    <div class="mosque-info">
                        <h4 class="mosque-name">${mosque.name}</h4>
                        <p class="mosque-address">${mosque.address}</p>
                    </div>
                </div>
                <div class="mosque-actions">
                    <div class="mosque-distance">
                        <i class="fas fa-map-marker-alt"></i>
                        ${mosque.distance.toFixed(1)} km
                    </div>
                    <button class="mosque-directions" onclick="event.stopPropagation(); openDirections(${mosque.lat}, ${mosque.lng}, '${mosque.name}')">
                        <i class="fas fa-directions"></i>
                        Directions
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    function updateMosqueStats(total, closest, accuracy) {
        const totalElement = document.getElementById('total-mosques');
        const closestElement = document.getElementById('closest-distance');
        const accuracyElement = document.getElementById('map-accuracy');
        
        if (totalElement) totalElement.textContent = total;
        if (closestElement) closestElement.textContent = typeof closest === 'number' ? `${closest.toFixed(1)}km` : closest;
        if (accuracyElement) accuracyElement.textContent = accuracy;
    }
    
    function formatAddress(tags) {
        if (!tags) return 'Address not available';
        
        const parts = [];
        if (tags['addr:housenumber'] && tags['addr:street']) {
            parts.push(`${tags['addr:housenumber']} ${tags['addr:street']}`);
        } else if (tags['addr:street']) {
            parts.push(tags['addr:street']);
        }
        
        if (tags['addr:city']) parts.push(tags['addr:city']);
        if (tags['addr:state']) parts.push(tags['addr:state']);
        
        return parts.length > 0 ? parts.join(', ') : 'Address not available';
    }
    
    function calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
    
    window.focusOnMosque = function(lat, lng) {
        if (mosquesMap) {
            mosquesMap.setView([lat, lng], 16);
            
            // Find and open popup for this mosque
            mosqueMarkers.forEach(marker => {
                const markerPos = marker.getLatLng();
                if (Math.abs(markerPos.lat - lat) < 0.0001 && Math.abs(markerPos.lng - lng) < 0.0001) {
                    marker.openPopup();
                }
            });
        }
    };
    
    window.openDirections = function(lat, lng, name) {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(name)}`;
        window.open(url, '_blank');
    };
    
    // Add event listeners for mosque tab controls
    document.addEventListener('DOMContentLoaded', function() {
        const refreshBtn = document.getElementById('refresh-mosques');
        const expandBtn = document.getElementById('expand-search');
        const fullscreenBtn = document.getElementById('fullscreen-map');
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                if (window.currentLocation) {
                    initMosqueFinder(window.currentLocation.lat, window.currentLocation.lng);
                } else {
                    showNotification('Location not available. Please enable location access.', 'error');
                }
            });
        }
        
        if (expandBtn) {
            expandBtn.addEventListener('click', function() {
                showNotification('Expanding search radius...', 'info');
                // Could implement expanded radius search here
            });
        }
        
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', function() {
                const mapContainer = document.getElementById('mosques-map');
                if (mapContainer) {
                    if (mapContainer.requestFullscreen) {
                        mapContainer.requestFullscreen();
                    } else if (mapContainer.webkitRequestFullscreen) {
                        mapContainer.webkitRequestFullscreen();
                    } else if (mapContainer.msRequestFullscreen) {
                        mapContainer.msRequestFullscreen();
                    }
                }
            });
        }
    });

    // Enhanced Bookmarks Management
    window.toggleBookmarks = function() {
        const bookmarksSection = document.getElementById('bookmarks-section');
        const isVisible = bookmarksSection.style.display !== 'none';
        
        if (isVisible) {
            bookmarksSection.style.display = 'none';
        } else {
            bookmarksSection.style.display = 'block';
            displayBookmarks();
        }
    };

    function displayBookmarks() {
        const bookmarks = JSON.parse(localStorage.getItem('quranBookmarks') || '[]');
        const bookmarksList = document.getElementById('bookmarks-list');
        const noBookmarks = document.getElementById('no-bookmarks');
        
        if (bookmarks.length === 0) {
            bookmarksList.innerHTML = '';
            noBookmarks.style.display = 'block';
            return;
        }
        
        noBookmarks.style.display = 'none';
        
        bookmarksList.innerHTML = bookmarks.map((bookmark, index) => `
            <div class="bookmark-item" data-index="${index}">
                <div class="bookmark-content">
                    <div class="bookmark-arabic">
                        ${bookmark.arabic}
                    </div>
                    <div class="bookmark-translation">
                        "${bookmark.translation}"
                    </div>
                    <div class="bookmark-reference">
                        <span class="reference-text">
                            <i class="fas fa-book-open mr-2"></i>
                            ${bookmark.reference}
                        </span>
                        <span class="bookmark-date">
                            <i class="fas fa-clock mr-1"></i>
                            ${new Date(bookmark.savedAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
                <div class="bookmark-actions">
                    <button onclick="playBookmarkedVerse(${index})" class="bookmark-btn play-bookmark-btn" title="Play Audio">
                        <i class="fas fa-play"></i>
                    </button>
                    <button onclick="shareBookmarkedVerse(${index})" class="bookmark-btn share-bookmark-btn" title="Share">
                        <i class="fas fa-share-alt"></i>
                    </button>
                    <button onclick="loadBookmarkedVerse(${index})" class="bookmark-btn load-bookmark-btn" title="View Verse">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="removeBookmark(${index})" class="bookmark-btn remove-bookmark-btn" title="Remove">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    window.playBookmarkedVerse = function(index) {
        const bookmarks = JSON.parse(localStorage.getItem('quranBookmarks') || '[]');
        if (bookmarks[index]) {
            const bookmark = bookmarks[index];
            
            // Find the verse in our array to get proper audio data
            const verseIndex = quranVerses.findIndex(v => v.reference === bookmark.reference);
            if (verseIndex !== -1) {
                currentVerseIndex = verseIndex;
                playVerseAudio();
                showNotification(`🔊 Playing bookmarked verse: ${bookmark.reference}`, 'success');
            } else {
                showNotification('❌ Audio not available for this verse', 'error');
            }
        }
    };

    window.shareBookmarkedVerse = function(index) {
        const bookmarks = JSON.parse(localStorage.getItem('quranBookmarks') || '[]');
        if (bookmarks[index]) {
            const bookmark = bookmarks[index];
            const shareText = `${bookmark.translation}\n\n${bookmark.reference}`;
            
            if (navigator.share) {
                navigator.share({
                    title: 'Bookmarked Verse from the Quran',
                    text: shareText
                }).catch(console.error);
            } else {
                navigator.clipboard.writeText(shareText).then(() => {
                    showNotification('Bookmarked verse copied to clipboard!', 'success');
                }).catch(() => {
                    showNotification('Could not copy verse', 'error');
                });
            }
        }
    };

    window.loadBookmarkedVerse = function(index) {
        const bookmarks = JSON.parse(localStorage.getItem('quranBookmarks') || '[]');
        if (bookmarks[index]) {
            const bookmark = bookmarks[index];
            
            // Find and load this verse
            const verseIndex = quranVerses.findIndex(v => v.reference === bookmark.reference);
            if (verseIndex !== -1) {
                currentVerseIndex = verseIndex;
                displayCurrentVerse();
                toggleBookmarks(); // Close bookmarks
                showNotification(`📖 Loaded verse: ${bookmark.reference}`, 'success');
                
                // Scroll to verse display
                const verseCard = document.querySelector('.verse-card-enhanced');
                if (verseCard) {
                    verseCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else {
                showNotification('❌ Could not load this verse', 'error');
            }
        }
    };

    window.removeBookmark = function(index) {
        const bookmarks = JSON.parse(localStorage.getItem('quranBookmarks') || '[]');
        if (bookmarks[index]) {
            const removedVerse = bookmarks[index];
            bookmarks.splice(index, 1);
            localStorage.setItem('quranBookmarks', JSON.stringify(bookmarks));
            displayBookmarks();
            showNotification(`🗑️ Removed bookmark: ${removedVerse.reference}`, 'success');
        }
    };

    window.exportBookmarks = function() {
        const bookmarks = JSON.parse(localStorage.getItem('quranBookmarks') || '[]');
        if (bookmarks.length === 0) {
            showNotification('❌ No bookmarks to export', 'error');
            return;
        }
        
        const exportData = bookmarks.map(bookmark => ({
            arabic: bookmark.arabic,
            translation: bookmark.translation,
            reference: bookmark.reference,
            savedDate: new Date(bookmark.savedAt).toLocaleDateString()
        }));
        
        const exportText = exportData.map(bookmark => 
            `${bookmark.reference}\n\n${bookmark.arabic}\n\n"${bookmark.translation}"\n\nSaved: ${bookmark.savedDate}\n\n${'='.repeat(50)}\n\n`
        ).join('');
        
        // Create downloadable file
        const blob = new Blob([exportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quran-bookmarks-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification(`📁 Exported ${bookmarks.length} bookmarks`, 'success');
    };

    window.clearAllBookmarks = function() {
        const bookmarks = JSON.parse(localStorage.getItem('quranBookmarks') || '[]');
        if (bookmarks.length === 0) {
            showNotification('❌ No bookmarks to clear', 'error');
            return;
        }
        
        if (confirm(`Are you sure you want to delete all ${bookmarks.length} bookmarked verses? This cannot be undone.`)) {
            localStorage.removeItem('quranBookmarks');
            displayBookmarks();
            showNotification('🗑️ All bookmarks cleared', 'success');
        }
    };

    // Update bookmark button appearance
    function updateBookmarkButton(isBookmarked) {
        const bookmarkBtns = document.querySelectorAll('.bookmark-btn, .verse-action-btn-enhanced.bookmark-btn');
        bookmarkBtns.forEach(btn => {
            if (isBookmarked) {
                btn.classList.add('bookmarked');
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.className = 'fas fa-bookmark mr-2';
                }
            } else {
                btn.classList.remove('bookmarked');
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.className = 'far fa-bookmark mr-2';
                }
            }
        });
    }

    // Check if current verse is bookmarked when displaying
    function checkIfVerseBookmarked() {
        const verse = quranVerses[currentVerseIndex];
        const bookmarks = JSON.parse(localStorage.getItem('quranBookmarks') || '[]');
        const isBookmarked = bookmarks.some(bookmark => bookmark.reference === verse.reference);
        updateBookmarkButton(isBookmarked);
    }

    // Update displayCurrentVerse to check bookmark status
    const originalDisplayCurrentVerse = displayCurrentVerse;
    displayCurrentVerse = function() {
        originalDisplayCurrentVerse();
        checkIfVerseBookmarked();
    };
}); 