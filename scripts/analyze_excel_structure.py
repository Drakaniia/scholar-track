#!/usr/bin/env python3
"""
Excel Structure Analyzer - Examine actual Excel file contents

This script analyzes the real structure and content of the Excel files
to understand the actual column names and data patterns.
"""

import pandas as pd
import os

def analyze_excel_detailed(file_path: str):
    """
    Analyze Excel file structure in detail
    """
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return
    
    try:
        print(f"\n📊 DETAILED ANALYSIS: {os.path.basename(file_path)}")
        print("=" * 80)
        
        # Read all sheets
        excel_file = pd.ExcelFile(file_path)
        
        for sheet_name in excel_file.sheet_names:
            print(f"\n📄 SHEET: {sheet_name}")
            print("-" * 40)
            
            df = pd.read_excel(file_path, sheet_name=sheet_name)
            
            print(f"Total Rows: {len(df)}")
            print(f"Total Columns: {len(df.columns)}")
            
            print(f"\n🏷️  COLUMN NAMES:")
            for i, col in enumerate(df.columns):
                print(f"  {chr(65+i)} (Column {i+1}): '{col}'")
            
            # Show first 10 rows
            print(f"\n📋 FIRST 10 ROWS OF DATA:")
            print("-" * 60)
            
            for idx, row in df.head(10).iterrows():
                print(f"\nRow {idx + 2}:")  # +2 because Excel starts from row 1 and we have header
                for col_idx, (col_name, value) in enumerate(row.items()):
                    col_letter = chr(65 + col_idx)
                    print(f"  {col_letter}: {col_name} = '{value}'")
            
            # Analyze Column F specifically (Grade/Year)
            if len(df.columns) > 5:  # Column F is index 5 (0-based)
                col_f_name = df.columns[5]
                col_f_data = df.iloc[:, 5]  # Column F data
                
                print(f"\n🎯 COLUMN F ANALYSIS: '{col_f_name}'")
                print("-" * 40)
                print(f"Column F Name: {col_f_name}")
                print(f"Total Values: {len(col_f_data)}")
                print(f"Non-null Values: {col_f_data.notna().sum()}")
                print(f"Unique Values: {col_f_data.nunique()}")
                
                print(f"\n📊 UNIQUE VALUES IN COLUMN F:")
                unique_values = col_f_data.dropna().unique()
                for i, val in enumerate(sorted(unique_values)):
                    count = (col_f_data == val).sum()
                    print(f"  {i+1:2d}. '{val}' (appears {count} times)")
                
                print(f"\n📝 SAMPLE COLUMN F VALUES (first 20):")
                for i, val in enumerate(col_f_data.head(20)):
                    print(f"  Row {i+2:2d}: '{val}'")
            
            # Look for program information in other columns
            print(f"\n🔍 LOOKING FOR PROGRAM/COURSE INFORMATION:")
            program_keywords = ['program', 'course', 'degree', 'bsit', 'bsba', 'beed']
            for col_idx, col_name in enumerate(df.columns):
                col_letter = chr(65 + col_idx)
                col_data = df.iloc[:, col_idx]
                
                # Check if column name or data contains program info
                if any(keyword in str(col_name).lower() for keyword in program_keywords):
                    print(f"  {col_letter}: '{col_name}' - Potential program column")
                    sample_values = col_data.dropna().unique()[:10]
                    print(f"     Sample values: {list(sample_values)}")
                
                # Check if data contains program codes
                sample_data = col_data.dropna().astype(str).str.upper()
                if any('BSIT' in val or 'BSBA' in val or 'BEED' in val for val in sample_data.head(100)):
                    print(f"  {col_letter}: '{col_name}' - Contains program codes")
                    program_samples = [val for val in sample_data.head(20) if any(prog in val for prog in ['BSIT', 'BSBA', 'BEED'])]
                    print(f"     Program samples: {program_samples[:5]}")
        
    except Exception as e:
        print(f"❌ Error analyzing {file_path}: {str(e)}")

def main():
    print("🔍 Excel Structure Analysis Tool")
    print("=" * 80)
    
    # File paths
    docs_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'docs')
    internal_file = os.path.join(docs_dir, 'sample_InernallyFunded2024-2025.xlsx')
    external_file = os.path.join(docs_dir, 'sample_externallyFunded-2024-2025.xlsx')
    
    # Analyze both files
    analyze_excel_detailed(internal_file)
    analyze_excel_detailed(external_file)
    
    print(f"\n✅ Analysis complete!")

if __name__ == "__main__":
    main()