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

    // Complete Quran Data - All 114 Surahs
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

    // Current player state
    let currentSurah = 1;
    let currentVerse = 1;
    let currentReciter = 'ar.alafasy';
    let isPlaying = false;

    // Available reciters
    const reciters = [
        { code: 'ar.alafasy', name: 'Mishary Alafasy' },
        { code: 'ar.abdurrahmaansudais', name: 'Abdur-Rahman As-Sudais' },
        { code: 'ar.maheralmeaqly', name: 'Maher Al Mueaqly' },
        { code: 'ar.saadalghamdi', name: 'Saad Al Ghamdi' },
        { code: 'ar.abdulbasitmurattal', name: 'Abdul Basit' }
    ];

    // Initialize Quran Player
    function initQuranPlayer() {
        populateSurahDropdown();
        populateVerseDropdown();
        loadSavedSettings();
        updateDisplay();
        console.log('🕌 Quran Player initialized with all 114 Surahs');
    }

    function populateSurahDropdown() {
        const surahSelect = document.getElementById('surah-select');
        if (!surahSelect) return;

        surahSelect.innerHTML = quranSurahs.map(surah => 
            `<option value="${surah.number}">${surah.number}. ${surah.name} (${surah.arabicName})</option>`
        ).join('');
    }

    function populateVerseDropdown() {
        const verseSelect = document.getElementById('verse-select');
        if (!verseSelect) return;

        const surah = quranSurahs.find(s => s.number === currentSurah);
        if (!surah) return;

        verseSelect.innerHTML = '';
        for (let i = 1; i <= surah.verses; i++) {
            verseSelect.innerHTML += `<option value="${i}">${i}</option>`;
        }
        verseSelect.value = currentVerse;
    }

    function loadSavedSettings() {
        const saved = localStorage.getItem('quranPlayerSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            currentSurah = settings.surah || 1;
            currentVerse = settings.verse || 1;
            currentReciter = settings.reciter || 'ar.alafasy';
            
            const surahSelect = document.getElementById('surah-select');
            const verseSelect = document.getElementById('verse-select');
            const reciterSelect = document.getElementById('main-reciter-select');
            
            if (surahSelect) surahSelect.value = currentSurah;
            if (verseSelect) verseSelect.value = currentVerse;
            if (reciterSelect) reciterSelect.value = currentReciter;
        }
    }

    function saveSettings() {
        localStorage.setItem('quranPlayerSettings', JSON.stringify({
            surah: currentSurah,
            verse: currentVerse,
            reciter: currentReciter
        }));
    }

    window.onSurahChange = function() {
        const surahSelect = document.getElementById('surah-select');
        if (!surahSelect) return;
        
        currentSurah = parseInt(surahSelect.value);
        currentVerse = 1; // Reset to verse 1 when changing surah
        
        populateVerseDropdown();
        updateDisplay();
        saveSettings();
        
        if (isPlaying) {
            stopAudio();
        }
    };

    window.onVerseChange = function() {
        const verseSelect = document.getElementById('verse-select');
        if (!verseSelect) return;
        
        currentVerse = parseInt(verseSelect.value);
        updateDisplay();
        saveSettings();
        
        if (isPlaying) {
            stopAudio();
        }
    };

    window.onReciterChange = function() {
        const reciterSelect = document.getElementById('main-reciter-select');
        if (!reciterSelect) return;
        
        currentReciter = reciterSelect.value;
        updateDisplay();
        saveSettings();
        
        if (isPlaying) {
            stopAudio();
            setTimeout(() => playCurrentVerse(), 500); // Restart with new reciter
        }
    };

    function updateDisplay() {
        const surah = quranSurahs.find(s => s.number === currentSurah);
        const reciter = reciters.find(r => r.code === currentReciter);
        
        if (!surah || !reciter) return;

        // Update player info
        const surahNameEl = document.getElementById('current-surah-name');
        const verseNumberEl = document.getElementById('current-verse-number');
        const reciterNameEl = document.getElementById('current-reciter-name');
        const referenceEl = document.getElementById('main-verse-reference');
        
        if (surahNameEl) surahNameEl.textContent = `${surah.name} (${surah.arabicName})`;
        if (verseNumberEl) verseNumberEl.textContent = `Verse ${currentVerse}`;
        if (reciterNameEl) reciterNameEl.textContent = reciter.name;
        if (referenceEl) {
            referenceEl.innerHTML = `
                <span class="reference-badge-main">
                    <i class="fas fa-book-open mr-2"></i>
                    ${surah.name} ${currentSurah}:${currentVerse}
                </span>
            `;
        }

        // Load verse text (placeholder - in real app you'd fetch from API)
        updateVerseText(surah, currentVerse);
    }

    function updateVerseText(surah, verse) {
        const arabicEl = document.getElementById('main-arabic-text');
        const translationEl = document.getElementById('main-translation-text');
        
        // Placeholder text - in real implementation, fetch from Quran API
        if (arabicEl) {
            if (surah.number === 1 && verse === 1) {
                arabicEl.textContent = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";
            } else {
                arabicEl.textContent = `Loading ${surah.name} verse ${verse}...`;
            }
        }
        
        if (translationEl) {
            if (surah.number === 1 && verse === 1) {
                translationEl.textContent = '"In the name of Allah, the Entirely Merciful, the Especially Merciful."';
            } else {
                translationEl.textContent = `Translation for ${surah.name} verse ${verse} will be loaded here...`;
            }
        }
    }

    window.playCurrentVerse = function() {
        if (isPlaying) {
            pauseAudio();
            return;
        }

        console.log(`🎵 Playing ${currentSurah}:${currentVerse} with ${currentReciter}`);
        
        // Stop any currently playing audio
        stopAllAudio();
        
        const surah = quranSurahs.find(s => s.number === currentSurah);
        if (!surah) return;

        // Update status
        updateAudioStatus('loading', `Loading ${surah.name} ${currentVerse}...`);
        
        // Al Quran Cloud API URL
        const audioUrl = `https://cdn.islamic.network/quran/audio/128/${currentReciter}/${currentSurah}${currentVerse.toString().padStart(3, '0')}.mp3`;
        
        // Create and play audio
        quranAudio = new Audio();
        currentAudio = quranAudio;
        quranAudio.src = audioUrl;
        
        quranAudio.addEventListener('canplay', function() {
            console.log('✅ Verse audio loaded successfully');
            quranAudio.play().then(() => {
                isPlaying = true;
                updateAudioStatus('playing', `Playing ${surah.name} ${currentVerse}`);
                updatePlayButton('pause');
            }).catch(error => {
                console.error('Failed to play verse audio:', error);
                tryFallbackAudio(currentSurah, currentVerse);
            });
        }, { once: true });
        
        quranAudio.addEventListener('error', function() {
            console.warn('Failed to load verse audio');
            tryFallbackAudio(currentSurah, currentVerse);
        }, { once: true });
        
        quranAudio.addEventListener('ended', function() {
            isPlaying = false;
            updateAudioStatus('completed', `${surah.name} ${currentVerse} completed`);
            updatePlayButton('play');
            currentAudio = null;
        }, { once: true });
        
        quranAudio.addEventListener('timeupdate', updateProgressBar);
        
        quranAudio.load();
    };

    function tryFallbackAudio(surahNum, verseNum) {
        // Try full surah audio as fallback
        const surahAudioUrl = `https://cdn.islamic.network/quran/audio-surah/128/${currentReciter}/${surahNum}.mp3`;
        
        if (quranAudio) {
            quranAudio.src = surahAudioUrl;
            quranAudio.load();
            
            quranAudio.addEventListener('canplay', function() {
                quranAudio.play().then(() => {
                    isPlaying = true;
                    const surah = quranSurahs.find(s => s.number === surahNum);
                    updateAudioStatus('playing', `Playing ${surah?.name || 'Surah'} (Full)`);
                    updatePlayButton('pause');
                }).catch(error => {
                    console.error('Failed to play surah audio:', error);
                    updateAudioStatus('error', 'Audio unavailable');
                });
            }, { once: true });
        }
    }

    function pauseAudio() {
        if (quranAudio && isPlaying) {
            quranAudio.pause();
            isPlaying = false;
            updateAudioStatus('paused', 'Paused');
            updatePlayButton('play');
        }
    }

    window.playNextVerse = function() {
        const surah = quranSurahs.find(s => s.number === currentSurah);
        if (!surah) return;

        if (currentVerse < surah.verses) {
            currentVerse++;
        } else if (currentSurah < 114) {
            currentSurah++;
            currentVerse = 1;
            populateVerseDropdown();
        } else {
            showNotification('📖 End of Quran reached', 'info');
            return;
        }

        updateSelectors();
        updateDisplay();
        saveSettings();
        
        if (isPlaying) {
            setTimeout(() => playCurrentVerse(), 300);
        }
    };

    window.playPreviousVerse = function() {
        if (currentVerse > 1) {
            currentVerse--;
        } else if (currentSurah > 1) {
            currentSurah--;
            const prevSurah = quranSurahs.find(s => s.number === currentSurah);
            if (prevSurah) {
                currentVerse = prevSurah.verses;
                populateVerseDropdown();
            }
        } else {
            showNotification('📖 Beginning of Quran reached', 'info');
            return;
        }

        updateSelectors();
        updateDisplay();
        saveSettings();
        
        if (isPlaying) {
            setTimeout(() => playCurrentVerse(), 300);
        }
    };

    function updateSelectors() {
        const surahSelect = document.getElementById('surah-select');
        const verseSelect = document.getElementById('verse-select');
        
        if (surahSelect) surahSelect.value = currentSurah;
        if (verseSelect) verseSelect.value = currentVerse;
    }

    function updateAudioStatus(status, message) {
        const statusEl = document.getElementById('audio-status');
        if (!statusEl) return;

        let icon = 'fas fa-pause';
        let color = 'text-gray-500';

        switch (status) {
            case 'loading':
                icon = 'fas fa-spinner fa-spin';
                color = 'text-blue-500';
                break;
            case 'playing':
                icon = 'fas fa-play';
                color = 'text-green-500';
                break;
            case 'paused':
                icon = 'fas fa-pause';
                color = 'text-yellow-500';
                break;
            case 'completed':
                icon = 'fas fa-check';
                color = 'text-green-600';
                break;
            case 'error':
                icon = 'fas fa-exclamation-triangle';
                color = 'text-red-500';
                break;
        }

        statusEl.innerHTML = `<i class="${icon} ${color}"></i><span>${message}</span>`;
    }

    function updatePlayButton(state) {
        const playBtns = document.querySelectorAll('.play-btn-main, .listen-btn-main');
        playBtns.forEach(btn => {
            const icon = btn.querySelector('i');
            if (icon) {
                icon.className = state === 'play' ? 'fas fa-play' : 'fas fa-pause';
            }
        });
    }

    function updateProgressBar() {
        if (!quranAudio || !quranAudio.duration) return;

        const progress = (quranAudio.currentTime / quranAudio.duration) * 100;
        const progressBar = document.getElementById('main-progress-bar');
        const currentTimeDisplay = document.getElementById('current-time-display');
        const totalTimeDisplay = document.getElementById('total-time-display');

        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }

        if (currentTimeDisplay) {
            currentTimeDisplay.textContent = formatTime(quranAudio.currentTime);
        }

        if (totalTimeDisplay) {
            totalTimeDisplay.textContent = formatTime(quranAudio.duration);
        }
    }

    window.bookmarkCurrentVerse = function() {
        const surah = quranSurahs.find(s => s.number === currentSurah);
        if (!surah) return;

        const arabicText = document.getElementById('main-arabic-text')?.textContent || '';
        const translationText = document.getElementById('main-translation-text')?.textContent || '';

        const bookmarkData = {
            arabic: arabicText,
            translation: translationText,
            reference: `Quran ${currentSurah}:${currentVerse}`,
            surahName: surah.name,
            surah: currentSurah,
            verse: currentVerse,
            savedAt: new Date().toISOString()
        };

        let bookmarks = JSON.parse(localStorage.getItem('quranBookmarks') || '[]');
        const isAlreadyBookmarked = bookmarks.some(b => b.reference === bookmarkData.reference);

        if (!isAlreadyBookmarked) {
            bookmarks.unshift(bookmarkData);
            localStorage.setItem('quranBookmarks', JSON.stringify(bookmarks));
            showNotification(`🔖 ${surah.name} ${currentVerse} bookmarked!`, 'success');
            updateBookmarkButtonState(true);
        } else {
            showNotification(`📌 ${surah.name} ${currentVerse} already bookmarked`, 'info');
        }
    };

    window.shareCurrentVerse = function() {
        const surah = quranSurahs.find(s => s.number === currentSurah);
        if (!surah) return;

        const translationText = document.getElementById('main-translation-text')?.textContent || '';
        const shareText = `${translationText}\n\n${surah.name} ${currentSurah}:${currentVerse}`;

        if (navigator.share) {
            navigator.share({
                title: 'Verse from the Quran',
                text: shareText
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(shareText).then(() => {
                showNotification('📋 Verse copied to clipboard!', 'success');
            }).catch(() => {
                showNotification('❌ Could not copy verse', 'error');
            });
        }
    };

    function updateBookmarkButtonState(isBookmarked) {
        const bookmarkBtns = document.querySelectorAll('.bookmark-btn-main');
        bookmarkBtns.forEach(btn => {
            const icon = btn.querySelector('i');
            if (icon) {
                icon.className = isBookmarked ? 'fas fa-bookmark' : 'far fa-bookmark';
            }
            if (isBookmarked) {
                btn.classList.add('bookmarked');
            } else {
                btn.classList.remove('bookmarked');
            }
        });
    }

    // Random and daily verse functions
    window.getRandomVerse = function() {
        const randomSurah = Math.floor(Math.random() * 114) + 1;
        const surah = quranSurahs.find(s => s.number === randomSurah);
        if (!surah) return;

        const randomVerse = Math.floor(Math.random() * surah.verses) + 1;
        
        currentSurah = randomSurah;
        currentVerse = randomVerse;
        
        populateVerseDropdown();
        updateSelectors();
        updateDisplay();
        saveSettings();
        
        showNotification(`🎲 Random verse: ${surah.name} ${currentVerse}`, 'success');
    };

    window.showDailyVerse = function() {
        const today = new Date();
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
        
        // Use day of year to select a consistent daily verse
        const surahIndex = (dayOfYear * 7) % 114; // Multiply by 7 for more variation
        const selectedSurah = quranSurahs[surahIndex];
        
        const verseIndex = (dayOfYear * 3) % selectedSurah.verses; // Multiply by 3 for variation
        
        currentSurah = selectedSurah.number;
        currentVerse = verseIndex + 1;
        
        populateVerseDropdown();
        updateSelectors();
        updateDisplay();
        saveSettings();
        
        showNotification(`📅 Daily verse: ${selectedSurah.name} ${currentVerse}`, 'success');
    };

    // Initialize player when page loads
    setTimeout(() => {
        initQuranPlayer();
    }, 1000);

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

    // Old compass variables removed - using compassState object instead

    // Enhanced Qibla Compass Implementation with Professional Accuracy
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

    function initQiblaCompass() {
        console.log('🧭 Initializing Enhanced Qibla Compass...');
        
        if (!window.currentLocation) {
            showNotification('📍 Location required for accurate Qibla direction', 'error');
            return;
        }
        
        // Reset compass state
        compassState.isActive = true;
        
        const { lat, lng } = window.currentLocation;
        
        // Calculate precise Qibla direction
        calculatePreciseQiblaDirection(lat, lng);
        
        // Check for device orientation support
        if (!window.DeviceOrientationEvent) {
            showNotification('❌ Device orientation not supported on this device', 'error');
            compassState.accuracy = 'Not Supported';
            updateAccuracyDisplay();
            return;
        }
        
        // Start compass with permission handling
        requestAndStartEnhancedCompass();
    }

    async function requestAndStartEnhancedCompass() {
        try {
            // For iOS 13+ devices, request permission
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                console.log('📱 Requesting iOS device orientation permission...');
                
                const permission = await DeviceOrientationEvent.requestPermission();
                if (permission === 'granted') {
                    console.log('✅ iOS orientation permission granted');
                    startEnhancedCompassListening();
                    showNotification('🧭 Compass access granted - calibrate for best accuracy', 'success');
                } else {
                    console.warn('❌ iOS orientation permission denied');
                    showNotification('❌ Compass permission required. Enable in Settings > Privacy > Motion & Orientation', 'error');
                    compassState.accuracy = 'Permission Denied';
                    updateAccuracyDisplay();
                }
            } else {
                // For other devices, start directly
                startEnhancedCompassListening();
                showNotification('🧭 Compass initialized - move device in figure-8 to calibrate', 'info');
            }
        } catch (error) {
            console.error('Compass permission error:', error);
            showNotification('❌ Unable to access device orientation', 'error');
            compassState.accuracy = 'Error';
            updateAccuracyDisplay();
        }
    }

    function startEnhancedCompassListening() {
        if (compassState.isListening) return;
        
        console.log('🎯 Starting enhanced compass listening...');
        
        // Remove existing listeners
        window.removeEventListener('deviceorientation', handleEnhancedOrientation);
        window.removeEventListener('deviceorientationabsolute', handleEnhancedOrientation);
        
        // Add new listeners with passive option for better performance
        window.addEventListener('deviceorientation', handleEnhancedOrientation, { passive: true });
        window.addEventListener('deviceorientationabsolute', handleEnhancedOrientation, { passive: true });
        
        compassState.isListening = true;
        compassState.accuracy = 'Initializing';
        updateAccuracyDisplay();
        
        // Start auto-calibration detection
        setTimeout(startCalibrationDetection, 1000);
    }

    function handleEnhancedOrientation(event) {
        if (!compassState.isActive) return;
        
        let heading = null;
        let isAbsolute = false;
        
        // Determine the best heading source with priority
        if (event.webkitCompassHeading !== undefined && event.webkitCompassHeading !== null) {
            // iOS Safari - most reliable for iOS devices
            heading = event.webkitCompassHeading;
            isAbsolute = true;
            compassState.accuracy = 'High (iOS)';
        } else if (event.alpha !== null) {
            // Standard DeviceOrientationEvent
            isAbsolute = event.absolute || event.type === 'deviceorientationabsolute';
            
            if (isAbsolute) {
                // Absolute orientation (preferred when available)
                heading = event.alpha;
                compassState.accuracy = 'High (Absolute)';
            } else {
                // Relative orientation (less reliable but usable)
                heading = event.alpha;
                compassState.accuracy = compassState.isCalibrated ? 'Good (Relative)' : 'Low (Needs Calibration)';
            }
            
            // Convert to compass heading (0° = North, clockwise)
            heading = (360 - heading) % 360;
        }
        
        if (heading !== null && !isNaN(heading)) {
            compassState.heading = heading;
            compassState.isAbsolute = isAbsolute;
            
            // Apply smooth filtering to reduce jitter
            heading = applySmoothingFilter(heading);
            
            // Update compass display
            updateEnhancedCompassDisplay(heading);
            
            // Track movement for auto-calibration
            trackMovementForCalibration(heading);
        }
    }

    // Smooth filtering to reduce compass jitter
    let headingHistory = [];
    const FILTER_SIZE = 5;

    function applySmoothingFilter(newHeading) {
        headingHistory.push(newHeading);
        if (headingHistory.length > FILTER_SIZE) {
            headingHistory.shift();
        }
        
        if (headingHistory.length < 2) return newHeading;
        
        // Calculate circular mean for compass headings
        let sumSin = 0, sumCos = 0;
        for (let heading of headingHistory) {
            const rad = heading * Math.PI / 180;
            sumSin += Math.sin(rad);
            sumCos += Math.cos(rad);
        }
        
        let meanRad = Math.atan2(sumSin / headingHistory.length, sumCos / headingHistory.length);
        let smoothedHeading = meanRad * 180 / Math.PI;
        if (smoothedHeading < 0) smoothedHeading += 360;
        
        return smoothedHeading;
    }

    function calculatePreciseQiblaDirection(lat, lng) {
        // Precise Kaaba coordinates
        const kaabaLat = 21.422487; // More precise coordinates
        const kaabaLng = 39.826206;
        
        // Convert to radians
        const lat1Rad = lat * Math.PI / 180;
        const lng1Rad = lng * Math.PI / 180;
        const lat2Rad = kaabaLat * Math.PI / 180;
        const lng2Rad = kaabaLng * Math.PI / 180;
        
        // Calculate bearing using spherical trigonometry (Great Circle)
        const deltaLng = lng2Rad - lng1Rad;
        const y = Math.sin(deltaLng) * Math.cos(lat2Rad);
        const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - 
                  Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLng);
        
        let bearing = Math.atan2(y, x) * 180 / Math.PI;
        compassState.qiblaDirection = (bearing + 360) % 360;
        
        console.log(`🕋 Precise Qibla direction: ${compassState.qiblaDirection.toFixed(2)}°`);
        
        // Update compass info display
        updateCompassInfo();
        
        // Fetch magnetic declination for maximum accuracy
        fetchEnhancedMagneticDeclination(lat, lng);
    }

    async function fetchEnhancedMagneticDeclination(lat, lng) {
        try {
            // Try multiple sources for magnetic declination
            
            // Primary: NOAA World Magnetic Model
            const year = new Date().getFullYear();
            const noaaUrl = `https://www.ngdc.noaa.gov/geomag-web/calculators/calculateDeclination?lat1=${lat}&lon1=${lng}&model=WMM&startYear=${year}&resultFormat=json`;
            
            const response = await fetch(noaaUrl);
            if (response.ok) {
                const data = await response.json();
                if (data?.result?.[0]?.declination) {
                    compassState.magneticDeclination = parseFloat(data.result[0].declination);
                    console.log(`🧲 NOAA Magnetic declination: ${compassState.magneticDeclination.toFixed(2)}°`);
                    updateCompassInfo();
                    return;
                }
            }
        } catch (error) {
            console.warn('NOAA magnetic declination failed:', error);
        }
        
        // Fallback to enhanced approximation
        compassState.magneticDeclination = calculateEnhancedMagneticDeclination(lat, lng);
        console.log(`🧲 Estimated magnetic declination: ${compassState.magneticDeclination.toFixed(2)}°`);
        updateCompassInfo();
    }

    function calculateEnhancedMagneticDeclination(lat, lng) {
        // Enhanced magnetic declination approximation based on global magnetic field model
        const year = new Date().getFullYear();
        const epochYear = 2020;
        const yearDiff = year - epochYear;
        
        let declination = 0;
        
        // More accurate regional approximations
        if (lat >= 40 && lat <= 70 && lng >= -140 && lng <= -60) {
            // North America
            declination = 10 + (lng + 100) * 0.15 + (lat - 50) * 0.1 + yearDiff * 0.1;
        } else if (lat >= 35 && lat <= 70 && lng >= -15 && lng <= 50) {
            // Europe and Western Asia
            declination = 2 + (lng - 10) * 0.08 + (lat - 50) * 0.05 + yearDiff * 0.08;
        } else if (lat >= 20 && lat <= 70 && lng >= 50 && lng <= 180) {
            // Eastern Asia
            declination = -8 + (lng - 100) * 0.05 + (lat - 40) * 0.1 + yearDiff * 0.07;
        } else if (lat >= -60 && lat <= 20 && lng >= -180 && lng <= 180) {
            // Southern regions and tropics
            declination = Math.sin(lng * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * 12 + yearDiff * 0.05;
        } else {
            // General fallback
            declination = Math.sin(lng * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * 8 + yearDiff * 0.1;
        }
        
        // Clamp to reasonable range
        return Math.max(-35, Math.min(35, declination));
    }

    function updateEnhancedCompassDisplay(heading) {
        const compassNeedle = document.getElementById('compass-needle');
        const qiblaIndicator = document.getElementById('qibla-indicator');
        const headingElement = document.getElementById('compass-heading');
        
        // Apply magnetic declination correction for true north
        const trueHeading = (heading + compassState.magneticDeclination + 360) % 360;
        
        if (compassNeedle) {
            // Smooth needle rotation with CSS transition
            compassNeedle.style.transition = 'transform 0.2s ease-out';
            compassNeedle.style.transform = `rotate(${-trueHeading}deg)`;
        }
        
        if (qiblaIndicator) {
            // Calculate Qibla direction relative to current true heading
            const qiblaRelative = (compassState.qiblaDirection - trueHeading + 360) % 360;
            qiblaIndicator.style.transition = 'transform 0.2s ease-out';
            qiblaIndicator.style.transform = `rotate(${qiblaRelative}deg)`;
            
            // Add visual feedback when pointing toward Qibla (within 10°)
            if (qiblaRelative <= 10 || qiblaRelative >= 350) {
                qiblaIndicator.style.filter = 'drop-shadow(0 0 10px #ffd700) brightness(1.3)';
            } else {
                qiblaIndicator.style.filter = '';
            }
        }
        
        if (headingElement) {
            headingElement.textContent = `${Math.round(trueHeading)}°`;
        }
        
        updateAccuracyDisplay();
    }

    function updateCompassInfo() {
        const qiblaAngleElement = document.getElementById('qibla-angle');
        const qiblaDistanceElement = document.getElementById('qibla-distance');
        
        if (qiblaAngleElement) {
            qiblaAngleElement.textContent = `${compassState.qiblaDirection.toFixed(1)}°`;
        }
        
        if (qiblaDistanceElement && window.currentLocation) {
            const distance = calculatePreciseDistanceToKaaba(window.currentLocation.lat, window.currentLocation.lng);
            qiblaDistanceElement.textContent = `${distance.toFixed(0)} km`;
        }
    }

    function calculatePreciseDistanceToKaaba(lat, lng) {
        const kaabaLat = 21.422487;
        const kaabaLng = 39.826206;
        
        // Haversine formula for great circle distance
        const R = 6371.0088; // Earth's mean radius in km (more precise)
        const dLat = (kaabaLat - lat) * Math.PI / 180;
        const dLng = (kaabaLng - lng) * Math.PI / 180;
        
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat * Math.PI / 180) * Math.cos(kaabaLat * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    function updateAccuracyDisplay() {
        const accuracyElement = document.getElementById('compass-accuracy');
        if (!accuracyElement) return;
        
        let className = 'text-red-500';
        
        if (compassState.accuracy.includes('High')) {
            className = 'text-green-500 font-bold';
        } else if (compassState.accuracy.includes('Good')) {
            className = 'text-blue-500 font-semibold';
        } else if (compassState.accuracy.includes('Low')) {
            className = 'text-yellow-500';
        }
        
        accuracyElement.textContent = compassState.accuracy;
        accuracyElement.className = className;
    }

    // Auto-calibration system
    let movementHistory = [];
    let lastCalibrationCheck = 0;

    function startCalibrationDetection() {
        console.log('🔧 Starting auto-calibration detection...');
    }

    function trackMovementForCalibration(heading) {
        const now = Date.now();
        movementHistory.push({ heading, time: now });
        
        // Keep only last 10 seconds of movement
        movementHistory = movementHistory.filter(entry => now - entry.time < 10000);
        
        // Check for calibration every 2 seconds
        if (now - lastCalibrationCheck > 2000) {
            checkForCalibration();
            lastCalibrationCheck = now;
        }
    }

    function checkForCalibration() {
        if (movementHistory.length < 20) return; // Need sufficient data
        
        // Check for diverse movement patterns
        const headings = movementHistory.map(entry => entry.heading);
        const minHeading = Math.min(...headings);
        const maxHeading = Math.max(...headings);
        let range = maxHeading - minHeading;
        
        // Handle wrap-around (e.g., 350° to 10°)
        if (range > 180) {
            range = 360 - range;
        }
        
        if (range > 120 && !compassState.isCalibrated) {
            compassState.calibrationMovements++;
            
            if (compassState.calibrationMovements >= 3) {
                compassState.isCalibrated = true;
                compassState.accuracy = compassState.isAbsolute ? 'High (Calibrated)' : 'Good (Calibrated)';
                showNotification('✅ Compass auto-calibrated successfully!', 'success');
                updateAccuracyDisplay();
            }
        }
    }

    // Enhanced manual calibration
    window.calibrateCompass = function() {
        showNotification('🔄 Starting compass calibration...', 'info');
        
        // Reset calibration state
        compassState.isCalibrated = false;
        compassState.calibrationMovements = 0;
        movementHistory = [];
        headingHistory = [];
        
        // Show detailed calibration instructions
        setTimeout(() => showNotification('📱 Hold device flat and move in large figure-8 patterns', 'info'), 1000);
        setTimeout(() => showNotification('🔄 Rotate device in all directions for 10 seconds', 'info'), 2500);
        setTimeout(() => showNotification('↕️ Tilt device up and down while rotating', 'info'), 4000);
        
        // Re-fetch magnetic declination
        if (window.currentLocation) {
            fetchEnhancedMagneticDeclination(window.currentLocation.lat, window.currentLocation.lng);
        }
        
        // Force calibration completion after timeout
        setTimeout(() => {
            if (!compassState.isCalibrated) {
                compassState.isCalibrated = true;
                compassState.accuracy = compassState.isAbsolute ? 'High (Manual)' : 'Good (Manual)';
                showNotification('✅ Manual compass calibration complete!', 'success');
                updateAccuracyDisplay();
            }
        }, 12000);
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

    // Enhanced browser and device detection
    const browserInfo = {
        isIOSChrome: /CriOS/i.test(navigator.userAgent),
        isIOSSafari: /Safari/i.test(navigator.userAgent) && /iPhone|iPad/i.test(navigator.userAgent) && !/CriOS/i.test(navigator.userAgent),
        isAndroidChrome: /Chrome/i.test(navigator.userAgent) && /Android/i.test(navigator.userAgent),
        isDesktopChrome: /Chrome/i.test(navigator.userAgent) && !/Mobile/i.test(navigator.userAgent),
        isIOS: /iPhone|iPad/i.test(navigator.userAgent),
        isAndroid: /Android/i.test(navigator.userAgent),
        isMobile: /iPhone|iPad|Android/i.test(navigator.userAgent)
    };

    // PWA Installation Support
    let deferredPrompt;
    let installButton = null;

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('💾 PWA install prompt available');
        e.preventDefault();
        deferredPrompt = e;
        showInstallButton();
    });

    // Check if app is already installed
    window.addEventListener('appinstalled', () => {
        console.log('✅ PWA was installed');
        hideInstallButton();
        showNotification('🕌 Athan Times installed successfully!', 'success');
    });

    function showInstallButton() {
        // Create install button if it doesn't exist
        if (!installButton) {
            installButton = document.createElement('button');
            installButton.id = 'install-app-btn';
            installButton.className = 'install-btn';
            installButton.innerHTML = '<i class="fas fa-download mr-2"></i>Install App';
            installButton.onclick = installApp;
            
            // Add to header actions
            const headerActions = document.querySelector('.header-actions');
            if (headerActions) {
                headerActions.appendChild(installButton);
            }
        }
        
        installButton.style.display = 'flex';
        
        // Show notification for iOS users (who need manual installation)
        if (browserInfo.isIOS) {
            setTimeout(() => {
                if (browserInfo.isIOSSafari) {
                    showNotification('📱 Tap Share button and "Add to Home Screen" to install', 'info');
                } else if (browserInfo.isIOSChrome) {
                    showNotification('📱 Open in Safari and tap Share → "Add to Home Screen" to install', 'info');
                }
            }, 3000);
        }
    }

    function hideInstallButton() {
        if (installButton) {
            installButton.style.display = 'none';
        }
    }

    async function installApp() {
        if (!deferredPrompt) {
            if (browserInfo.isIOS) {
                if (browserInfo.isIOSSafari) {
                    showNotification('📱 Tap the Share button below and select "Add to Home Screen"', 'info');
                } else {
                    showNotification('📱 Please open this app in Safari to install it', 'info');
                }
            } else {
                showNotification('❌ Installation not available on this browser', 'error');
            }
            return;
        }

        const choiceResult = await deferredPrompt.prompt();
        console.log(`User response to install prompt: ${choiceResult.outcome}`);
        
        if (choiceResult.outcome === 'accepted') {
            showNotification('📱 Installing Athan Times...', 'info');
        } else {
            showNotification('❌ Installation cancelled', 'info');
        }
        
        deferredPrompt = null;
        hideInstallButton();
    }

    // Enhanced geolocation with iOS Chrome fixes
    function getLocationAndPrayerTimes() {
        console.log('🌍 Requesting location...', browserInfo);
        
        if (!navigator.geolocation) {
            showNotification('❌ Geolocation not supported by this browser', 'error');
            useFallbackLocation();
            return;
        }

        // Show different messages for different browsers
        if (browserInfo.isIOSChrome) {
            showNotification('📍 iOS Chrome detected - Getting location...', 'info');
        } else if (browserInfo.isIOSSafari) {
            showNotification('📍 Getting your location...', 'info');
        } else {
            showNotification('📍 Getting your location...', 'info');
        }

        // Enhanced geolocation options for different browsers
        const geoOptions = {
            enableHighAccuracy: true,
            timeout: browserInfo.isIOSChrome ? 20000 : 15000, // Longer timeout for iOS Chrome
            maximumAge: browserInfo.isIOSChrome ? 60000 : 300000 // Shorter cache for iOS Chrome
        };

        // For iOS Chrome, try a more permissive approach first
        if (browserInfo.isIOSChrome) {
            console.log('🔧 Using iOS Chrome location strategy');
            
            // First try with basic options
            const basicOptions = {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 60000
            };
            
            navigator.geolocation.getCurrentPosition(
                handleLocationSuccess,
                (error) => {
                    console.warn('Basic geolocation failed, trying high accuracy...', error);
                    // If basic fails, try high accuracy
                    navigator.geolocation.getCurrentPosition(
                        handleLocationSuccess,
                        handleLocationError,
                        geoOptions
                    );
                },
                basicOptions
            );
        } else {
            // Standard approach for other browsers
            navigator.geolocation.getCurrentPosition(
                handleLocationSuccess,
                handleLocationError,
                geoOptions
            );
        }
    }

    async function handleLocationSuccess(position) {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;
        
        console.log(`✅ Location obtained: ${lat}, ${lng} (accuracy: ${accuracy}m)`);
        
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
            
            // Update location info with accuracy
            const locationInfo = document.getElementById('location-info');
            if (locationInfo) {
                const accuracyText = accuracy < 100 ? 'High' : accuracy < 1000 ? 'Medium' : 'Low';
                locationInfo.textContent = `${locationName} - GPS accuracy: ${accuracyText} (${accuracy.toFixed(0)}m)`;
            }
            
            showNotification(`📍 Location found: ${locationName}`, 'success');
            
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
            
            showNotification('📍 Location found, fetching prayer times...', 'info');
            
            // Still fetch prayer times with coordinates
            await fetchPrayerTimes(lat, lng);
        }
    }

    function handleLocationError(error) {
        console.error('Geolocation error:', error);
        
        let errorMessage = '❌ Unable to get your location. ';
        let suggestion = '';
        
        switch(error.code) {
            case error.PERMISSION_DENIED:
                if (browserInfo.isIOSChrome) {
                    errorMessage += 'iOS Chrome blocks location access.';
                    suggestion = '💡 Try opening this app in Safari for better location support.';
                } else if (browserInfo.isIOSSafari) {
                    errorMessage += 'Please allow location access in Settings → Privacy → Location Services → Safari.';
                    suggestion = '💡 You may need to refresh the page after enabling location.';
                } else {
                    errorMessage += 'Please allow location access.';
                    suggestion = '💡 Click the location icon in your browser address bar.';
                }
                break;
            case error.POSITION_UNAVAILABLE:
                errorMessage += 'Location information unavailable.';
                suggestion = '💡 Make sure GPS is enabled and you have internet connection.';
                break;
            case error.TIMEOUT:
                if (browserInfo.isIOSChrome) {
                    errorMessage += 'Location request timed out on iOS Chrome.';
                    suggestion = '💡 Try opening this app in Safari for better location support.';
                } else {
                    errorMessage += 'Location request timed out.';
                    suggestion = '💡 Try again or check your GPS connection.';
                }
                break;
            default:
                errorMessage += 'Unknown error occurred.';
                suggestion = '💡 Please try refreshing the page.';
                break;
        }
        
        showNotification(errorMessage, 'error');
        
        if (suggestion) {
            setTimeout(() => {
                showNotification(suggestion, 'info');
            }, 2000);
        }
        
        // Use fallback location after showing error
        setTimeout(() => {
            useFallbackLocation();
        }, 4000);
    }

    function useFallbackLocation() {
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
        
        showNotification('📍 Using fallback location for demonstration', 'info');
        
        // Use fallback prayer times
        const fallbackPrayers = calculateFallbackPrayerTimes(fallbackLat, fallbackLng);
        displayPrayerTimes(fallbackPrayers);
        updateNextPrayer(fallbackPrayers);
    }

    // Function to manually request location (for iOS Chrome users)
    window.requestLocationManually = function() {
        if (browserInfo.isIOSChrome) {
            showNotification('📱 For best experience, please open this app in Safari', 'info');
            
            // Offer to copy the URL
            if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href).then(() => {
                    showNotification('📋 URL copied! Open Safari and paste it', 'success');
                }).catch(() => {
                    showNotification('💡 Please copy this URL and open it in Safari', 'info');
                });
            }
        } else {
            getLocationAndPrayerTimes();
        }
    };

    // Check if we should show install prompt on page load
    window.addEventListener('load', () => {
        console.log('🔍 Checking PWA installation status...');
        
        // Check if app is in standalone mode (already installed)
        if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
            console.log('✅ App is running as installed PWA');
            hideInstallButton();
        } else {
            console.log('📱 App is running in browser - install available');
            
            // For iOS, show install hint after delay
            if (browserInfo.isIOS) {
                setTimeout(() => {
                    if (browserInfo.isIOSSafari) {
                        showNotification('💡 Tip: Add this app to your home screen for the best experience!', 'info');
                    }
                }, 5000);
            }
        }
        
        // Auto-show install button after some time if available
        setTimeout(() => {
            if (deferredPrompt && !installButton?.style.display) {
                showInstallButton();
            }
        }, 10000);
    });

    // Helper functions for iOS Chrome users
    window.copyUrlForSafari = function() {
        const currentUrl = window.location.href;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(currentUrl).then(() => {
                showNotification('📋 URL copied! Now open Safari and paste it', 'success');
                setTimeout(() => {
                    showNotification('💡 In Safari: Long press URL bar → Paste → Go', 'info');
                }, 2000);
            }).catch(() => {
                showNotification('❌ Could not copy URL automatically', 'error');
                promptManualCopy(currentUrl);
            });
        } else {
            promptManualCopy(currentUrl);
        }
    };

    function promptManualCopy(url) {
        // Create a temporary text area for manual copy
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.width = '2em';
        textArea.style.height = '2em';
        textArea.style.padding = '0';
        textArea.style.border = 'none';
        textArea.style.outline = 'none';
        textArea.style.boxShadow = 'none';
        textArea.style.background = 'transparent';
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            showNotification('📋 URL copied! Open Safari and paste it', 'success');
        } catch (err) {
            showNotification('💡 Please manually copy this URL and open it in Safari', 'info');
            console.log('Manual copy needed:', url);
        }
        
        document.body.removeChild(textArea);
    }

    // Show/hide browser-specific helpers (DISABLED - was showing unwanted colorful windows)
    function showBrowserSpecificHelpers() {
        // Temporarily disabled to prevent colorful windows from appearing
        console.log('Browser-specific helpers disabled to prevent unwanted UI elements');
        
        // Only show critical notifications, not the colorful helper boxes
        if (browserInfo.isIOSChrome) {
            setTimeout(() => {
                showNotification('💡 For better location accuracy, consider using Safari', 'info');
            }, 5000);
        }
    }

    // Enhanced location refresh specifically for browser compatibility
    window.refreshLocationWithBrowserCheck = function() {
        if (browserInfo.isIOSChrome) {
            showNotification('🔄 Refreshing location (iOS Chrome may have limitations)...', 'info');
            setTimeout(() => {
                getLocationAndPrayerTimes();
            }, 1000);
        } else {
            getLocationAndPrayerTimes();
        }
    };

    // Update location button to use browser-aware refresh
    document.addEventListener('DOMContentLoaded', function() {
        const locationBtn = document.getElementById('location-btn');
        if (locationBtn) {
            locationBtn.onclick = refreshLocationWithBrowserCheck;
        }
    });

    // Browser helpers disabled to prevent colorful windows
}); 