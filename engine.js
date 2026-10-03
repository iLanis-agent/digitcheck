(function (root) {
  // IBAN country table (length, BBAN format) transcribed from the Wikipedia "International Bank Account Number" page: [country code, total length, BBAN format, name]
  var IBAN = [["AL",28,"8n,16c","Albania"],["AD",24,"8n,12c","Andorra"],["AT",20,"16n","Austria"],["AZ",28,"4a,20c","Azerbaijan"],["BH",22,"4a,14c","Bahrain"],["BY",28,"4c,4n,16c","Belarus"],["BE",16,"12n","Belgium"],["BA",20,"16n","Bosnia and Herzegovina"],["BR",29,"23n,1a,1c","Brazil"],["BG",22,"4a,6n,8c","Bulgaria"],["BI",27,"5n,5n,11n,2n","Burundi"],["CR",22,"18n","Costa Rica"],["HR",21,"17n","Croatia"],["CY",28,"8n,16c","Cyprus"],["CZ",24,"20n","Czech Republic"],["DK",18,"14n","Denmark"],["DJ",27,"5n,5n,11n,2n","Djibouti"],["DO",28,"4c,20n","Dominican Republic"],["TL",23,"19n","East Timor"],["EG",29,"25n","Egypt"],["SV",28,"4a,20n","El Salvador"],["EE",20,"16n","Estonia"],["FK",18,"2a,12n","Falkland Islands"],["FO",18,"14n","Faroe Islands"],["FI",18,"14n","Finland"],["FR",27,"10n,11c,2n","France"],["GE",22,"2a,16n","Georgia"],["DE",22,"18n","Germany"],["GI",23,"4a,15c","Gibraltar"],["GR",27,"7n,16c","Greece"],["GL",18,"14n","Greenland"],["GT",28,"4c,20c","Guatemala"],["HN",28,"4a,20n","Honduras"],["HU",28,"24n","Hungary"],["IS",26,"22n","Iceland"],["IQ",23,"4a,15n","Iraq"],["IE",22,"4a,6n,8n","Ireland"],["IL",23,"19n","Israel"],["IT",27,"1a,10n,12c","Italy"],["JO",30,"4a,4n,18c","Jordan"],["KZ",20,"3n,13c","Kazakhstan"],["XK",20,"4n,10n,2n","Kosovo"],["KW",30,"4a,22c","Kuwait"],["LV",21,"4a,13c","Latvia"],["LB",28,"4n,20c","Lebanon"],["LY",25,"21n","Libya"],["LI",21,"5n,12c","Liechtenstein"],["LT",20,"16n","Lithuania"],["LU",20,"3n,13c","Luxembourg"],["MT",31,"4a,5n,18c","Malta"],["MR",27,"23n","Mauritania"],["MU",30,"4a,19n,3a","Mauritius"],["MC",27,"10n,11c,2n","Monaco"],["MD",24,"2c,18c","Moldova"],["MN",20,"4n,12n","Mongolia"],["ME",22,"18n","Montenegro"],["NL",18,"4a,10n","Netherlands"],["NI",28,"4a,20n","Nicaragua"],["MK",19,"3n,10c,2n","North Macedonia"],["NO",15,"11n","Norway"],["OM",23,"3n,16c","Oman"],["PK",24,"4a,16c","Pakistan"],["PS",29,"4a,21c","Palestinian territories"],["PL",28,"24n","Poland"],["PT",25,"21n","Portugal"],["QA",29,"4a,21c","Qatar"],["RO",24,"4a,16c","Romania"],["RU",33,"14n,15c","Russia"],["LC",32,"4a,24c","Saint Lucia"],["SM",27,"1a,10n,12c","San Marino"],["ST",25,"21n","São Tomé and Príncipe"],["SA",24,"2n,18c","Saudi Arabia"],["RS",22,"18n","Serbia"],["SC",31,"4a,20n,3a","Seychelles"],["SK",24,"20n","Slovakia"],["SI",19,"15n","Slovenia"],["SO",23,"4n,3n,12n","Somalia"],["ES",24,"20n","Spain"],["SD",18,"14n","Sudan"],["SE",24,"20n","Sweden"],["CH",21,"5n,12c","Switzerland"],["TN",24,"20n","Tunisia"],["TR",26,"5n,1n,16c","Turkey"],["UA",29,"6n,19c","Ukraine"],["AE",23,"3n,16n","United Arab Emirates"],["GB",22,"4a,14n","United Kingdom"],["VA",22,"3n,15n","Vatican City"],["VG",24,"4a,16n","Virgin Islands, British"],["YE",30,"4a,4n,18c","Yemen"],["DZ",26,"22n","Algeria"],["AO",25,"21n","Angola"],["BJ",28,"2c,22n","Benin"],["BF",28,"2c,22n","Burkina Faso"],["CV",25,"21n","Cabo Verde"],["CM",27,"23n","Cameroon"],["CF",27,"23n","Central African Republic"],["TD",27,"23n","Chad"],["KM",27,"23n","Comoros"],["CG",27,"23n","Congo, Republic of the"],["CI",28,"2a,22n","Côte d'Ivoire"],["GQ",27,"23n","Equatorial Guinea"],["GA",27,"23n","Gabon"],["GW",25,"2c,19n","Guinea-Bissau"],["IR",26,"22n","Iran"],["MG",27,"23n","Madagascar"],["ML",28,"2c,22n","Mali"],["MA",28,"24n","Morocco"],["MZ",25,"21n","Mozambique"],["NE",28,"2a,22n","Niger"],["SN",28,"2a,22n","Senegal"],["TG",28,"2a,22n","Togo"]];
  var BYCC = {}; IBAN.forEach(function (r) { BYCC[r[0]] = r; });
  function digitsOnly(s) { return String(s).replace(/[\s-]/g, ''); }
  function mod97(str) { var rem = 0; for (var i = 0; i < str.length; i++) { var c = str.charAt(i), v = /\d/.test(c) ? c : String(c.charCodeAt(0) - 55); for (var j = 0; j < v.length; j++) rem = (rem * 10 + (+v.charAt(j))) % 97; } return rem; }
  function bbanOk(bban, fmt) {
    var parts = fmt.split(','), pos = 0;
    for (var i = 0; i < parts.length; i++) {
      var m = /^(\d+)([nac])$/.exec(parts[i]), len = +m[1], seg = bban.substr(pos, len), re = m[2] === 'n' ? /^[0-9]+$/ : m[2] === 'a' ? /^[A-Z]+$/ : /^[0-9A-Za-z]+$/;
      if (seg.length !== len || !re.test(seg)) return { ok: false, at: pos + 5 };
      pos += len;
    }
    return { ok: true };
  }
  function ibanCheck(input) {
    var s = String(input).replace(/\s/g, '').toUpperCase();
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(s)) return { ok: false, reason: 'An IBAN starts with 2 letters, 2 digits, then letters and digits.' };
    var c = BYCC[s.slice(0, 2)];
    if (!c) return { ok: false, reason: s.slice(0, 2) + ' is not in the country table.' };
    if (s.length !== c[1]) return { ok: false, reason: c[3] + ' IBANs have ' + c[1] + ' characters, this has ' + s.length + '.', country: c[3] };
    var b = bbanOk(s.slice(4), c[2]);
    if (!b.ok) return { ok: false, reason: 'Characters do not match the ' + c[3] + ' format (' + c[2] + ') near position ' + b.at + '.', country: c[3] };
    var r = mod97(s.slice(4) + s.slice(0, 4));
    if (r !== 1) return { ok: false, reason: 'Check digits fail: remainder mod 97 is ' + r + ', it must be 1.', country: c[3] };
    return { ok: true, country: c[3], formatted: s.replace(/(.{4})/g, '$1 ').trim(), length: s.length };
  }
  function ibanMake(cc, bban) {
    cc = String(cc).toUpperCase(); bban = String(bban).replace(/\s/g, '').toUpperCase();
    var c = BYCC[cc]; if (!c) return { error: cc + ' is not in the country table.' };
    if (bban.length !== c[1] - 4) return { error: c[3] + ' needs a ' + (c[1] - 4) + ' character account part, got ' + bban.length + '.' };
    var b = bbanOk(bban, c[2]); if (!b.ok) return { error: 'The account part does not match the ' + c[3] + ' format (' + c[2] + ').' };
    var k = 98 - mod97(bban + cc + '00'), kk = (k < 10 ? '0' : '') + k, iban = cc + kk + bban;
    return { iban: iban, formatted: iban.replace(/(.{4})/g, '$1 ').trim(), check: kk };
  }
  // Luhn (ISO/IEC 7812-1 Annex B): double every second digit from the right of the payload
  function luhnSum(digits) { var sum = 0, dbl = false; for (var i = digits.length - 1; i >= 0; i--) { var d = +digits.charAt(i); if (dbl) { d *= 2; if (d > 9) d -= 9; } sum += d; dbl = !dbl; } return sum; }
  function luhnCheck(input) { var s = digitsOnly(input); if (!/^\d{2,}$/.test(s)) return { ok: false, reason: 'Digits only, at least 2.' }; return luhnSum(s) % 10 === 0 ? { ok: true } : { ok: false, reason: 'Sum is ' + luhnSum(s) + ', it must be a multiple of 10.', expected: luhnDigit(s.slice(0, -1)) }; }
  function luhnDigit(payload) { var s = digitsOnly(payload); return (10 - luhnSum(s + '0') % 10) % 10; }
  function isbn10Digit(nine) { var sum = 0; for (var i = 0; i < 9; i++) sum += (10 - i) * +nine.charAt(i); var c = (11 - sum % 11) % 11; return c === 10 ? 'X' : String(c); }
  function isbn13Digit(twelve) { var sum = 0; for (var i = 0; i < 12; i++) sum += (i % 2 ? 3 : 1) * +twelve.charAt(i); return String((10 - sum % 10) % 10); }
  function isbnCheck(input) {
    var s = digitsOnly(input).toUpperCase();
    if (/^\d{9}[\dX]$/.test(s)) {
      var e = isbn10Digit(s.slice(0, 9));
      if (e !== s.charAt(9)) return { ok: false, kind: 'ISBN-10', reason: 'Check digit should be ' + e + ', not ' + s.charAt(9) + '.' };
      var t = '978' + s.slice(0, 9); return { ok: true, kind: 'ISBN-10', asIsbn13: t + isbn13Digit(t) };
    }
    if (/^\d{13}$/.test(s)) {
      var e2 = isbn13Digit(s.slice(0, 12));
      if (e2 !== s.charAt(12)) return { ok: false, kind: 'ISBN-13', reason: 'Check digit should be ' + e2 + ', not ' + s.charAt(12) + '.' };
      var r = { ok: true, kind: 'ISBN-13' };
      if (s.slice(0, 3) === '978') r.asIsbn10 = s.slice(3, 12) + isbn10Digit(s.slice(3, 12));
      return r;
    }
    return { ok: false, reason: 'An ISBN has 10 characters (last may be X) or 13 digits.' };
  }
  // guess what was pasted
  function detect(input) {
    var raw = String(input).trim(), compact = raw.replace(/[\s-]/g, '').toUpperCase();
    if (/^[A-Z]{2}\d{2}[A-Z0-9]{8,}$/.test(compact) && /[A-Z]{2}/.test(compact.slice(0, 2))) return 'iban';
    if (/^\d{9}[\dX]$/.test(compact) || (/^97[89]\d{10}$/.test(compact))) return 'isbn';
    if (/^\d{2,}$/.test(compact)) return 'luhn';
    return null;
  }
  var api = { IBAN: IBAN, mod97: mod97, ibanCheck: ibanCheck, ibanMake: ibanMake, luhnCheck: luhnCheck, luhnDigit: luhnDigit, isbnCheck: isbnCheck, isbn10Digit: isbn10Digit, isbn13Digit: isbn13Digit, detect: detect };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.DigitCheck = api;
})(typeof window !== 'undefined' ? window : this);
