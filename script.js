// ==========================================
// عقار بلس - Appwrite
// ==========================================

const client = new Appwrite.Client();

client
    .setEndpoint("https://cloud.appwrite.io/v1")
    .setProject("6a867fed002fef251e71");

const tablesDB = new Appwrite.TablesDB(client);

const DATABASE_ID = "6a86824200363a615936";
const TABLE_ID = "properties";

const PHONE_NUMBER = "01095663300";
const WHATSAPP_NUMBER = "201095663300";


// ==========================================
// حماية النصوص
// ==========================================

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ==========================================
// واتساب
// ==========================================

function openWhatsApp(title = "") {

    const message =
        "مرحبًا، أريد الاستفسار عن العقار" +
        (title ? ' "' + title + '"' : "") +
        " الموجود على عقار بلس.";

    const url =
        "https://api.whatsapp.com/send?phone=" +
        WHATSAPP_NUMBER +
        "&text=" +
        encodeURIComponent(message);

    window.open(url, "_blank", "noopener,noreferrer");
}


// ==========================================
// بطاقة العقار
// ==========================================

function createPropertyCard(property) {

    const title =
        property.title || "عقار بدون عنوان";

    const price =
        Number(property.price || 0);

    const location =
        property.location || "غير محدد";

    const description =
        property.description || "";

    const propertyType =
        property.property_type || "غير محدد";

    const operation =
        property.Operation || "غير محدد";

    const rooms =
        Number(property.rooms || 0);

    const area =
        Number(property.area || 0);

    const image =
        property.image || "";

    const propertyId =
        property.$id || "";

    const card =
        document.createElement("div");

    card.className = "property";

    card.innerHTML = `

        <div class="property-image">

            ${
                image
                    ? `
                        <img
                            src="${escapeHTML(image)}"
                            alt="${escapeHTML(title)}"
                            loading="lazy"
                            onerror="this.style.display='none'; this.parentElement.innerHTML='🏠';"
                        >
                    `
                    : "🏠"
            }

        </div>

        <div class="property-content">

            <h3>
                ${escapeHTML(title)}
            </h3>

            <div class="info">

                📍 ${escapeHTML(location)}

                <br>

                🏠 النوع:
                ${escapeHTML(propertyType)}

                <br>

                🔑 العملية:
                ${escapeHTML(operation)}

                <br>

                🛏️ الغرف:
                ${escapeHTML(rooms)}

                <br>

                📐 المساحة:
                ${escapeHTML(area)}
                متر

            </div>

            <div class="price">

                💰
                ${price.toLocaleString("ar-EG")}
                جنيه

            </div>

            ${
                description
                    ? `
                        <div class="description">
                            ${escapeHTML(description)}
                        </div>
                    `
                    : ""
            }

            <span class="status">

                ${
                    operation === "إيجار"
                        ? "🔑 متاح للإيجار"
                        : "🟢 متاح للبيع"
                }

            </span>

            <div class="actions">

                <button
                    class="details"
                    type="button">
                    🔎 تفاصيل
                </button>

                <button
                    class="call-property"
                    type="button">
                    📞 اتصال
                </button>

                <button
                    class="whatsapp-property"
                    type="button">
                    💬 واتساب
                </button>

            </div>

        </div>
    `;


    // تفاصيل

    const detailsButton =
        card.querySelector(".details");

    if (detailsButton) {

        detailsButton.addEventListener(
            "click",
            function () {

                if (!propertyId) {

                    alert(
                        "❌ لم يتم العثور على رقم العقار"
                    );

                    return;
                }

                window.location.href =
                    "property.html?id=" +
                    encodeURIComponent(propertyId);

            }
        );

    }


    // اتصال

    const callButton =
        card.querySelector(".call-property");

    if (callButton) {

        callButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "tel:" + PHONE_NUMBER;

            }
        );

    }


    // واتساب

    const whatsappButton =
        card.querySelector(
            ".whatsapp-property"
        );

    if (whatsappButton) {

        whatsappButton.addEventListener(
            "click",
            function () {

                openWhatsApp(title);

            }
        );

    }


    return card;
}


// ==========================================
// عرض العقارات
// ==========================================

function renderProperties(
    properties,
    title = "العقارات"
) {

    const container =
        document.getElementById(
            "propertiesContainer"
        );

    if (!container) return;


    const titleElement =
        document.querySelector(
            "#sale .title h2"
        );

    const subtitleElement =
        document.querySelector(
            "#sale .title p"
        );


    if (titleElement) {

        titleElement.textContent =
            title;

    }


    if (subtitleElement) {

        subtitleElement.textContent =
            "العقارات المتاحة على عقار بلس";

    }


    container.innerHTML = "";


    if (
        !Array.isArray(properties) ||
        properties.length === 0
    ) {

        container.innerHTML = `

            <div class="empty">

                🔍 لا توجد عقارات في هذا القسم

            </div>

        `;

        return;
    }


    properties.forEach(function(property) {

        container.appendChild(
            createPropertyCard(property)
        );

    });


    const saleSection =
        document.getElementById("sale");

    if (saleSection) {

        saleSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}


// ==========================================
// جلب كل العقارات
// ==========================================

async function getAllProperties() {

    const result =
        await tablesDB.listRows({

            databaseId:
                DATABASE_ID,

            tableId:
                TABLE_ID,

            queries: [

                Appwrite.Query.limit(100),

                Appwrite.Query.orderDesc(
                    "$createdAt"
                )

            ]

        });


    console.log(
        "العقارات القادمة من Appwrite:",
        result.rows
    );


    return result.rows || [];
}


// ==========================================
// كل العقارات
// ==========================================

async function showAllProperties() {

    const container =
        document.getElementById(
            "propertiesContainer"
        );

    if (!container) return;


    container.innerHTML = `

        <div class="loading">
            ⏳ جاري تحميل كل العقارات...
        </div>

    `;


    try {

        const properties =
            await getAllProperties();

        renderProperties(
            properties,
            "كل العقارات"
        );

    }

    catch(error) {

        showError(
            container,
            error
        );

    }

}


// ==========================================
// عقارات البيع
// ==========================================

async function showSale() {

    const container =
        document.getElementById(
            "propertiesContainer"
        );

    if (!container) return;


    container.innerHTML = `

        <div class="loading">
            ⏳ جاري تحميل عقارات البيع...
        </div>

    `;


    try {

        const properties =
            await getAllProperties();


        const saleProperties =
            properties.filter(function(property) {

                return String(
                    property.Operation ?? ""
                ).trim() === "بيع";

            });


        renderProperties(
            saleProperties,
            "عقارات للبيع"
        );

    }

    catch(error) {

        showError(
            container,
            error
        );

    }

}


// ==========================================
// عقارات الإيجار
// ==========================================

async function showRent() {

    const container =
        document.getElementById(
            "propertiesContainer"
        );

    if (!container) return;


    container.innerHTML = `

        <div class="loading">
            ⏳ جاري تحميل عقارات الإيجار...
        </div>

    `;


    try {

        const properties =
            await getAllProperties();


        const rentProperties =
            properties.filter(function(property) {

                return String(
                    property.Operation ?? ""
                ).trim() === "إيجار";

            });


        renderProperties(
            rentProperties,
            "عقارات للإيجار"
        );

    }

    catch(error) {

        showError(
            container,
            error
        );

    }

}


// ==========================================
// البحث
// ==========================================

async function searchProperties() {

    const governorateElement =
        document.getElementById(
            "governorate"
        );

    const propertyTypeElement =
        document.getElementById(
            "propertyType"
        );

    const operationElement =
        document.getElementById(
            "operation"
        );

    const container =
        document.getElementById(
            "propertiesContainer"
        );


    if (!container) return;


    const governorate =
        governorateElement
            ? governorateElement.value.trim()
            : "";

    const propertyType =
        propertyTypeElement
            ? propertyTypeElement.value.trim()
            : "";

    const operation =
        operationElement
            ? operationElement.value.trim()
            : "";


    container.innerHTML = `

        <div class="loading">
            ⏳ جاري البحث...
        </div>

    `;


    try {

        let properties =
            await getAllProperties();


        // المدينة

        if (governorate) {

            properties =
                properties.filter(
                    function(property) {

                        const location =
                            String(
                                property.location ?? ""
                            ).trim();

                        return location ===
                            governorate;

                    }
                );

        }


        // نوع العقار

        if (propertyType) {

            properties =
                properties.filter(
                    function(property) {

                        const type =
                            String(
                                property.property_type ?? ""
                            ).trim();

                        return type ===
                            propertyType;

                    }
                );

        }


        // نوع العملية

        if (operation) {

            properties =
                properties.filter(
                    function(property) {

                        const propertyOperation =
                            String(
                                property.Operation ?? ""
                            ).trim();

                        return propertyOperation ===
                            operation;

                    }
                );

        }


        let resultTitle =
            "نتائج البحث";


        if (governorate) {

            resultTitle =
                "عقارات " +
                governorate;

        }


        renderProperties(
            properties,
            resultTitle
        );

    }

    catch(error) {

        showError(
            container,
            error
        );

    }

}


// ==========================================
// عرض الخطأ
// ==========================================

function showError(
    container,
    error
) {

    console.error(
        "Appwrite Error:",
        error
    );


    container.innerHTML = `

        <div class="error">

            ❌ حدث خطأ أثناء تحميل العقارات

            <br><br>

            ${escapeHTML(
                error?.message ||
                "خطأ غير معروف"
            )}

        </div>

    `;

}


// ==========================================
// تحميل الموقع
// ==========================================

async function loadProperties() {

    const container =
        document.getElementById(
            "propertiesContainer"
        );

    if (!container) return;


    container.innerHTML = `

        <div class="loading">
            ⏳ جاري تحميل العقارات...
        </div>

    `;


    try {

        const properties =
            await getAllProperties();


        renderProperties(
            properties,
            "كل العقارات"
        );

    }

    catch(error) {

        showError(
            container,
            error
        );

    }

}


// ==========================================
// التشغيل
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadProperties();

    }
);
