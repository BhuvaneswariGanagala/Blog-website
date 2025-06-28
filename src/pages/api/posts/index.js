import { connectToDatabase } from '../../../utils/database.js';
import Post from '../../../models/Post.js';

/**
 * GET /api/posts - Get all posts
 * Returns a list of all posts with optional filtering
 */
export default async function handler(req, res) {
  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    // Connect to database
    await connectToDatabase();

    // Get query parameters
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

    // Return success response
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
}
