import { connectToDatabase } from '../../../utils/database.js';
import Post from '../../../models/Post.js';
import { slugify } from '../../../utils/slugify.js';

/**
 * POST /api/posts/create - Create a new post
 * Creates a new blog post with validation and slug generation
 */
export default async function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    // Connect to database
    await connectToDatabase();

    // Get request body
    const { 
      title, 
      content, 
      slug: customSlug,
      category = 'Uncategorized',
      tags = [],
      status = 'draft',
      metaTitle,
      metaDescription,
      keywords = [],
      featuredImage
    } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    // Validate title length
    if (title.length < 3 || title.length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Title must be between 3 and 200 characters'
      });
    }

    // Validate content length
    if (content.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Content must be at least 10 characters'
      });
    }

    // Generate slug
    let slug = customSlug || slugify(title);
    
    // Check if slug already exists
    const existingPost = await Post.findOne({ slug, deletedAt: null });
    if (existingPost) {
      // Generate unique slug
      let counter = 1;
      let uniqueSlug = slug;
      while (await Post.findOne({ slug: uniqueSlug, deletedAt: null })) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      }
      slug = uniqueSlug;
    }

    // Prepare post data
    const postData = {
      title: title.trim(),
      content: content.trim(),
      slug,
      category: category.trim(),
      tags: Array.isArray(tags) ? tags.map(tag => tag.trim().toLowerCase()) : [],
      status,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || content.replace(/<[^>]*>/g, '').substring(0, 160) + '...',
      keywords: Array.isArray(keywords) ? keywords.map(keyword => keyword.trim().toLowerCase()) : [],
      featuredImage,
      author: {
        name: 'Admin', // Default author - can be enhanced with authentication
        email: 'admin@example.com',
        avatar: null
      }
    };

    // Set publishedAt if status is published
    if (status === 'published') {
      postData.publishedAt = new Date();
    }

    // Create new post
    const newPost = new Post(postData);
    const savedPost = await newPost.save();

    // Format response
    const formattedPost = {
      id: savedPost._id,
      title: savedPost.title,
      slug: savedPost.slug,
      excerpt: savedPost.excerpt,
      content: savedPost.content,
      author: savedPost.author,
      category: savedPost.category,
      tags: savedPost.tags,
      status: savedPost.status,
      viewCount: savedPost.viewCount,
      readTime: savedPost.readTime,
      featuredImage: savedPost.featuredImage,
      createdAt: savedPost.createdAt,
      updatedAt: savedPost.updatedAt,
      publishedAt: savedPost.publishedAt,
      formattedDate: savedPost.formattedDate
    };

    // Return success response
    return res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: formattedPost
    });

  } catch (error) {
    console.error('Error creating post:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A post with this slug already exists'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
