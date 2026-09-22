/**
 * Google Apps Script for JK Homes & Renovation
 * Automatically appends website form submissions to Google Sheets
 * and emails an instant alert to jkhomesandrenovation@gmail.com
 *
 * HOW TO SET UP (Takes 2 minutes):
 * 1. Open Google Sheets (https://sheets.new) and name it "JK Homes Leads".
 * 2. Click Extensions > Apps Script.
 * 3. Delete any code in the editor and paste this ENTIRE file.
 * 4. Click Save (disk icon).
 * 5. Click "Deploy" (top right) > "New deployment".
 * 6. Click the gear icon next to "Select type" > choose "Web app".
 * 7. Set:
 *    - Description: "Website Form Handler"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (IMPORTANT: Do NOT select "Only myself")
 * 8. Click "Deploy" and authorize access with your Google account.
 * 9. Copy the "Web app URL" (starts with https://script.google.com/macros/s/...).
 * 10. Paste that URL into index.html inside the form action:
 *     <form id="contact-form" action="PASTE_URL_HERE" method="POST">
 */

const NOTIFICATION_EMAIL = 'jkhomesandrenovation@gmail.com';

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const p = e.parameter || {};
    
    // Create header row if empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp',
        'Customer Name',
        'Email Address',
        'Phone Number',
        'Project Type',
        'Message / Project Details'
      ]);
      // Format header row
      sheet.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#143743').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }
    
    // Extract parameters
    const name = p.name || 'Website Visitor';
    const email = p.email || 'Not provided';
    const phone = p.phone || 'Not provided';
    const project = p.project || 'General Inquiry';
    const message = p.message || '';
    const date = Utilities.formatDate(new Date(), 'America/Toronto', 'yyyy-MM-dd HH:mm:ss');
    
    // Append lead to Google Sheet
    sheet.appendRow([date, name, email, phone, project, message]);
    
    // Send immediate email notification to business owner
    MailApp.sendEmail({
      to: NOTIFICATION_EMAIL,
      subject: `🚨 New Lead: ${name} - ${project}`,
      body: `You received a new inquiry on JK Homes & Renovation website:\n\n` +
            `• Name: ${name}\n` +
            `• Phone: ${phone}\n` +
            `• Email: ${email}\n` +
            `• Project: ${project}\n` +
            `• Details:\n${message}\n\n` +
            `---\n` +
            `Click here to open your Google Sheet:\n` +
            `${SpreadsheetApp.getActiveSpreadsheet().getUrl()}`
    });
    
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success', message: 'Lead recorded successfully' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput("JK Homes & Renovation form endpoint is active.")
    .setMimeType(ContentService.MimeType.TEXT);
}
