const SHEET_NAME = 'Orders'; // نام شیت
const SECRET = 'CHANGE_TO_YOUR_SECRET'; // با BACKEND_SECRET در صفحه یکی کن

function doPost(e){
  try{
    const body = JSON.parse(e.postData.contents);
    if(!body || body.secret !== SECRET) {
      return ContentService.createTextOutput(JSON.stringify({success:false, error:'invalid secret'})).setMimeType(ContentService.MimeType.JSON);
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sh = ss.getSheetByName(SHEET_NAME);
    if(!sh){
      sh = ss.insertSheet(SHEET_NAME);
      // Header row
      sh.appendRow(['trackingId','timestamp','final','fullname','mobile','address','postal','note','cartJSON','raw']);
    }

    const tracking = body.trackingId;
    const timestamp = body.timestamp || new Date().toISOString();
    const isFinal = !!body.final;
    const form = body.form || {};
    const cart = body.cart || {};

    // بررسی اینکه قبلا رکوردی با همین tracking وجود دارد یا خیر
    const data = sh.getDataRange().getValues();
    let rowIndex = -1;
    for(let r=1;r<data.length;r++){
      if(String(data[r][0]) === String(tracking)){
        rowIndex = r+1; // because sheet rows are 1-based
        break;
      }
    }

    const cartJSON = JSON.stringify(cart);
    const raw = JSON.stringify(body);

    if(rowIndex === -1){
      // append
      sh.appendRow([tracking, timestamp, isFinal ? 'TRUE' : 'FALSE', form.fullname||'', form.mobile||'', form.address||'', form.postal||'', form.note||'', cartJSON, raw]);
    } else {
      // update existing row (نگهداری شماره پیگیری قبلی)
      sh.getRange(rowIndex,2).setValue(timestamp);
      sh.getRange(rowIndex,3).setValue(isFinal ? 'TRUE' : 'FALSE');
      sh.getRange(rowIndex,4).setValue(form.fullname||'');
      sh.getRange(rowIndex,5).setValue(form.mobile||'');
      sh.getRange(rowIndex,6).setValue(form.address||'');
      sh.getRange(rowIndex,7).setValue(form.postal||'');
      sh.getRange(rowIndex,8).setValue(form.note||'');
      sh.getRange(rowIndex,9).setValue(cartJSON);
      sh.getRange(rowIndex,10).setValue(raw);
    }

    return ContentService.createTextOutput(JSON.stringify({success:true})).setMimeType(ContentService.MimeType.JSON);
  }catch(err){
    return ContentService.createTextOutput(JSON.stringify({success:false, error: String(err)})).setMimeType(ContentService.MimeType.JSON);
  }
}
