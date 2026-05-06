// =====================================================
// CONSTANTS - Magic number'ları burada topladık
// =====================================================
const MAX_LIMIT_DIGITS = 3;
const MIN_LETTERS_FOR_SEE_MORE = 8;
const DENSITY_HEIGHT_COLLAPSED = '165px';
const DEBOUNCE_DELAY = 300;

// =====================================================
// DOM ELEMENTS - Tüm elementleri başta seçiyoruz
// =====================================================
const body = document.querySelector("body");
const logo = document.querySelector(".logo");
const iconSun = document.querySelector(".icon-sun");
const iconMoon = document.querySelector(".icon-moon");
const inputs = document.querySelectorAll("input");

const textArea = document.querySelector("#textarea");
const spaceCheckbox = document.querySelector("#space");
const limitCheckbox = document.querySelector("#limit");
const limitInput = document.querySelector("#limit-value");

const totalCharsDisplay = document.querySelector(".total-box");
const wordCountDisplay = document.querySelector(".word-box");
const sentenceCountDisplay = document.querySelector(".sentence-box");

const noCharText = document.querySelector(".no-character");
const seeMoreBtn = document.querySelector(".see-more");
const seeLessBtn = document.querySelector(".see-less");
const densitiesContainer = document.querySelector(".densities");

// =====================================================
// STATE - Uygulama durumu
// =====================================================
let isLightTheme = false;
let densityTimeout = null; // Debouncing için

// =====================================================
// UTILITY FUNCTIONS - Yardımcı fonksiyonlar
// =====================================================

// Element göster/gizle
function toggleElement(element, shouldShow) {
    if (element) {
        element.style.display = shouldShow ? "block" : "none";
    }
}

// Debounce - Pahalı işlemleri geciktirmek için
function debounce(func, delay) {
    return function(...args) {
        clearTimeout(densityTimeout);
        densityTimeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// =====================================================
// THEME FUNCTIONS - Tema değiştirme
// =====================================================

function changeTheme() {
    isLightTheme = body.classList.toggle("light");
    updateThemeUI();
}

function updateThemeUI() {
    // Icon'ları değiştir
    toggleElement(iconSun, !isLightTheme);
    toggleElement(iconMoon, isLightTheme);
    
    // TextArea stilini güncelle
    textArea.style.backgroundColor = isLightTheme ? "white" : "#21222C";
    textArea.style.color = isLightTheme ? "black" : "inherit";
    
    // Logo'yu değiştir
    const theme = isLightTheme ? "light" : "dark";
    logo.src = `assets/images/logo-${theme}-theme.svg`;
    
    // Input'ları güncelle
    inputs.forEach(input => {
        input.classList.toggle("light", isLightTheme);
    });
}

// =====================================================
// INPUT HANDLING - Metin girişi yönetimi
// =====================================================

function handleTextInput() {
    const value = textArea.value;
    
    // Focus efekti
    textArea.style.boxShadow = "0 0 20px #C27CF8";
    textArea.style.outline = "none";
    
    // Limit kontrolü
    if (limitCheckbox.checked) {
        applyCharacterLimit();
    }
    
    // Boş text uyarısını göster/gizle
    toggleElement(noCharText, !value);
    
    // Tüm sayıları güncelle
    updateCharCount();
    updateWordCount();
    updateSentenceCount();
    
    // Density'yi debounce ile güncelle (pahalı işlem)
    debouncedUpdateDensity();
}

// Density güncellemesini debounce ile sarmalıyoruz
const debouncedUpdateDensity = debounce(updateLetterDensity, DEBOUNCE_DELAY);

// =====================================================
// CHARACTER LIMIT - Karakter sınırı
// =====================================================

function handleLimitToggle() {
    const isChecked = limitCheckbox.checked;
    toggleElement(limitInput, isChecked);
    
    if (isChecked) {
        limitInput.value = "";
    }
}

function sanitizeLimitInput() {
    // Sadece rakam kabul et
    limitInput.value = limitInput.value.replace(/\D/g, "");
    
    // Maksimum 3 karakter
    if (limitInput.value.length > MAX_LIMIT_DIGITS) {
        limitInput.value = limitInput.value.slice(0, MAX_LIMIT_DIGITS);
    }
}

function handleLimitKeydown(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        applyCharacterLimit();
        updateAllCounts();
    }
}

function applyCharacterLimit() {
    const limitValue = limitInput.value;
    
    if (!limitValue) return;
    
    const maxLength = parseInt(limitValue, 10);
    const currentText = textArea.value;
    
    if (currentText.length > maxLength) {
        textArea.value = currentText.slice(0, maxLength);
        totalCharsDisplay.textContent = maxLength;
    }
}

// =====================================================
// COUNTING FUNCTIONS - Sayma işlemleri
// =====================================================

function updateAllCounts() {
    updateCharCount();
    updateWordCount();
    updateSentenceCount();
}

function updateCharCount() {
    const text = textArea.value;
    
    // Boşluk sayılsın mı kontrolü
    const charCount = spaceCheckbox.checked 
        ? text.replace(/\s/g, "").length 
        : text.length;
    
    totalCharsDisplay.textContent = charCount;
}

function updateWordCount() {
    const text = textArea.value;
    
    // Noktalama işaretlerini boşluğa çevir ve kelimeleri say
    const words = text
        .replace(/[.,;:!?()"\-]/g, ' ')
        .split(/\s+/)
        .filter(word => word.trim().length > 0);
    
    wordCountDisplay.textContent = words.length;
}

function updateSentenceCount() {
    const text = textArea.value;
    
    // Cümle sonlarını bul ve say
    const sentences = text
        .split(/[.!?]+/)
        .filter(sentence => sentence.trim().length > 0);
    
    sentenceCountDisplay.textContent = sentences.length;
}

// =====================================================
// LETTER DENSITY - Harf yoğunluğu
// =====================================================

function updateLetterDensity() {
    // Önceki içeriği temizle
    densitiesContainer.innerHTML = "";
    
    const text = textArea.value;
    
    // Sadece harfleri al
    const letters = text.replace(/[^a-zA-Z]/g, "").split("");
    const totalLetters = letters.length;
    
    if (totalLetters === 0) return;
    
    // Her harfin sayısını hesapla
    const letterCounts = {};
    letters.forEach(letter => {
        const upperLetter = letter.toUpperCase();
        letterCounts[upperLetter] = (letterCounts[upperLetter] || 0) + 1;
    });
    
    // Yüzde hesapla ve sırala
    const densityArray = Object.entries(letterCounts)
        .map(([letter, count]) => {
            const percentage = ((count / totalLetters) * 100).toFixed(2);
            return {
                letter: letter,
                count: count,
                percentage: parseFloat(percentage)
            };
        })
        .sort((a, b) => b.percentage - a.percentage);
    
    // "See More" butonunu göster/gizle
    const shouldShowSeeMore = densityArray.length > MIN_LETTERS_FOR_SEE_MORE;
    toggleElement(seeMoreBtn, shouldShowSeeMore);
    
    // Density bar'ları oluştur
    renderDensityBars(densityArray);
}

function renderDensityBars(densityArray) {
    densityArray.forEach(item => {
        const densityDiv = document.createElement("div");
        densityDiv.className = "letter-density";
        
        densityDiv.innerHTML = `
            <p>${item.letter}</p>
            <div class="progress">
                <p class="bar" style="width: ${item.percentage}%"></p>
            </div>
            <p class="letter-number">
                ${item.count} 
                <span class="letter-percentage">(${item.percentage}%)</span>
            </p>
        `;
        
        densitiesContainer.appendChild(densityDiv);
    });
}

// =====================================================
// SEE MORE/LESS - Genişlet/Daralt
// =====================================================

function showMoreDensities() {
    densitiesContainer.style.height = "auto";
    toggleElement(seeMoreBtn, false);
    toggleElement(seeLessBtn, true);
}

function showLessDensities() {
    densitiesContainer.style.height = DENSITY_HEIGHT_COLLAPSED;
    toggleElement(seeMoreBtn, true);
    toggleElement(seeLessBtn, false);
}

// =====================================================
// EVENT LISTENERS - Olay dinleyicileri
// =====================================================

function attachEventListeners() {
    // Tema değiştirme
    iconSun.addEventListener("click", changeTheme);
    iconMoon.addEventListener("click", changeTheme);
    
    // Text input
    textArea.addEventListener("input", handleTextInput);
    
    // Checkbox'lar
    spaceCheckbox.addEventListener("change", updateCharCount);
    limitCheckbox.addEventListener("change", handleLimitToggle);
    
    // Limit input
    limitInput.addEventListener("input", sanitizeLimitInput);
    limitInput.addEventListener("keydown", handleLimitKeydown);
    
    // See more/less buttons
    seeMoreBtn.addEventListener("click", showMoreDensities);
    seeLessBtn.addEventListener("click", showLessDensities);
}

// =====================================================
// INITIALIZATION - Başlatma
// =====================================================

function init() {
    try {
        attachEventListeners();
        console.log("Character Counter başarıyla yüklendi!");
    } catch (error) {
        console.error("Başlatma hatası:", error);
    }
}

// Sayfa yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', init);