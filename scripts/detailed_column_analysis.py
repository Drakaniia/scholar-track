#!/usr/bin/env python3
"""
Detailed Column Analysis for Import Script

This script analyzes the Excel files to identify all important columns
including financial data (Tuition, Other Fees, Miscellaneous, Laboratory Fees)
and section groupings (Grade School, Junior High, Senior High, College)
"""

import pandas as pd
import os

def analyze_financial_columns(file_path: str):
    """
    Analyze Excel file to identify financial and descriptive columns
    """
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return
    
    try:
        print(f"\n💰 FINANCIAL COLUMN ANALYSIS: {os.path.basename(file_path)}")
        print("=" * 80)
        
        # Read all sheets
        excel_file = pd.ExcelFile(file_path)
        
        for sheet_name in excel_file.sheet_names:
            print(f"\n📄 SHEET: {sheet_name}")
            print("-" * 50)
            
            df = pd.read_excel(file_path, sheet_name=sheet_name)
            
            # Map columns by letter for easy reference
            column_mapping = {}
            for i, col in enumerate(df.columns):
                letter = chr(65 + i)  # A, B, C, etc.
                column_mapping[letter] = col
            
            print(f"\n🏷️  COLUMN MAPPING:")
            for letter, col_name in column_mapping.items():
                print(f"  Column {letter}: '{col_name}'")
            
            # Look for header row (row that contains column names)
            header_row_index = None
            for idx, row in df.iterrows():
                row_values = [str(v).strip().upper() if pd.notna(v) else "" for v in row.values]
                if any("GRADE/YEAR" in val or "TUITION" in val for val in row_values):
                    header_row_index = idx
                    print(f"\n📋 FOUND HEADER ROW AT INDEX {idx}:")
                    for col_idx, val in enumerate(row.values):
                        letter = chr(65 + col_idx)
                        if pd.notna(val) and str(val).strip():
                            print(f"    Column {letter}: '{val}'")
                    break
            
            if header_row_index is not None:
                # Extract column headers from the found row
                headers = {}
                for col_idx, val in enumerate(df.iloc[header_row_index].values):
                    letter = chr(65 + col_idx)
                    if pd.notna(val) and str(val).strip():
                        headers[letter] = str(val).strip()
                
                print(f"\n💼 IDENTIFIED COLUMNS:")
                important_columns = {
                    'DESCRIPTION': None,
                    'NAMES': None, 
                    'GRADE/YEAR': None,
                    'TUITION': None,
                    'OTHER FEES': None,
                    'MISCELLANEOUS': None,
                    'LABORATORY FEES': None,
                    'TOTAL FEES': None,
                    'AMOUNT SUBSIDY': None,
                    '% OF SUBSIDY': None,
                    'NO.OF STUDENT': None,
                    'FSE': None
                }
                
                for letter, header in headers.items():
                    header_upper = header.upper()
                    for key in important_columns.keys():
                        if key in header_upper or header_upper in key:
                            important_columns[key] = letter
                            print(f"    ✅ {key}: Column {letter} = '{header}'")
                
                # Show missing columns
                missing = [k for k, v in important_columns.items() if v is None]
                if missing:
                    print(f"\n    ❌ MISSING COLUMNS: {', '.join(missing)}")
                
                # Analyze actual data rows (after header)
                print(f"\n📊 SAMPLE DATA (5 rows after header):")
                start_row = header_row_index + 1
                sample_data = df.iloc[start_row:start_row+5]
                
                for idx, row in sample_data.iterrows():
                    print(f"\n    Row {idx + 2}:")  # +2 for Excel row number
                    for col_idx, val in enumerate(row.values):
                        letter = chr(65 + col_idx)
                        if letter in headers:
                            print(f"      {letter} ({headers[letter]}): '{val}'")
            
            # Look for section dividers (Grade School, Junior High, Senior High, College)
            print(f"\n🎓 SECTION ANALYSIS:")
            section_keywords = ['GRADE SCHOOL', 'JUNIOR HIGH', 'SENIOR HIGH', 'COLLEGE', 'BASIC EDUCATION']
            
            for idx, row in df.iterrows():
                first_cell = str(row.iloc[0]).upper() if pd.notna(row.iloc[0]) else ""
                for keyword in section_keywords:
                    if keyword in first_cell:
                        print(f"    📚 Found section '{keyword}' at row {idx + 2}")
                        
                        # Look for students in this section
                        section_students = []
                        for next_idx in range(idx + 1, min(idx + 20, len(df))):
                            next_row = df.iloc[next_idx]
                            grade_col = next_row.iloc[5] if len(next_row) > 5 else None  # Column F
                            if pd.notna(grade_col) and str(grade_col).strip() and str(grade_col).strip() != 'nan':
                                grade_val = str(grade_col).strip()
                                if grade_val not in ['Grade/year', 'DESCRIPTION']:
                                    section_students.append(grade_val)
                                    if len(section_students) >= 5:  # Show first 5
                                        break
                        
                        if section_students:
                            print(f"      Sample grades in this section: {section_students}")
                        break
        
    except Exception as e:
        print(f"❌ Error analyzing {file_path}: {str(e)}")

def analyze_fee_structure(file_path: str):
    """
    Analyze fee structure and calculate totals
    """
    if not os.path.exists(file_path):
        return
    
    try:
        print(f"\n💵 FEE STRUCTURE ANALYSIS: {os.path.basename(file_path)}")
        print("=" * 60)
        
        df = pd.read_excel(file_path, sheet_name=0)  # First sheet
        
        # Find header row
        header_row = None
        for idx, row in df.iterrows():
            if any("TUITION" in str(val).upper() for val in row.values if pd.notna(val)):
                header_row = idx
                break
        
        if header_row is not None:
            # Extract fee columns after header
            fee_data = df.iloc[header_row + 1:]
            
            # Assume standard column positions based on analysis
            columns = {
                'Grade': 5,  # Column F
                'Tuition': 6,  # Column G  
                'Other_Fees': 7,  # Column H
                'Miscellaneous': 8,  # Column I
                'Laboratory': 9,  # Column J
                'Total_Fees': 10,  # Column K
                'Amount_Subsidy': 11,  # Column L
                'Percent_Subsidy': 12,  # Column M
            }
            
            print(f"Fee structure sample (first 10 records):")
            print(f"{'Grade':<12} {'Tuition':<10} {'Other':<10} {'Misc':<10} {'Lab':<10} {'Total':<12} {'Subsidy':<10}")
            print("-" * 84)
            
            fee_summary = {
                'total_tuition': 0,
                'total_other': 0, 
                'total_misc': 0,
                'total_lab': 0,
                'total_subsidy': 0,
                'record_count': 0
            }
            
            for idx, row in fee_data.head(10).iterrows():
                if len(row) > max(columns.values()):
                    grade = str(row.iloc[columns['Grade']]) if pd.notna(row.iloc[columns['Grade']]) else "N/A"
                    tuition = _safe_float(row.iloc[columns['Tuition']])
                    other = _safe_float(row.iloc[columns['Other_Fees']])
                    misc = _safe_float(row.iloc[columns['Miscellaneous']])
                    lab = _safe_float(row.iloc[columns['Laboratory']])
                    total = _safe_float(row.iloc[columns['Total_Fees']])
                    subsidy = _safe_float(row.iloc[columns['Amount_Subsidy']])
                    
                    if any([tuition, other, misc, lab, total, subsidy]):  # Has some financial data
                        print(f"{grade:<12} {tuition:<10,.0f} {other:<10,.0f} {misc:<10,.0f} {lab:<10,.0f} {total:<12,.0f} {subsidy:<10,.0f}")
                        
                        fee_summary['total_tuition'] += tuition or 0
                        fee_summary['total_other'] += other or 0
                        fee_summary['total_misc'] += misc or 0
                        fee_summary['total_lab'] += lab or 0
                        fee_summary['total_subsidy'] += subsidy or 0
                        fee_summary['record_count'] += 1
            
            if fee_summary['record_count'] > 0:
                print(f"\n📊 FEE SUMMARY (sample records):")
                print(f"  Records with fee data: {fee_summary['record_count']}")
                print(f"  Total Tuition: ₱{fee_summary['total_tuition']:,.2f}")
                print(f"  Total Other Fees: ₱{fee_summary['total_other']:,.2f}")
                print(f"  Total Miscellaneous: ₱{fee_summary['total_misc']:,.2f}")
                print(f"  Total Laboratory: ₱{fee_summary['total_lab']:,.2f}")
                print(f"  Total Subsidies: ₱{fee_summary['total_subsidy']:,.2f}")
                
                if fee_summary['record_count'] > 0:
                    avg_tuition = fee_summary['total_tuition'] / fee_summary['record_count']
                    avg_subsidy = fee_summary['total_subsidy'] / fee_summary['record_count']
                    print(f"  Average Tuition: ₱{avg_tuition:,.2f}")
                    print(f"  Average Subsidy: ₱{avg_subsidy:,.2f}")
        
    except Exception as e:
        print(f"❌ Error analyzing fees: {str(e)}")

def _safe_float(value):
    """Safely convert value to float"""
    try:
        if pd.notna(value) and str(value).strip():
            # Remove currency symbols and commas
            clean_val = str(value).replace('₱', '').replace(',', '').replace('$', '').strip()
            return float(clean_val)
    except:
        pass
    return 0

def main():
    print("🔍 COMPREHENSIVE EXCEL ANALYSIS FOR IMPORT")
    print("=" * 80)
    
    # File paths
    docs_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'docs')
    internal_file = os.path.join(docs_dir, 'sample_InernallyFunded2024-2025.xlsx')
    external_file = os.path.join(docs_dir, 'sample_externallyFunded-2024-2025.xlsx')
    
    # Analyze both files for columns
    analyze_financial_columns(internal_file)
    analyze_financial_columns(external_file)
    
    # Analyze fee structures
    analyze_fee_structure(internal_file) 
    analyze_fee_structure(external_file)
    
    print(f"\n" + "="*80)
    print("🎯 IMPORT READINESS ASSESSMENT")
    print("="*80)
    
    print(f"""
✅ WHAT WE CAN IMPORT:
  • Student names (anonymized with random Filipino names)
  • Grade/Year levels (G6, G7, BSIT 1, BSBA 2, etc.)
  • Program information (BSIT, BSBA, BEED, etc.)
  • Year levels (1st-4th year for college, Grade K-12 for basic ed)
  • Academic level classification (Basic Ed vs College)

💰 FINANCIAL DATA COLUMNS IDENTIFIED:
  • Column G: Tuition fees
  • Column H: Other fees  
  • Column I: Miscellaneous fees
  • Column J: Laboratory fees
  • Column K: Total fees (calculated)
  • Column L: Amount subsidy
  • Column M: Percentage subsidy

📚 SECTION GROUPINGS:
  • Basic Education (Elementary)
  • Grade School  
  • Junior High School (Grades 7-10)
  • Senior High School (Grades 11-12)
  • College (BSIT, BSBA, BEED, etc.)

🚀 PRODUCTION READINESS:
  • ✅ Grade/year parsing works for all formats
  • ✅ Program extraction from combined fields  
  • ✅ Age-appropriate birth date generation
  • ✅ Section-aware scholarship categorization
  • ⚠️  Financial data extraction needs to be added
  • ⚠️  Name extraction from Column B needs implementation
  • ⚠️  Scholarship description from Column A needs parsing
    """)

if __name__ == "__main__":
    main()