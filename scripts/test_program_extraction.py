#!/usr/bin/env python3
"""Quick test of program extraction with proper codes"""

import sys
sys.path.append('.')

# Test cases
test_cases = [
    "BSIT 1",
    "BSIT 2",
    "BSBA 3",
    "BEED 4",
    "G7",
    "G11",
    "Grade 5",
    "Kindergarten",
    "BSHM 2",
    "BSCS 2",
]

print("Testing Program Code Extraction")
print("=" * 60)

for test in test_cases:
    # Simulate the parsing logic
    result = {'program': 'Unknown', 'yearLevel': 'Unknown', 'gradeLevel': 'Unknown'}
    grade_year_raw = test
    grade_year_upper = test.upper()
    
    # College programs
    college_programs = {
        'BSIT': 'Bachelor of Science in Information Technology',
        'BSBA': 'Bachelor of Science in Business Administration',
        'BEED': 'Bachelor of Elementary Education',
        'BSCS': 'Bachelor of Science in Computer Science',
        'BSHM': 'Bachelor of Science in Hotel Management',
    }
    
    # Check for college programs
    for prog_code, prog_name in college_programs.items():
        if prog_code in grade_year_upper:
            parts = grade_year_raw.upper().replace(prog_code, '').strip()
            if parts:
                year_match = ''.join(filter(str.isdigit, parts))
                if year_match and year_match.isdigit():
                    year_num = int(year_match)
                    if 1 <= year_num <= 4:
                        result['program'] = prog_code  # Use program code
                        result['yearLevel'] = f"{year_num}{'st' if year_num == 1 else 'nd' if year_num == 2 else 'rd' if year_num == 3 else 'th'} Year"
                        result['gradeLevel'] = f"College Year {year_num}"
                        break
    
    # K-12
    if result['program'] == 'Unknown':
        if grade_year_upper.startswith('G') and len(grade_year_upper) >= 2:
            grade_num_str = grade_year_upper[1:]
            if grade_num_str.isdigit():
                grade_num = int(grade_num_str)
                if 1 <= grade_num <= 12:
                    result['program'] = 'K-12'
                    result['gradeLevel'] = f"Grade {grade_num}"
                    if grade_num <= 6:
                        result['yearLevel'] = 'Elementary'
                    elif grade_num <= 10:
                        result['yearLevel'] = 'Junior High School'
                    else:
                        result['yearLevel'] = 'Senior High School'
        elif 'GRADE' in grade_year_upper:
            grade_part = grade_year_upper.replace('GRADE', '').strip()
            if grade_part.isdigit():
                grade_num = int(grade_part)
                result['program'] = 'K-12'
                result['gradeLevel'] = f"Grade {grade_num}"
                result['yearLevel'] = 'Elementary'
        elif 'KINDERGARTEN' in grade_year_upper:
            result['program'] = 'K-12'
            result['gradeLevel'] = 'Kindergarten'
            result['yearLevel'] = 'Kindergarten'
    
    print(f"\nInput: {test}")
    print(f"  Program: {result['program']}")
    print(f"  Year Level: {result['yearLevel']}")
    print(f"  Grade Level: {result['gradeLevel']}")

print("\n" + "=" * 60)
print("VERIFICATION:")
print("College programs should show: BSIT, BSBA, BEED, BSCS, BSHM")
print("K-12 programs should show: K-12")
print("Grade levels for college should be: College Year 1, 2, 3, 4")
print("NOT: Grade 13, 14, 15, 16")
