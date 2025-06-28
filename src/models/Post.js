import mongoose from 'mongoose';
import { slugify } from '../utils/slugify.js';

/**
 * Post Schema - Complete database model following Context.md specifications
 * This schema includes all fields, validation, indexes, and middleware
 */

const PostSchema = new mongoose.Schema({
  // Basic Information
  title: { 
    type: String, 
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
    minlength: [3, 'Title must be at least 3 characters']
  },
  
  content: { 
    type: String, 
    required: [true, 'Content is required'],
    minlength: [10, 'Content must be at least 10 characters']
  }, // HTML content from React-Quill
  
  slug: { 
    type: String, 
    required: [true, 'Slug is required'], 
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
  },
  
  // SEO & Meta
  metaTitle: {
    type: String,
    maxlength: [60, 'Meta title cannot exceed 60 characters'],
    default: function() { return this.title; }
  },
  
  metaDescription: {
    type: String,
    maxlength: [160, 'Meta description cannot exceed 160 characters'],
    default: function() { 
      return this.content.replace(/<[^>]*>/g, '').substring(0, 160) + '...';
    }
  },
  
  keywords: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Publishing & Status
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  
  publishedAt: {
    type: Date,
    default: null
  },
  
  // Author Information
  author: {
    name: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Author email is required'],
      lowercase: true,
      trim: true
    },
    avatar: {
      type: String,
      default: null
    }
  },
  
  // Content Organization
  category: {
    type: String,
    trim: true,
    default: 'Uncategorized'
  },
  
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Media & Assets
  featuredImage: {
    url: String,
    alt: String,
    caption: String
  },
  
  // Analytics & Engagement
  viewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  readTime: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Social Sharing
  socialShares: {
    facebook: { type: Number, default: 0 },
    twitter: { type: Number, default: 0 },
    linkedin: { type: Number, default: 0 }
  },
  
  // Timestamps
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  
  // Soft Delete
  deletedAt: {
    type: Date,
    default: null
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for excerpt
PostSchema.virtual('excerpt').get(function() {
  return this.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...';
});

// Virtual for formatted date
PostSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Indexes for performance
PostSchema.index({ slug: 1 });
PostSchema.index({ status: 1, publishedAt: -1 });
PostSchema.index({ category: 1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ author: 1 });
PostSchema.index({ createdAt: -1 });
PostSchema.index({ viewCount: -1 });

// Pre-save middleware
PostSchema.pre('save', function(next) {
  // Auto-generate slug if not provided
  if (!this.slug && this.title) {
    this.slug = slugify(this.title);
  }
  
  // Calculate read time
  if (this.content) {
    const wordCount = this.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / 200); // 200 words per minute
  }
  
  // Set publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Static methods
PostSchema.statics.findPublished = function() {
  return this.find({ 
    status: 'published', 
    publishedAt: { $lte: new Date() },
    deletedAt: null 
  });
};

PostSchema.statics.findByCategory = function(category) {
  return this.findPublished().where('category', category);
};

PostSchema.statics.findByTag = function(tag) {
  return this.findPublished().where('tags', tag);
};

PostSchema.statics.findByAuthor = function(authorId) {
  return this.find({ 'author._id': authorId, deletedAt: null });
};

// Instance methods
PostSchema.methods.incrementViews = function() {
  this.viewCount += 1;
  return this.save();
};

PostSchema.methods.softDelete = function() {
  this.deletedAt = new Date();
  this.status = 'archived';
  return this.save();
};

PostSchema.methods.publish = function() {
  this.status = 'published';
  this.publishedAt = new Date();
  return this.save();
};

PostSchema.methods.unpublish = function() {
  this.status = 'draft';
  this.publishedAt = null;
  return this.save();
};

// Create and export the model
const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);

export default Post; 