# 🚀 Blog Website

A beautiful, full-stack blog website built with React, Express, MongoDB, and TailwindCSS. Features a collaborative platform where everyone can create, edit, and manage blog posts.

## ✨ Features

- **🎨 Beautiful UI**: Purple-themed design with modern styling
- **✍️ Rich Text Editor**: React-Quill for creating beautiful content
- **📱 Responsive Design**: Works perfectly on all devices
- **🔐 Collaborative**: Everyone has admin access to create and manage posts
- **📊 Dashboard**: Manage all posts with edit/delete functionality
- **🎯 SEO Optimized**: Meta tags and clean URLs
- **⚡ Fast Performance**: Built with Vite for optimal speed

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS, React-Quill
- **Backend**: Express.js, Node.js
- **Database**: MongoDB Atlas
- **Deployment**: Vercel

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account
- Vercel account (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/BhuvaneswariGanagala/Blog-website.git
   cd Blog-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_atlas_connection_string
   NODE_ENV=development
   VITE_API_BASE_URL=http://localhost:3001
   ```

4. **Seed the database with sample posts**
   ```bash
   node seed-data.js
   ```

5. **Start the development server**
   ```bash
   npm run dev:full
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 🌐 Deployment to Vercel

### Step 1: Prepare Your Repository

1. **Push your code to GitHub** (already done!)
2. **Ensure all files are committed**

### Step 2: Deploy to Vercel

1. **Go to [Vercel](https://vercel.com)**
2. **Sign in with your GitHub account**
3. **Click "New Project"**
4. **Import your repository**: `BhuvaneswariGanagala/Blog-website`
5. **Configure the project**:
   - **Framework Preset**: Node.js
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 3: Set Environment Variables

In your Vercel project settings, add these environment variables:

```
MONGODB_URI=your_mongodb_atlas_connection_string
NODE_ENV=production
VITE_API_BASE_URL=https://your-vercel-domain.vercel.app
```

### Step 4: Deploy

1. **Click "Deploy"**
2. **Wait for the build to complete**
3. **Your blog will be live!**

## 📁 Project Structure

```
blog-website/
├── src/
│   ├── components/     # Reusable React components
│   ├── pages/         # Page components
│   ├── api/           # API functions
│   ├── models/        # MongoDB models
│   └── utils/         # Utility functions
├── server.js          # Express server
├── seed-data.js       # Database seeding script
├── vercel.json        # Vercel configuration
└── package.json       # Dependencies and scripts
```

## 🎨 Customization

### Colors
The website uses a purple theme. To change colors, update the TailwindCSS classes in:
- `src/pages/Home.jsx`
- `src/pages/admin/CreatePost.jsx`
- `src/pages/admin/Dashboard.jsx`

### Styling
All styling is done with TailwindCSS. The configuration is in `tailwind.config.js`.

## 🔧 Available Scripts

- `npm run dev` - Start Vite development server
- `npm run server` - Start Express server only
- `npm run dev:full` - Start both frontend and backend
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `node seed-data.js` - Seed database with sample posts

## 🌟 Features in Detail

### Collaborative Blog Platform
- Everyone who visits can create posts
- No login required
- Full admin access for all users

### Rich Content Creation
- React-Quill rich text editor
- Support for formatting, links, and images
- Live preview while writing

### Modern UI/UX
- Beautiful purple gradient design
- Smooth animations and transitions
- Responsive layout for all devices
- Glassmorphism effects

### Database Features
- MongoDB Atlas integration
- Soft delete functionality
- SEO-friendly slugs
- Category and tag support

## 🤝 Contributing

Since this is a collaborative blog platform, everyone can contribute by:
1. Creating new posts
2. Editing existing content
3. Suggesting improvements

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you encounter any issues:
1. Check the console for error messages
2. Ensure your MongoDB connection string is correct
3. Verify all environment variables are set
4. Check the Vercel deployment logs

---

**Built with ❤️ using React, Express, MongoDB, and TailwindCSS**
