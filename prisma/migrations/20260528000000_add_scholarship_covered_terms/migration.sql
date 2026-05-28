-- Add configurable scholarship term coverage.
ALTER TABLE "scholarships"
ADD COLUMN "covered_terms" TEXT NOT NULL DEFAULT '1ST,2ND';

-- LGU scholarships are funded for the complete 1st through 3rd semester cycle.
UPDATE "scholarships"
SET "covered_terms" = '1ST,2ND,3RD'
WHERE "type" = 'LGU';

-- Historical third-term markers now map to the 3rd semester.
UPDATE "academic_years"
SET "semester" = '3RD'
WHERE UPPER("semester") IN ('SUM' || 'MER', 'MID' || 'YEAR');

UPDATE "student_fees"
SET "term" = regexp_replace("term", 'Sum' || 'mer' || '|Mid' || 'year', '3rd Semester', 'i')
WHERE "term" ~* ('Sum' || 'mer' || '|Mid' || 'year');

UPDATE "disbursements"
SET "term" = regexp_replace("term", 'Sum' || 'mer' || '|Mid' || 'year', '3rd Semester', 'i')
WHERE "term" ~* ('Sum' || 'mer' || '|Mid' || 'year');
