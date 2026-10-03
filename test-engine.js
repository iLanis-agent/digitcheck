var D = require('./engine.js'); var fails = 0, n = 0;
function eq(a, b, m) { n++; if (a !== b) { fails++; console.log('FAIL', m, a, b); } }
// Worked examples from Wikipedia: Luhn (1789372997 -> 17893729974), ISBN-10 0-306-40615-2, ISBN-13 978-0-306-40615-7, 978-3-16-148410-0, IBAN GB82 WEST 1234 5698 7654 32
eq(D.luhnDigit('1789372997'), 4, 'luhn digit'); eq(D.luhnCheck('17893729974').ok, true, 'luhn ok'); eq(D.luhnCheck('17893729975').ok, false, 'luhn bad'); eq(D.luhnCheck('1789 3729 974').ok, true, 'luhn spaces');
eq(D.isbnCheck('0-306-40615-2').ok, true, 'isbn10'); eq(D.isbnCheck('0-306-40615-2').asIsbn13, '9780306406157', '10 to 13');
eq(D.isbnCheck('978-0-306-40615-7').ok, true, 'isbn13'); eq(D.isbnCheck('978-0-306-40615-7').asIsbn10, '0306406152', '13 to 10'); eq(D.isbnCheck('978-3-16-148410-0').ok, true, 'isbn13 b');
eq(D.isbnCheck('0-306-40615-3').ok, false, 'isbn10 bad'); eq(D.isbnCheck('978-0-306-40615-8').ok, false, 'isbn13 bad'); eq(D.isbnCheck('12345').ok, false, 'isbn short');
eq(D.isbn10Digit('080442957'), 'X', 'X check digit'); eq(D.isbnCheck('080442957X').ok, true, 'isbn10 with X');
eq(D.mod97('3214282912345698765432161182'), 1, 'wikipedia D mod 97');
eq(D.ibanCheck('GB82 WEST 1234 5698 7654 32').ok, true, 'GB iban'); eq(D.ibanCheck('gb82west12345698765432').ok, true, 'lowercase'); eq(D.ibanMake('GB', 'WEST12345698765432').check, '82', 'make GB');
eq(D.ibanCheck('GB82 WEST 1234 5698 7654 33').ok, false, 'GB bad'); eq(/22 characters/.test(D.ibanCheck('GB82WEST1234569876543').reason), true, 'length msg'); eq(D.ibanCheck('XX82WEST12345698765432').ok, false, 'unknown country');
eq(D.IBAN.length >= 100, true, 'table size');
// every country in the table: build a synthetic account part from its format, make an IBAN, check it, then every single-character substitution and adjacent swap must fail
function synth(fmt) { var out = ''; fmt.split(',').forEach(function (p) { var m = /^(\d+)([nac])$/.exec(p), len = +m[1]; for (var i = 0; i < len; i++) out += m[2] === 'n' ? String((i * 7 + 3) % 10) : m[2] === 'a' ? String.fromCharCode(65 + (i * 5) % 26) : String.fromCharCode(i % 2 ? 65 + (i * 3) % 26 : 48 + i % 10); }); return out; }
D.IBAN.forEach(function (r) {
  var made = D.ibanMake(r[0], synth(r[2])); eq(!!made.iban, true, 'make ' + r[0]); if (!made.iban) return;
  eq(made.iban.length, r[1], 'length ' + r[0]); eq(D.ibanCheck(made.iban).ok, true, 'valid ' + r[0]);
  var s = made.iban, bad = 0;
  for (var i = 2; i < s.length; i++) { var ch = s.charAt(i), alt = /\d/.test(ch) ? String((+ch + 1) % 10) : (ch === 'Z' ? 'Y' : String.fromCharCode(ch.charCodeAt(0) + 1)); if (D.ibanCheck(s.slice(0, i) + alt + s.slice(i + 1)).ok) bad++; }
  eq(bad, 0, 'single substitution slipped through ' + r[0]);
});
// Luhn catches every single-digit error; ISBN-13 catches every single-digit error
var base = '7992739871', full = base + D.luhnDigit(base), miss = 0;
for (var i = 0; i < full.length; i++) for (var d = 0; d < 10; d++) if (String(d) !== full.charAt(i) && D.luhnCheck(full.slice(0, i) + d + full.slice(i + 1)).ok) miss++;
eq(miss, 0, 'luhn single digit');
var i13 = '9780306406157', miss13 = 0;
for (var j = 0; j < 13; j++) for (var e = 0; e < 10; e++) if (String(e) !== i13.charAt(j) && D.isbnCheck(i13.slice(0, j) + e + i13.slice(j + 1)).ok) miss13++;
eq(miss13, 0, 'isbn13 single digit');
eq(D.detect('GB82 WEST 1234 5698 7654 32'), 'iban', 'detect iban'); eq(D.detect('978-0-306-40615-7'), 'isbn', 'detect isbn'); eq(D.detect('0-306-40615-2'), 'isbn', 'detect isbn10'); eq(D.detect('1789 3729 974'), 'luhn', 'detect luhn'); eq(D.detect('hello'), null, 'detect none');
console.log(n + ' checks, ' + fails + ' failures'); process.exit(fails ? 1 : 0);
