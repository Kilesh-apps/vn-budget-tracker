// Deal Calc → Google Sheets backup + live group link (script version 2).
// Paste this into Extensions → Apps Script, save, then Deploy → New deployment →
// Web app (Execute as: Me, Who has access: Anyone). Copy the web-app link into the app.
// Updating from version 1? Deploy → Manage deployments → ✏️ → Version: New version → Deploy.
// The first phone that connects becomes the only one allowed to write or read the backup.
// Friends with the live link can only read the group summary (shared bills), never the backup.

const TABS = ['Purchases', 'Group bills', 'Payments', 'Exchanges', 'Balances'];
const BACKUP_TAB = 'Backup (do not edit)';
const LIVE_TAB = 'Group live (do not edit)';

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
    writeChunks(ss, BACKUP_TAB, 'Full backup for the app', String(body.backup || ''));
    if (body.group && body.groupToken && String(body.groupToken).length >= 16) {
      props.setProperty('GROUP_TOKEN', String(body.groupToken));
      props.setProperty('GROUP_AT', new Date().toISOString());
      writeChunks(ss, LIVE_TAB, 'Live group summary for the shared link', String(body.group));
    }
    return out({ ok: true, v: 2, at: new Date().toISOString() });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  const props = PropertiesService.getScriptProperties();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (p.group) { // read-only group summary for friends
    const token = props.getProperty('GROUP_TOKEN');
    if (!token || p.group !== token) return out({ ok: false, error: 'This live link is not valid any more.' });
    const report = readChunks(ss, LIVE_TAB);
    if (!report) return out({ ok: false, error: 'Nothing shared yet.' });
    return out({ ok: true, report: report, at: props.getProperty('GROUP_AT') });
  }
  const saved = props.getProperty('SECRET');
  if (!saved || p.secret !== saved) return out({ ok: false, error: 'Not allowed.', v: 2 });
  const backup = readChunks(ss, BACKUP_TAB);
  if (!backup) return out({ ok: false, error: 'No backup in this sheet yet.' });
  return out({ ok: true, backup: backup, v: 2 });
}

function writeChunks(ss, name, title, json) {
  const rows = [[title + ', saved ' + new Date().toISOString() + '. Do not edit.']];
  for (let i = 0; i < json.length; i += 45000) rows.push(['~' + json.slice(i, i + 45000)]);
  writeTab(ss, name, rows, true);
  const sh = ss.getSheetByName(name);
  if (sh && !sh.isSheetHidden() && ss.getSheets().length > 1) sh.hideSheet();
}

function readChunks(ss, name) {
  const sh = ss.getSheetByName(name);
  if (!sh || sh.getLastRow() < 2) return '';
  return sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().map(r => String(r[0]).slice(1)).join('');
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
