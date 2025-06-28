import React, { useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

/**
 * RichTextEditor component that wraps React-Quill
 * Handles findDOMNode warnings and provides consistent styling
 */
const RichTextEditor = ({ value, onChange, placeholder = "Write your content here...", readOnly = false }) => {
  const quillRef = useRef(null);

  // Suppress findDOMNode warnings in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const originalConsoleWarn = console.warn;
      console.warn = (...args) => {
        if (args[0] && typeof args[0] === 'string' && args[0].includes('findDOMNode')) {
          return; // Suppress findDOMNode warnings
        }
        originalConsoleWarn.apply(console, args);
      };
      
      return () => {
        console.warn = originalConsoleWarn;
      };
    }
  }, []);

  // Quill modules and formats
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'image', 'blockquote', 'code-block'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'color', 'background', 'align',
    'link', 'image', 'blockquote', 'code-block'
  ];

  return (
    <div className="rich-text-editor">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={readOnly}
        style={{
          height: '300px',
          marginBottom: '50px'
        }}
      />
      <style jsx>{`
        .rich-text-editor .ql-editor {
          min-height: 200px;
          font-size: 16px;
          line-height: 1.6;
        }
        .rich-text-editor .ql-toolbar {
          border-top: 1px solid #e2e8f0;
          border-left: 1px solid #e2e8f0;
          border-right: 1px solid #e2e8f0;
          border-radius: 8px 8px 0 0;
        }
        .rich-text-editor .ql-container {
          border-bottom: 1px solid #e2e8f0;
          border-left: 1px solid #e2e8f0;
          border-right: 1px solid #e2e8f0;
          border-radius: 0 0 8px 8px;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor; 