// تهيئة Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC7RoFG-bxZVLVI-txBcAEDF_8Jr_57mBs",
    authDomain: "hrsd-fcb0e.firebaseapp.com",
    projectId: "hrsd-fcb0e",
    storageBucket: "hrsd-fcb0e.firebasestorage.app",
    messagingSenderId: "854796086468",
    appId: "1:854796086468:web:b58044e5ac266a34d6ed91",
    measurementId: "G-B9KVSWPRJQ",
    databaseURL: "https://hrsd-fcb0e-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// متغيرات التحقق من كلمة المرور
let passwordVerified = false;
const correctPassword = "99946";
let currentProtectedTab = null;

// دالة لجمع القيم من جميع الأيام
function sumAllValues(snapshot) {
    let total = 0;
    snapshot.forEach(daySnapshot => {
        const value = daySnapshot.val();
        if (typeof value === 'number') {
            total += value;
        } else if (typeof value === 'object') {
            Object.values(value).forEach(v => {
                if (typeof v === 'number') total += v;
            });
        }
    });
    return total;
}

// دالة لتنسيق التاريخ
function formatDate(dateString) {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('ar-SA', options);
}

// دالة للتبديل بين التبويبات
function setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // إزالة الفعالية من جميع التبويبات
            tabs.forEach(t => t.classList.remove('active'));
            // إضافة الفعالية للتبويب المحدد
            tab.classList.add('active');

            // إخفاء جميع محتويات التبويبات
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });

            // إظهار محتوى التبويب المحدد
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

// دالة للتحقق من كلمة المرور
function checkPassword() {
    const passwordInput = document.getElementById('password-input').value;
    if (passwordInput === correctPassword) {
        passwordVerified = true;
        document.getElementById('password-modal').style.display = 'none';
        
        // تحديد التبويب المطلوب وإظهار محتواه
        if (currentProtectedTab === 'locations') {
            document.getElementById('locations-protected').style.display = 'none';
            document.getElementById('locations-content').style.display = 'block';
            loadLocationData();
        } else if (currentProtectedTab === 'cities') {
            document.getElementById('cities-protected').style.display = 'none';
            document.getElementById('cities-content').style.display = 'block';
            loadLocationData();
        }
    } else {
        document.getElementById('password-error').style.display = 'block';
    }
}

// دالة لعرض نافذة كلمة المرور لتفاصيل الزوار
function showLocationsPasswordModal() {
    currentProtectedTab = 'locations';
    showPasswordModal();
}

// دالة لعرض نافذة كلمة المرور لبيانات المدن
function showCitiesPasswordModal() {
    currentProtectedTab = 'cities';
    showPasswordModal();
}

// دالة عامة لعرض نافذة كلمة المرور
function showPasswordModal() {
    document.getElementById('password-modal').style.display = 'flex';
    document.getElementById('password-input').value = '';
    document.getElementById('password-error').style.display = 'none';
    document.getElementById('password-input').focus();
}

// دالة لتحميل بيانات المواقع بعد التحقق من كلمة المرور
function loadLocationData() {
    database.ref('locations').once('value').then(locationsSnapshot => {
        if (locationsSnapshot.exists()) {
            // رسم خريطة التوزيع (لتبويب تفاصيل الزوار فقط)
            if (currentProtectedTab === 'locations') {
                const mapContainer = document.getElementById('map');
                mapContainer.innerHTML = '';
                
                const map = L.map('map').setView([24.7136, 46.6753], 5);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors'
                }).addTo(map);

                locationsSnapshot.forEach(locationSnapshot => {
                    const location = locationSnapshot.val();
                    if (location.lat && location.lng) {
                        const marker = L.marker([location.lat, location.lng]).addTo(map);
                        marker.bindPopup(
                            `<strong>${location.city || 'غير معروف'}</strong><br>${formatDate(location.timestamp)}`
                        );
                    }
                });
            }

            const locationsCount = locationsSnapshot.numChildren();
            document.getElementById('locations-count').textContent = locationsCount.toLocaleString('ar-SA');

            // عدادات المدن
            const cityCounts = {};
            const locationsTbody = document.querySelector('#locations-table tbody');
            locationsTbody.innerHTML = '';

            locationsSnapshot.forEach(locationSnapshot => {
                const location = locationSnapshot.val();
                const city = location.city || 'غير معروف';

                // زيادة عداد المدينة
                cityCounts[city] = (cityCounts[city] || 0) + 1;

                // إضافة صف إلى جدول المواقع (لتبويب تفاصيل الزوار فقط)
                if (currentProtectedTab === 'locations') {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${city}</td>
                        <td>${location.lat?.toFixed(4) || 'N/A'}</td>
                        <td>${location.lng?.toFixed(4) || 'N/A'}</td>
                        <td>${formatDate(location.timestamp)}</td>
                    `;
                    locationsTbody.appendChild(row);
                }
            });

            // تحويل عدادات المدن إلى مصفوفة وترتيبها تنازلياً
            const sortedCities = Object.entries(cityCounts)
                .sort((a, b) => b[1] - a[1]);

            // عرض أهم المدن (لتبويب المدن فقط)
            if (currentProtectedTab === 'cities') {
                const topCitiesGrid = document.getElementById('top-cities-grid');
                if (topCitiesGrid) {
                    topCitiesGrid.innerHTML = '';

                    // عرض أفضل 4 مدن
                    sortedCities.slice(0, 4).forEach(([city, count]) => {
                        const percentage = ((count / locationsCount) * 100).toFixed(1);
                        const cityCard = document.createElement('div');
                        cityCard.className = 'city-card';
                        cityCard.innerHTML = `
                            <div class="city-name">${city}</div>
                            <div class="city-count">${count.toLocaleString('ar-SA')}</div>
                            <div class="city-percentage">${percentage}% من الزيارات</div>
                        `;
                        topCitiesGrid.appendChild(cityCard);
                    });
                }

                // عرض جميع المدن في الجدول
                const citiesTbody = document.querySelector('#cities-table tbody');
                if (citiesTbody) {
                    citiesTbody.innerHTML = '';

                    sortedCities.forEach(([city, count]) => {
                        const percentage = ((count / locationsCount) * 100).toFixed(1);
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${city}</td>
                            <td>${count.toLocaleString('ar-SA')}</td>
                            <td>${percentage}%</td>
                        `;
                        citiesTbody.appendChild(row);
                    });
                }
            }
        }
    }).catch(error => {
        console.error('Error loading location data:', error);
    });
}

// جلب وعرض البيانات
function loadStatistics() {
    Promise.all([
        database.ref('visits').once('value'),
        database.ref('downloads').once('value'),
        database.ref('card_downloads').once('value'),
        database.ref('locations').once('value') // جلب بيانات المواقع مباشرة
    ]).then(([visitsSnapshot, downloadsSnapshot, cardsSnapshot, locationsSnapshot]) => {
        // إخفاء رسالة التحميل وإظهار المحتوى
        document.getElementById('loading').style.display = 'none';
        document.getElementById('content').style.display = 'block';

        // تحديث وقت آخر تحديث
        document.getElementById('last-updated').textContent = 
            `آخر تحديث: ${new Date().toLocaleTimeString('ar-SA')}`;

        // عرض إجمالي الزيارات
        const totalVisits = sumAllValues(visitsSnapshot);
        document.getElementById('total-visits').textContent = totalVisits.toLocaleString('ar-SA');

        // عرض إجمالي التحميلات
        const totalDownloads = sumAllValues(downloadsSnapshot);
        document.getElementById('total-downloads').textContent = totalDownloads.toLocaleString('ar-SA');

        // عرض عدد المواقع المسجلة (دون الحاجة لكلمة مرور)
        const locationsCount = locationsSnapshot.exists() ? locationsSnapshot.numChildren() : 0;
        document.getElementById('locations-count').textContent = locationsCount.toLocaleString('ar-SA');

        // عرض التحميلات حسب نوع البطاقة
        const cardStatsTbody = document.querySelector('#card-stats tbody');
        cardStatsTbody.innerHTML = '';

        if (cardsSnapshot.exists()) {
            let cardTypes = [];
            let totalCardDownloads = 0;

            cardsSnapshot.forEach(cardSnapshot => {
                const cardName = cardSnapshot.key;
                const cardCount = typeof cardSnapshot.val() === 'number' ? 
                    cardSnapshot.val() : 
                    sumAllValues(cardSnapshot);
                totalCardDownloads += cardCount;
                cardTypes.push({
                    name: cardName,
                    count: cardCount
                });
            });

            // ترتيب البطاقات تنازلياً حسب عدد التحميلات
            cardTypes.sort((a, b) => b.count - a.count);

            // عرض أهم البطاقات
            const topCardsGrid = document.getElementById('top-cards-grid');
            topCardsGrid.innerHTML = '';

            // عرض أفضل 3 بطاقات
            cardTypes.slice(0, 3).forEach(card => {
                const percentage = ((card.count / totalCardDownloads) * 100).toFixed(1);
                const cardElement = document.createElement('div');
                cardElement.className = 'card-type';
                cardElement.innerHTML = `
                    <div class="card-name">${card.name}</div>
                    <div class="card-count">${card.count.toLocaleString('ar-SA')}</div>
                    <div class="card-percentage">${percentage}% من التحميلات</div>
                `;
                topCardsGrid.appendChild(cardElement);
            });

            // عرض جميع البطاقات في الجدول
            cardTypes.forEach(card => {
                const percentage = ((card.count / totalCardDownloads) * 100).toFixed(1);
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${card.name}</td>
                    <td>${card.count.toLocaleString('ar-SA')}</td>
                    <td>${percentage}%</td>
                `;
                cardStatsTbody.appendChild(row);
            });
        } else {
            cardStatsTbody.innerHTML = '<tr><td colspan="3">لا توجد بيانات متاحة</td></tr>';
        }

        // إعداد بيانات المواقع والمدن (الجزء المحمي بكلمة مرور)
        if (!passwordVerified) {
            document.getElementById('locations-protected').style.display = 'block';
            document.getElementById('locations-content').style.display = 'none';
            
            document.getElementById('cities-protected').style.display = 'block';
            document.getElementById('cities-content').style.display = 'none';
        } else {
            document.getElementById('locations-protected').style.display = 'none';
            document.getElementById('locations-content').style.display = 'block';
            
            document.getElementById('cities-protected').style.display = 'none';
            document.getElementById('cities-content').style.display = 'block';
            loadLocationData();
        }

    }).catch(error => {
        console.error('Error loading statistics:', error);
        document.getElementById('loading').innerHTML = `
            <div style="color: #e74c3c;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 15px;"></i>
                <p>حدث خطأ أثناء تحميل البيانات. يرجى المحاولة لاحقًا.</p>
                <button onclick="location.reload()" class="refresh-btn" style="margin-top: 15px;">
                    <i class="fas fa-sync-alt"></i> إعادة المحاولة
                </button>
            </div>
        `;
    });
}

// إعداد التبويبات وتحميل البيانات عند فتح الصفحة
document.addEventListener('DOMContentLoaded', () => {
    setupTabs();
    
    // إعداد أحداث كلمة المرور
    document.getElementById('password-submit').addEventListener('click', checkPassword);
    document.getElementById('password-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkPassword();
    });
    
    // إعداد حدث لزر "عرض المحتوى" لتفاصيل الزوار
    document.getElementById('show-locations-btn').addEventListener('click', showLocationsPasswordModal);
    
    // إعداد حدث لزر "عرض المحتوى" لبيانات المدن
    document.getElementById('show-cities-btn').addEventListener('click', showCitiesPasswordModal);
    
    // تحميل البيانات الأولية
    loadStatistics();
    
    // إضافة حدث للزر تحديث
    document.getElementById('refresh-btn').addEventListener('click', () => {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('content').style.display = 'none';
        passwordVerified = false; // إعادة تعيين التحقق عند التحديث
        loadStatistics();
    });

    // تعيين سنة حقوق النشر
    document.getElementById('year').textContent = new Date().getFullYear();
});