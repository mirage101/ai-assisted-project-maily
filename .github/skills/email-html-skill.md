# Email HTML Generation Skill

## Purpose

This skill provides patterns for generating email-safe HTML from component trees, ensuring compatibility with email clients.

## Email HTML Constraints

### Key Requirements
1. **Inline styles** - No external stylesheets or `<style>` tags
2. **Table-based layouts** - Use `<table>` instead of `<div>` with flexbox/grid
3. **Absolute URLs** - All image sources must be absolute
4. **Limited CSS** - Avoid modern CSS (flexbox, grid, transforms)
5. **Web-safe fonts** - Use fallback font stacks
6. **Max-width 600px** - Standard email body width

## Email Template Structure

```javascript
/**
 * Generate complete email HTML document
 * @param {Array} components - Component tree
 * @returns {String} Complete HTML document
 */
const generateEmailHTML = (components) => {
  const bodyContent = components.map(componentToHTML).join('\n');
  
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email Template</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <!-- Main content table -->
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="padding: 0;">
              ${bodyContent}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
```

## Component-to-HTML Converters

### Text Block Component

```javascript
/**
 * Convert text component to email HTML
 * @param {Object} component - Text component
 * @returns {String} HTML string
 */
const textToHTML = (component) => {
  const {
    text = '',
    fontSize = 16,
    color = '#333333',
    fontWeight = 'normal',
    textAlign = 'left',
    lineHeight = 1.6,
    padding = { top: 10, right: 20, bottom: 10, left: 20 },
  } = component.properties;
  
  const paddingStyle = `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;
  
  return `
<table border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td style="padding: ${paddingStyle}; font-size: ${fontSize}px; color: ${color}; font-weight: ${fontWeight}; text-align: ${textAlign}; line-height: ${lineHeight}; font-family: Arial, Helvetica, sans-serif;">
      ${escapeHTML(text)}
    </td>
  </tr>
</table>`;
};
```

### Button Component

```javascript
/**
 * Convert button component to email HTML
 * @param {Object} component - Button component
 * @returns {String} HTML string
 */
const buttonToHTML = (component) => {
  const {
    text = 'Click me',
    url = '#',
    backgroundColor = '#007bff',
    textColor = '#ffffff',
    fontSize = 16,
    padding = { top: 12, right: 24, bottom: 12, left: 24 },
    borderRadius = 4,
    textAlign = 'center',
  } = component.properties;
  
  const paddingStyle = `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;
  
  return `
<table border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td align="${textAlign}" style="padding: 20px;">
      <table border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="background-color: ${backgroundColor}; border-radius: ${borderRadius}px;">
            <a href="${url}" target="_blank" style="display: inline-block; padding: ${paddingStyle}; font-size: ${fontSize}px; color: ${textColor}; text-decoration: none; font-weight: bold; font-family: Arial, Helvetica, sans-serif;">
              ${escapeHTML(text)}
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
};
```

### Image Component

```javascript
/**
 * Convert image component to email HTML
 * @param {Object} component - Image component
 * @returns {String} HTML string
 */
const imageToHTML = (component) => {
  const {
    src = '',
    alt = '',
    width = 600,
    href = null,
    textAlign = 'center',
  } = component.properties;
  
  const imageTag = `<img src="${src}" alt="${escapeHTML(alt)}" width="${width}" style="display: block; border: 0; max-width: 100%; height: auto;" />`;
  
  const content = href
    ? `<a href="${href}" target="_blank" style="text-decoration: none;">${imageTag}</a>`
    : imageTag;
  
  return `
<table border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td align="${textAlign}" style="padding: 10px 0;">
      ${content}
    </td>
  </tr>
</table>`;
};
```

### Heading Component

```javascript
/**
 * Convert heading component to email HTML
 * @param {Object} component - Heading component
 * @returns {String} HTML string
 */
const headingToHTML = (component) => {
  const {
    text = '',
    level = 2, // h1-h6
    fontSize = 32,
    color = '#333333',
    fontWeight = 'bold',
    textAlign = 'left',
    padding = { top: 20, right: 20, bottom: 10, left: 20 },
  } = component.properties;
  
  const paddingStyle = `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;
  
  return `
<table border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td style="padding: ${paddingStyle};">
      <h${level} style="margin: 0; font-size: ${fontSize}px; color: ${color}; font-weight: ${fontWeight}; text-align: ${textAlign}; font-family: Arial, Helvetica, sans-serif; line-height: 1.2;">
        ${escapeHTML(text)}
      </h${level}>
    </td>
  </tr>
</table>`;
};
```

### Divider Component

```javascript
/**
 * Convert divider component to email HTML
 * @param {Object} component - Divider component
 * @returns {String} HTML string
 */
const dividerToHTML = (component) => {
  const {
    color = '#dddddd',
    height = 1,
    width = '100%',
    margin = { top: 20, bottom: 20 },
  } = component.properties;
  
  return `
<table border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td style="padding: ${margin.top}px 20px ${margin.bottom}px 20px;">
      <table border="0" cellpadding="0" cellspacing="0" width="${width}" style="border-top: ${height}px solid ${color};">
        <tr>
          <td></td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
};
```

### Spacer Component

```javascript
/**
 * Convert spacer component to email HTML
 * @param {Object} component - Spacer component
 * @returns {String} HTML string
 */
const spacerToHTML = (component) => {
  const { height = 20 } = component.properties;
  
  return `
<table border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td style="height: ${height}px; font-size: 0; line-height: 0;">
      &nbsp;
    </td>
  </tr>
</table>`;
};
```

### Container Component

```javascript
/**
 * Convert container component to email HTML
 * @param {Object} component - Container component with nested components
 * @returns {String} HTML string
 */
const containerToHTML = (component) => {
  const {
    backgroundColor = 'transparent',
    padding = { top: 20, right: 20, bottom: 20, left: 20 },
    children = [],
  } = component.properties;
  
  const paddingStyle = `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;
  const childrenHTML = children.map(componentToHTML).join('\n');
  
  return `
<table border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td style="background-color: ${backgroundColor}; padding: ${paddingStyle};">
      ${childrenHTML}
    </td>
  </tr>
</table>`;
};
```

## Main Converter Function

```javascript
/**
 * Convert component to HTML based on type
 * @param {Object} component - Component object
 * @returns {String} HTML string
 */
const componentToHTML = (component) => {
  switch (component.type) {
    case 'text':
      return textToHTML(component);
    case 'heading':
      return headingToHTML(component);
    case 'button':
      return buttonToHTML(component);
    case 'image':
      return imageToHTML(component);
    case 'divider':
      return dividerToHTML(component);
    case 'spacer':
      return spacerToHTML(component);
    case 'container':
      return containerToHTML(component);
    default:
      console.warn(`Unknown component type: ${component.type}`);
      return '';
  }
};
```

## Utility Functions

### Escape HTML

```javascript
/**
 * Escape HTML special characters
 * @param {String} text - Text to escape
 * @returns {String} Escaped text
 */
const escapeHTML = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
};
```

### Inline Styles Builder

```javascript
/**
 * Build inline style string from object
 * @param {Object} styles - Style object
 * @returns {String} Style string
 */
const buildInlineStyles = (styles) => {
  return Object.entries(styles)
    .map(([key, value]) => {
      // Convert camelCase to kebab-case
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssKey}: ${value}`;
    })
    .join('; ');
};

// Usage
const styles = {
  fontSize: '16px',
  color: '#333333',
  fontWeight: 'bold',
  textAlign: 'center',
};

const styleString = buildInlineStyles(styles);
// "font-size: 16px; color: #333333; font-weight: bold; text-align: center"
```

### Color Validation

```javascript
/**
 * Ensure color is valid hex code
 * @param {String} color - Color value
 * @returns {String} Valid hex color
 */
const validateColor = (color) => {
  // If it's a valid hex color, return it
  if (/^#[0-9A-F]{6}$/i.test(color)) {
    return color;
  }
  
  // Otherwise return default
  return '#000000';
};
```

## Complete Example

```javascript
// utils/emailGenerator.js

/**
 * Generate complete email HTML from component tree
 * @param {Array} components - Array of component objects
 * @param {Object} options - Generation options
 * @returns {String} Complete HTML email
 */
export const generateEmailHTML = (components, options = {}) => {
  const {
    backgroundColor = '#f4f4f4',
    contentWidth = 600,
    title = 'Email Template',
  } = options;
  
  // Convert all components to HTML
  const bodyContent = components
    .map(componentToHTML)
    .filter(Boolean) // Remove empty strings
    .join('\n');
  
  // Build complete document
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHTML(title)}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: ${backgroundColor};">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${backgroundColor};">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="${contentWidth}" style="background-color: #ffffff;">
          <tr>
            <td style="padding: 0;">
              ${bodyContent}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

// Export all converters
export {
  componentToHTML,
  textToHTML,
  headingToHTML,
  buttonToHTML,
  imageToHTML,
  dividerToHTML,
  spacerToHTML,
  containerToHTML,
  escapeHTML,
  buildInlineStyles,
  validateColor,
};
```

## Usage Example

```javascript
import { generateEmailHTML } from '../utils/emailGenerator';

const components = [
  {
    id: '1',
    type: 'heading',
    properties: {
      text: 'Welcome to Our Newsletter',
      level: 1,
      fontSize: 32,
      textAlign: 'center',
    },
  },
  {
    id: '2',
    type: 'text',
    properties: {
      text: 'Thank you for subscribing to our newsletter!',
      fontSize: 16,
      textAlign: 'center',
    },
  },
  {
    id: '3',
    type: 'button',
    properties: {
      text: 'Read More',
      url: 'https://example.com',
      backgroundColor: '#007bff',
      textAlign: 'center',
    },
  },
];

const html = generateEmailHTML(components, {
  title: 'Newsletter',
  backgroundColor: '#f9f9f9',
  contentWidth: 600,
});

console.log(html);
```

## Email Client Testing Checklist

- [ ] Gmail (web and mobile app)
- [ ] Outlook (desktop 2016/2019/2021)
- [ ] Outlook.com (web)
- [ ] Apple Mail (macOS and iOS)
- [ ] Yahoo Mail
- [ ] Thunderbird
- [ ] Mobile email clients (iOS Mail, Android Gmail)

---

**Use these patterns to generate email-safe HTML that renders consistently across email clients.**