/**
 * Utility functions for slug generation and text processing
 * Following the Context.md specifications for slug format
 */

/**
 * Generate a URL-friendly slug from a title
 * @param {string} title - The title to convert to slug
 * @returns {string} URL-friendly slug
 */
export const slugify = (title) => {
  if (!title) return '';
  
  return title
    .toLowerCase()
    .trim()
    // Remove special characters except letters, numbers, spaces, and hyphens
    .replace(/[^a-z0-9\s-]/g, '')
    // Replace multiple spaces with single space
    .replace(/\s+/g, ' ')
    // Replace spaces with hyphens
    .replace(/\s/g, '-')
    // Replace multiple hyphens with single hyphen
    .replace(/-+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, '');
};

/**
 * Generate a unique slug by appending a number if slug already exists
 * @param {string} title - The title to convert to slug
 * @param {Array} existingSlugs - Array of existing slugs to check against
 * @returns {string} Unique slug
 */
export const generateUniqueSlug = (title, existingSlugs = []) => {
  let slug = slugify(title);
  let counter = 1;
  let uniqueSlug = slug;
  
  while (existingSlugs.includes(uniqueSlug)) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
  
  return uniqueSlug;
};

/**
 * Validate if a slug follows the required format
 * @param {string} slug - The slug to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidSlug = (slug) => {
  if (!slug) return false;
  
  // Check if slug matches the required pattern: lowercase letters, numbers, and hyphens only
  const slugPattern = /^[a-z0-9-]+$/;
  return slugPattern.test(slug);
};

/**
 * Clean and format text for SEO-friendly content
 * @param {string} text - The text to clean
 * @returns {string} Cleaned text
 */
export const cleanText = (text) => {
  if (!text) return '';
  
  return text
    .trim()
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    // Remove HTML tags
    .replace(/<[^>]*>/g, '');
};

/**
 * Generate an excerpt from content
 * @param {string} content - The content to generate excerpt from
 * @param {number} maxLength - Maximum length of excerpt (default: 150)
 * @returns {string} Excerpt
 */
export const generateExcerpt = (content, maxLength = 150) => {
  if (!content) return '';
  
  const cleanContent = cleanText(content);
  
  if (cleanContent.length <= maxLength) {
    return cleanContent;
  }
  
  // Truncate to maxLength and add ellipsis
  return cleanContent.substring(0, maxLength).trim() + '...';
};

/**
 * Calculate read time based on content length
 * @param {string} content - The content to calculate read time for
 * @param {number} wordsPerMinute - Average reading speed (default: 200)
 * @returns {number} Estimated read time in minutes
 */
export const calculateReadTime = (content, wordsPerMinute = 200) => {
  if (!content) return 0;
  
  const cleanContent = cleanText(content);
  const wordCount = cleanContent.split(/\s+/).length;
  const readTime = Math.ceil(wordCount / wordsPerMinute);
  
  return Math.max(1, readTime); // Minimum 1 minute
};
