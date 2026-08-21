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
// توحيد أسماء المدن
// ==========================================

function normalizeCity(value) {

    return String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/أ/g, "ا")
        .replace(/إ/g, "ا")
        .replace(/آ/g, "ا")
        .replace(/ة/g, "ه")
        .replace(/\s+/g, "");

}


// ==========================================
// توحيد النصوص العادية
// ==========================================

function normalizeText(value) {

    return String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "");

}


// ==========================================
// واتساب
// ==========================================

function openWhatsApp(propertyTitle = "") {

    const message =
        "مرحبًا، أريد الاستفسار عن العقار" +
        (
            propertyTitle
                ? " \"" + propertyTitle + "\""
                : ""
        ) +
        " الموجود على عقار بلس.";

    const url =
        "https://api.whatsapp.com/send?phone=" +
        WHATSAPP_NUMBER +
        "&text=" +
        encodeURIComponent(message);

    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );

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
        property.rooms || 0;

    const area =
        property.area || 0;

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
                ?
                `
                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(title)}"
                >
                `
                :
                "🏠"
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
                ?
                `
                <div class="description">

                    ${escapeHTML(description)}

                </div>
                `
                :
                ""
            }


            <span class="status">

                ${
                    normalizeText(operation) === normalizeText("إيجار")
                    ?
                    "🔑 متاح للإيجار"
                    :
                    "🟢 متاح للبيع"
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


    // تفاصيل العقار

    card
        .querySelector(".details")
        .addEventListener(
            "click",
            function() {

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


    // الاتصال

    card
        .querySelector(".call-property")
        .addEventListener(
            "click",
            function() {

                window.location.href =
                    "tel:" + PHONE_NUMBER;

            }
        );


    // واتساب

    card
        .querySelector(".whatsapp-property")
        .addEventListener(
            "click",
            function() {

                openWhatsApp(title);

            }
        );


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
        !properties ||
        properties.length === 0
    ) {

        container.innerHTML = `

            <div class="empty">

                🔍 لا توجد عقارات في هذا البحث

            </div>

        `;

        return;

    }


    properties.forEach(
        property => {

            container.appendChild(
                createPropertyCard(property)
            );

        }
    );


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
// جلب العقارات
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
// للبيع
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
            properties.filter(
                property => {

                    return normalizeText(
                        property.Operation
                    ) === normalizeText("بيع");

                }
            );


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
// للإيجار
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
            properties.filter(
                property => {

                    return normalizeText(
                        property.Operation
                    ) === normalizeText("إيجار");

               