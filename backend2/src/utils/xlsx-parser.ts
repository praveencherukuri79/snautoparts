/**
 * XLSX Parser Utility
 * 
 * Parses inventory XLSX files and converts them to product/inventory data.
 * Uses the xlsx library for parsing Excel files.
 */

import { logger } from '../config/logger.js';

/**
 * Raw row from the inventory XLSX file
 */
export interface InventoryXlsxRow {
  'SN Part Number': string;
  Description: string;
  Make: string;
  Model: string;
  'Master Category': string;
  'Sub Category'?: string;
  'From Year': number;
  'To Year': number;
  'QTY Ordered': number;
  'UPC Code'?: string;
  Length?: number;
  Width?: number;
  Height?: number;
  Weight?: number;
  'Cost Price'?: number;
  'Sell Price'?: number;
}

/**
 * Parsed product data from XLSX
 */
export interface ParsedProduct {
  sku: string;
  name: string;
  description: string;
  masterCategory: string;
  subCategory?: string;
  stockQuantity: number;
  upc?: string;
  length?: number;
  width?: number;
  height?: number;
  weight?: number;
  costPrice?: number;
  sellPrice?: number;
  fitments: ParsedFitment[];
}

/**
 * Parsed fitment data from XLSX
 */
export interface ParsedFitment {
  make: string;
  model: string;
  yearStart: number;
  yearEnd: number;
}

/**
 * Parse result
 */
export interface ParseResult {
  products: ParsedProduct[];
  errors: ParseError[];
  totalRows: number;
  successfulRows: number;
}

/**
 * Parse error
 */
export interface ParseError {
  row: number;
  field: string;
  message: string;
  value?: unknown;
}

/**
 * Column name mapping
 */
const COLUMN_MAPPINGS: Record<string, keyof InventoryXlsxRow> = {
  'sn part number': 'SN Part Number',
  'part number': 'SN Part Number',
  sku: 'SN Part Number',
  description: 'Description',
  name: 'Description',
  make: 'Make',
  model: 'Model',
  'master category': 'Master Category',
  category: 'Master Category',
  'sub category': 'Sub Category',
  subcategory: 'Sub Category',
  'from year': 'From Year',
  'year from': 'From Year',
  'start year': 'From Year',
  'to year': 'To Year',
  'year to': 'To Year',
  'end year': 'To Year',
  'qty ordered': 'QTY Ordered',
  quantity: 'QTY Ordered',
  qty: 'QTY Ordered',
  stock: 'QTY Ordered',
  'upc code': 'UPC Code',
  upc: 'UPC Code',
  length: 'Length',
  width: 'Width',
  height: 'Height',
  weight: 'Weight',
  'cost price': 'Cost Price',
  cost: 'Cost Price',
  'sell price': 'Sell Price',
  price: 'Sell Price',
};

/**
 * Parse inventory XLSX buffer
 * 
 * Note: This requires the 'xlsx' package to be installed.
 * Install with: npm install xlsx
 */
export async function parseInventoryXlsx(buffer: Buffer): Promise<ParseResult> {
  // Dynamic import of xlsx to avoid issues if not installed
  const XLSX = await import('xlsx');

  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert to JSON with headers
  const rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

  const products: ParsedProduct[] = [];
  const errors: ParseError[] = [];
  const productMap = new Map<string, ParsedProduct>();

  let rowNumber = 2; // Excel rows start at 1, and row 1 is headers

  for (const rawRow of rawData) {
    try {
      // Normalize column names
      const row = normalizeRow(rawRow);

      // Validate required fields
      const validationErrors = validateRow(row, rowNumber);
      if (validationErrors.length > 0) {
        errors.push(...validationErrors);
        rowNumber++;
        continue;
      }

      const sku = String(row['SN Part Number']).trim();

      // Check if product already exists (to merge fitments)
      let product = productMap.get(sku);

      if (!product) {
        product = {
          sku,
          name: String(row.Description).trim(),
          description: String(row.Description).trim(),
          masterCategory: String(row['Master Category']).trim(),
          subCategory: row['Sub Category'] ? String(row['Sub Category']).trim() : undefined,
          stockQuantity: Number(row['QTY Ordered']) || 0,
          upc: row['UPC Code'] ? String(row['UPC Code']).trim() : undefined,
          length: row.Length ? Number(row.Length) : undefined,
          width: row.Width ? Number(row.Width) : undefined,
          height: row.Height ? Number(row.Height) : undefined,
          weight: row.Weight ? Number(row.Weight) : undefined,
          costPrice: row['Cost Price'] ? Number(row['Cost Price']) : undefined,
          sellPrice: row['Sell Price'] ? Number(row['Sell Price']) : undefined,
          fitments: [],
        };
        productMap.set(sku, product);
        products.push(product);
      }

      // Add fitment
      const fitment: ParsedFitment = {
        make: String(row.Make).trim(),
        model: String(row.Model).trim(),
        yearStart: Number(row['From Year']),
        yearEnd: Number(row['To Year']),
      };

      // Check for duplicate fitment
      const isDuplicate = product.fitments.some(
        (f) =>
          f.make === fitment.make &&
          f.model === fitment.model &&
          f.yearStart === fitment.yearStart &&
          f.yearEnd === fitment.yearEnd,
      );

      if (!isDuplicate) {
        product.fitments.push(fitment);
      }
    } catch (error) {
      errors.push({
        row: rowNumber,
        field: 'general',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    rowNumber++;
  }

  return {
    products,
    errors,
    totalRows: rawData.length,
    successfulRows: rawData.length - errors.length,
  };
}

/**
 * Normalize row by mapping various column names to standard names
 */
function normalizeRow(
  rawRow: Record<string, unknown>,
): Partial<InventoryXlsxRow> {
  const normalized: Partial<InventoryXlsxRow> = {};

  for (const [key, value] of Object.entries(rawRow)) {
    const normalizedKey = key.toLowerCase().trim();
    const mappedKey = COLUMN_MAPPINGS[normalizedKey];

    if (mappedKey) {
      (normalized as Record<string, unknown>)[mappedKey] = value;
    }
  }

  return normalized;
}

/**
 * Validate a row and return any errors
 */
function validateRow(
  row: Partial<InventoryXlsxRow>,
  rowNumber: number,
): ParseError[] {
  const errors: ParseError[] = [];

  // Required fields
  const requiredFields: Array<{ field: keyof InventoryXlsxRow; label: string }> = [
    { field: 'SN Part Number', label: 'SN Part Number' },
    { field: 'Description', label: 'Description' },
    { field: 'Make', label: 'Make' },
    { field: 'Model', label: 'Model' },
    { field: 'Master Category', label: 'Master Category' },
    { field: 'From Year', label: 'From Year' },
    { field: 'To Year', label: 'To Year' },
    { field: 'QTY Ordered', label: 'QTY Ordered' },
  ];

  for (const { field, label } of requiredFields) {
    const value = row[field];
    if (value === undefined || value === null || value === '') {
      errors.push({
        row: rowNumber,
        field: label,
        message: `${label} is required`,
        value,
      });
    }
  }

  // Validate year range
  if (row['From Year'] && row['To Year']) {
    const fromYear = Number(row['From Year']);
    const toYear = Number(row['To Year']);

    if (isNaN(fromYear) || fromYear < 1900 || fromYear > 2100) {
      errors.push({
        row: rowNumber,
        field: 'From Year',
        message: 'From Year must be a valid year between 1900 and 2100',
        value: row['From Year'],
      });
    }

    if (isNaN(toYear) || toYear < 1900 || toYear > 2100) {
      errors.push({
        row: rowNumber,
        field: 'To Year',
        message: 'To Year must be a valid year between 1900 and 2100',
        value: row['To Year'],
      });
    }

    if (!isNaN(fromYear) && !isNaN(toYear) && fromYear > toYear) {
      errors.push({
        row: rowNumber,
        field: 'Year Range',
        message: 'From Year cannot be greater than To Year',
        value: `${fromYear}-${toYear}`,
      });
    }
  }

  // Validate quantity
  if (row['QTY Ordered'] !== undefined) {
    const qty = Number(row['QTY Ordered']);
    if (isNaN(qty) || qty < 0) {
      errors.push({
        row: rowNumber,
        field: 'QTY Ordered',
        message: 'Quantity must be a non-negative number',
        value: row['QTY Ordered'],
      });
    }
  }

  // Validate numeric fields
  const numericFields: Array<{ field: keyof InventoryXlsxRow; label: string }> = [
    { field: 'Length', label: 'Length' },
    { field: 'Width', label: 'Width' },
    { field: 'Height', label: 'Height' },
    { field: 'Weight', label: 'Weight' },
    { field: 'Cost Price', label: 'Cost Price' },
    { field: 'Sell Price', label: 'Sell Price' },
  ];

  for (const { field, label } of numericFields) {
    const value = row[field];
    if (value !== undefined && value !== null && value !== '') {
      const numValue = Number(value);
      if (isNaN(numValue) || numValue < 0) {
        errors.push({
          row: rowNumber,
          field: label,
          message: `${label} must be a non-negative number`,
          value,
        });
      }
    }
  }

  return errors;
}

/**
 * Generate a sample XLSX file for reference
 */
export async function generateSampleXlsx(): Promise<Buffer> {
  const XLSX = await import('xlsx');

  const sampleData = [
    {
      'SN Part Number': 'SNP-12345',
      Description: 'Oil Filter - Premium',
      Make: 'Chevrolet',
      Model: 'Silverado',
      'Master Category': 'Engine Parts',
      'Sub Category': 'Filters',
      'From Year': 2018,
      'To Year': 2024,
      'QTY Ordered': 50,
      'UPC Code': '123456789012',
      Length: 8.5,
      Width: 4.2,
      Height: 4.0,
      Weight: 1.2,
      'Cost Price': 12.99,
      'Sell Price': 24.99,
    },
    {
      'SN Part Number': 'SNP-12346',
      Description: 'Brake Pad Set - Front',
      Make: 'Ford',
      Model: 'F-150',
      'Master Category': 'Brakes',
      'Sub Category': 'Brake Pads',
      'From Year': 2015,
      'To Year': 2023,
      'QTY Ordered': 25,
      'UPC Code': '123456789013',
      Length: 12.0,
      Width: 6.0,
      Height: 3.0,
      Weight: 4.5,
      'Cost Price': 35.00,
      'Sell Price': 69.99,
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

