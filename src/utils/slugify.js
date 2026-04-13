/**
 * Convert a peptide name (or any string) to a URL-safe slug.
 *
 * Examples:
 *   "BPC-157"                                    → "bpc-157"
 *   "NAD+ (Nicotinamide Adenine Dinucleotide)"   → "nad-plus-nicotinamide-adenine-dinucleotide"
 *   "TB-500 (Thymosin Beta-4)"                   → "tb-500-thymosin-beta-4"
 *   "GHK-Cu (Copper Peptide)"                    → "ghk-cu-copper-peptide"
 *   "PT-141 (Bremelanotide)"                     → "pt-141-bremelanotide"
 *
 * @param {string} text - The string to slugify
 * @returns {string} A URL-safe slug
 */
export const slugify = (text) => {
    if (!text) return '';
    return text
        .toLowerCase()
        .replace(/\+/g, '-plus')       // NAD+ → nad-plus
        .replace(/&/g, '-and')         // & → -and
        .replace(/[()[\]{}]/g, '')     // Remove brackets/parens
        .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric with hyphens
        .replace(/^-+|-+$/g, '')      // Trim leading/trailing hyphens
        .replace(/-{2,}/g, '-');       // Collapse multiple hyphens
};

/**
 * Build the encyclopedia URL for a peptide.
 * @param {string} name - The peptide name
 * @returns {string} e.g. "/encyclopedia/bpc-157"
 */
export const peptideUrl = (name) => {
    return `/encyclopedia/${slugify(name)}`;
};
