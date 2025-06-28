import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RichTextEditor from '../../components/forms/RichTextEditor';
import { createPost } from '../../api/posts';

const CreatePost = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContentChange = (content) => {
    setFormData(prev => ({
      ...prev,
      content
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use real API to create post
      await createPost({
        title: formData.title,
        content: formData.content,
        status: 'published' // Default to published
      });
      
      // Redirect to dashboard
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <span className="text-3xl">✍️</span>
                Create New Post
              </h1>
              <p className="text-purple-200 text-lg">Craft your next amazing blog post</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-2xl border border-purple-100 p-10 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100 to-purple-200 rounded-full translate-y-12 -translate-x-12 opacity-50"></div>
          
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            {/* Title Input */}
            <div>
              <label htmlFor="title" className="block text-lg font-semibold text-purple-800 mb-3">
                Post Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-6 py-4 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-400 transition-all duration-300 text-lg bg-gradient-to-r from-purple-50 to-white shadow-inner"
                placeholder="Enter your captivating post title..."
                required
              />
              <p className="text-sm text-purple-600 mt-2 font-medium">
                ✨ A compelling title will draw readers in
              </p>
            </div>

            {/* Content Editor */}
            <div>
              <label className="block text-lg font-semibold text-purple-800 mb-3">
                Post Content *
              </label>
              <div className="border-2 border-purple-200 rounded-xl overflow-hidden shadow-lg">
                <RichTextEditor
                  value={formData.content}
                  onChange={handleContentChange}
                  placeholder="Share your thoughts, insights, and knowledge..."
                />
              </div>
              <p className="text-sm text-purple-600 mt-2 font-medium">
                🎨 Use the toolbar to make your content shine
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <span className="text-red-500 text-xl">⚠️</span>
                  <p className="text-red-700 font-semibold">{error}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-6 pt-8 border-t-2 border-purple-100">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-8 py-4 border-2 border-purple-300 text-purple-700 rounded-xl font-semibold hover:bg-purple-50 hover:border-purple-400 transition-all duration-300 shadow-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-bold hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Creating Your Post...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🚀</span>
                    <span>Publish Post</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Preview Section */}
        {formData.title && (
          <div className="mt-12 bg-white rounded-2xl shadow-2xl border border-purple-100 p-10 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full -translate-y-10 -translate-x-10 opacity-50"></div>
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-purple-800 mb-6 flex items-center gap-3">
                <span className="text-2xl">👀</span>
                Live Preview
              </h3>
              <div className="prose max-w-none">
                <h1 className="text-3xl font-bold text-purple-900 mb-6 border-b-2 border-purple-200 pb-4">{formData.title}</h1>
                <div 
                  className="text-gray-700 leading-relaxed text-lg"
                  dangerouslySetInnerHTML={{ __html: formData.content }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Inspiration Section */}
        <div className="mt-12 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-8 border border-purple-200">
          <h3 className="text-xl font-bold text-purple-800 mb-4 flex items-center gap-2">
            <span>💡</span>
            Writing Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-purple-700">
            <div className="flex items-start gap-3">
              <span className="text-purple-500 font-bold">•</span>
              <p className="text-sm">Start with a compelling hook to grab attention</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-purple-500 font-bold">•</span>
              <p className="text-sm">Use clear, concise language that's easy to understand</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-purple-500 font-bold">•</span>
              <p className="text-sm">Include examples and practical insights</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-purple-500 font-bold">•</span>
              <p className="text-sm">End with a strong conclusion that leaves an impact</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreatePost;
