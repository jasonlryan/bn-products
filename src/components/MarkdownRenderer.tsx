import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  skipFirstHeading?: boolean;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
  skipFirstHeading = false,
}) => {
  const renderMarkdown = (text: string) => {
    if (!text) return '';

    let html = text;

    // Remove first heading if requested
    if (skipFirstHeading) {
      html = html.replace(/^#\s*.*$/m, '');
    }

    // Handle code blocks first (to avoid processing their content)
    html = html.replace(
      /```([\s\S]*?)```/g,
      '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4"><code>$1</code></pre>'
    );

    // Handle inline code
    html = html.replace(
      /`([^`]+)`/g,
      '<code class="bg-gray-100 px-2 py-1 rounded text-sm">$1</code>'
    );

    // Headers (process in order from largest to smallest)
    html = html.replace(
      /^#### (.*$)/gm,
      '<h4 class="text-base font-bold mt-3 mb-2 text-gray-800">$1</h4>'
    );
    html = html.replace(
      /^### (.*$)/gm,
      '<h3 class="text-lg font-bold mt-4 mb-2 text-gray-900">$1</h3>'
    );
    html = html.replace(
      /^## (.*$)/gm,
      '<h2 class="text-xl font-bold mt-6 mb-3 text-gray-900">$1</h2>'
    );
    html = html.replace(
      /^# (.*$)/gm,
      '<h1 class="text-2xl font-bold mt-8 mb-4 text-gray-900">$1</h1>'
    );

    // Bold and italic text
    html = html.replace(
      /\*\*\*(.*?)\*\*\*/g,
      '<strong class="font-bold italic">$1</strong>'
    );
    html = html.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-bold">$1</strong>'
    );
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

    // Links
    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Process lists more carefully
    const lines = html.split('\n');
    const processedLines: string[] = [];
    let inUnorderedList = false;
    let inOrderedList = false;
    let listItems: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      const trimmedLine = line.trim();

      // Check for unordered list items
      if (trimmedLine.match(/^[-*+]\s+/)) {
        if (!inUnorderedList) {
          // Starting a new unordered list
          if (inOrderedList) {
            // Close previous ordered list
            processedLines.push(
              `<ol class="list-decimal ml-6 mb-4">${listItems.join('')}</ol>`
            );
            listItems = [];
            inOrderedList = false;
          }
          inUnorderedList = true;
        }
        const content = trimmedLine.replace(/^[-*+]\s+/, '');
        listItems.push(`<li class="mb-1">${content}</li>`);
      }
      // Check for ordered list items
      else if (trimmedLine.match(/^\d+\.\s+/)) {
        if (!inOrderedList) {
          // Starting a new ordered list
          if (inUnorderedList) {
            // Close previous unordered list
            processedLines.push(
              `<ul class="list-disc ml-6 mb-4">${listItems.join('')}</ul>`
            );
            listItems = [];
            inUnorderedList = false;
          }
          inOrderedList = true;
        }
        const content = trimmedLine.replace(/^\d+\.\s+/, '');
        listItems.push(`<li class="mb-1">${content}</li>`);
      }
      // Not a list item
      else {
        // Close any open lists
        if (inUnorderedList) {
          processedLines.push(
            `<ul class="list-disc ml-6 mb-4">${listItems.join('')}</ul>`
          );
          listItems = [];
          inUnorderedList = false;
        }
        if (inOrderedList) {
          processedLines.push(
            `<ol class="list-decimal ml-6 mb-4">${listItems.join('')}</ol>`
          );
          listItems = [];
          inOrderedList = false;
        }

        // Handle other content
        if (trimmedLine === '') {
          processedLines.push('<br />');
        } else if (!line.includes('<')) {
          // Only wrap in paragraph if it's not already HTML
          processedLines.push(`<p class="mb-3 leading-relaxed">${line}</p>`);
        } else {
          processedLines.push(line);
        }
      }
    }

    // Close any remaining open lists
    if (inUnorderedList) {
      processedLines.push(
        `<ul class="list-disc ml-6 mb-4">${listItems.join('')}</ul>`
      );
    }
    if (inOrderedList) {
      processedLines.push(
        `<ol class="list-decimal ml-6 mb-4">${listItems.join('')}</ol>`
      );
    }

    html = processedLines.join('\n');

    // Clean up extra breaks and empty paragraphs
    html = html.replace(/<br\s*\/?>\s*<br\s*\/?>/g, '<br />');
    html = html.replace(/<p[^>]*>\s*<\/p>/g, '');

    return html;
  };

  return (
    <div
      className={`prose prose-gray max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
};

export default MarkdownRenderer;
