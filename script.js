document.addEventListener('DOMContentLoaded', function () {
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
    const analytics = firebase.analytics();
    const database = firebase.database();

    // تسجيل زيارة الصفحة
    recordPageVisit();

    // دالة للتحكم في التمرير
    let scrollPosition = 0;

    function toggleBodyScroll(enable) {
        if (enable) {
            document.body.style.overflow = 'auto';
            window.scrollTo(0, scrollPosition);
        } else {
            scrollPosition = window.scrollY;
            document.body.style.overflow = 'hidden';
        }
    }

    const toInput = document.getElementById('to');
    const fromInput = document.getElementById('from');
    const toPositionInput = document.getElementById('to-position');
    const fromPositionInput = document.getElementById('from-position');
    const cardTypeSelect = document.getElementById('card-type');
    const downloadBtn = document.getElementById('download-btn');
    const cardImage = document.getElementById('card-image');
    const cardContainer = document.querySelector('.card-container');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    // إنشاء عنصر canvas للمعاينة
    const previewCanvas = document.createElement('canvas');
    const previewCtx = previewCanvas.getContext('2d');
    cardContainer.insertBefore(previewCanvas, cardImage.nextSibling);
    previewCanvas.style.position = 'absolute';
    previewCanvas.style.top = '0';
    previewCanvas.style.left = '0';
    previewCanvas.style.width = '100%';
    previewCanvas.style.height = '100%';
    previewCanvas.style.pointerEvents = 'none';

    // حالة تحميل الصورة
    let imageLoaded = false;
    let currentImageSrc = './cards/بطاقة امتنان.png';

    // دالة لتحميل الصورة
    function loadImage(src) {
        imageLoaded = false;
        currentImageSrc = src;
        cardImage.src = src;
        cardImage.onload = function () {
            imageLoaded = true;
            updatePreview();
        };

        if (cardImage.complete && cardImage.naturalHeight !== 0) {
            imageLoaded = true;
            updatePreview();
        }
    }

    // تحميل الصورة الأولية
    loadImage(currentImageSrc);

    // دالة مشتركة لإعداد النصوص
    function drawTexts(ctx, canvasWidth, canvasHeight) {
        // إعدادات الخطوط (نفسها للمعاينة والتحميل)
        const fontSizeLarge = canvasWidth / 40;
        const fontSizeMedium = canvasWidth / 52;

        // نص "إلى" - خط عريض بحجم كبير
        ctx.font = `bold ${fontSizeLarge}px 'Tajawal', sans-serif`;
        ctx.fillStyle = '#7a7c7f';
        ctx.textAlign = 'right';
        ctx.fillText(
            toInput.value,
            canvasWidth * 0.585,
            canvasHeight * 0.577
        );

        // منصب المرسل إليه - خط مختلف بحجم متوسط
        ctx.font = `bold ${fontSizeMedium}px 'Tajawal', sans-serif`;
        ctx.fillStyle = '#ffc209';
        ctx.textAlign = 'center';
        ctx.fillText(
            toPositionInput.value,
            canvasWidth * 0.5,
            canvasHeight * 0.64
        );

        // نص "من" - نفس خط "إلى"
        ctx.font = `bold ${fontSizeLarge}px 'Tajawal', sans-serif`;
        ctx.fillStyle = '#7a7c7f';
        ctx.textAlign = 'right';
        ctx.fillText(
            fromInput.value,
            canvasWidth * 0.59,
            canvasHeight * 0.725
        );

        // منصب المرسل - نفس خط المنصب الأول
        ctx.font = `bold ${fontSizeMedium}px 'Tajawal', sans-serif`;
        ctx.fillStyle = '#ffc209';
        ctx.textAlign = 'center';
        ctx.fillText(
            fromPositionInput.value,
            canvasWidth * 0.5,
            canvasHeight * 0.78
        );
    }

    // تحديث المعاينة عند تغيير النصوص
    function updatePreview() {
        if (!imageLoaded) return;

        previewCanvas.width = cardImage.naturalWidth;
        previewCanvas.height = cardImage.naturalHeight;
        previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

        // استخدام الدالة المشتركة لرسم النصوص
        drawTexts(previewCtx, previewCanvas.width, previewCanvas.height);
    }

    // إضافة مستمعات الأحداث للتحديث الفوري
    toInput.addEventListener('input', updatePreview);
    fromInput.addEventListener('input', updatePreview);
    toPositionInput.addEventListener('input', updatePreview);
    fromPositionInput.addEventListener('input', updatePreview);

    // تغيير نوع البطاقة
    cardTypeSelect.addEventListener('change', function () {
        loadImage(this.value);
    });

    // وظيفة تحميل البطاقة
    downloadBtn.addEventListener('click', function () {
        if (!toInput.value.trim() || !fromInput.value.trim()) {
            document.getElementById('validation-modal').style.display = 'flex';
            toggleBodyScroll(false);
            return;
        }

        if (!imageLoaded) {
            alert('الرجاء الانتظار حتى يتم تحميل الصورة بالكامل');
            return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = cardImage.naturalWidth;
        canvas.height = cardImage.naturalHeight;
        ctx.drawImage(cardImage, 0, 0, canvas.width, canvas.height);
        drawTexts(ctx, canvas.width, canvas.height);

        const cardTypeName = cardTypeSelect.options[cardTypeSelect.selectedIndex].text;
        const link = document.createElement('a');
        link.download = `بطاقة_امتنان_${cardTypeName}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        // تسجيل حدث التحميل
        recordDownload(cardTypeName);
        
        // عرض نافذة المشاركة بعد التحميل
        setTimeout(() => {
            showWhatsAppModal(canvas.toDataURL('image/png'));
        }, 1000);
    });

    // دالة لتسجيل التحميلات
    function recordDownload(cardType) {
        const today = new Date().toISOString().split('T')[0];
        const downloadsRef = database.ref('downloads/' + today);
        const cardDownloadsRef = database.ref('card_downloads/' + cardType);
        
        // تسجيل التحميل اليومي
        downloadsRef.transaction((current) => {
            return (current || 0) + 1;
        }).catch(error => {
            console.error('Error recording download:', error);
        });
        
        // تسجيل تحميل حسب نوع البطاقة
        cardDownloadsRef.transaction((current) => {
            return (current || 0) + 1;
        }).catch(error => {
            console.error('Error recording card download:', error);
        });
        
        // تسجيل حدث في Analytics
        analytics.logEvent('card_download', {
            card_type: cardType
        });
    }

    // دالة لتسجيل زيارات الصفحة
    function recordPageVisit() {
        const today = new Date().toISOString().split('T')[0];
        const visitsRef = database.ref('visits/' + today);
        
        visitsRef.transaction((current) => {
            return (current || 0) + 1;
        }).catch(error => {
            console.error('Error recording visit:', error);
        });

        // تسجيل حدث في Analytics
        analytics.logEvent('page_visit');
    }

    // إغلاق نافذة التحذير
    modalCloseBtn.addEventListener('click', function () {
        document.getElementById('validation-modal').style.display = 'none';
        toggleBodyScroll(true);
    });

    // تحسينات التنقل السلس
    const heroBtn = document.querySelector('.hero-btn');
    const cardCreatorSection = document.getElementById('card-creator');

    heroBtn.addEventListener('click', function (e) {
        e.preventDefault();
        cardCreatorSection.scrollIntoView({
            behavior: 'smooth'
        });
        setTimeout(() => {
            cardCreatorSection.classList.add('visible');
        }, 600);
    });

    // اكتشاف وصول المستخدم للقسم عند التمرير
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });

    observer.observe(cardCreatorSection);
});

// دالة لعرض نافذة المشاركة عبر واتساب
function showWhatsAppModal(imageDataUrl) {
    const modal = document.createElement('div');
    modal.id = 'whatsapp-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>شارك بطاقتك</h3>
            <p>هل ترغب في مشاركة بطاقتك عبر واتساب؟</p>
            <div class="modal-buttons">
                <button class="whatsapp-btn" id="share-whatsapp">
                    <i class="fab fa-whatsapp"></i> مشاركة عبر واتساب
                </button>
                <button class="cancel-btn" id="cancel-share">
                    إلغاء
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    toggleBodyScroll(false);

    // إضافة مستمعات الأحداث للأزرار
    document.getElementById('share-whatsapp').addEventListener('click', function() {
        const message = 'تحقق من بطاقة الامتنان الرائعة التي تلقيتها!';
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}&media=${encodeURIComponent(imageDataUrl)}`;
        window.open(whatsappUrl, '_blank');
        modal.remove();
        toggleBodyScroll(true);
    });

    document.getElementById('cancel-share').addEventListener('click', function() {
        modal.remove();
        toggleBodyScroll(true);
    });
}