import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import pages
import Home from './pages/Home';
import Dashboard from './pages/admin/Dashboard';
import CreatePost from './pages/admin/CreatePost';
import EditPost from './pages/admin/EditPost';
import PostView from './pages/posts/PostView';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/posts/:slug" element={<PostView />} />
          
          {/* Admin Routes - Now accessible to everyone */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create" element={<CreatePost />} />
          <Route path="/edit/:slug" element={<EditPost />} />
          
          {/* Keep old admin routes for backward compatibility */}
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/create" element={<CreatePost />} />
          <Route path="/admin/edit/:slug" element={<EditPost />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
