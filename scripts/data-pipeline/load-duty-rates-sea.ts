/**
 * Load SE Asia duty rates for common import categories
 * Covers: Vietnam, Thailand, Indonesia, Cambodia, China (comparison)
 */

import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const OUTPUT_FILE = path.join(DATA_DIR, 'duty-rates-sea.json');

interface DutyRate {
  hts_chapter: number;
  category: string;
  subcategory: string;
  hts_range: string;
  country: string;
  country_code: string;
  general_rate: string;
  general_rate_pct: number;
  section_301_rate?: string;
  section_301_pct?: number;
  effective_rate_pct: number;
  gsp_eligible: boolean;
  gsp_status?: string;
  ldc_preference: boolean;
  fta_applicable?: string;
  ad_cvd_flag: boolean;
  ad_cvd_details?: string;
  notes?: string;
}

function getDutyRates(): DutyRate[] {
  return [
    // ======================================
    // CHAPTER 03 - SEAFOOD
    // ======================================
    // Vietnam
    { hts_chapter: 3, category: 'Seafood', subcategory: 'Frozen shrimp', hts_range: '0306.17', country: 'Vietnam', country_code: 'VN', general_rate: 'Free', general_rate_pct: 0, effective_rate_pct: 0, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: true, ad_cvd_details: 'AD order on frozen warmwater shrimp: 25.76% (company-specific rates vary 0%-25.76%)', notes: 'Major AD case - check company-specific rates' },
    { hts_chapter: 3, category: 'Seafood', subcategory: 'Pangasius/basa fillets', hts_range: '0304.62', country: 'Vietnam', country_code: 'VN', general_rate: 'Free', general_rate_pct: 0, effective_rate_pct: 0, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: true, ad_cvd_details: 'AD order on frozen fish fillets (pangasius/basa): 2.39 USD/kg country-wide' },
    // Thailand
    { hts_chapter: 3, category: 'Seafood', subcategory: 'Frozen shrimp', hts_range: '0306.17', country: 'Thailand', country_code: 'TH', general_rate: 'Free', general_rate_pct: 0, effective_rate_pct: 0, gsp_eligible: true, gsp_status: 'Eligible', ldc_preference: false, ad_cvd_flag: true, ad_cvd_details: 'AD order on frozen warmwater shrimp: 5.34%' },
    { hts_chapter: 3, category: 'Seafood', subcategory: 'Tuna, prepared', hts_range: '1604.14', country: 'Thailand', country_code: 'TH', general_rate: '35%', general_rate_pct: 35, effective_rate_pct: 35, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false, notes: 'High duty rate on canned tuna - Thailand is largest global exporter' },
    // Indonesia
    { hts_chapter: 3, category: 'Seafood', subcategory: 'Frozen shrimp', hts_range: '0306.17', country: 'Indonesia', country_code: 'ID', general_rate: 'Free', general_rate_pct: 0, effective_rate_pct: 0, gsp_eligible: true, gsp_status: 'Eligible', ldc_preference: false, ad_cvd_flag: true, ad_cvd_details: 'AD order on frozen warmwater shrimp: 7.74%' },
    // Cambodia
    { hts_chapter: 3, category: 'Seafood', subcategory: 'Frozen shrimp', hts_range: '0306.17', country: 'Cambodia', country_code: 'KH', general_rate: 'Free', general_rate_pct: 0, effective_rate_pct: 0, gsp_eligible: true, gsp_status: 'LDC - duty-free', ldc_preference: true, ad_cvd_flag: false },
    // China (comparison)
    { hts_chapter: 3, category: 'Seafood', subcategory: 'Frozen shrimp', hts_range: '0306.17', country: 'China', country_code: 'CN', general_rate: 'Free', general_rate_pct: 0, section_301_rate: '25%', section_301_pct: 25, effective_rate_pct: 25, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: true, ad_cvd_details: 'AD order on frozen warmwater shrimp: 112.81% + Section 301 List 3' },

    // ======================================
    // CHAPTER 16 - PREPARED FOODS
    // ======================================
    { hts_chapter: 16, category: 'Prepared Foods', subcategory: 'Prepared shrimp', hts_range: '1605.21', country: 'Vietnam', country_code: 'VN', general_rate: 'Free', general_rate_pct: 0, effective_rate_pct: 0, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false },
    { hts_chapter: 16, category: 'Prepared Foods', subcategory: 'Prepared shrimp', hts_range: '1605.21', country: 'Thailand', country_code: 'TH', general_rate: 'Free', general_rate_pct: 0, effective_rate_pct: 0, gsp_eligible: true, gsp_status: 'Eligible', ldc_preference: false, ad_cvd_flag: false },
    { hts_chapter: 16, category: 'Prepared Foods', subcategory: 'Prepared fish, canned', hts_range: '1604.20', country: 'Vietnam', country_code: 'VN', general_rate: '4%', general_rate_pct: 4, effective_rate_pct: 4, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false },
    { hts_chapter: 16, category: 'Prepared Foods', subcategory: 'Prepared fish, canned', hts_range: '1604.20', country: 'Thailand', country_code: 'TH', general_rate: '4%', general_rate_pct: 4, effective_rate_pct: 4, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false },
    { hts_chapter: 16, category: 'Prepared Foods', subcategory: 'Prepared fish, canned', hts_range: '1604.20', country: 'China', country_code: 'CN', general_rate: '4%', general_rate_pct: 4, section_301_rate: '25%', section_301_pct: 25, effective_rate_pct: 29, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false },

    // ======================================
    // CHAPTER 39 - PLASTICS
    // ======================================
    { hts_chapter: 39, category: 'Plastics', subcategory: 'Plastic bags & sacks', hts_range: '3923.21', country: 'Vietnam', country_code: 'VN', general_rate: '3%', general_rate_pct: 3, effective_rate_pct: 3, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false },
    { hts_chapter: 39, category: 'Plastics', subcategory: 'Plastic bags & sacks', hts_range: '3923.21', country: 'Thailand', country_code: 'TH', general_rate: '3%', general_rate_pct: 3, effective_rate_pct: 3, gsp_eligible: true, gsp_status: 'Eligible', ldc_preference: false, ad_cvd_flag: false },
    { hts_chapter: 39, category: 'Plastics', subcategory: 'Plastic bags & sacks', hts_range: '3923.21', country: 'Indonesia', country_code: 'ID', general_rate: '3%', general_rate_pct: 3, effective_rate_pct: 3, gsp_eligible: true, gsp_status: 'Eligible', ldc_preference: false, ad_cvd_flag: false },
    { hts_chapter: 39, category: 'Plastics', subcategory: 'Plastic bags & sacks', hts_range: '3923.21', country: 'China', country_code: 'CN', general_rate: '3%', general_rate_pct: 3, section_301_rate: '25%', section_301_pct: 25, effective_rate_pct: 28, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false },
    { hts_chapter: 39, category: 'Plastics', subcategory: 'Plastic articles nesoi', hts_range: '3926.90', country: 'Vietnam', country_code: 'VN', general_rate: '5.3%', general_rate_pct: 5.3, effective_rate_pct: 5.3, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false },
    { hts_chapter: 39, category: 'Plastics', subcategory: 'Plastic articles nesoi', hts_range: '3926.90', country: 'China', country_code: 'CN', general_rate: '5.3%', general_rate_pct: 5.3, section_301_rate: '25%', section_301_pct: 25, effective_rate_pct: 30.3, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false },

    // ======================================
    // CHAPTER 42 - LEATHER GOODS
    // ======================================
    { hts_chapter: 42, category: 'Leather Goods', subcategory: 'Handbags, leather', hts_range: '4202.21', country: 'Vietnam', country_code: 'VN', general_rate: '8%', general_rate_pct: 8, effective_rate_pct: 8, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false },
    { hts_chapter: 42, category: 'Leather Goods', subcategory: 'Handbags, leather', hts_range: '4202.21', country: 'Cambodia', country_code: 'KH', general_rate: '8%', general_rate_pct: 8, effective_rate_pct: 0, gsp_eligible: true, gsp_status: 'LDC - duty-free', ldc_preference: true, ad_cvd_flag: false },
    { hts_chapter: 42, category: 'Leather Goods', subcategory: 'Handbags, leather', hts_range: '4202.21', country: 'China', country_code: 'CN', general_rate: '8%', general_rate_pct: 8, section_301_rate: '7.5%', section_301_pct: 7.5, effective_rate_pct: 15.5, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false, notes: 'Section 301 List 4A' },
    { hts_chapter: 42, category: 'Leather Goods', subcategory: 'Travel bags, plastic', hts_range: '4202.92', country: 'Vietnam', country_code: 'VN', general_rate: '20%', general_rate_pct: 20, effective_rate_pct: 20, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false },
    { hts_chapter: 42, category: 'Leather Goods', subcategory: 'Travel bags, plastic', hts_range: '4202.92', country: 'China', country_code: 'CN', general_rate: '20%', general_rate_pct: 20, section_301_rate: '7.5%', section_301_pct: 7.5, effective_rate_pct: 27.5, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false },

    // ======================================
    // CHAPTER 61 - KNITTED APPAREL
    // ======================================
    { hts_chapter: 61, category: 'Apparel (Knitted)', subcategory: 'T-shirts, cotton', hts_range: '6109.10', country: 'Vietnam', country_code: 'VN', general_rate: '16.5%', general_rate_pct: 16.5, effective_rate_pct: 16.5, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false, notes: 'Vietnam is #2 apparel exporter to US' },
    { hts_chapter: 61, category: 'Apparel (Knitted)', subcategory: 'T-shirts, cotton', hts_range: '6109.10', country: 'Cambodia', country_code: 'KH', general_rate: '16.5%', general_rate_pct: 16.5, effective_rate_pct: 16.5, gsp_eligible: false, gsp_status: 'Not covered under GSP for apparel', ldc_preference: false, ad_cvd_flag: false, notes: 'Apparel excluded from GSP even for LDCs' },
    { hts_chapter: 61, category: 'Apparel (Knitted)', subcategory: 'T-shirts, cotton', hts_range: '6109.10', country: 'Indonesia', country_code: 'ID', general_rate: '16.5%', general_rate_pct: 16.5, effective_rate_pct: 16.5, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false },
    { hts_chapter: 61, category: 'Apparel (Knitted)', subcategory: 'T-shirts, cotton', hts_range: '6109.10', country: 'Thailand', country_code: 'TH', general_rate: '16.5%', general_rate_pct: 16.5, effective_rate_pct: 16.5, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false },
    { hts_chapter: 61, category: 'Apparel (Knitted)', subcategory: 'T-shirts, cotton', hts_range: '6109.10', country: 'China', country_code: 'CN', general_rate: '16.5%', general_rate_pct: 16.5, section_301_rate: '7.5%', section_301_pct: 7.5, effective_rate_pct: 24, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false, notes: 'Section 301 List 4A' },
    { hts_chapter: 61, category: 'Apparel (Knitted)', subcategory: 'Sweaters, man-made fiber', hts_range: '6110.30', country: 'Vietnam', country_code: 'VN', general_rate: '32%', general_rate_pct: 32, effective_rate_pct: 32, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false },
    { hts_chapter: 61, category: 'Apparel (Knitted)', subcategory: 'Sweaters, man-made fiber', hts_range: '6110.30', country: 'China', country_code: 'CN', general_rate: '32%', general_rate_pct: 32, section_301_rate: '7.5%', section_301_pct: 7.5, effective_rate_pct: 39.5, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false },

    // ======================================
    // CHAPTER 62 - WOVEN APPAREL
    // ======================================
    { hts_chapter: 62, category: 'Apparel (Woven)', subcategory: 'Men\'s trousers, cotton', hts_range: '6203.42', country: 'Vietnam', country_code: 'VN', general_rate: '16.6%', general_rate_pct: 16.6, effective_rate_pct: 16.6, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false },
    { hts_chapter: 62, category: 'Apparel (Woven)', subcategory: 'Men\'s trousers, cotton', hts_range: '6203.42', country: 'Cambodia', country_code: 'KH', general_rate: '16.6%', general_rate_pct: 16.6, effective_rate_pct: 16.6, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false },
    { hts_chapter: 62, category: 'Apparel (Woven)', subcategory: 'Men\'s trousers, cotton', hts_range: '6203.42', country: 'Indonesia', country_code: 'ID', general_rate: '16.6%', general_rate_pct: 16.6, effective_rate_pct: 16.6, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false },
    { hts_chapter: 62, category: 'Apparel (Woven)', subcategory: 'Men\'s trousers, cotton', hts_range: '6203.42', country: 'China', country_code: 'CN', general_rate: '16.6%', general_rate_pct: 16.6, section_301_rate: '7.5%', section_301_pct: 7.5, effective_rate_pct: 24.1, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false },
    { hts_chapter: 62, category: 'Apparel (Woven)', subcategory: 'Men\'s shirts, cotton', hts_range: '6205.20', country: 'Vietnam', country_code: 'VN', general_rate: '19.7%', general_rate_pct: 19.7, effective_rate_pct: 19.7, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false },
    { hts_chapter: 62, category: 'Apparel (Woven)', subcategory: 'Men\'s shirts, cotton', hts_range: '6205.20', country: 'Thailand', country_code: 'TH', general_rate: '19.7%', general_rate_pct: 19.7, effective_rate_pct: 19.7, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false },

    // ======================================
    // CHAPTER 64 - FOOTWEAR
    // ======================================
    { hts_chapter: 64, category: 'Footwear', subcategory: 'Sports footwear, rubber/plastic', hts_range: '6402.19', country: 'Vietnam', country_code: 'VN', general_rate: '20%', general_rate_pct: 20, effective_rate_pct: 20, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false, notes: 'Vietnam is #1 footwear exporter to US' },
    { hts_chapter: 64, category: 'Footwear', subcategory: 'Sports footwear, rubber/plastic', hts_range: '6402.19', country: 'Indonesia', country_code: 'ID', general_rate: '20%', general_rate_pct: 20, effective_rate_pct: 20, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false },
    { hts_chapter: 64, category: 'Footwear', subcategory: 'Sports footwear, rubber/plastic', hts_range: '6402.19', country: 'China', country_code: 'CN', general_rate: '20%', general_rate_pct: 20, section_301_rate: '25%', section_301_pct: 25, effective_rate_pct: 45, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false, notes: 'Section 301 List 3' },
    { hts_chapter: 64, category: 'Footwear', subcategory: 'Footwear, textile upper', hts_range: '6404.19', country: 'Vietnam', country_code: 'VN', general_rate: '37.5%', general_rate_pct: 37.5, effective_rate_pct: 37.5, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false },
    { hts_chapter: 64, category: 'Footwear', subcategory: 'Footwear, textile upper', hts_range: '6404.19', country: 'Cambodia', country_code: 'KH', general_rate: '37.5%', general_rate_pct: 37.5, effective_rate_pct: 37.5, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false, notes: 'Footwear excluded from GSP' },
    { hts_chapter: 64, category: 'Footwear', subcategory: 'Footwear, textile upper', hts_range: '6404.19', country: 'China', country_code: 'CN', general_rate: '37.5%', general_rate_pct: 37.5, section_301_rate: '7.5%', section_301_pct: 7.5, effective_rate_pct: 45, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false },
    { hts_chapter: 64, category: 'Footwear', subcategory: 'Leather footwear', hts_range: '6403.99', country: 'Vietnam', country_code: 'VN', general_rate: '10%', general_rate_pct: 10, effective_rate_pct: 10, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false },

    // ======================================
    // CHAPTER 85 - ELECTRONICS
    // ======================================
    { hts_chapter: 85, category: 'Electronics', subcategory: 'Smartphones', hts_range: '8517.12', country: 'Vietnam', country_code: 'VN', general_rate: 'Free', general_rate_pct: 0, effective_rate_pct: 0, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false, notes: 'Samsung major manufacturer in Vietnam' },
    { hts_chapter: 85, category: 'Electronics', subcategory: 'Smartphones', hts_range: '8517.12', country: 'China', country_code: 'CN', general_rate: 'Free', general_rate_pct: 0, effective_rate_pct: 0, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false, notes: 'ITA product - exempt from Section 301' },
    { hts_chapter: 85, category: 'Electronics', subcategory: 'Laptops', hts_range: '8471.30', country: 'Vietnam', country_code: 'VN', general_rate: 'Free', general_rate_pct: 0, effective_rate_pct: 0, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false },
    { hts_chapter: 85, category: 'Electronics', subcategory: 'Laptops', hts_range: '8471.30', country: 'China', country_code: 'CN', general_rate: 'Free', general_rate_pct: 0, effective_rate_pct: 0, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false, notes: 'ITA product - exempt from Section 301' },
    { hts_chapter: 85, category: 'Electronics', subcategory: 'Li-ion batteries', hts_range: '8507.60', country: 'Vietnam', country_code: 'VN', general_rate: '3.4%', general_rate_pct: 3.4, effective_rate_pct: 3.4, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false },
    { hts_chapter: 85, category: 'Electronics', subcategory: 'Li-ion batteries', hts_range: '8507.60', country: 'China', country_code: 'CN', general_rate: '3.4%', general_rate_pct: 3.4, section_301_rate: '25%', section_301_pct: 25, effective_rate_pct: 28.4, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false, notes: 'Section 301 List 3 - major battery AD/CVD cases pending' },
    { hts_chapter: 85, category: 'Electronics', subcategory: 'Solar cells', hts_range: '8541.40', country: 'Vietnam', country_code: 'VN', general_rate: 'Free', general_rate_pct: 0, effective_rate_pct: 0, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: true, ad_cvd_details: 'AD/CVD on solar cells: varies by company, circumvention investigations active' },
    { hts_chapter: 85, category: 'Electronics', subcategory: 'Solar cells', hts_range: '8541.40', country: 'Thailand', country_code: 'TH', general_rate: 'Free', general_rate_pct: 0, effective_rate_pct: 0, gsp_eligible: true, gsp_status: 'Eligible', ldc_preference: false, ad_cvd_flag: true, ad_cvd_details: 'AD/CVD on solar cells: varies, circumvention investigations' },
    { hts_chapter: 85, category: 'Electronics', subcategory: 'Solar cells', hts_range: '8541.40', country: 'China', country_code: 'CN', general_rate: 'Free', general_rate_pct: 0, section_301_rate: '25%', section_301_pct: 25, effective_rate_pct: 25, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: true, ad_cvd_details: 'AD 238.95% / CVD 15.97% + Section 301' },
    { hts_chapter: 85, category: 'Electronics', subcategory: 'Headphones/earphones', hts_range: '8518.30', country: 'Vietnam', country_code: 'VN', general_rate: 'Free', general_rate_pct: 0, effective_rate_pct: 0, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false },
    { hts_chapter: 85, category: 'Electronics', subcategory: 'Headphones/earphones', hts_range: '8518.30', country: 'China', country_code: 'CN', general_rate: 'Free', general_rate_pct: 0, section_301_rate: '7.5%', section_301_pct: 7.5, effective_rate_pct: 7.5, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false, notes: 'Section 301 List 4A' },

    // ======================================
    // ADDITIONAL CATEGORIES - CPG & FOOD
    // ======================================
    { hts_chapter: 9, category: 'CPG', subcategory: 'Coffee, green', hts_range: '0901.11', country: 'Vietnam', country_code: 'VN', general_rate: 'Free', general_rate_pct: 0, effective_rate_pct: 0, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false, notes: 'Vietnam is #2 global coffee producer' },
    { hts_chapter: 9, category: 'CPG', subcategory: 'Pepper', hts_range: '0904.11', country: 'Vietnam', country_code: 'VN', general_rate: 'Free', general_rate_pct: 0, effective_rate_pct: 0, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false, notes: 'Vietnam is #1 global pepper exporter' },
    { hts_chapter: 15, category: 'CPG', subcategory: 'Palm oil', hts_range: '1511.10', country: 'Indonesia', country_code: 'ID', general_rate: 'Free', general_rate_pct: 0, effective_rate_pct: 0, gsp_eligible: true, gsp_status: 'Eligible', ldc_preference: false, ad_cvd_flag: false, notes: 'Indonesia is #1 global palm oil producer' },
    { hts_chapter: 40, category: 'CPG', subcategory: 'Natural rubber', hts_range: '4001.21', country: 'Thailand', country_code: 'TH', general_rate: 'Free', general_rate_pct: 0, effective_rate_pct: 0, gsp_eligible: true, gsp_status: 'Eligible', ldc_preference: false, ad_cvd_flag: false, notes: 'Thailand is #1 global rubber producer' },
    { hts_chapter: 40, category: 'CPG', subcategory: 'Rubber gloves', hts_range: '4015.19', country: 'Thailand', country_code: 'TH', general_rate: '3%', general_rate_pct: 3, effective_rate_pct: 0, gsp_eligible: true, gsp_status: 'GSP duty-free', ldc_preference: false, ad_cvd_flag: false },
    { hts_chapter: 40, category: 'CPG', subcategory: 'Rubber gloves', hts_range: '4015.19', country: 'Vietnam', country_code: 'VN', general_rate: '3%', general_rate_pct: 3, effective_rate_pct: 3, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false },
    { hts_chapter: 40, category: 'CPG', subcategory: 'Rubber gloves', hts_range: '4015.19', country: 'China', country_code: 'CN', general_rate: '3%', general_rate_pct: 3, section_301_rate: '25%', section_301_pct: 25, effective_rate_pct: 28, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false },

    // ======================================
    // FURNITURE & WOOD (Chapter 94, 44)
    // ======================================
    { hts_chapter: 94, category: 'Furniture', subcategory: 'Wooden bedroom furniture', hts_range: '9403.50', country: 'Vietnam', country_code: 'VN', general_rate: 'Free', general_rate_pct: 0, effective_rate_pct: 0, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: true, ad_cvd_details: 'AD/CVD on wooden bedroom furniture from Vietnam: AD 0%-250.63%, CVD pending' },
    { hts_chapter: 94, category: 'Furniture', subcategory: 'Wooden bedroom furniture', hts_range: '9403.50', country: 'Indonesia', country_code: 'ID', general_rate: 'Free', general_rate_pct: 0, effective_rate_pct: 0, gsp_eligible: true, gsp_status: 'Eligible', ldc_preference: false, ad_cvd_flag: false },
    { hts_chapter: 94, category: 'Furniture', subcategory: 'Wooden bedroom furniture', hts_range: '9403.50', country: 'China', country_code: 'CN', general_rate: 'Free', general_rate_pct: 0, section_301_rate: '25%', section_301_pct: 25, effective_rate_pct: 25, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: true, ad_cvd_details: 'AD 0%-216.01% on wooden bedroom furniture' },
    { hts_chapter: 44, category: 'Wood Products', subcategory: 'Plywood, tropical', hts_range: '4412.34', country: 'Vietnam', country_code: 'VN', general_rate: '8%', general_rate_pct: 8, effective_rate_pct: 8, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: true, ad_cvd_details: 'AD/CVD on hardwood plywood from Vietnam' },
    { hts_chapter: 44, category: 'Wood Products', subcategory: 'Plywood, tropical', hts_range: '4412.34', country: 'Indonesia', country_code: 'ID', general_rate: '8%', general_rate_pct: 8, effective_rate_pct: 8, gsp_eligible: false, ldc_preference: false, ad_cvd_flag: false },
  ];
}

async function main() {
  console.log('=== SE Asia Duty Rate Loader ===\n');

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const rates = getDutyRates();

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(rates, null, 2));

  // Summary
  const countryCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};
  let adCvdCount = 0;
  let section301Count = 0;
  let gspCount = 0;

  for (const rate of rates) {
    countryCounts[rate.country] = (countryCounts[rate.country] || 0) + 1;
    categoryCounts[rate.category] = (categoryCounts[rate.category] || 0) + 1;
    if (rate.ad_cvd_flag) adCvdCount++;
    if (rate.section_301_pct) section301Count++;
    if (rate.gsp_eligible) gspCount++;
  }

  console.log(`Loaded ${rates.length} duty rate entries to ${OUTPUT_FILE}\n`);
  console.log('By country:');
  for (const [country, count] of Object.entries(countryCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${country}: ${count} entries`);
  }
  console.log('\nBy category:');
  for (const [cat, count] of Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count} entries`);
  }
  console.log(`\nAD/CVD flagged: ${adCvdCount}`);
  console.log(`Section 301 entries: ${section301Count}`);
  console.log(`GSP eligible: ${gspCount}`);
}

main().catch(console.error);
