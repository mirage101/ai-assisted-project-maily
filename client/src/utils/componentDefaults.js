/**
 * Get default properties for a component type
 */
export const getDefaultProperties = (type) => {
  const defaults = {
    root: {
      maxWidth: 600,
    },
    text: {
      text: 'Enter your text here',
      fontSize: 16,
      color: '#333333',
      fontWeight: 'normal',
      textAlign: 'left',
      lineHeight: 1.6,
      padding: { top: 10, right: 20, bottom: 10, left: 20 },
    },
    heading: {
      text: 'Heading',
      level: 2,
      fontSize: 28,
      color: '#333333',
      fontWeight: 'bold',
      textAlign: 'left',
      padding: { top: 20, right: 20, bottom: 10, left: 20 },
    },
    button: {
      text: 'Click me',
      url: '#',
      backgroundColor: '#007bff',
      textColor: '#ffffff',
      fontSize: 16,
      padding: { top: 12, right: 24, bottom: 12, left: 24 },
      borderRadius: 4,
      textAlign: 'center',
    },
    image: {
      src: 'https://placehold.co/600x400',
      alt: 'Image',
      width: 600,
      href: null,
      textAlign: 'center',
      fitToContainer: true,
    },
    divider: {
      color: '#dddddd',
      height: 1,
      width: '100%',
      margin: { top: 20, bottom: 20 },
    },
    spacer: {
      height: 20,
    },
    columns: {
      columns: 2,
      gap: 16,
      padding: { top: 10, right: 10, bottom: 10, left: 10 },
      backgroundColor: '#ffffff',
      borderRadius: 0,
    },
    column: {
      padding: { top: 10, right: 10, bottom: 10, left: 10 },
      backgroundColor: '#ffffff',
      borderRadius: 0,
    },
  };

  return defaults[type] || {};
};

/**
 * Check if component type can have children
 */
export const canHaveChildren = (type) => {
  return ['root', 'columns', 'column'].includes(type);
};

/**
 * Generate unique component ID
 */
export const generateComponentId = () => {
  return `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
