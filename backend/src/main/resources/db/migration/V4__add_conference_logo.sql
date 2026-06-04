ALTER TABLE conferences
    ADD COLUMN logo_url VARCHAR(512);
UPDATE conferences
SET logo_url = 'https://jprime.io/images/jprime-small.png'
WHERE name = 'jPrime'
  AND conference_year = 2026;
