document.addEventListener('DOMContentLoaded', function() {
    console.log('🕌 Athan Times App - Minimal Version Loading...');
    
    // Global variables
    window.currentLocation = null;
    let countdownInterval = null;

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
        
        // Initialize basic app functionality
        initBasicApp();
    }, 2000);
    
    // Basic app initialization
    function initBasicApp() {
        console.log('🔄 Starting basic app initialization...');
        
        // Initialize date and time
        updateDateTime();
        setInterval(updateDateTime, 1000);
        
        // Initialize tabs
        initTabs();
        
        // Get location and prayer times
        getLocationAndPrayerTimes();
        
        console.log('✅ Basic app initialized');
    }
    
    // Tab navigation
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
                if (targetTab === 'qibla') {
                    initBasicQiblaCompass();
                } else if (targetTab === 'mosques') {
                    initBasicMosqueFinder();
                }
            });
        });
    }
    
    // Date and time functions
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
        
        // Update Hijri date (simplified)
        const hijriElement = document.getElementById('hijri-date');
        if (hijriElement) {
            hijriElement.textContent = 'Hijri Date (calculating...)';
        }
    }
    
    // Basic location and prayer times
    function getLocationAndPrayerTimes() {
        if (navigator.geolocation) {
            showNotification('Getting your location...', 'info');
            
            navigator.geolocation.getCurrentPosition(
                async function(position) {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    window.currentLocation = { lat, lng };
                    
                    // Update location display
                    const locationElement = document.getElementById('location-name');
                    if (locationElement) {
                        locationElement.textContent = `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                    }
                    
                    showNotification('Location found! Fetching prayer times...', 'success');
                    
                    // Fetch prayer times (simplified)
                    await fetchBasicPrayerTimes(lat, lng);
                },
                function(error) {
                    console.error('Geolocation error:', error);
                    showNotification('Unable to get location. Using default prayer times.', 'error');
                    
                    // Use fallback location
                    window.currentLocation = { lat: 40.7128, lng: -74.0060 };
                    displayFallbackPrayerTimes();
                }
            );
        } else {
            showNotification('Geolocation not supported. Using default prayer times.', 'error');
            displayFallbackPrayerTimes();
        }
    }
    
    // Basic prayer times fetching
    async function fetchBasicPrayerTimes(lat, lng) {
        try {
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0];
            
            const response = await fetch(`https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=2`);
            const data = await response.json();
            
            if (data.code === 200) {
                displayPrayerTimes(data.data.timings);
                showNotification('Prayer times loaded successfully!', 'success');
            } else {
                throw new Error('API response error');
            }
        } catch (error) {
            console.error('Error fetching prayer times:', error);
            showNotification('Failed to fetch prayer times. Using default times.', 'error');
            displayFallbackPrayerTimes();
        }
    }
    
    // Display prayer times
    function displayPrayerTimes(timings) {
        const prayerContainer = document.getElementById('prayer-times');
        if (!prayerContainer) return;
        
        const prayers = [
            { name: 'Fajr', time: timings.Fajr, description: 'Dawn Prayer' },
            { name: 'Dhuhr', time: timings.Dhuhr, description: 'Noon Prayer' },
            { name: 'Asr', time: timings.Asr, description: 'Afternoon Prayer' },
            { name: 'Maghrib', time: timings.Maghrib, description: 'Sunset Prayer' },
            { name: 'Isha', time: timings.Isha, description: 'Night Prayer' }
        ];
        
        prayerContainer.innerHTML = prayers.map(prayer => `
            <div class="prayer-card bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all">
                <div class="flex justify-between items-center">
                    <div>
                        <h3 class="text-xl font-bold text-gray-800">${prayer.name}</h3>
                        <p class="text-sm text-gray-500">${prayer.description}</p>
                    </div>
                    <div class="text-right">
                        <div class="text-2xl font-bold text-blue-600">${prayer.time}</div>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // Fallback prayer times
    function displayFallbackPrayerTimes() {
        const fallbackTimes = {
            Fajr: '05:30',
            Dhuhr: '12:15',
            Asr: '15:45',
            Maghrib: '18:30',
            Isha: '20:00'
        };
        displayPrayerTimes(fallbackTimes);
    }
    
    // Basic Qibla compass
    function initBasicQiblaCompass() {
        const qiblaContainer = document.querySelector('#qibla .tab-content > div');
        if (qiblaContainer) {
            qiblaContainer.innerHTML = `
                <div class="text-center">
                    <h3 class="text-2xl font-bold mb-4">Qibla Direction</h3>
                    <div class="w-64 h-64 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <div class="text-6xl">🧭</div>
                    </div>
                    <p class="text-gray-600">Basic compass functionality</p>
                    <p class="text-sm text-gray-500 mt-2">Full compass will be restored in next update</p>
                </div>
            `;
        }
    }
    
    // Basic mosque finder
    function initBasicMosqueFinder() {
        const mosqueContainer = document.querySelector('#mosques .tab-content > div');
        if (mosqueContainer) {
            mosqueContainer.innerHTML = `
                <div class="text-center">
                    <h3 class="text-2xl font-bold mb-4">Nearby Mosques</h3>
                    <div class="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                        <div class="text-center">
                            <div class="text-6xl mb-2">🗺️</div>
                            <p class="text-gray-600">Map functionality</p>
                        </div>
                    </div>
                    <p class="text-sm text-gray-500">Full mosque finder will be restored in next update</p>
                </div>
            `;
        }
    }
    
    // Simple notification system
    function showNotification(message, type = 'info') {
        console.log(`📢 ${type.toUpperCase()}: ${message}`);
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white max-w-sm ${
            type === 'success' ? 'bg-green-500' :
            type === 'error' ? 'bg-red-500' :
            type === 'warning' ? 'bg-yellow-500' :
            'bg-blue-500'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove after 4 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 4000);
    }
    
    // Make notification function global
    window.showNotification = showNotification;
    
    console.log('🕌 Minimal Athan Times script loaded successfully');
}); 