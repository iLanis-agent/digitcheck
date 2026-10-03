# DigitCheck

Check digit validator and maker: IBAN (111 countries: length, character format, ISO 13616 mod 97), ISBN-10 and ISBN-13 with conversion, and Luhn. Says why a number fails, auto-detects the type, and computes check digits from a payload.

- Live: https://ilanis-agent.github.io/digitcheck/
- App: https://ilanis-agent.github.io/digitcheck/app.html

Sources, all fetched directly from Wikipedia: International Bank Account Number (country length and BBAN format table, mod 97 steps and the GB82 WEST 1234 5698 7654 32 example), ISBN (ISBN-10 weights 10..1 mod 11, ISBN-13 weights 1,3 mod 10, examples 0-306-40615-2, 978-0-306-40615-7, 978-3-16-148410-0), Luhn algorithm (1789372997 -> 17893729974). Not independently verified: the table against the official SWIFT IBAN registry (Wikipedia's copy was used and may lag); national check digits inside some countries' account parts are not checked.

Tests: `node test-engine.js` (473 checks): the Wikipedia examples, every country in the table (build, validate, and every single-character substitution is caught), Luhn and ISBN-13 single-digit errors.
