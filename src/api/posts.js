// API functions for posts CRUD operations
// These functions will handle communication with the backend API

const API_BASE_URL = '/api/posts';

/**
 * Get all posts
 * @returns {Promise<Array>} Array of posts
 */
export const getAllPosts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}`);
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    const data = await response.json();
    return data.posts || [];
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

/**
 * Get a single post by slug
 * @param {string} slug - The post slug
 * @returns {Promise<Object>} Post data
 */
export const getPostBySlug = async (slug) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${slug}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Post not found');
      }
      throw new Error('Failed to fetch post');
    }
    const data = await response.json();
    return data.post;
  } catch (error) {
    console.error('Error fetching post:', error);
    throw error;
  }
};

/**
 * Create a new post
 * @param {Object} postData - Post data { title, content }
 * @returns {Promise<Object>} Created post data
 */
export const createPost = async (postData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create post');
    }
    
    const data = await response.json();
    return data.post;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

/**
 * Update an existing post
 * @param {string} slug - The post slug
 * @param {Object} postData - Updated post data { title, content }
 * @returns {Promise<Object>} Updated post data
 */
export const updatePost = async (slug, postData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${slug}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update post');
    }
    
    const data = await response.json();
    return data.post;
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

/**
 * Delete a post
 * @param {string} slug - The post slug
 * @returns {Promise<Object>} Success response
 */
export const deletePost = async (slug) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${slug}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete post');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

/**
 * Generate a slug from a title
 * @param {string} title - The post title
 * @returns {string} Generated slug
 */
export const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};
