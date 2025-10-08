// ---------- تنظیمات ----------
const AIRTABLE_API_KEY = 'YOUR_API_KEY';       // کلید Airtable خودت
const AIRTABLE_BASE_ID = 'YOUR_BASE_ID';       // Base ID Airtable
const AIRTABLE_TABLE_NAME = 'Orders';          // اسم جدول در Airtable
const BACKEND_SECRET = 'Qaz@123123';           // رمز اختصاصی برای امنیت

// ---------- تابع دریافت POST ----------
function doPost(e) {
  try {
    // دریافت داده از فرم
    const data = JSON.parse(e.postData.contents);
    const secret = e.parameter.secret;

    // بررسی امنیت
    if (secret !== BACKEND_SECRET) {
      return ContentService.createTextOutput('Unauthorized').setResponseCode(403);
    }

    // آماده‌سازی داده برای Airtable
    const payload = {
      "fields": {
        "Date": data.date,
        "TrackingCode": data.trackingCode,
        "CustomerName": data.name,
        "Phone": data.phone,
        "Address": data.address,
        "PostalCode": data.postalCode,
        "Items": data.items || '',
        "Total": data.total || '',
        "Status": data.status || 'Pending',
        "Notes": data.notes || ''
      }
    };

    // ارسال به Airtable
    const options = {
      method: "post",
      contentType: "application/json",
      headers: { Authorization: "Bearer " + AIRTABLE_API_KEY },
      payload: JSON.stringify(payload)
    };

    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;
    const response = UrlFetchApp.fetch(url, options);

    return ContentService.createTextOutput(response.getContentText())
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
