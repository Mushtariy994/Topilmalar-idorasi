
// =====================================
// TOPILMALAR IDORASI - ASOSIY JAVASCRIPT
// =====================================

// E'lonlarni LocalStorage orqali olish
function getListings() {
    try {
        return JSON.parse(localStorage.getItem("topilmalar")) || [];
    } catch {
        return [];
    }
}

// E'lonlarni LocalStorage ga saqlash
function saveListings(listings) {
    try {
        localStorage.setItem("topilmalar", JSON.stringify(listings));
        return true;
    } catch {
        alert("Xotira to‘ldi. Kichikroq rasm yuklab ko‘ring.");
        return false;
    }
}

// HTML xavfsiz chiqarish uchun
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

// Telefon raqamini tekshirish
function validPhone(phone) {
    return /^[+0-9\s()-]{9,20}$/.test(phone);
}

// =====================================
// TUN VA KUN REJIMI
// =====================================

const themeBtn = document.getElementById("themeBtn");

function updateThemeButton() {
    if (themeBtn) {
        themeBtn.textContent =
            document.body.classList.contains("dark") ? "☀️" : "🌙";
    }
}

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
}

updateThemeButton();

if (themeBtn) {
    themeBtn.addEventListener("click", function () {
        document.body.classList.toggle("dark");

        const theme = document.body.classList.contains("dark")
            ? "dark"
            : "light";

        localStorage.setItem("theme", theme);
        updateThemeButton();
    });
}

// =====================================
// E'LON KARTASINI YARATISH
// =====================================

function createListingCard(item) {
    const typeText = item.type === "lost"
        ? "Yo‘qolgan"
        : "Topilgan";

    const image = item.image
        ? `<img src="${item.image}" alt="Buyum rasmi">`
        : `<div class="no-image">📦</div>`;

    return `
        <article class="listing-card">
            ${image}

            <div class="listing-info">
                <span class="status ${item.type}">
                    ${typeText}
                </span>

                <h3>${escapeHTML(item.name)}</h3>

                <p>📁 ${escapeHTML(item.category)}</p>
                <p>📍 ${escapeHTML(item.region)}</p>
                <p>🗓️ ${escapeHTML(item.date)}</p>
                <p>${escapeHTML(item.description)}</p>
                <p>📌 ${escapeHTML(item.location)}</p>
                <p>📞 ${escapeHTML(item.phone)}</p>
            </div>
        </article>
    `;
}

// =====================================
// BOSH SAHIFADAGI STATISTIKA
// =====================================

function updateStatistics() {
    const listings = getListings();

    const total = document.getElementById("totalCount");
    const lost = document.getElementById("lostCount");
    const found = document.getElementById("foundCount");

    if (total) {
        total.textContent = listings.length;
    }

    if (lost) {
        lost.textContent =
            listings.filter(item => item.type === "lost").length;
    }

    if (found) {
        found.textContent =
            listings.filter(item => item.type === "found").length;
    }
}

// =====================================
// BOSH SAHIFADAGI SO'NGGI E'LONLAR
// =====================================

function showLatestListings() {
    const container = document.getElementById("latestListings");

    if (!container) return;

    const listings = getListings().slice(-3).reverse();

    if (listings.length === 0) {
        container.innerHTML =
            '<p class="empty">Hozircha e\'lonlar mavjud emas.</p>';
        return;
    }

    container.innerHTML = listings
        .map(createListingCard)
        .join("");
}

// =====================================
// E'LON JOYLASH FORMASI
// =====================================

const listingForm = document.getElementById("listingForm");

if (listingForm) {
    listingForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const type = document.getElementById("listingType").value;
        const name = document.getElementById("itemName").value.trim();
        const category = document.getElementById("itemCategory").value;
        const region = document.getElementById("itemRegion").value;
        const date = document.getElementById("itemDate").value;
        const location = document.getElementById("itemLocation").value.trim();
        const phone = document.getElementById("itemPhone").value.trim();
        const description = document.getElementById("itemDescription").value.trim();

        const imageInput = document.getElementById("itemImage");
        const imageFile = imageInput.files[0];
        const message = document.getElementById("formMessage");

        message.textContent = "";
        message.style.color = "#c52c2c";

        if (!type || !name || !category || !region || !date ||
            !location || !phone || !description) {
            message.textContent = "Barcha majburiy maydonlarni to‘ldiring!";
            return;
        }

        if (!validPhone(phone)) {
            message.textContent = "Telefon raqamini to‘g‘ri kiriting!";
            return;
        }

        if (imageFile) {
            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/webp"
            ];

            if (!allowedTypes.includes(imageFile.type)) {
                message.textContent = "Faqat JPG, PNG yoki WEBP rasm yuklang!";
                return;
            }

            if (imageFile.size > 2 * 1024 * 1024) {
                message.textContent = "Rasm hajmi 2 MB dan oshmasligi kerak!";
                return;
            }
        }

        let imageData = "";

        if (imageFile) {
            try {
                imageData = await new Promise((resolve, reject) => {
                    const reader = new FileReader();

                    reader.onload = () => resolve(reader.result);
                    reader.onerror = () => reject(
                        new Error("Rasmni o‘qib bo‘lmadi")
                    );

                    reader.readAsDataURL(imageFile);
                });
            } catch {
                message.textContent = "Rasmni yuklashda xatolik yuz berdi.";
                return;
            }
        }

        const newListing = {
            id: Date.now(),
            type,
            name,
            category,
            region,
            date,
            location,
            phone,
            description,
            image: imageData,
            createdAt: new Date().toISOString()
        };

        const listings = getListings();
        listings.push(newListing);

        if (!saveListings(listings)) {
            return;
        }

        message.style.color = "green";
        message.textContent = "E'lon muvaffaqiyatli joylandi!";

        listingForm.reset();
        updateStatistics();
    });
}

// =====================================
// QIDIRISH VA FILTRLASH
// =====================================

function searchListings() {
    const container = document.getElementById("searchResults");

    if (!container) return;

    const searchInput = document.getElementById("searchInput");
    const typeFilter = document.getElementById("typeFilter");
    const categoryFilter = document.getElementById("categoryFilter");
    const regionFilter = document.getElementById("regionFilter");

    const searchText = searchInput.value.trim().toLowerCase();
    const selectedType = typeFilter.value;
    const selectedCategory = categoryFilter.value;
    const selectedRegion = regionFilter.value;

    const filtered = getListings().filter(item => {
        const matchesName =
            item.name.toLowerCase().includes(searchText);

        const matchesType =
            !selectedType || item.type === selectedType;

        const matchesCategory =
            !selectedCategory || item.category === selectedCategory;

        const matchesRegion =
            !selectedRegion || item.region === selectedRegion;

        return matchesName &&
            matchesType &&
            matchesCategory &&
            matchesRegion;
    });

    if (filtered.length === 0) {
        container.innerHTML =
            '<p class="empty">Siz qidirgan buyum topilmadi.</p>';
        return;
    }

    container.innerHTML = filtered
        .slice()
        .reverse()
        .map(createListingCard)
        .join("");
}

const searchBtn = document.getElementById("searchBtn");

if (searchBtn) {
    searchBtn.addEventListener("click", searchListings);
}

const searchInput = document.getElementById("searchInput");

if (searchInput) {
    searchInput.addEventListener("input", searchListings);
}

["typeFilter", "categoryFilter", "regionFilter"].forEach(id => {
    const element = document.getElementById(id);

    if (element) {
        element.addEventListener("change", searchListings);
    }
});

// =====================================
// SAYT ISHGA TUSHGANDA
// =====================================

updateStatistics();
showLatestListings();
searchListings();
