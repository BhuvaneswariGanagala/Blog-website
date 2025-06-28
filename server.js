import express from 'express';
import cors from 'cors';
import { connectToDatabase } from './src/utils/database.js';
import Post from './src/models/Post.js';
import { slugify } from './src/utils/slugify.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Connect to database
connectToDatabase().then(() => {
  console.log('✅ Database connected');
}).catch(err => {
  console.error('❌ Database connection failed:', err);
});

// API Routes

// GET /api/posts - Get all posts
app.get('/api/posts', async (req, res) => {
  try {
    const { 
      status = 'published', 
      category, 
      tag, 
      author, 
      limit = 10, 
      page = 1,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build query
    let query = { deletedAt: null };

    // Filter by status
    if (status === 'published') {
      query.status = 'published';
      query.publishedAt = { $lte: new Date() };
    } else if (status === 'draft') {
      query.status = 'draft';
    } else if (status === 'all') {
      // Don't filter by status
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by tag
    if (tag) {
      query.tags = tag;
    }

    // Filter by author
    if (author) {
      query['author.name'] = author;
    }

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const posts = await Post.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v')
      .lean();

    // Get total count for pagination
    const total = await Post.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Format response
    const formattedPosts = posts.map(post => ({
      id: post._id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      author: post.author,
      category: post.category,
      tags: post.tags,
      status: post.status,
      viewCount: post.viewCount,
      readTime: post.readTime,
      featuredImage: post.featuredImage,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      publishedAt: post.publishedAt,
      formattedDate: post.formattedDate
    }));

    return res.status(200).json({
      success: true,
      posts: formattedPosts,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalPosts: total,
        hasNextPage,
        hasPrevPage,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching posts:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/posts/create - Create a new post
app.post('/api/posts/create', async (req, res) => {
  try {
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
});

// GET /api/posts/:slug - Get a single post
app.get('/api/posts/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

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
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/posts/:slug - Update a post
app.put('/api/posts/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

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

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/posts/:slug - Delete a post
app.delete('/api/posts/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

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
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
}); 