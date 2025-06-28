import { connectToDatabase } from './src/utils/database.js';
import Post from './src/models/Post.js';
import { slugify } from './src/utils/slugify.js';

/**
 * Sample blog posts with rich content and images
 * This script will populate the database with sample articles
 */

const samplePosts = [
  {
    title: "The Art of Clean Code Design: Principles Every Developer Should Know",
    metaTitle: "Clean Code Design Principles - Best Practices for Developers",
    metaDescription: "Learn essential clean code principles that every developer should know. Discover best practices for writing readable, maintainable, and scalable code.",
    content: `<h2>Introduction to Clean Code</h2><p>Clean code is not just about making your code work—it's about making it readable, maintainable, and scalable. In this comprehensive guide, we'll explore the fundamental principles that every developer should understand and practice.</p><h3>1. Meaningful Names</h3><p>One of the most important aspects of clean code is using meaningful names for variables, functions, and classes. Names should be self-documenting and reveal intent.</p><h3>2. Single Responsibility Principle</h3><p>Each function and class should have one reason to change. This principle helps maintain code that's easier to understand and modify.</p><h3>3. DRY (Don't Repeat Yourself)</h3><p>Duplication in code is a sign of poor design. Always look for ways to extract common functionality into reusable functions or classes.</p><h2>Best Practices for Clean Code</h2><ul><li><strong>Keep functions small:</strong> Functions should do one thing and do it well</li><li><strong>Use descriptive names:</strong> Names should reveal intent</li><li><strong>Avoid comments:</strong> Code should be self-documenting</li><li><strong>Handle errors gracefully:</strong> Use proper error handling</li><li><strong>Write tests:</strong> Testable code is usually clean code</li></ul><h2>Conclusion</h2><p>Clean code is an investment in the future. While it may take more time initially, it pays dividends in maintainability, readability, and team productivity.</p>`,
    category: "Programming",
    tags: ["clean-code", "best-practices", "software-development", "coding"],
    status: "published"
  },
  {
    title: "Modern JavaScript Best Practices: ES6+ Features You Should Master",
    metaTitle: "Modern JavaScript ES6+ Features and Best Practices",
    metaDescription: "Master essential ES6+ JavaScript features including arrow functions, destructuring, async/await, and modern development practices.",
    content: `<h2>Introduction to Modern JavaScript</h2><p>JavaScript has evolved significantly over the years. With ES6 (ECMAScript 2015) and beyond, we have powerful new features that make our code more readable, maintainable, and efficient.</p><h3>1. Arrow Functions</h3><p>Arrow functions provide a concise syntax for writing function expressions. They're especially useful for short, single-purpose functions.</p><h3>2. Destructuring Assignment</h3><p>Destructuring allows you to extract values from objects and arrays into distinct variables.</p><h3>3. Template Literals</h3><p>Template literals provide an elegant way to create strings with embedded expressions.</p><h3>4. Async/Await</h3><p>Async/await makes asynchronous code look and behave more like synchronous code.</p><h2>Advanced Features</h2><ul><li><strong>Modules:</strong> ES6 modules for better code organization</li><li><strong>Classes:</strong> Syntactical sugar over JavaScript's prototype-based inheritance</li><li><strong>Promises:</strong> Better handling of asynchronous operations</li><li><strong>Spread/Rest operators:</strong> Flexible parameter handling</li><li><strong>Optional chaining:</strong> Safe property access</li></ul><h2>Conclusion</h2><p>Modern JavaScript features make our code more expressive and maintainable. By mastering these features, you'll write better, more efficient code.</p>`,
    category: "JavaScript",
    tags: ["javascript", "es6", "modern-js", "programming", "web-development"],
    status: "published"
  },
  {
    title: "Building Scalable React Applications: Architecture Patterns and Best Practices",
    metaTitle: "Scalable React Architecture Patterns and Best Practices",
    metaDescription: "Learn how to build scalable React applications with proper architecture patterns, state management, and performance optimization techniques.",
    content: `<h2>Introduction to React Architecture</h2><p>As React applications grow in complexity, having a solid architecture becomes crucial. In this guide, we'll explore patterns and practices that help build scalable, maintainable React applications.</p><h3>1. Component Architecture</h3><p>Proper component structure is the foundation of a scalable React application. Understanding the difference between presentational and container components is key.</p><h3>2. State Management</h3><p>Choosing the right state management solution is crucial for scalability. Consider these options:</p><ul><li><strong>Local State:</strong> For component-specific data</li><li><strong>Context API:</strong> For shared state across components</li><li><strong>Redux/Zustand:</strong> For complex global state</li><li><strong>Server State:</strong> For API data (React Query, SWR)</li></ul><h3>3. Custom Hooks</h3><p>Custom hooks help extract and reuse logic across components.</p><h3>4. Performance Optimization</h3><p>React provides several tools for optimizing performance:</p><ul><li><strong>React.memo:</strong> Prevent unnecessary re-renders</li><li><strong>useMemo:</strong> Memoize expensive calculations</li><li><strong>useCallback:</strong> Memoize functions</li><li><strong>Code splitting:</strong> Lazy load components</li></ul><h2>Conclusion</h2><p>Building scalable React applications requires careful consideration of architecture, state management, and performance.</p>`,
    category: "React",
    tags: ["react", "architecture", "scalability", "frontend", "javascript"],
    status: "published"
  },
  {
    title: "The Future of Web Development: Trends and Technologies to Watch in 2024",
    metaTitle: "Web Development Trends and Technologies for 2024",
    metaDescription: "Explore the latest web development trends including AI-powered development, WebAssembly, PWAs, and emerging technologies shaping the future.",
    content: `<h2>Introduction to Web Development Trends</h2><p>The web development landscape is constantly evolving. As we move through 2024, several trends and technologies are shaping the future of how we build and deploy web applications.</p><h3>1. AI-Powered Development</h3><p>Artificial Intelligence is revolutionizing how we write and maintain code. From AI-powered code completion to automated testing and debugging, AI tools are becoming essential for developers.</p><h3>2. WebAssembly (WASM)</h3><p>WebAssembly continues to gain traction as a way to run high-performance code in the browser. It's particularly useful for applications that require intensive computations.</p><h3>3. Progressive Web Apps (PWAs)</h3><p>PWAs are becoming the standard for modern web applications, offering native app-like experiences with offline capabilities and push notifications.</p><h3>4. Micro-Frontends</h3><p>Micro-frontends architecture allows teams to work independently on different parts of a web application, improving development speed and maintainability.</p><h2>Emerging Technologies</h2><h3>Edge Computing</h3><p>Edge computing brings computation closer to users, reducing latency and improving performance for web applications.</p><h3>Web Components</h3><p>Web Components provide a standard way to create reusable, encapsulated components that work across different frameworks.</p><h2>Conclusion</h2><p>The future of web development is exciting and full of possibilities. By staying informed about these trends and technologies, developers can build better, more efficient, and more secure web applications.</p>`,
    category: "Web Development",
    tags: ["web-development", "trends", "ai", "pwa", "performance", "security"],
    status: "published"
  },
  {
    title: "Mastering CSS Grid and Flexbox: Modern Layout Techniques for Responsive Design",
    metaTitle: "CSS Grid and Flexbox - Modern Layout Techniques",
    metaDescription: "Master CSS Grid and Flexbox for creating responsive, modern web layouts. Learn best practices and advanced techniques for professional web design.",
    content: `<h2>Introduction to Modern CSS Layout</h2><p>CSS Grid and Flexbox have revolutionized how we create layouts on the web. Understanding these powerful layout systems is essential for building responsive, modern web applications.</p><h3>1. CSS Flexbox Fundamentals</h3><p>Flexbox is designed for one-dimensional layouts (either rows or columns). It's perfect for navigation bars, card layouts, and form elements.</p><h3>2. CSS Grid Essentials</h3><p>CSS Grid is designed for two-dimensional layouts. It's perfect for page layouts, dashboards, and complex component arrangements.</p><h3>3. Responsive Design Patterns</h3><p>Combining Grid and Flexbox creates powerful responsive layouts:</p><ul><li><strong>Mobile-first approach:</strong> Start with mobile layouts and scale up</li><li><strong>Breakpoint strategy:</strong> Use logical breakpoints based on content</li><li><strong>Container queries:</strong> The future of responsive design</li><li><strong>CSS custom properties:</strong> Dynamic theming and responsive values</li></ul><h3>4. Advanced Layout Techniques</h3><h4>Holy Grail Layout with CSS Grid:</h4><p>CSS Grid makes it easy to create complex layouts like the holy grail layout.</p><h4>Card Layout with Flexbox:</h4><p>Flexbox excels at creating flexible card layouts that adapt to different screen sizes.</p><h2>Best Practices</h2><ul><li><strong>Use Grid for page layouts:</strong> Grid is perfect for overall page structure</li><li><strong>Use Flexbox for components:</strong> Flexbox excels at component-level layouts</li><li><strong>Combine both:</strong> Use Grid for the big picture, Flexbox for the details</li><li><strong>Test on real devices:</strong> Always test responsive layouts on actual devices</li><li><strong>Consider accessibility:</strong> Ensure layouts work with screen readers</li></ul><h2>Conclusion</h2><p>CSS Grid and Flexbox provide powerful tools for creating modern, responsive layouts. By mastering these techniques, you can build flexible, maintainable, and beautiful web applications.</p>`,
    category: "CSS",
    tags: ["css", "grid", "flexbox", "responsive-design", "layout", "frontend"],
    status: "published"
  }
];

/**
 * Seed the database with sample posts
 */
async function seedDatabase() {
  try {
    console.log('🔄 Connecting to database...');
    await connectToDatabase();
    
    console.log('🧹 Clearing existing posts...');
    await Post.deleteMany({});
    
    console.log('📝 Creating sample posts...');
    const createdPosts = [];
    
    for (const postData of samplePosts) {
      const slug = slugify(postData.title);
      
      const post = new Post({
        ...postData,
        slug,
        author: {
          name: 'Admin',
          email: 'admin@example.com',
          avatar: null
        },
        publishedAt: new Date()
      });
      
      const savedPost = await post.save();
      createdPosts.push(savedPost);
      console.log(`✅ Created post: ${savedPost.title}`);
    }
    
    console.log(`🎉 Successfully created ${createdPosts.length} sample posts!`);
    console.log('\n📋 Sample posts created:');
    createdPosts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title} (${post.slug})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase(); 