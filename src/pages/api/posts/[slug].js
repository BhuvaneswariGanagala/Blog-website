import { connectToDatabase } from '../../../utils/database.js';
import Post from '../../../models/Post.js';
import { slugify } from '../../../utils/slugify.js';

/**
 * Dynamic API endpoint for individual posts by slug
 * Supports GET, PUT, and DELETE operations
 */
export default async function handler(req, res) {
  const { slug } = req.query;
  const { method } = req;

  // Validate slug parameter
  if (!slug) {
    return res.status(400).json({
      success: false,
      message: 'Slug parameter is required'
    });
  }

  try {
    // Connect to database
    await connectToDatabase();

    // Handle different HTTP methods
    switch (method) {
      case 'GET':
        return await getPost(req, res, slug);
      case 'PUT':
        return await updatePost(req, res, slug);
      case 'DELETE':
        return await deletePost(req, res, slug);
      default:
        return res.status(405).json({
          success: false,
          message: 'Method not allowed'
        });
    }
  } catch (error) {
    console.error(`Error in ${method} /api/posts/[slug]:`, error);
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * GET - Retrieve a single post by slug
 */
async function getPost(req, res, slug) {
  try {
    // Find post by slug
    const post = await Post.findOne({ 
      slug, 
      deletedAt: null 
    }).select('-__v');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Increment view count
    await post.incrementViews();

    // Format response
    const formattedPost = {
      id: post._id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      author: post.author,
      category: post.category,
      tags: post.tags,
      status: post.status,
      viewCount: post.viewCount + 1, // Include the incremented count
      readTime: post.readTime,
      featuredImage: post.featuredImage,
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      keywords: post.keywords,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      publishedAt: post.publishedAt,
      formattedDate: post.formattedDate
    };

    return res.status(200).json({
      success: true,
      post: formattedPost
    });

  } catch (error) {
    console.error('Error fetching post:', error);
    throw error;
  }
}

/**
 * PUT - Update an existing post by slug
 */
async function updatePost(req, res, slug) {
  try {
    // Find existing post
    const existingPost = await Post.findOne({ 
      slug, 
      deletedAt: null 
    });

    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Get request body
    const { 
      title, 
      content, 
      newSlug,
      category,
      tags,
      status,
      metaTitle,
      metaDescription,
      keywords,
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

    // Handle slug update if title changed
    let updatedSlug = slug;
    if (title !== existingPost.title && newSlug) {
      updatedSlug = slugify(newSlug);
      
      // Check if new slug already exists
      const slugExists = await Post.findOne({ 
        slug: updatedSlug, 
        _id: { $ne: existingPost._id },
        deletedAt: null 
      });
      
      if (slugExists) {
        return res.status(400).json({
          success: false,
          message: 'A post with this slug already exists'
        });
      }
    }

    // Prepare update data
    const updateData = {
      title: title.trim(),
      content: content.trim(),
      slug: updatedSlug,
      category: category || existingPost.category,
      tags: Array.isArray(tags) ? tags.map(tag => tag.trim().toLowerCase()) : existingPost.tags,
      status: status || existingPost.status,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || content.replace(/<[^>]*>/g, '').substring(0, 160) + '...',
      keywords: Array.isArray(keywords) ? keywords.map(keyword => keyword.trim().toLowerCase()) : existingPost.keywords,
      featuredImage: featuredImage || existingPost.featuredImage,
      updatedAt: new Date()
    };

    // Set publishedAt if status changes to published
    if (status === 'published' && existingPost.status !== 'published') {
      updateData.publishedAt = new Date();
    }

    // Update post
    const updatedPost = await Post.findByIdAndUpdate(
      existingPost._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');

    // Format response
    const formattedPost = {
      id: updatedPost._id,
      title: updatedPost.title,
      slug: updatedPost.slug,
      excerpt: updatedPost.excerpt,
      content: updatedPost.content,
      author: updatedPost.author,
      category: updatedPost.category,
      tags: updatedPost.tags,
      status: updatedPost.status,
      viewCount: updatedPost.viewCount,
      readTime: updatedPost.readTime,
      featuredImage: updatedPost.featuredImage,
      metaTitle: updatedPost.metaTitle,
      metaDescription: updatedPost.metaDescription,
      keywords: updatedPost.keywords,
      createdAt: updatedPost.createdAt,
      updatedAt: updatedPost.updatedAt,
      publishedAt: updatedPost.publishedAt,
      formattedDate: updatedPost.formattedDate
    };

    return res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      post: formattedPost
    });

  } catch (error) {
    console.error('Error updating post:', error);
    
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

    throw error;
  }
}

/**
 * DELETE - Soft delete a post by slug
 */
async function deletePost(req, res, slug) {
  try {
    // Find post by slug
    const post = await Post.findOne({ 
      slug, 
      deletedAt: null 
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Soft delete the post
    await post.softDelete();

    return res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
}
