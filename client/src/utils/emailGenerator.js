/**
 * Generate complete email HTML document
 * Accepts either:
 * - component tree object (preferred)
 * - flat components array (legacy)
 */
export const generateEmailHTML = (input) => {
  const emailMaxWidth =
    Array.isArray(input) || !input?.root?.properties?.maxWidth
      ? 600
      : Math.min(1200, Math.max(320, Number(input.root.properties.maxWidth) || 600));

  const bodyContent = Array.isArray(input)
    ? input.map((component) => componentToHTML(component, null, { maxContainerWidth: emailMaxWidth })).join('\n')
    : treeToHTML(input, { maxContainerWidth: emailMaxWidth });

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
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: ${emailMaxWidth}px; background-color: #ffffff;">
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

const treeToHTML = (componentTree, context = {}) => {
  if (!componentTree || !componentTree.root || !Array.isArray(componentTree.root.children)) {
    return '';
  }

  return componentTree.root.children
    .map((childId) => componentToHTML(componentTree[childId], componentTree, context))
    .join('\n');
};

/**
 * Convert component to HTML based on type
 */
const componentToHTML = (component, componentTree = null, context = {}) => {
  if (!component) return '';

  switch (component.type) {
    case 'text':
      return textToHTML(component);
    case 'heading':
      return headingToHTML(component);
    case 'button':
      return buttonToHTML(component);
    case 'image':
      return imageToHTML(component, context);
    case 'divider':
      return dividerToHTML(component);
    case 'spacer':
      return spacerToHTML(component);
    case 'columns':
      return columnsToHTML(component, componentTree, context);
    default:
      return '';
  }
};

const escapeHTML = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return String(text || '').replace(/[&<>"']/g, (char) => map[char]);
};

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

const headingToHTML = (component) => {
  const {
    text = '',
    level = 2,
    fontSize = 28,
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

const imageToHTML = (component, context = {}) => {
  const { src = '', alt = '', width = 600, href = null, textAlign = 'center', fitToContainer = true } = component.properties;
  const containerWidth = context.maxContainerWidth || 600;
  const requestedWidth = Number(width) || containerWidth;
  const safeWidth = Math.min(requestedWidth, containerWidth);
  const imageWidthAttribute = fitToContainer ? safeWidth : requestedWidth;
  const imageStyle = fitToContainer
    ? `display: block; border: 0; width: 100%; max-width: ${safeWidth}px; height: auto;`
    : `display: block; border: 0; width: ${requestedWidth}px; max-width: 100%; height: auto;`;
  const imageTag = `<img src="${src}" alt="${escapeHTML(alt)}" width="${imageWidthAttribute}" style="${imageStyle}" />`;
  const content = href ? `<a href="${href}" target="_blank" style="text-decoration: none;">${imageTag}</a>` : imageTag;

  return `
<table border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td align="${textAlign}" style="padding: 10px 0;">
      ${content}
    </td>
  </tr>
</table>`;
};

const dividerToHTML = (component) => {
  const { color = '#dddddd', height = 1, width = '100%', margin = { top: 20, bottom: 20 } } = component.properties;

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

const columnsToHTML = (component, componentTree, context = {}) => {
  if (!componentTree || !Array.isArray(component.children) || component.children.length === 0) {
    return '';
  }

  const {
    gap = 16,
    padding = { top: 10, right: 10, bottom: 10, left: 10 },
    backgroundColor = '#ffffff',
    borderRadius = 0,
  } = component.properties || {};

  const columnsCount = component.children.length;
  const columnWidth = Math.floor(100 / columnsCount);
  const wrapperPadding = `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;
  const parentWidth = context.maxContainerWidth || 600;
  const usableWidth = Math.max(100, parentWidth - (padding.left + padding.right));
  const columnContentMaxWidth = Math.floor((usableWidth - gap * (columnsCount - 1)) / columnsCount);

  const columnsHtml = component.children
    .map((columnId, index) => {
      const column = componentTree[columnId];
      if (!column) return '';

      const columnProps = column.properties || {};
      const columnPadding = columnProps.padding || { top: 10, right: 10, bottom: 10, left: 10 };
      const columnChildrenHtml = (column.children || [])
        .map((childId) =>
          componentToHTML(componentTree[childId], componentTree, {
            maxContainerWidth: Math.max(80, columnContentMaxWidth - ((columnPadding?.left || 10) + (columnPadding?.right || 10))),
          })
        )
        .join('\n');

      const rightPadding = index === columnsCount - 1 ? 0 : gap;
      const columnPaddingStyle = `${columnPadding.top}px ${columnPadding.right}px ${columnPadding.bottom}px ${columnPadding.left}px`;

      return `
      <td valign="top" width="${columnWidth}%" style="padding-right: ${rightPadding}px; background-color: ${columnProps.backgroundColor || '#ffffff'}; border-radius: ${columnProps.borderRadius || 0}px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding: ${columnPaddingStyle};">
              ${columnChildrenHtml}
            </td>
          </tr>
        </table>
      </td>`;
    })
    .join('\n');

  return `
<table border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td style="padding: ${wrapperPadding}; background-color: ${backgroundColor}; border-radius: ${borderRadius}px;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          ${columnsHtml}
        </tr>
      </table>
    </td>
  </tr>
</table>`;
};
