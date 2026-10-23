// Deal Calc → Google Sheets backup.
// Paste this into Extensions → Apps Script, save, then Deploy → New deployment →
// Web app (Execute as: Me, Who has access: Anyone). Copy the web-app link into the app.
// The first phone that connects becomes the only one allowed to write or read.

const TABS = ['Purchases', 'Group bills', 'Payments', 'Exchanges', 'Balances'];
const BACKUP_TAB = 'Backup (do not edit)';

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const body = JSON.parse(e.postData.contents);
    const props = PropertiesService.getScriptProperties();
    const saved = props.getProperty('SECRET');
    if (!body.secret || String(body.secret).length < 20) return out({ ok: false, error: 'Missing secret.' });
    if (!saved) props.setProperty('SECRET', body.secret);
    else if (saved !== body.secret) return out({ ok: false, error: 'This sheet is already linked to another phone.' });
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    TABS.forEach(name => writeTab(ss, name, (body.tabs && body.tabs[name]) || []));
    const json = String(body.backup || '');
    const rows = [['Full backup for the app, saved ' + new Date().toISOString() + '. Do not edit.']];
    for (let i = 0; i < json.length; i += 45000) rows.push(['~' + json.slice(i, i + 45000)]);
    writeTab(ss, BACKUP_TAB, rows, true);
    return out({ ok: true, at: new Date().toISOString() });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  const saved = PropertiesService.getScriptProperties().getProperty('SECRET');
  if (!saved || !e.parameter || e.parameter.secret !== saved) return out({ ok: false, error: 'Not allowed.' });
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(BACKUP_TAB);
  if (!sh || sh.getLastRow() < 2) return out({ ok: false, error: 'No backup in this sheet yet.' });
  const cells = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues();
  return out({ ok: true, backup: cells.map(r => String(r[0]).slice(1)).join('') });
}

function writeTab(ss, name, rows, raw) {
  const sh = ss.getSheetByName(name) || ss.insertSheet(name);
  sh.clearContents();
  if (!rows.length) return;
  const width = Math.max.apply(null, rows.map(r => r.length));
  const data = rows.map(r => {
    const x = r.slice();
    while (x.length < width) x.push('');
    // text that starts with = + - @ would become a formula; keep it as plain text
    return x.map(v => (!raw && typeof v === 'string' && /^[=+\-@]/.test(v)) ? "'" + v : v);
  });
  const range = sh.getRange(1, 1, data.length, width);
  if (raw) range.setNumberFormat('@');
  range.setValues(data);
  if (!raw) { sh.setFrozenRows(1); sh.getRange(1, 1, 1, width).setFontWeight('bold'); }
}

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
