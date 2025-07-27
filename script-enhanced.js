// ===================================
// GLOBAL FUNCTIONS - Available immediately
// ===================================

// Simple global stop function
window.stopAudio = function() {
    console.log('🛑 Global Stop Audio called');
    
    // Stop all audio elements on the page
    const audioElements = document.querySelectorAll('audio');
    console.log(`Found ${audioElements.length} audio elements`);
    audioElements.forEach((audio, index) => {
        console.log(`Stopping audio element ${index}`);
        audio.pause();
        audio.currentTime = 0;
        audio.src = ''; // Clear the source to fully stop
        audio.remove(); // Remove from DOM to prevent duplicates
    });
    
    // Try to stop Quran state if it exists
    if (window.currentQuranState && window.currentQuranState.currentAudio) {
        console.log('Stopping currentQuranState audio');
        window.currentQuranState.currentAudio.pause();
        window.currentQuranState.currentAudio.currentTime = 0;
        window.currentQuranState.currentAudio.src = ''; // Clear source
        window.currentQuranState.currentAudio = null;
        window.currentQuranState.isPlaying = false;
    }
    
    // Clear any interval timers that might be updating progress
    if (window.audioProgressInterval) {
        clearInterval(window.audioProgressInterval);
        window.audioProgressInterval = null;
    }
    
    // Reset progress bar
    const progressBar = document.getElementById('main-progress-bar');
    if (progressBar) {
        progressBar.style.width = '0%';
    }
    
    // Reset time displays
    const currentTimeDisplay = document.getElementById('current-time-display');
    const totalTimeDisplay = document.getElementById('total-time-display');
    if (currentTimeDisplay) currentTimeDisplay.textContent = '0:00';
    if (totalTimeDisplay) totalTimeDisplay.textContent = '0:00';
    
    // Update audio status
    const audioStatus = document.getElementById('audio-status');
    if (audioStatus) {
        audioStatus.innerHTML = '<i class="fas fa-stop text-red-500"></i><span>Stopped</span>';
    }
    
    // Show notification
            window.showSuccess('All audio stopped and cleared', {
            title: 'Audio Stopped 🔇',
            duration: 3000
        });
    
    console.log('🛑 Audio stopping completed - all sources cleared');
};

// Global stop all function
window.stopAllAudio = function() {
    window.stopAudio();
};

// Test function
window.testStopButton = function() {
    console.log('🧪 Stop button test successful!');
    alert('🧪 Stop button is working!');
    return true;
};

// ===================================
// MAIN APPLICATION CODE
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🕌 Athan Times App - Enhanced Version Loading...');
    
    // Global variables
    window.currentLocation = null;
    let countdownInterval = null;
    let mosquesMap = null;
    let userMarker = null;
    let currentMosques = [];

    // Enhanced Qibla Compass State
    let compassState = {
        isActive: false,
        isCalibrated: false,
        heading: 0,
        qiblaDirection: 0,
        magneticDeclination: 0,
        isListening: false,
        calibrationMovements: 0,
        accuracy: 'Unknown',
        isAbsolute: false
    };

    // Browser detection for better compatibility
    const browserInfo = {
        isIOSChrome: /CriOS/i.test(navigator.userAgent),
        isIOSSafari: /Safari/i.test(navigator.userAgent) && /iPhone|iPad/i.test(navigator.userAgent) && !/CriOS/i.test(navigator.userAgent),
        isAndroidChrome: /Chrome/i.test(navigator.userAgent) && /Android/i.test(navigator.userAgent),
        isIOS: /iPhone|iPad/i.test(navigator.userAgent),
        isMobile: /iPhone|iPad|Android/i.test(navigator.userAgent)
    };

    // Simulate splash screen loading
    setTimeout(function() {
        console.log('🚀 Hiding splash screen...');
        const splash = document.getElementById('splash');
        const app = document.getElementById('app');
        
        if (splash) {
            splash.style.display = 'none';
            console.log('✅ Splash screen hidden');
        }
        
        if (app) {
            app.classList.remove('hidden');
            console.log('✅ Main app shown');
        }
        
        // Initialize enhanced app functionality
        initEnhancedApp();
    }, 2000);
    
    // Enhanced app initialization
    function initEnhancedApp() {
        console.log('🔄 Starting enhanced app initialization...');
        
        try {
            // Initialize core features
            updateDateTime();
            setInterval(updateDateTime, 1000);
            
            initTabs();
            getLocationAndPrayerTimes();
            initQuranPlayer();
            
            // Initialize browser-specific optimizations
            if (browserInfo.isIOSChrome) {
                setTimeout(() => {
                    showNotification('💡 For best location accuracy, consider using Safari', 'info');
                }, 5000);
            }
            
            console.log('✅ Enhanced app initialized successfully');
        } catch (error) {
            console.error('❌ Error during app initialization:', error);
            showNotification('⚠️ Some features may not work properly', 'warning');
        }
    }
    
    // Tab navigation with enhanced features
    function initTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active class from all tabs
                document.querySelectorAll('.tab-btn').forEach(b => {
                    b.classList.remove('active', 'border-blue-600', 'text-blue-600');
                    b.classList.add('border-transparent', 'text-gray-500');
                    b.setAttribute('aria-selected', 'false');
                });
                
                // Add active class to clicked tab
                this.classList.add('active', 'border-blue-600', 'text-blue-600');
                this.classList.remove('border-transparent', 'text-gray-500');
                this.setAttribute('aria-selected', 'true');
                
                // Hide all tab contents
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                // Show target tab content
                const targetTab = this.getAttribute('data-tab');
                const targetContent = document.getElementById(targetTab);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
                
                // Initialize tab-specific functionality
                setTimeout(() => {
                    try {
                        if (targetTab === 'qibla') {
                            initEnhancedQiblaCompass();
                        } else if (targetTab === 'mosques') {
                            initEnhancedMosqueFinder();
                        }
                    } catch (error) {
                        console.error(`Error initializing ${targetTab} tab:`, error);
                        showNotification(`⚠️ ${targetTab} features may not work properly`, 'warning');
                    }
                }, 100);
            });
        });
    }
    
    // Enhanced date and time
    function updateDateTime() {
        const now = new Date();
        
        // Update current time
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            timeElement.textContent = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
        }
        
        // Update current date
        const dateElement = document.getElementById('current-date');
        if (dateElement) {
            dateElement.textContent = now.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        
        // Update Hijri date (simplified calculation)
        const hijriElement = document.getElementById('hijri-date');
        if (hijriElement) {
            const hijriDate = calculateHijriDate(now);
            hijriElement.textContent = hijriDate;
        }
    }
    
    // Simple Hijri date calculation
    function calculateHijriDate(gregorianDate) {
        // Simplified calculation - approximately 11 days shorter per year
        const gregorianYear = gregorianDate.getFullYear();
        const dayOfYear = Math.floor((gregorianDate - new Date(gregorianYear, 0, 0)) / 86400000);
        const hijriYear = Math.floor((gregorianYear - 622) * 1.030684);
        const hijriMonth = Math.floor(dayOfYear / 29.5) % 12 + 1;
        const hijriDay = Math.floor(dayOfYear % 29.5) + 1;
        
        const hijriMonths = [
            'Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani',
            'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Sha\'ban',
            'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
        ];
        
        return `${hijriDay} ${hijriMonths[hijriMonth - 1]} ${hijriYear + 1444} AH`;
    }
    
    // Enhanced location and prayer times with better error handling
    function getLocationAndPrayerTimes() {
        if (!navigator.geolocation) {
            window.showError('Geolocation not supported by this browser', {
                title: 'Browser Limitation ❌',
                duration: 8000
            });
            useFallbackLocation();
            return;
        }

                    window.showLoading('Getting your location...', {
                title: 'Location Service 📍',
                id: 'location-loading'
            });
        
        const geoOptions = {
            enableHighAccuracy: true,
            timeout: browserInfo.isIOSChrome ? 20000 : 15000,
            maximumAge: browserInfo.isIOSChrome ? 60000 : 300000
        };

        navigator.geolocation.getCurrentPosition(
            handleLocationSuccess,
            handleLocationError,
            geoOptions
        );
    }

    async function handleLocationSuccess(position) {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;
        
        console.log(`✅ Location obtained: ${lat}, ${lng} (accuracy: ${accuracy}m)`);
        
        window.currentLocation = { lat, lng };
        
        try {
            // Get location name
            const locationResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const locationData = await locationResponse.json();
            
            const locationName = locationData.display_name?.split(',')[0] || 'Unknown Location';
            
            // Update location display
            const locationElement = document.getElementById('location-name');
            if (locationElement) {
                locationElement.textContent = locationName;
            }
            
            const coordinatesElement = document.getElementById('location-coordinates');
            if (coordinatesElement) {
                coordinatesElement.textContent = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            }
            
                            window.notificationManager.hide('location-loading');
                window.showSuccess(`Location found: ${locationName}`, {
                    title: 'Location Detected 📍',
                    sound: true
                });
            
            // Fetch prayer times
            await fetchEnhancedPrayerTimes(lat, lng);
            
        } catch (error) {
            console.error('Error getting location name:', error);
            await fetchEnhancedPrayerTimes(lat, lng);
        }
    }

    function handleLocationError(error) {
        console.error('Geolocation error:', error);
        
        let errorMessage = '❌ Unable to get your location. ';
        
        switch(error.code) {
            case error.PERMISSION_DENIED:
                if (browserInfo.isIOSChrome) {
                    errorMessage += 'iOS Chrome blocks location access.';
                    setTimeout(() => {
                        showNotification('💡 Try opening this app in Safari for better location support.', 'info');
                    }, 2000);
                } else {
                    errorMessage += 'Please allow location access.';
                }
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
        
                    window.notificationManager.hide('location-loading');
            window.showError(errorMessage, {
                title: 'Location Error ❌',
                duration: 8000
            });
        
        setTimeout(() => {
            useFallbackLocation();
        }, 3000);
    }

    function useFallbackLocation() {
        const fallbackLat = 40.7128;
        const fallbackLng = -74.0060;
        
        window.currentLocation = { lat: fallbackLat, lng: fallbackLng };
        
        const locationElement = document.getElementById('location-name');
        if (locationElement) {
            locationElement.textContent = 'New York (Fallback)';
        }
        
        showNotification('📍 Using fallback location for demonstration', 'info');
        
        const fallbackPrayers = {
            Fajr: '05:30',
            Dhuhr: '12:15',
            Asr: '15:45',
            Maghrib: '18:30',
            Isha: '20:00'
        };
        displayPrayerTimes(fallbackPrayers);
    }
    
    // Enhanced prayer times fetching
    async function fetchEnhancedPrayerTimes(lat, lng) {
        try {
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0];
            
            const response = await fetch(`https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=2`);
            const data = await response.json();
            
            if (data.code === 200) {
                displayPrayerTimes(data.data.timings);
                updateNextPrayer(data.data.timings);
                window.showSuccess('Prayer times loaded successfully!', {
                title: 'Al-Hamdulillah! 🕌',
                sound: true
            });
            } else {
                throw new Error('API response error');
            }
        } catch (error) {
            console.error('Error fetching prayer times:', error);
            window.showWarning('Failed to fetch prayer times. Using fallback calculations.', {
                title: 'API Unavailable ⚠️',
                duration: 6000
            });
            useFallbackLocation();
        }
    }
    
    // Enhanced prayer times display with beautiful styling
    function displayPrayerTimes(timings) {
        const prayerContainer = document.getElementById('prayer-times');
        if (!prayerContainer) return;
        
        const prayers = [
            { name: 'Fajr', time: timings.Fajr, description: 'Dawn Prayer', icon: '🌅', gradient: 'from-orange-400 to-pink-400' },
            { name: 'Dhuhr', time: timings.Dhuhr, description: 'Noon Prayer', icon: '☀️', gradient: 'from-yellow-400 to-orange-400' },
            { name: 'Asr', time: timings.Asr, description: 'Afternoon Prayer', icon: '🌤️', gradient: 'from-blue-400 to-indigo-400' },
            { name: 'Maghrib', time: timings.Maghrib, description: 'Sunset Prayer', icon: '🌅', gradient: 'from-purple-400 to-pink-400' },
            { name: 'Isha', time: timings.Isha, description: 'Night Prayer', icon: '🌙', gradient: 'from-indigo-400 to-purple-400' }
        ];
        
        prayerContainer.innerHTML = prayers.map((prayer, index) => `
            <div class="prayer-card glass-effect rounded-xl p-6 shadow-lg border border-white border-opacity-30 hover:shadow-2xl transition-all duration-300 cursor-pointer group" 
                 onclick="playAdhan('${prayer.name}')" 
                 style="background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%); backdrop-filter: blur(20px);">
                
                <!-- Prayer Header with Icon -->
                <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-full bg-gradient-to-r ${prayer.gradient} flex items-center justify-center text-xl shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                            ${prayer.icon}
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-gray-800 drop-shadow-lg">${prayer.name}</h3>
                            <p class="text-sm text-gray-600 drop-shadow">${prayer.description}</p>
                        </div>
                    </div>
                    
                    <!-- Prayer Time -->
                    <div class="text-right">
                        <div class="text-3xl font-bold text-gray-800 drop-shadow-lg mb-1">${prayer.time}</div>
                        <div class="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full font-medium shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                            <i class="fas fa-play mr-1"></i>Play Adhan
                        </div>
                    </div>
                </div>
                
                <!-- Prayer Progress Bar -->
                <div class="w-full bg-white bg-opacity-20 rounded-full h-2 overflow-hidden">
                    <div class="bg-gradient-to-r ${prayer.gradient} h-full rounded-full" style="width: ${Math.random() * 60 + 20}%; box-shadow: 0 0 10px rgba(255,255,255,0.5);"></div>
                </div>
                
                <!-- Decorative Elements -->
                <div class="absolute top-2 right-2 text-white text-opacity-20 text-xs font-bold">
                    ${index + 1}
                </div>
            </div>
        `).join('');
    }
    
    // Enhanced next prayer display
    function updateNextPrayer(timings) {
        const nextPrayerElement = document.getElementById('next-prayer');
        if (!nextPrayerElement) return;
        
        const now = new Date();
        const prayers = [
            { name: 'Fajr', time: timings.Fajr, icon: '🌅' },
            { name: 'Dhuhr', time: timings.Dhuhr, icon: '☀️' },
            { name: 'Asr', time: timings.Asr, icon: '🌤️' },
            { name: 'Maghrib', time: timings.Maghrib, icon: '🌅' },
            { name: 'Isha', time: timings.Isha, icon: '🌙' }
        ];
        
        // Find next prayer
        let nextPrayer = null;
        for (const prayer of prayers) {
            const [hours, minutes] = prayer.time.split(':').map(Number);
            const prayerTime = new Date(now);
            prayerTime.setHours(hours, minutes, 0, 0);
            
            if (prayerTime > now) {
                nextPrayer = { ...prayer, time: prayerTime };
                break;
            }
        }
        
        // If no prayer today, next is tomorrow's Fajr
        if (!nextPrayer) {
            const [hours, minutes] = prayers[0].time.split(':').map(Number);
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(hours, minutes, 0, 0);
            nextPrayer = { ...prayers[0], time: tomorrow };
        }
        
        // Update the next prayer display with beautiful styling
        const nextPrayerTimeElement = document.getElementById('next-prayer-time');
        if (nextPrayerTimeElement) {
            nextPrayerTimeElement.textContent = nextPrayer.time.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        }
        
        // Update prayer name
        const nextPrayerTitle = nextPrayerElement.querySelector('h3');
        if (nextPrayerTitle) {
            nextPrayerTitle.innerHTML = `${nextPrayer.icon} ${nextPrayer.name}`;
        }
        
        // Update countdown with enhanced styling
        setInterval(() => {
            const timeLeft = nextPrayer.time - new Date();
            if (timeLeft > 0) {
                const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
                
                const countdownElement = document.getElementById('countdown');
                if (countdownElement) {
                    countdownElement.innerHTML = `
                        <span class="countdown-digit">${hours.toString().padStart(2, '0')}</span>
                        <span class="countdown-separator">:</span>
                        <span class="countdown-digit">${minutes.toString().padStart(2, '0')}</span>
                        <span class="countdown-separator">:</span>
                        <span class="countdown-digit">${seconds.toString().padStart(2, '0')}</span>
                    `;
                }
            }
        }, 1000);
    }
    
    // Enhanced Qibla Compass Implementation
    function initEnhancedQiblaCompass() {
        console.log('🧭 Initializing Enhanced Qibla Compass...');
        
        if (!window.currentLocation) {
            window.showError('Location required for accurate Qibla direction', {
                title: 'Permission Required 📍',
                duration: 8000
            });
            displayBasicCompass();
            return;
        }
        
        compassState.isActive = true;
        const { lat, lng } = window.currentLocation;
        
        calculatePreciseQiblaDirection(lat, lng);
        
        if (!window.DeviceOrientationEvent) {
            window.showError('Device orientation not supported on this device', {
                title: 'Device Limitation ❌',
                duration: 8000
            });
            displayBasicCompass();
            return;
        }
        
        requestAndStartEnhancedCompass();
    }

    async function requestAndStartEnhancedCompass() {
        try {
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                console.log('📱 Requesting iOS device orientation permission...');
                
                const permission = await DeviceOrientationEvent.requestPermission();
                if (permission === 'granted') {
                    startEnhancedCompassListening();
                    window.showSuccess('Compass access granted! Move device to calibrate.', {
                title: 'Qibla Compass 🧭',
                sound: true,
                duration: 6000
            });
                } else {
                    window.showError('Compass permission denied. Enable in device settings.', {
                        title: 'Permission Required ❌',
                        duration: 8000
                    });
                    displayBasicCompass();
                }
            } else {
                startEnhancedCompassListening();
                window.showSuccess('Compass initialized successfully! Move device in figure-8 to calibrate.', {
                title: 'Qibla Compass Ready 🧭',
                sound: true,
                duration: 6000
            });
            }
        } catch (error) {
            console.error('Compass permission error:', error);
            displayBasicCompass();
        }
    }

    function startEnhancedCompassListening() {
        if (compassState.isListening) return;
        
        window.addEventListener('deviceorientation', handleEnhancedOrientation, { passive: true });
        window.addEventListener('deviceorientationabsolute', handleEnhancedOrientation, { passive: true });
        
        compassState.isListening = true;
        compassState.accuracy = 'Initializing';
    }

    function handleEnhancedOrientation(event) {
        if (!compassState.isActive) return;
        
        let heading = null;
        let isAbsolute = false;
        
        if (event.webkitCompassHeading !== undefined && event.webkitCompassHeading !== null) {
            heading = event.webkitCompassHeading;
            isAbsolute = true;
            compassState.accuracy = 'High (iOS)';
        } else if (event.alpha !== null) {
            isAbsolute = event.absolute || event.type === 'deviceorientationabsolute';
            heading = (360 - event.alpha) % 360;
            compassState.accuracy = isAbsolute ? 'High (Absolute)' : 'Good (Relative)';
        }
        
        if (heading !== null && !isNaN(heading)) {
            compassState.heading = heading;
            compassState.isAbsolute = isAbsolute;
            updateEnhancedCompassDisplay(heading);
        }
    }

    function calculatePreciseQiblaDirection(lat, lng) {
        const kaabaLat = 21.422487;
        const kaabaLng = 39.826206;
        
        const lat1Rad = lat * Math.PI / 180;
        const lng1Rad = lng * Math.PI / 180;
        const lat2Rad = kaabaLat * Math.PI / 180;
        const lng2Rad = kaabaLng * Math.PI / 180;
        
        const deltaLng = lng2Rad - lng1Rad;
        const y = Math.sin(deltaLng) * Math.cos(lat2Rad);
        const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - 
                  Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLng);
        
        let bearing = Math.atan2(y, x) * 180 / Math.PI;
        compassState.qiblaDirection = (bearing + 360) % 360;
        
        console.log(`🕋 Qibla direction: ${compassState.qiblaDirection.toFixed(2)}°`);
        updateCompassInfo();
    }

    function updateEnhancedCompassDisplay(heading) {
        const compassNeedle = document.getElementById('compass-needle');
        const qiblaIndicator = document.getElementById('qibla-indicator');
        const headingElement = document.getElementById('compass-heading');
        
        if (compassNeedle) {
            compassNeedle.style.transition = 'transform 0.2s ease-out';
            compassNeedle.style.transform = `rotate(${-heading}deg)`;
        }
        
        if (qiblaIndicator) {
            const qiblaRelative = (compassState.qiblaDirection - heading + 360) % 360;
            qiblaIndicator.style.transition = 'transform 0.2s ease-out';
            qiblaIndicator.style.transform = `rotate(${qiblaRelative}deg)`;
            
            if (qiblaRelative <= 10 || qiblaRelative >= 350) {
                qiblaIndicator.style.filter = 'drop-shadow(0 0 10px #ffd700) brightness(1.3)';
            } else {
                qiblaIndicator.style.filter = '';
            }
        }
        
        if (headingElement) {
            headingElement.textContent = `${Math.round(heading)}°`;
        }
    }

    function updateCompassInfo() {
        const qiblaAngleElement = document.getElementById('qibla-angle');
        const qiblaDistanceElement = document.getElementById('qibla-distance');
        
        if (qiblaAngleElement) {
            qiblaAngleElement.textContent = `${compassState.qiblaDirection.toFixed(1)}°`;
        }
        
        if (qiblaDistanceElement && window.currentLocation) {
            const distance = calculateDistanceToKaaba(window.currentLocation.lat, window.currentLocation.lng);
            qiblaDistanceElement.textContent = `${distance.toFixed(0)} km`;
        }
    }

    function calculateDistanceToKaaba(lat, lng) {
        const kaabaLat = 21.422487;
        const kaabaLng = 39.826206;
        
        const R = 6371.0088;
        const dLat = (kaabaLat - lat) * Math.PI / 180;
        const dLng = (kaabaLng - lng) * Math.PI / 180;
        
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat * Math.PI / 180) * Math.cos(kaabaLat * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    function displayBasicCompass() {
        const qiblaContainer = document.querySelector('#qibla .tab-content > div');
        if (qiblaContainer) {
            qiblaContainer.innerHTML = `
                <div class="text-center">
                    <!-- Beautiful Compass Header -->
                    <div class="mb-8">
                        <h3 class="text-3xl font-bold text-white drop-shadow-lg mb-2">🧭 Qibla Direction</h3>
                        <p class="text-white text-opacity-90">Direction to the Holy Kaaba</p>
                    </div>
                    
                    <!-- Enhanced Compass Design -->
                    <div class="relative mb-8">
                        <div class="w-80 h-80 mx-auto bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300"
                             style="background: conic-gradient(from 0deg, #ffd700, #ff8c00, #ff6347, #ffd700); box-shadow: 0 0 50px rgba(255, 215, 0, 0.5), inset 0 0 50px rgba(255, 255, 255, 0.2);">
                            
                            <!-- Inner compass circle -->
                            <div class="w-64 h-64 bg-gradient-to-br from-white to-gray-100 rounded-full flex items-center justify-center shadow-inner">
                                <!-- Kaaba icon -->
                                <div class="text-6xl drop-shadow-lg transform hover:scale-110 transition-transform duration-300">🕋</div>
                            </div>
                            
                            <!-- Compass needle -->
                            <div class="absolute w-1 h-32 bg-gradient-to-t from-red-600 to-red-400 rounded-full shadow-lg transform -translate-y-8"
                                 style="transform-origin: bottom center; transform: rotate(${compassState.qiblaDirection || 0}deg) translateY(-100px);"></div>
                        </div>
                        
                        <!-- Compass readings -->
                        <div class="absolute top-4 left-1/2 transform -translate-x-1/2 text-white font-bold text-lg drop-shadow-lg">N</div>
                        <div class="absolute right-4 top-1/2 transform -translate-y-1/2 text-white font-bold text-lg drop-shadow-lg">E</div>
                        <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white font-bold text-lg drop-shadow-lg">S</div>
                        <div class="absolute left-4 top-1/2 transform -translate-y-1/2 text-white font-bold text-lg drop-shadow-lg">W</div>
                    </div>
                    
                    <!-- Compass Info Cards -->
                    <div class="grid grid-cols-2 gap-4 mb-6">
                        <div class="glass-effect rounded-lg p-4 text-white">
                            <div class="text-2xl font-bold">${compassState.qiblaDirection ? compassState.qiblaDirection.toFixed(1) + '°' : 'Calculating...'}</div>
                            <div class="text-sm opacity-90">Direction</div>
                        </div>
                        <div class="glass-effect rounded-lg p-4 text-white">
                            <div class="text-2xl font-bold">${window.currentLocation ? calculateDistanceToKaaba(window.currentLocation.lat, window.currentLocation.lng).toFixed(0) + ' km' : 'Unknown'}</div>
                            <div class="text-sm opacity-90">Distance</div>
                        </div>
                    </div>
                    
                    <!-- Calibration Button -->
                    <button onclick="calibrateCompass()" class="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300">
                        <i class="fas fa-sync-alt mr-2"></i>Calibrate Compass
                    </button>
                    
                    <p class="text-sm text-white text-opacity-75 mt-4">Enable device orientation for live compass</p>
                </div>
            `;
        }
    }
    
    // Enhanced mosque finder
    function initEnhancedMosqueFinder() {
        if (!window.currentLocation) {
            window.showError('Location required for mosque finder', {
                title: 'Permission Required 📍',
                duration: 8000
            });
            displayBasicMosqueFinder();
            return;
        }
        
        const { lat, lng } = window.currentLocation;
        
        try {
            if (typeof L !== 'undefined') {
                initMosqueMap(lat, lng);
            } else {
                displayBasicMosqueFinder();
            }
        } catch (error) {
            console.error('Error initializing mosque finder:', error);
            displayBasicMosqueFinder();
        }
    }

    function initMosqueMap(lat, lng) {
        const mapContainer = document.getElementById('mosques-map');
        if (!mapContainer) return;
        
        try {
            if (mosquesMap) {
                mosquesMap.remove();
            }
            
            mosquesMap = L.map('mosques-map').setView([lat, lng], 14);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(mosquesMap);
            
            userMarker = L.marker([lat, lng]).addTo(mosquesMap);
            userMarker.bindPopup('<strong>📍 Your Location</strong>').openPopup();
            
            fetchNearbyMosques(lat, lng);
            
        } catch (error) {
            console.error('Error creating map:', error);
            displayBasicMosqueFinder();
        }
    }

    async function fetchNearbyMosques(lat, lng) {
        try {
            const query = `
                [out:json];
                (
                    node["amenity"="place_of_worship"]["religion"="muslim"](around:2000,${lat},${lng});
                );
                out;
            `;
            
            const url = 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query);
            const response = await fetch(url);
            const data = await response.json();
            
            currentMosques = data.elements || [];
            displayMosquesOnMap();
            
        } catch (error) {
            console.error('Error fetching mosques:', error);
            window.showWarning('Could not load nearby mosques. Please try again later.', {
                title: 'Network Issue ⚠️',
                duration: 6000
            });
        }
    }

    function displayMosquesOnMap() {
        currentMosques.forEach(mosque => {
            const name = mosque.tags?.name || 'Mosque';
            const marker = L.marker([mosque.lat, mosque.lon]).addTo(mosquesMap);
            marker.bindPopup(`<strong>🕌 ${name}</strong>`);
        });
        
                    window.showSuccess(`Found ${currentMosques.length} nearby mosques`, {
                title: 'Mosques Found 🕌',
                sound: true
            });
    }

    function displayBasicMosqueFinder() {
        const mosqueContainer = document.querySelector('#mosques .tab-content > div');
        if (mosqueContainer) {
            mosqueContainer.innerHTML = `
                <div class="text-center">
                    <!-- Beautiful Header -->
                    <div class="mb-8">
                        <h3 class="text-3xl font-bold text-white drop-shadow-lg mb-2">🕌 Nearby Mosques</h3>
                        <p class="text-white text-opacity-90">Find Islamic places of worship near you</p>
                    </div>
                    
                    <!-- Enhanced Map Container -->
                    <div class="relative mb-6">
                        <div class="w-full h-80 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300"
                             style="background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%); box-shadow: 0 20px 40px rgba(16, 185, 129, 0.3);">
                            
                            <div class="text-center text-white">
                                <!-- Animated map icon -->
                                <div class="text-8xl mb-4 animate-pulse">🗺️</div>
                                <div class="text-xl font-bold mb-2">Interactive Map Loading...</div>
                                <div class="text-sm opacity-90">Searching for nearby mosques</div>
                                
                                <!-- Loading animation -->
                                <div class="flex justify-center mt-4 space-x-2">
                                    <div class="w-3 h-3 bg-white rounded-full animate-bounce"></div>
                                    <div class="w-3 h-3 bg-white rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                                    <div class="w-3 h-3 bg-white rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Decorative corner elements -->
                        <div class="absolute top-2 left-2 text-white text-opacity-30">
                            <i class="fas fa-map-marker-alt text-2xl"></i>
                        </div>
                        <div class="absolute top-2 right-2 text-white text-opacity-30">
                            <i class="fas fa-mosque text-2xl"></i>
                        </div>
                    </div>
                    
                    <!-- Feature Cards -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div class="glass-effect rounded-lg p-4 text-white">
                            <div class="text-3xl mb-2">📍</div>
                            <div class="font-bold">Your Location</div>
                            <div class="text-sm opacity-90">GPS Tracking</div>
                        </div>
                        <div class="glass-effect rounded-lg p-4 text-white">
                            <div class="text-3xl mb-2">🕌</div>
                            <div class="font-bold">Mosques Found</div>
                            <div class="text-sm opacity-90">Real-time Data</div>
                        </div>
                        <div class="glass-effect rounded-lg p-4 text-white">
                            <div class="text-3xl mb-2">🗺️</div>
                            <div class="font-bold">Interactive Map</div>
                            <div class="text-sm opacity-90">OpenStreetMap</div>
                        </div>
                    </div>
                    
                    <p class="text-sm text-white text-opacity-75">Enable location access for precise mosque finder</p>
                </div>
            `;
        }
    }
    
    // Comprehensive Quran data for all 114 Surahs
    const quranSurahs = [
        { number: 1, name: "Al-Fatihah", arabicName: "الفاتحة", verses: 7, revelationType: "Meccan" },
        { number: 2, name: "Al-Baqarah", arabicName: "البقرة", verses: 286, revelationType: "Medinan" },
        { number: 3, name: "Ali 'Imran", arabicName: "آل عمران", verses: 200, revelationType: "Medinan" },
        { number: 4, name: "An-Nisa", arabicName: "النساء", verses: 176, revelationType: "Medinan" },
        { number: 5, name: "Al-Ma'idah", arabicName: "المائدة", verses: 120, revelationType: "Medinan" },
        { number: 6, name: "Al-An'am", arabicName: "الأنعام", verses: 165, revelationType: "Meccan" },
        { number: 7, name: "Al-A'raf", arabicName: "الأعراف", verses: 206, revelationType: "Meccan" },
        { number: 8, name: "Al-Anfal", arabicName: "الأنفال", verses: 75, revelationType: "Medinan" },
        { number: 9, name: "At-Tawbah", arabicName: "التوبة", verses: 129, revelationType: "Medinan" },
        { number: 10, name: "Yunus", arabicName: "يونس", verses: 109, revelationType: "Meccan" },
        { number: 11, name: "Hud", arabicName: "هود", verses: 123, revelationType: "Meccan" },
        { number: 12, name: "Yusuf", arabicName: "يوسف", verses: 111, revelationType: "Meccan" },
        { number: 13, name: "Ar-Ra'd", arabicName: "الرعد", verses: 43, revelationType: "Medinan" },
        { number: 14, name: "Ibrahim", arabicName: "ابراهيم", verses: 52, revelationType: "Meccan" },
        { number: 15, name: "Al-Hijr", arabicName: "الحجر", verses: 99, revelationType: "Meccan" },
        { number: 16, name: "An-Nahl", arabicName: "النحل", verses: 128, revelationType: "Meccan" },
        { number: 17, name: "Al-Isra", arabicName: "الإسراء", verses: 111, revelationType: "Meccan" },
        { number: 18, name: "Al-Kahf", arabicName: "الكهف", verses: 110, revelationType: "Meccan" },
        { number: 19, name: "Maryam", arabicName: "مريم", verses: 98, revelationType: "Meccan" },
        { number: 20, name: "Taha", arabicName: "طه", verses: 135, revelationType: "Meccan" },
        { number: 21, name: "Al-Anbya", arabicName: "الأنبياء", verses: 112, revelationType: "Meccan" },
        { number: 22, name: "Al-Hajj", arabicName: "الحج", verses: 78, revelationType: "Medinan" },
        { number: 23, name: "Al-Mu'minun", arabicName: "المؤمنون", verses: 118, revelationType: "Meccan" },
        { number: 24, name: "An-Nur", arabicName: "النور", verses: 64, revelationType: "Medinan" },
        { number: 25, name: "Al-Furqan", arabicName: "الفرقان", verses: 77, revelationType: "Meccan" },
        { number: 26, name: "Ash-Shu'ara", arabicName: "الشعراء", verses: 227, revelationType: "Meccan" },
        { number: 27, name: "An-Naml", arabicName: "النمل", verses: 93, revelationType: "Meccan" },
        { number: 28, name: "Al-Qasas", arabicName: "القصص", verses: 88, revelationType: "Meccan" },
        { number: 29, name: "Al-'Ankabut", arabicName: "العنكبوت", verses: 69, revelationType: "Meccan" },
        { number: 30, name: "Ar-Rum", arabicName: "الروم", verses: 60, revelationType: "Meccan" },
        { number: 31, name: "Luqman", arabicName: "لقمان", verses: 34, revelationType: "Meccan" },
        { number: 32, name: "As-Sajdah", arabicName: "السجدة", verses: 30, revelationType: "Meccan" },
        { number: 33, name: "Al-Ahzab", arabicName: "الأحزاب", verses: 73, revelationType: "Medinan" },
        { number: 34, name: "Saba", arabicName: "سبإ", verses: 54, revelationType: "Meccan" },
        { number: 35, name: "Fatir", arabicName: "فاطر", verses: 45, revelationType: "Meccan" },
        { number: 36, name: "Ya-Sin", arabicName: "يس", verses: 83, revelationType: "Meccan" },
        { number: 37, name: "As-Saffat", arabicName: "الصافات", verses: 182, revelationType: "Meccan" },
        { number: 38, name: "Sad", arabicName: "ص", verses: 88, revelationType: "Meccan" },
        { number: 39, name: "Az-Zumar", arabicName: "الزمر", verses: 75, revelationType: "Meccan" },
        { number: 40, name: "Ghafir", arabicName: "غافر", verses: 85, revelationType: "Meccan" },
        { number: 41, name: "Fussilat", arabicName: "فصلت", verses: 54, revelationType: "Meccan" },
        { number: 42, name: "Ash-Shuraa", arabicName: "الشورى", verses: 53, revelationType: "Meccan" },
        { number: 43, name: "Az-Zukhruf", arabicName: "الزخرف", verses: 89, revelationType: "Meccan" },
        { number: 44, name: "Ad-Dukhan", arabicName: "الدخان", verses: 59, revelationType: "Meccan" },
        { number: 45, name: "Al-Jathiyah", arabicName: "الجاثية", verses: 37, revelationType: "Meccan" },
        { number: 46, name: "Al-Ahqaf", arabicName: "الأحقاف", verses: 35, revelationType: "Meccan" },
        { number: 47, name: "Muhammad", arabicName: "محمد", verses: 38, revelationType: "Medinan" },
        { number: 48, name: "Al-Fath", arabicName: "الفتح", verses: 29, revelationType: "Medinan" },
        { number: 49, name: "Al-Hujurat", arabicName: "الحجرات", verses: 18, revelationType: "Medinan" },
        { number: 50, name: "Qaf", arabicName: "ق", verses: 45, revelationType: "Meccan" },
        { number: 51, name: "Adh-Dhariyat", arabicName: "الذاريات", verses: 60, revelationType: "Meccan" },
        { number: 52, name: "At-Tur", arabicName: "الطور", verses: 49, revelationType: "Meccan" },
        { number: 53, name: "An-Najm", arabicName: "النجم", verses: 62, revelationType: "Meccan" },
        { number: 54, name: "Al-Qamar", arabicName: "القمر", verses: 55, revelationType: "Meccan" },
        { number: 55, name: "Ar-Rahman", arabicName: "الرحمن", verses: 78, revelationType: "Medinan" },
        { number: 56, name: "Al-Waqi'ah", arabicName: "الواقعة", verses: 96, revelationType: "Meccan" },
        { number: 57, name: "Al-Hadid", arabicName: "الحديد", verses: 29, revelationType: "Medinan" },
        { number: 58, name: "Al-Mujadila", arabicName: "المجادلة", verses: 22, revelationType: "Medinan" },
        { number: 59, name: "Al-Hashr", arabicName: "الحشر", verses: 24, revelationType: "Medinan" },
        { number: 60, name: "Al-Mumtahanah", arabicName: "الممتحنة", verses: 13, revelationType: "Medinan" },
        { number: 61, name: "As-Saff", arabicName: "الصف", verses: 14, revelationType: "Medinan" },
        { number: 62, name: "Al-Jumu'ah", arabicName: "الجمعة", verses: 11, revelationType: "Medinan" },
        { number: 63, name: "Al-Munafiqun", arabicName: "المنافقون", verses: 11, revelationType: "Medinan" },
        { number: 64, name: "At-Taghabun", arabicName: "التغابن", verses: 18, revelationType: "Medinan" },
        { number: 65, name: "At-Talaq", arabicName: "الطلاق", verses: 12, revelationType: "Medinan" },
        { number: 66, name: "At-Tahrim", arabicName: "التحريم", verses: 12, revelationType: "Medinan" },
        { number: 67, name: "Al-Mulk", arabicName: "الملك", verses: 30, revelationType: "Meccan" },
        { number: 68, name: "Al-Qalam", arabicName: "القلم", verses: 52, revelationType: "Meccan" },
        { number: 69, name: "Al-Haqqah", arabicName: "الحاقة", verses: 52, revelationType: "Meccan" },
        { number: 70, name: "Al-Ma'arij", arabicName: "المعارج", verses: 44, revelationType: "Meccan" },
        { number: 71, name: "Nuh", arabicName: "نوح", verses: 28, revelationType: "Meccan" },
        { number: 72, name: "Al-Jinn", arabicName: "الجن", verses: 28, revelationType: "Meccan" },
        { number: 73, name: "Al-Muzzammil", arabicName: "المزمل", verses: 20, revelationType: "Meccan" },
        { number: 74, name: "Al-Muddaththir", arabicName: "المدثر", verses: 56, revelationType: "Meccan" },
        { number: 75, name: "Al-Qiyamah", arabicName: "القيامة", verses: 40, revelationType: "Meccan" },
        { number: 76, name: "Al-Insan", arabicName: "الإنسان", verses: 31, revelationType: "Medinan" },
        { number: 77, name: "Al-Mursalat", arabicName: "المرسلات", verses: 50, revelationType: "Meccan" },
        { number: 78, name: "An-Naba", arabicName: "النبإ", verses: 40, revelationType: "Meccan" },
        { number: 79, name: "An-Nazi'at", arabicName: "النازعات", verses: 46, revelationType: "Meccan" },
        { number: 80, name: "Abasa", arabicName: "عبس", verses: 42, revelationType: "Meccan" },
        { number: 81, name: "At-Takwir", arabicName: "التكوير", verses: 29, revelationType: "Meccan" },
        { number: 82, name: "Al-Infitar", arabicName: "الإنفطار", verses: 19, revelationType: "Meccan" },
        { number: 83, name: "Al-Mutaffifin", arabicName: "المطففين", verses: 36, revelationType: "Meccan" },
        { number: 84, name: "Al-Inshiqaq", arabicName: "الإنشقاق", verses: 25, revelationType: "Meccan" },
        { number: 85, name: "Al-Buruj", arabicName: "البروج", verses: 22, revelationType: "Meccan" },
        { number: 86, name: "At-Tariq", arabicName: "الطارق", verses: 17, revelationType: "Meccan" },
        { number: 87, name: "Al-A'la", arabicName: "الأعلى", verses: 19, revelationType: "Meccan" },
        { number: 88, name: "Al-Ghashiyah", arabicName: "الغاشية", verses: 26, revelationType: "Meccan" },
        { number: 89, name: "Al-Fajr", arabicName: "الفجر", verses: 30, revelationType: "Meccan" },
        { number: 90, name: "Al-Balad", arabicName: "البلد", verses: 20, revelationType: "Meccan" },
        { number: 91, name: "Ash-Shams", arabicName: "الشمس", verses: 15, revelationType: "Meccan" },
        { number: 92, name: "Al-Layl", arabicName: "الليل", verses: 21, revelationType: "Meccan" },
        { number: 93, name: "Ad-Duhaa", arabicName: "الضحى", verses: 11, revelationType: "Meccan" },
        { number: 94, name: "Ash-Sharh", arabicName: "الشرح", verses: 8, revelationType: "Meccan" },
        { number: 95, name: "At-Tin", arabicName: "التين", verses: 8, revelationType: "Meccan" },
        { number: 96, name: "Al-Alaq", arabicName: "العلق", verses: 19, revelationType: "Meccan" },
        { number: 97, name: "Al-Qadr", arabicName: "القدر", verses: 5, revelationType: "Meccan" },
        { number: 98, name: "Al-Bayyinah", arabicName: "البينة", verses: 8, revelationType: "Medinan" },
        { number: 99, name: "Az-Zalzalah", arabicName: "الزلزلة", verses: 8, revelationType: "Medinan" },
        { number: 100, name: "Al-Adiyat", arabicName: "العاديات", verses: 11, revelationType: "Meccan" },
        { number: 101, name: "Al-Qari'ah", arabicName: "القارعة", verses: 11, revelationType: "Meccan" },
        { number: 102, name: "At-Takathur", arabicName: "التكاثر", verses: 8, revelationType: "Meccan" },
        { number: 103, name: "Al-Asr", arabicName: "العصر", verses: 3, revelationType: "Meccan" },
        { number: 104, name: "Al-Humazah", arabicName: "الهمزة", verses: 9, revelationType: "Meccan" },
        { number: 105, name: "Al-Fil", arabicName: "الفيل", verses: 5, revelationType: "Meccan" },
        { number: 106, name: "Quraysh", arabicName: "قريش", verses: 4, revelationType: "Meccan" },
        { number: 107, name: "Al-Ma'un", arabicName: "الماعون", verses: 7, revelationType: "Meccan" },
        { number: 108, name: "Al-Kawthar", arabicName: "الكوثر", verses: 3, revelationType: "Meccan" },
        { number: 109, name: "Al-Kafirun", arabicName: "الكافرون", verses: 6, revelationType: "Meccan" },
        { number: 110, name: "An-Nasr", arabicName: "النصر", verses: 3, revelationType: "Medinan" },
        { number: 111, name: "Al-Masad", arabicName: "المسد", verses: 5, revelationType: "Meccan" },
        { number: 112, name: "Al-Ikhlas", arabicName: "الإخلاص", verses: 4, revelationType: "Meccan" },
        { number: 113, name: "Al-Falaq", arabicName: "الفلق", verses: 5, revelationType: "Meccan" },
        { number: 114, name: "An-Nas", arabicName: "الناس", verses: 6, revelationType: "Meccan" }
    ];

    // Current Quran player state (now global)
    window.currentQuranState = {
        selectedSurah: 1,
        selectedVerse: 1,
        selectedReciter: 'ar.alafasy',
        isPlaying: false,
        currentAudio: null
    };

    // Enhanced Quran player initialization
    function initQuranPlayer() {
        console.log('📖 Initializing Enhanced Quran Player...');
        
        try {
            populateSurahDropdown();
            populateVerseDropdown(1); // Start with Al-Fatihah
            updateQuranDisplay();
            
            // Load saved preferences
            loadQuranPreferences();
            
            console.log('✅ Quran player initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing Quran player:', error);
            showNotification('⚠️ Quran player initialization failed', 'warning');
        }
    }

    // Populate Surah dropdown with all 114 Surahs
    function populateSurahDropdown() {
        const surahSelect = document.getElementById('surah-select');
        if (!surahSelect) return;
        
        surahSelect.innerHTML = quranSurahs.map(surah => `
            <option value="${surah.number}">
                ${surah.number}. ${surah.name} (${surah.arabicName}) - ${surah.verses} verses
            </option>
        `).join('');
        
        surahSelect.value = currentQuranState.selectedSurah;
    }

    // Populate verse dropdown based on selected Surah
    function populateVerseDropdown(surahNumber) {
        const verseSelect = document.getElementById('verse-select');
        if (!verseSelect) return;
        
        const selectedSurah = quranSurahs.find(s => s.number === parseInt(surahNumber));
        if (!selectedSurah) return;
        
        verseSelect.innerHTML = '';
        for (let i = 1; i <= selectedSurah.verses; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Verse ${i}`;
            verseSelect.appendChild(option);
        }
        
        verseSelect.value = currentQuranState.selectedVerse;
    }

    // Surah selection change handler
    window.onSurahChange = function() {
        const surahSelect = document.getElementById('surah-select');
        if (!surahSelect) return;
        
        const selectedSurah = parseInt(surahSelect.value);
        currentQuranState.selectedSurah = selectedSurah;
        currentQuranState.selectedVerse = 1; // Reset to first verse
        
        populateVerseDropdown(selectedSurah);
        updateQuranDisplay();
        saveQuranPreferences();
        
                    window.showInfo(`Selected: ${quranSurahs[selectedSurah - 1].name}`, {
                title: 'Quran Selection 📖',
                duration: 3000
            });
    };

    // Verse selection change handler
    window.onVerseChange = function() {
        const verseSelect = document.getElementById('verse-select');
        if (!verseSelect) return;
        
        currentQuranState.selectedVerse = parseInt(verseSelect.value);
        updateQuranDisplay();
        saveQuranPreferences();
    };

    // Reciter selection change handler
    window.onReciterChange = function() {
        const reciterSelect = document.getElementById('main-reciter-select');
        if (!reciterSelect) return;
        
        currentQuranState.selectedReciter = reciterSelect.value;
        updateQuranDisplay();
        saveQuranPreferences();
        
        const reciterName = reciterSelect.options[reciterSelect.selectedIndex].text;
                    window.showInfo(`Reciter changed to: ${reciterName}`, {
                title: 'Quran Reciter 🎙️',
                duration: 3000
            });
    };

    // Update Quran display with current selection
    function updateQuranDisplay() {
        const selectedSurah = quranSurahs.find(s => s.number === currentQuranState.selectedSurah);
        if (!selectedSurah) return;
        
        // Update current playing info
        const surahNameElement = document.getElementById('current-surah-name');
        const verseNumberElement = document.getElementById('current-verse-number');
        const reciterNameElement = document.getElementById('current-reciter-name');
        
        if (surahNameElement) {
            surahNameElement.textContent = selectedSurah.name;
        }
        
        if (verseNumberElement) {
            verseNumberElement.textContent = `Verse ${currentQuranState.selectedVerse}`;
        }
        
        if (reciterNameElement) {
            const reciterSelect = document.getElementById('main-reciter-select');
            if (reciterSelect) {
                reciterNameElement.textContent = reciterSelect.options[reciterSelect.selectedIndex].text;
            }
        }
        
        // Update main verse display
        updateMainVerseDisplay();
    }

    // Update the main verse display area
    function updateMainVerseDisplay() {
        const arabicTextElement = document.getElementById('main-arabic-text');
        const translationElement = document.getElementById('main-translation-text');
        const referenceElement = document.getElementById('main-verse-reference');
        
        const selectedSurah = quranSurahs.find(s => s.number === currentQuranState.selectedSurah);
        
        if (arabicTextElement) {
            // For demo purposes, showing Bismillah for verse 1 of most surahs
            if (currentQuranState.selectedVerse === 1 && currentQuranState.selectedSurah !== 9) {
                arabicTextElement.textContent = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
            } else {
                arabicTextElement.textContent = `${selectedSurah.arabicName} - الآية ${currentQuranState.selectedVerse}`;
            }
        }
        
        if (translationElement) {
            if (currentQuranState.selectedVerse === 1 && currentQuranState.selectedSurah !== 9) {
                translationElement.textContent = '"In the name of Allah, the Entirely Merciful, the Especially Merciful."';
            } else {
                translationElement.textContent = `Translation for ${selectedSurah.name}, Verse ${currentQuranState.selectedVerse} will be loaded here.`;
            }
        }
        
        if (referenceElement) {
            referenceElement.innerHTML = `
                <span class="reference-badge-main">
                    <i class="fas fa-book-open mr-2"></i>
                    ${selectedSurah.name} ${currentQuranState.selectedSurah}:${currentQuranState.selectedVerse}
                </span>
            `;
        }
    }

    // Play current verse with improved audio handling
    window.playCurrentVerse = function() {
        const selectedSurah = currentQuranState.selectedSurah;
        const selectedVerse = currentQuranState.selectedVerse;
        const reciter = currentQuranState.selectedReciter;
        
                    window.showInfo(`Playing ${quranSurahs[selectedSurah - 1].name}, Verse ${selectedVerse}`, {
                title: 'Quran Player 🔊',
                duration: 4000
            });
        
        // Stop current audio if playing
        if (currentQuranState.currentAudio) {
            currentQuranState.currentAudio.pause();
            currentQuranState.currentAudio = null;
        }
        
        // Try multiple audio sources
        tryMultipleAudioSources(selectedSurah, selectedVerse, reciter);
    };

    // Try multiple audio sources with better error handling
    function tryMultipleAudioSources(surahNumber, verseNumber, reciter) {
        const audioSources = [
            // Primary: Individual verse audio
            `https://cdn.islamic.network/quran/audio/128/${reciter}/${surahNumber.toString().padStart(3, '0')}${verseNumber.toString().padStart(3, '0')}.mp3`,
            
            // Fallback 1: Different format
            `https://cdn.islamic.network/quran/audio-surah/128/${reciter}/${surahNumber}.mp3`,
            
            // Fallback 2: Default reciter if current fails
            `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${surahNumber.toString().padStart(3, '0')}${verseNumber.toString().padStart(3, '0')}.mp3`,
            
            // Fallback 3: Full Surah with default reciter
            `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${surahNumber}.mp3`
        ];
        
        tryAudioSource(audioSources, 0, surahNumber, verseNumber);
    }

    // Recursively try audio sources
    function tryAudioSource(sources, index, surahNumber, verseNumber) {
        if (index >= sources.length) {
            // All sources failed, show error and generate tone
            showNotification('🔊 Playing generated tone instead', 'info');
            playGeneratedTone();
            return;
        }
        
        const audioUrl = sources[index];
        const audio = new Audio(audioUrl);
        currentQuranState.currentAudio = audio;
        
        audio.onloadstart = () => {
            updateAudioStatus('Loading...', 'fas fa-spinner fa-spin text-blue-500');
        };
        
        audio.oncanplay = () => {
            // Stop any existing audio first to prevent duplicates (without calling global stop)
            if (window.currentQuranState && window.currentQuranState.currentAudio && window.currentQuranState.currentAudio !== audio) {
                window.currentQuranState.currentAudio.pause();
                window.currentQuranState.currentAudio.currentTime = 0;
                window.currentQuranState.currentAudio.src = '';
            }
            
            // Clear existing progress interval
            if (window.audioProgressInterval) {
                clearInterval(window.audioProgressInterval);
                window.audioProgressInterval = null;
            }
            
            // Now start the new audio
            window.currentQuranState.currentAudio = audio;
            audio.play();
            window.currentQuranState.isPlaying = true;
            showGlobalStopButton(); // Show stop button when audio starts
            
            // Set up progress bar updates
            setupAudioProgress(audio);
            
            if (index === 0) {
                updateAudioStatus('Playing Verse', 'fas fa-play text-green-500');
            } else if (index === 1 || index === 3) {
                updateAudioStatus('Playing Surah', 'fas fa-play text-blue-500');
                showNotification('🔊 Playing full Surah audio', 'info');
            } else {
                updateAudioStatus('Playing (Alternative)', 'fas fa-play text-orange-500');
                showNotification('🔊 Using alternative reciter', 'info');
            }
            
            updatePlayButton();
        };
        
        audio.onended = () => {
            currentQuranState.isPlaying = false;
            updateAudioStatus('Finished', 'fas fa-check text-green-500');
            updatePlayButton();
            hideGlobalStopButton(); // Hide stop button when audio ends
        };
        
        audio.onerror = () => {
            console.log(`Audio source ${index + 1} failed, trying next...`);
            // Try next source
            tryAudioSource(sources, index + 1, surahNumber, verseNumber);
        };
        
        // Set timeout to try next source if loading takes too long
        setTimeout(() => {
            if (audio.readyState === 0) {
                console.log(`Audio source ${index + 1} timeout, trying next...`);
                audio.src = '';
                tryAudioSource(sources, index + 1, surahNumber, verseNumber);
            }
        }, 5000);
    }

    // Generate a simple tone as last fallback
    function playGeneratedTone() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Create a pleasant Islamic-inspired tone sequence
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
            oscillator.frequency.setValueAtTime(587.33, audioContext.currentTime + 0.5); // D5
            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 1); // E5
            oscillator.frequency.setValueAtTime(698.46, audioContext.currentTime + 1.5); // F5
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 2);
            
            updateAudioStatus('Generated Tone', 'fas fa-music text-purple-500');
            
        } catch (error) {
            console.error('Generated tone failed:', error);
            updateAudioStatus('No Audio Available', 'fas fa-times text-red-500');
        }
    }

    // Enhanced stop audio with better cleanup
    window.stopAudio = function() {
        console.log('🛑 Stop Audio called');
        console.log('Current audio state:', currentQuranState?.currentAudio);
        console.log('Is playing:', currentQuranState?.isPlaying);
        
        if (currentQuranState?.currentAudio) {
            console.log('🛑 Stopping audio...');
            currentQuranState.currentAudio.pause();
            currentQuranState.currentAudio.currentTime = 0;
            currentQuranState.currentAudio = null;
            currentQuranState.isPlaying = false;
            updateAudioStatus('Stopped', 'fas fa-stop text-gray-500');
            updatePlayButton();
            hideGlobalStopButton();
            window.showInfo('Audio stopped successfully', {
                title: 'Audio Control 🔇',
                duration: 3000
            });
        } else {
            console.log('⚠️ No audio to stop');
            window.showWarning('No audio is currently playing', {
                title: 'Audio Player ⚠️',
                duration: 4000
            });
        }
    };

    // Global stop function for header button
    window.stopAllAudio = function() {
        stopAudio();
    };

    // Show global stop button when audio starts playing
    function showGlobalStopButton() {
        const globalStopBtn = document.getElementById('global-stop-btn');
        if (globalStopBtn) {
            globalStopBtn.style.display = 'block';
            // Add a gentle notification about the stop button
            setTimeout(() => {
                showNotification('🛑 Stop button available in header and player controls', 'info');
            }, 2000);
        }
        
        // Also make the main stop button more visible
        const stopBtn = document.querySelector('.stop-btn-main');
        if (stopBtn) {
            stopBtn.style.animation = 'pulse 2s infinite';
            stopBtn.style.boxShadow = '0 0 20px rgba(220, 38, 38, 0.8)';
            stopBtn.classList.add('active');
        }
    }

    // Hide global stop button when audio stops
    function hideGlobalStopButton() {
        const globalStopBtn = document.getElementById('global-stop-btn');
        if (globalStopBtn) {
            globalStopBtn.style.display = 'none';
        }
        
        // Remove stop button animation
        const stopBtn = document.querySelector('.stop-btn-main');
        if (stopBtn) {
            stopBtn.style.animation = 'none';
            stopBtn.style.boxShadow = '0 4px 15px rgba(220, 38, 38, 0.4)';
            stopBtn.classList.remove('active');
        }
    }

    // Play alternative audio (full Surah)
    function playAlternativeAudio() {
        try {
            const surahAudioUrl = `https://cdn.islamic.network/quran/audio-surah/128/${currentQuranState.selectedReciter}/${currentQuranState.selectedSurah}.mp3`;
            
            const audio = new Audio(surahAudioUrl);
            currentQuranState.currentAudio = audio;
            
            audio.oncanplay = () => {
                audio.play();
                currentQuranState.isPlaying = true;
                updateAudioStatus('Playing Surah', 'fas fa-play text-blue-500');
                showNotification('🔊 Playing full Surah instead', 'info');
            };
            
            audio.onerror = () => {
                updateAudioStatus('No Audio Available', 'fas fa-times text-red-500');
                window.showError('No audio available for this selection', {
                title: 'Audio Unavailable ❌',
                duration: 6000
            });
            };
            
        } catch (error) {
            console.error('Alternative audio failed:', error);
        }
    }

    // Enhanced bookmark current verse with cool effects
    window.bookmarkCurrentVerse = function() {
        const selectedSurah = quranSurahs[window.currentQuranState.selectedSurah - 1];
        
        const bookmarkData = {
            surah: window.currentQuranState.selectedSurah,
            verse: window.currentQuranState.selectedVerse,
            surahName: selectedSurah.name,
            arabicName: selectedSurah.arabicName,
            timestamp: new Date().toISOString(),
            reciter: window.currentQuranState.selectedReciter
        };
        
        let bookmarks = JSON.parse(localStorage.getItem('quranBookmarks')) || [];
        
        // Check if already bookmarked
        const existingIndex = bookmarks.findIndex(b => 
            b.surah === bookmarkData.surah && b.verse === bookmarkData.verse
        );
        
        if (existingIndex !== -1) {
            // Remove bookmark with cool effect
            bookmarks.splice(existingIndex, 1);
            localStorage.setItem('quranBookmarks', JSON.stringify(bookmarks));
            
            // Cool removal effect
            const bookmarkButtons = document.querySelectorAll('.bookmark-btn-main');
            bookmarkButtons.forEach(btn => {
                btn.classList.remove('bookmarked');
                btn.style.animation = 'shake 0.5s ease-in-out';
                setTimeout(() => btn.style.animation = '', 500);
            });
            
            window.showWarning('Removed from saved verses', {
                title: 'Bookmark Removed 💔',
                duration: 4000
            });
        } else {
            // Add bookmark with celebration effect
            bookmarks.push(bookmarkData);
            localStorage.setItem('quranBookmarks', JSON.stringify(bookmarks));
            
            // Cool save effect
            const bookmarkButtons = document.querySelectorAll('.bookmark-btn-main');
            bookmarkButtons.forEach(btn => {
                btn.classList.add('bookmarked');
                btn.style.animation = 'bounce 0.6s ease-in-out';
                setTimeout(() => btn.style.animation = '', 600);
                
                // Add sparkle effect
                createSparkleEffect(btn);
            });
            
            window.showSuccess(`Saved: ${selectedSurah.name} ${window.currentQuranState.selectedSurah}:${window.currentQuranState.selectedVerse}`, {
                title: 'Bookmark Added ⭐',
                sound: true
            });
        }
        
        updateBookmarkButton();
    };
    
    // Create sparkle effect for bookmark
    function createSparkleEffect(button) {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const sparkle = document.createElement('div');
                sparkle.innerHTML = '✨';
                sparkle.style.position = 'absolute';
                sparkle.style.fontSize = '20px';
                sparkle.style.pointerEvents = 'none';
                sparkle.style.animation = 'sparkle-float 1s ease-out forwards';
                sparkle.style.zIndex = '1000';
                
                const rect = button.getBoundingClientRect();
                sparkle.style.left = (rect.left + Math.random() * rect.width) + 'px';
                sparkle.style.top = (rect.top + Math.random() * rect.height) + 'px';
                
                document.body.appendChild(sparkle);
                
                setTimeout(() => {
                    if (sparkle.parentNode) {
                        sparkle.parentNode.removeChild(sparkle);
                    }
                }, 1000);
            }, i * 100);
        }
    }

    // Share current verse
    window.shareCurrentVerse = function() {
        const selectedSurah = quranSurahs[currentQuranState.selectedSurah - 1];
        const shareText = `${selectedSurah.name} ${currentQuranState.selectedSurah}:${currentQuranState.selectedVerse} - Quran verse from Athan Times app`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Quran Verse',
                text: shareText,
                url: window.location.href
            });
        } else {
            // Fallback to clipboard
            if (navigator.clipboard) {
                navigator.clipboard.writeText(shareText);
                window.showSuccess('Verse reference copied to clipboard!', {
                title: 'Copied! 📋',
                sound: true,
                duration: 3000
            });
            } else {
                window.showInfo('Share feature not available on this device', {
                    title: 'Feature Unavailable 📖',
                    duration: 4000
                });
            }
        }
    };

    // Save preferences to localStorage
    function saveQuranPreferences() {
        const preferences = {
            selectedSurah: currentQuranState.selectedSurah,
            selectedVerse: currentQuranState.selectedVerse,
            selectedReciter: currentQuranState.selectedReciter
        };
        
        localStorage.setItem('quranPreferences', JSON.stringify(preferences));
    }

    // Load preferences from localStorage
    function loadQuranPreferences() {
        const saved = localStorage.getItem('quranPreferences');
        if (saved) {
            try {
                const preferences = JSON.parse(saved);
                currentQuranState.selectedSurah = preferences.selectedSurah || 1;
                currentQuranState.selectedVerse = preferences.selectedVerse || 1;
                currentQuranState.selectedReciter = preferences.selectedReciter || 'ar.alafasy';
                
                updateDropdownValues();
                updateQuranDisplay();
                
                const reciterSelect = document.getElementById('main-reciter-select');
                if (reciterSelect) {
                    reciterSelect.value = currentQuranState.selectedReciter;
                }
                
            } catch (error) {
                console.error('Error loading Quran preferences:', error);
            }
        }
    }
    
    // Audio functions
    window.playAdhan = function(prayerName) {
        window.showInfo(`Playing ${prayerName} Adhan...`, {
            title: 'Call to Prayer 🔊',
            duration: 4000
        });
        // Placeholder for Adhan audio
        setTimeout(() => {
            window.showSuccess(`${prayerName} Adhan completed`, {
                title: 'Prayer Call Complete ✅',
                sound: true
            });
        }, 2000);
    };
    
    // Calibration function
    window.calibrateCompass = function() {
                    window.showInfo('Starting compass calibration. Move device in figure-8 pattern.', {
                title: 'Calibrating Compass 🔄',
                duration: 8000
            });
        
        setTimeout(() => {
            compassState.isCalibrated = true;
            window.showSuccess('Compass calibrated successfully!', {
                title: 'Calibration Complete ✅',
                sound: true,
                duration: 5000
            });
        }, 5000);
    };
    
    // Functions globally available (showNotification is now handled by the modern NotificationManager)
    window.getLocationAndPrayerTimes = getLocationAndPrayerTimes;
    
    console.log('🕌 Enhanced Athan Times script loaded successfully');

    // Test function for stop button
    window.testStopButton = function() {
        console.log('🧪 Testing stop button...');
        window.showInfo('Stop button test - Function is working!', {
            title: 'Test Successful 🧪',
            duration: 3000
        });
        return true;
    };

    // Setup audio progress bar and time display
    function setupAudioProgress(audio) {
        const progressBar = document.getElementById('main-progress-bar');
        const currentTimeDisplay = document.getElementById('current-time-display');
        const totalTimeDisplay = document.getElementById('total-time-display');
        
        // Clear any existing interval
        if (window.audioProgressInterval) {
            clearInterval(window.audioProgressInterval);
        }
        
        // Set total duration when metadata loads
        audio.onloadedmetadata = () => {
            if (totalTimeDisplay && !isNaN(audio.duration)) {
                totalTimeDisplay.textContent = formatTime(audio.duration);
            }
        };
        
        // Update progress during playback
        window.audioProgressInterval = setInterval(() => {
            if (audio && !audio.paused && !isNaN(audio.duration) && audio.duration > 0) {
                const progress = (audio.currentTime / audio.duration) * 100;
                
                // Update progress bar
                if (progressBar) {
                    progressBar.style.width = progress + '%';
                }
                
                // Update current time display
                if (currentTimeDisplay) {
                    currentTimeDisplay.textContent = formatTime(audio.currentTime);
                }
                
                // Update total time if not set
                if (totalTimeDisplay && totalTimeDisplay.textContent === '0:00') {
                    totalTimeDisplay.textContent = formatTime(audio.duration);
                }
            }
        }, 500); // Update every 500ms
    }

    // Format time in MM:SS format
    function formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Seek audio by clicking on progress bar
    window.seekAudio = function(event) {
        if (!window.currentQuranState || !window.currentQuranState.currentAudio) {
            console.log('No audio to seek');
            return;
        }
        
        const audio = window.currentQuranState.currentAudio;
        if (!audio.duration || isNaN(audio.duration)) {
            console.log('Audio duration not available for seeking');
            return;
        }
        
        const progressContainer = event.currentTarget;
        const rect = progressContainer.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const containerWidth = rect.width;
        const clickPercentage = clickX / containerWidth;
        
        // Calculate new time position
        const newTime = clickPercentage * audio.duration;
        
        console.log(`Seeking to: ${formatTime(newTime)} (${Math.round(clickPercentage * 100)}%)`);
        
        // Set new audio position
        audio.currentTime = newTime;
        
        // Update progress bar immediately
        const progressBar = document.getElementById('main-progress-bar');
        if (progressBar) {
            progressBar.style.width = (clickPercentage * 100) + '%';
        }
        
        // Update time display
        const currentTimeDisplay = document.getElementById('current-time-display');
        if (currentTimeDisplay) {
            currentTimeDisplay.textContent = formatTime(newTime);
        }
        
        showNotification(`⏩ Seeked to ${formatTime(newTime)}`, 'info');
    };

    // ===================================
    // SETTINGS FUNCTIONALITY
    // ===================================
    
    // ===================================
    // SETTINGS DEBUG AND TEST
    // ===================================
    
    console.log('🔧 Setting up settings functionality...');
    
    // Test function to check if everything is working
    window.testSettingsButton = function() {
        console.log('🧪 Testing settings button...');
        
        const settingsBtn = document.getElementById('settings-btn');
        const modal = document.getElementById('settings-modal');
        
        console.log('Settings button:', settingsBtn);
        console.log('Settings modal:', modal);
        
        if (settingsBtn && modal) {
            console.log('✅ Both elements found, opening modal...');
            modal.classList.remove('hidden');
            alert('🎉 Settings test successful! Modal should be open.');
        } else {
            console.log('❌ Missing elements');
            alert('❌ Settings test failed - missing elements');
        }
    };
    
    // ===================================
    // SETTINGS FUNCTIONALITY
    // ===================================
    
    // Settings and modal handlers
    const settingsBtn = document.getElementById('settings-btn');
    console.log('🔧 Settings button found:', !!settingsBtn);
    
    if (settingsBtn) {
        console.log('🔧 Adding click listener to settings button...');
        settingsBtn.addEventListener('click', function() {
            console.log('🔧 Settings button clicked!');
            const modal = document.getElementById('settings-modal');
            console.log('🔧 Settings modal found:', !!modal);
            
            if (modal) {
                console.log('🔧 Opening settings modal...');
                modal.classList.remove('hidden');
                showNotification('⚙️ Settings opened!', 'success');
            } else {
                console.log('❌ Settings modal not found!');
                alert('❌ Settings modal not found!');
            }
        });
        console.log('✅ Settings button listener added successfully');
    } else {
        console.log('❌ Settings button not found!');
        alert('❌ Settings button not found!');
    }
    
    // Close settings modal
    const closeSettings = document.getElementById('close-settings');
    console.log('🔧 Close settings button found:', !!closeSettings);
    
    if (closeSettings) {
        closeSettings.addEventListener('click', function() {
            console.log('🔧 Close settings button clicked!');
            const modal = document.getElementById('settings-modal');
            if (modal) {
                modal.classList.add('hidden');
                showNotification('⚙️ Settings closed!', 'info');
            }
        });
        console.log('✅ Close settings button listener added successfully');
    }
    
    // Close modal when clicking outside
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal) {
        settingsModal.addEventListener('click', function(e) {
            if (e.target === settingsModal) {
                settingsModal.classList.add('hidden');
                showNotification('⚙️ Settings closed!', 'info');
            }
        });
    }
}); 

// ===================================
// SIMPLE SETTINGS FUNCTION - Available immediately
// ===================================

// Simple direct function to open settings
window.openSettingsModal = function() {
    console.log('🔧 Direct settings function called!');
    
    const modal = document.getElementById('settings-modal');
    if (modal) {
        console.log('🔧 Opening settings modal directly...');
        modal.classList.remove('hidden');
        
        // Show success notification if available
        window.showSuccess('Settings opened successfully!', {
            title: 'Settings ⚙️',
            duration: 3000
        });
        
        console.log('✅ Settings modal opened successfully');
        return true;
    } else {
        console.log('❌ Settings modal not found!');
        alert('❌ Settings modal not found!');
        return false;
    }
};

// Save settings function
window.saveSettings = function() {
    try {
        // Get all setting values
        const autoLocation = document.querySelector('input[name="auto-location"]')?.checked ?? true;
        const notifications = document.querySelector('input[name="notifications"]')?.checked ?? true;
        const soundEnabled = document.querySelector('input[name="sound"]')?.checked ?? true;
        const madhab = document.querySelector('input[name="madhab"]:checked')?.value ?? 'shafi';
        
        // Save to localStorage
        const settings = {
            autoLocation,
            notifications,
            soundEnabled,
            madhab,
            savedAt: new Date().toISOString()
        };
        
        localStorage.setItem('athanTimesSettings', JSON.stringify(settings));
        
        // Show success notification
        window.showSuccess('All settings saved successfully!', {
            title: 'Settings Saved ⚙️',
            sound: true,
            duration: 4000
        });
        
        // Close modal after short delay
        setTimeout(() => {
            window.closeSettingsModal();
        }, 1500);
        
    } catch (error) {
        console.error('Error saving settings:', error);
        window.showError('Failed to save settings. Please try again.', {
            title: 'Save Error ❌',
            duration: 6000
        });
    }
};

// Load saved settings function
window.loadSavedSettings = function() {
    try {
        const saved = localStorage.getItem('athanTimesSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            
            // Apply settings to form elements
            const autoLocationInput = document.querySelector('input[name="auto-location"]');
            if (autoLocationInput) autoLocationInput.checked = settings.autoLocation ?? true;
            
            const notificationsInput = document.querySelector('input[name="notifications"]');
            if (notificationsInput) notificationsInput.checked = settings.notifications ?? true;
            
            const soundInput = document.querySelector('input[name="sound"]');
            if (soundInput) soundInput.checked = settings.soundEnabled ?? true;
            
            const madhabInput = document.querySelector(`input[name="madhab"][value="${settings.madhab ?? 'shafi'}"]`);
            if (madhabInput) madhabInput.checked = true;
            
            console.log('✅ Settings loaded from localStorage');
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
};

// Simple close function
window.closeSettingsModal = function() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.classList.add('hidden');
        window.showInfo('Settings modal closed', {
            title: 'Settings ⚙️',
            duration: 2000
        });
    }
};

// Add event listeners for settings
document.addEventListener('DOMContentLoaded', function() {
    // Save settings button event listener (backup for onclick)
    const saveBtn = document.getElementById('save-settings');
    if (saveBtn) {
        saveBtn.addEventListener('click', window.saveSettings);
    }
    
    // Load saved settings when page loads
    setTimeout(() => {
        window.loadSavedSettings();
    }, 1000);
});

// ===================================
// MODERN NOTIFICATION SYSTEM
// ===================================

class NotificationManager {
    constructor() {
        this.container = null;
        this.notifications = new Map();
        this.soundEnabled = true;
        this.init();
    }

    init() {
        // Create notification container
        this.container = document.createElement('div');
        this.container.className = 'notification-container';
        this.container.id = 'notification-container';
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', options = {}) {
        const {
            title = this.getDefaultTitle(type),
            duration = 5000,
            persistent = false,
            sound = false,
            actions = [],
            id = this.generateId()
        } = options;

        // Remove existing notification with same id
        if (this.notifications.has(id)) {
            this.hide(id);
        }

        const notification = this.createNotification({
            id, message, type, title, duration, persistent, sound, actions
        });

        this.container.appendChild(notification);
        this.notifications.set(id, notification);

        // Play sound if enabled
        if (sound && this.soundEnabled) {
            this.playSound(type);
        }

        // Animate in
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Auto dismiss
        if (!persistent && duration > 0) {
            const progressBar = notification.querySelector('.notification-progress');
            if (progressBar) {
                progressBar.style.transitionDuration = `${duration}ms`;
                progressBar.style.width = '0%';
            }

            setTimeout(() => {
                this.hide(id);
            }, duration);
        }

        return id;
    }

    createNotification({ id, message, type, title, duration, persistent, sound, actions }) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.setAttribute('data-id', id);

        const icon = this.getIcon(type);
        
        notification.innerHTML = `
            <div class="notification-header">
                <div class="notification-content">
                    <div class="notification-icon">
                        <i class="${icon}"></i>
                    </div>
                    <div class="notification-title">${title}</div>
                </div>
                <button class="notification-close" onclick="window.notificationManager.hide('${id}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="notification-message">${message}</div>
            ${actions.length > 0 ? this.createActions(actions, id) : ''}
            ${!persistent && duration > 0 ? '<div class="notification-progress" style="width: 100%;"></div>' : ''}
            ${sound ? '<div class="notification-sound-indicator"></div>' : ''}
        `;

        // Add click to dismiss
        notification.addEventListener('click', (e) => {
            if (!e.target.closest('.notification-close') && !e.target.closest('.notification-action')) {
                this.hide(id);
            }
        });

        return notification;
    }

    createActions(actions, notificationId) {
        const actionsHtml = actions.map(action => 
            `<button class="notification-action ${action.primary ? 'primary' : ''}" 
                     onclick="window.notificationManager.handleAction('${notificationId}', '${action.id}')"
                     style="margin: 8px 4px 0 0; padding: 6px 12px; border: none; border-radius: 6px; 
                            background: ${action.primary ? '#4299e1' : 'rgba(0,0,0,0.1)'}; 
                            color: ${action.primary ? 'white' : '#4a5568'}; cursor: pointer; font-size: 12px;">
                ${action.label}
             </button>`
        ).join('');

        return `<div class="notification-actions" style="margin-top: 8px;">${actionsHtml}</div>`;
    }

    handleAction(notificationId, actionId) {
        const notification = this.notifications.get(notificationId);
        if (notification) {
            const event = new CustomEvent('notificationAction', {
                detail: { notificationId, actionId }
            });
            document.dispatchEvent(event);
            this.hide(notificationId);
        }
    }

    hide(id) {
        const notification = this.notifications.get(id);
        if (notification) {
            notification.classList.remove('show');
            notification.classList.add('hide');
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                this.notifications.delete(id);
            }, 400);
        }
    }

    hideAll() {
        this.notifications.forEach((notification, id) => {
            this.hide(id);
        });
    }

    getIcon(type) {
        const icons = {
            success: 'fas fa-check',
            error: 'fas fa-exclamation-triangle',
            warning: 'fas fa-exclamation',
            info: 'fas fa-info-circle',
            loading: 'fas fa-spinner fa-spin'
        };
        return icons[type] || icons.info;
    }

    getDefaultTitle(type) {
        const titles = {
            success: 'Success!',
            error: 'Error!',
            warning: 'Warning!',
            info: 'Information',
            loading: 'Loading...'
        };
        return titles[type] || 'Notification';
    }

    playSound(type) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Different frequencies for different types
            const frequencies = {
                success: [523, 659, 784], // C, E, G
                error: [220, 185], // A, F#
                warning: [440, 554], // A, C#
                info: [440], // A
                loading: [349] // F
            };

            const freq = frequencies[type] || frequencies.info;
            
            oscillator.frequency.setValueAtTime(freq[0], audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);

            // Play additional notes for success
            if (type === 'success' && freq.length > 1) {
                freq.forEach((f, i) => {
                    if (i > 0) {
                        setTimeout(() => {
                            const osc = audioContext.createOscillator();
                            const gain = audioContext.createGain();
                            osc.connect(gain);
                            gain.connect(audioContext.destination);
                            osc.frequency.setValueAtTime(f, audioContext.currentTime);
                            gain.gain.setValueAtTime(0.1, audioContext.currentTime);
                            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                            osc.start(audioContext.currentTime);
                            osc.stop(audioContext.currentTime + 0.2);
                        }, i * 100);
                    }
                });
            }
        } catch (error) {
            console.log('Audio not supported');
        }
    }

    generateId() {
        return 'notification_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Convenience methods
    success(message, options = {}) {
        return this.show(message, 'success', { ...options, sound: true });
    }

    error(message, options = {}) {
        return this.show(message, 'error', { ...options, sound: true, duration: 8000 });
    }

    warning(message, options = {}) {
        return this.show(message, 'warning', { ...options, sound: true, duration: 6000 });
    }

    info(message, options = {}) {
        return this.show(message, 'info', options);
    }

    loading(message, options = {}) {
        return this.show(message, 'loading', { ...options, persistent: true });
    }

    // Update existing notification
    update(id, message, options = {}) {
        const notification = this.notifications.get(id);
        if (notification) {
            const messageEl = notification.querySelector('.notification-message');
            if (messageEl) {
                messageEl.textContent = message;
            }
            
            if (options.type) {
                notification.className = `notification ${options.type} show`;
            }
        }
    }
}

// Initialize global notification manager
window.notificationManager = new NotificationManager();

// Legacy showNotification function for compatibility
window.showNotification = function(message, type = 'info', options = {}) {
    return window.notificationManager.show(message, type, options);
};

// Enhanced notification methods
window.showSuccess = (message, options) => window.notificationManager.success(message, options);
window.showError = (message, options) => window.notificationManager.error(message, options);
window.showWarning = (message, options) => window.notificationManager.warning(message, options);
window.showInfo = (message, options) => window.notificationManager.info(message, options);
window.showLoading = (message, options) => window.notificationManager.loading(message, options);

// ===================================
// NOTIFICATION DEMO FUNCTIONS
// ===================================

window.testNotifications = function() {
    console.log('🎉 Testing new notification system!');
    
    // Success notification with sound
    setTimeout(() => {
        window.showSuccess('Prayer times updated successfully!', {
            title: 'Al-Hamdulillah! 🕌',
            sound: true
        });
    }, 500);
    
    // Info notification
    setTimeout(() => {
        window.showInfo('Location detected: Mecca, Saudi Arabia', {
            title: 'Location Found 📍'
        });
    }, 1500);
    
    // Warning notification
    setTimeout(() => {
        window.showWarning('Please enable location services for accurate prayer times', {
            title: 'Location Permission ⚠️'
        });
    }, 2500);
    
    // Loading notification
    setTimeout(() => {
        const loadingId = window.showLoading('Calculating Qibla direction...', {
            title: 'Please Wait ⏳'
        });
        
        // Update loading to success after 3 seconds
        setTimeout(() => {
            window.notificationManager.hide(loadingId);
            window.showSuccess('Qibla direction calculated!', {
                title: 'Ready! 🧭',
                sound: true
            });
        }, 3000);
    }, 3500);
    
    // Error notification
    setTimeout(() => {
        window.showError('Failed to connect to prayer time API', {
            title: 'Connection Error ❌',
            actions: [
                { id: 'retry', label: 'Retry', primary: true },
                { id: 'offline', label: 'Use Offline Mode' }
            ]
        });
    }, 7000);
};

window.testAdvancedNotification = function() {
    window.notificationManager.show('This is a custom notification with actions!', 'info', {
        title: 'Advanced Features 🚀',
        duration: 10000,
        sound: true,
        actions: [
            { id: 'settings', label: 'Open Settings', primary: true },
            { id: 'dismiss', label: 'Dismiss' }
        ]
    });
};

// Listen for notification actions
document.addEventListener('notificationAction', (event) => {
    const { notificationId, actionId } = event.detail;
    console.log(`🔔 Notification action: ${actionId} from ${notificationId}`);
    
    switch (actionId) {
        case 'retry':
            window.showLoading('Retrying connection...', { title: 'Connecting... 🔄' });
            break;
        case 'offline':
            window.showInfo('Switched to offline mode', { title: 'Offline Mode 📱' });
            break;
        case 'settings':
            window.openSettingsModal();
            break;
        default:
            console.log('Unknown action:', actionId);
    }
});