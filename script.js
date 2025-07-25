document.addEventListener('DOMContentLoaded', function () {
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
    let currentImageSrc = '/cards/بطاقة امتنان.png';

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
        // إعدادات الخطوط
        const fontSizeLarge = canvasWidth / 40;
        const fontSizeMedium = canvasWidth / 52;

        // نص "إلى"
        ctx.font = `bold ${fontSizeLarge}px 'Tajawal', sans-serif`;
        ctx.fillStyle = '#7a7c7f';
        ctx.textAlign = 'right';
        ctx.fillText(
            toInput.value,
            canvasWidth * 0.585,
            canvasHeight * 0.577
        );

        // منصب المرسل إليه
        ctx.font = `bold ${fontSizeMedium}px 'Tajawal', sans-serif`;
        ctx.fillStyle = '#ffc209';
        ctx.textAlign = 'center';
        ctx.fillText(
            toPositionInput.value,
            canvasWidth * 0.5,
            canvasHeight * 0.64
        );

        // نص "من"
        ctx.font = `bold ${fontSizeLarge}px 'Tajawal', sans-serif`;
        ctx.fillStyle = '#7a7c7f';
        ctx.textAlign = 'right';
        ctx.fillText(
            fromInput.value,
            canvasWidth * 0.59,
            canvasHeight * 0.725
        );

        // منصب المرسل
        ctx.font = `bold ${fontSizeMedium}px 'Tajawal', sans-serif`;
        ctx.fillStyle = '#ffc209';
        ctx.textAlign = 'center';
        ctx.fillText(
            fromPositionInput.value,
            canvasWidth * 0.5,
            canvasHeight * 0.78
        );
    }

    // تحديث المعاينة
    function updatePreview() {
        if (!imageLoaded) return;

        previewCanvas.width = cardImage.naturalWidth;
        previewCanvas.height = cardImage.naturalHeight;
        previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        drawTexts(previewCtx, previewCanvas.width, previewCanvas.height);
    }

    // إضافة مستمعات الأحداث
    toInput.addEventListener('input', updatePreview);
    fromInput.addEventListener('input', updatePreview);
    toPositionInput.addEventListener('input', updatePreview);
    fromPositionInput.addEventListener('input', updatePreview);

    // تغيير نوع البطاقة
    cardTypeSelect.addEventListener('change', function () {
        loadImage(this.value);
    });

    // دالة لمشاركة الصورة عبر الواتساب
    function shareOnWhatsApp(imageDataUrl) {
        const cardTypeName = cardTypeSelect.options[cardTypeSelect.selectedIndex].text;
        const message = `*بطاقة امتنان* 🎁\n\nإلى: ${toInput.value}\nمن: ${fromInput.value}\n\n${cardTypeName}\n\n#حملة_امتنان`;
        const shareUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(shareUrl, '_blank');
    }

    // عرض نافذة المشاركة مع تعليمات لحفظ الصورة
    function showSaveInstructionsModal(imageDataUrl) {
        const modal = document.createElement('div');
        modal.id = 'save-instructions-modal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.zIndex = '1000';
        modal.style.flexDirection = 'column';
        modal.style.color = 'white';
        modal.style.textAlign = 'center';
        modal.style.padding = '20px';

        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

        modal.innerHTML = `
            <h3 style="color: #ffc209; margin-bottom: 20px;">تم تحميل البطاقة بنجاح</h3>
            ${isIOS ? `
                <p style="margin-bottom: 20px;">للحفظ في ألبوم الصور:</p>
                <ol style="text-align: right; margin-bottom: 20px; padding-right: 20px;">
                    <li>افتح تطبيق "الملفات"</li>
                    <li>ابحث عن الملف "بطاقة_امتنان.png"</li>
                    <li>اضغط مطولاً على الملف</li>
                    <li>اختر "مشاركة"</li>
                    <li>اختر "حفظ الصورة"</li>
                </ol>
            ` : `
                <p style="margin-bottom: 20px;">تم حفظ البطاقة في مجلد التنزيلات</p>
            `}
            <div style="display: flex; gap: 10px;">
                <button id="whatsapp-share-btn" style="background-color: #25D366; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                    <i class="fab fa-whatsapp"></i> مشاركة عبر الواتساب
                </button>
                <button id="close-save-modal" style="background-color: #f8f9fa; color: #333; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                    إغلاق
                </button>
            </div>
        `;

        document.body.appendChild(modal);
        toggleBodyScroll(false);

        document.getElementById('whatsapp-share-btn').addEventListener('click', function() {
            shareOnWhatsApp(imageDataUrl);
            modal.remove();
            toggleBodyScroll(true);
        });

        document.getElementById('close-save-modal').addEventListener('click', function() {
            modal.remove();
            toggleBodyScroll(true);
        });
    }

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
        const fileName = `بطاقة_امتنان_${cardTypeName}.png`.replace(/\s+/g, '_');
        
        // طريقة التنزيل الأساسية
        const link = document.createElement('a');
        link.download = fileName;
        link.href = canvas.toDataURL('image/png');
        link.click();

        // عرض تعليمات الحفظ بعد التنزيل
        setTimeout(() => {
            showSaveInstructionsModal(canvas.toDataURL('image/png'));
        }, 1000);
    });

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