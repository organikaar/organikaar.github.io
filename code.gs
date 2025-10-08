/*******************************************************
 * ارگانيکار - Google Apps Script Backend
 * ورژن نهايي (اتصال بين فرم HTML و Google Sheet)
 *******************************************************/

const BACKEND_SECRET = 'Qaz@123123'; // ?? هموني که در index.html گذاشتي

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // بررسي رمز امنيتي
    if (data.secret !== BACKEND_SECRET) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Unauthorized' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('سفارش‌ها') || ss.insertSheet('سفارش‌ها');

    // ساختن هدرها اگر شيت خالي است
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'تاريخ ثبت',
        'کد پيگيري',
        'نام مشتري',
        'تلفن',
        'آدرس',
        'کدپستي',
        'اقلام سفارش',
        'جمع کل (تومان)',
        'وضعيت',
      ]);
    }

    const form = data.form || {};
    const cart = data.cart || {};
    const trackingId = data.trackingId || 'بدون‌کد';
    const finalStatus = data.final ? 'نهايي' : 'پيش‌نويس';
    const date = new Date();

    // اقلام سفارش به‌صورت متن
    let itemsText = '';
    let total = 0;
    for (const [pid, qty] of Object.entries(cart)) {
      itemsText += `${pid} × ${qty}\n`;
    }

    // اگر محصول‌ها قيمت دارند (از سمت فرانت مي‌آد)، جمعش حساب بشه
    if (data.cart && Object.keys(data.cart).length) {
      total = Object.entries(data.cart).reduce((sum, [pid, qty]) => {
        const product = PRODUCTS_LIST[pid];
        return product ? sum + product.price * qty : sum;
      }, 0);
    }

    // چک کن آيا اين trackingId قبلاً ثبت شده
    const range = sheet.getRange(2, 2, sheet.getLastRow(), 1).getValues(); // ستون کد پيگيري
    let existingRow = null;
    for (let i = 0; i < range.length; i++) {
      if (range[i][0] === trackingId) {
        existingRow = i + 2;
        break;
      }
    }

    const rowData = [
      Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy/MM/dd HH:mm:ss'),
      trackingId,
      form.fullname || '',
      form.mobile || '',
      form.address || '',
      form.postal || '',
      itemsText.trim(),
      total || '',
      finalStatus,
    ];

    if (existingRow) {
      sheet.getRange(existingRow, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * ليست محصولات با قيمت براي محاسبه جمع کل
 */
const PRODUCTS_LIST = {
  zaferan: { title: "زعفران", price: 250000 },
  zereshk: { title: "زرشک", price: 120000 },
  anab: { title: "عناب", price: 100000 },
  asal: { title: "عسل", price: 180000 }
};
