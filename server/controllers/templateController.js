import asyncHandler from 'express-async-handler';
import Template from '../models/Template.js';

/**
 * Serialize component tree for database
 */
const serializeComponentTree = (componentTree) => {
  const serialized = {};
  for (const [id, component] of Object.entries(componentTree)) {
    serialized[id] = {
      id: component.id,
      type: component.type,
      parentId: component.parentId,
      properties: component.properties || {},
      children: component.children || undefined,
    };
  }
  return serialized;
};

/**
 * Deserialize component tree from database
 */
const deserializeComponentTree = (serializedTree) => {
  if (!serializedTree) {
    return {
      root: {
        id: 'root',
        type: 'root',
        children: [],
      },
    };
  }

  if (serializedTree instanceof Map) {
    const tree = {};
    for (const [key, value] of serializedTree.entries()) {
      tree[key] = value;
    }
    return tree;
  }

  return serializedTree;
};

/**
 * Format template for response
 */
const formatTemplateForResponse = (template) => {
  return {
    id: template._id,
    name: template.name,
    description: template.description,
    thumbnail: template.thumbnail,
    componentTree: deserializeComponentTree(template.componentTree),
    category: template.category,
    tags: template.tags,
    isPublic: template.isPublic,
    userId: template.userId,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
  };
};

/**
 * Get all templates (public + user's own)
 * GET /api/templates
 * Private
 */
export const getTemplates = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, category, search } = req.query;

  const query = {
    $or: [{ isPublic: true }, { userId: req.user._id }],
  };

  if (category) {
    query.category = category;
  }

  if (search) {
    query.$text = { $search: search };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const templates = await Template.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .select('-componentTree'); // Exclude component tree for list view

  const total = await Template.countDocuments(query);

  res.json({
    success: true,
    data: {
      templates: templates.map((t) => ({
        id: t._id,
        name: t.name,
        description: t.description,
        thumbnail: t.thumbnail,
        category: t.category,
        tags: t.tags,
        isPublic: t.isPublic,
        userId: t.userId,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

/**
 * Get user's templates
 * GET /api/templates/my-templates
 * Private
 */
export const getMyTemplates = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const templates = await Template.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .select('-componentTree'); // Exclude component tree for list view

  const total = await Template.countDocuments({ userId: req.user._id });

  res.json({
    success: true,
    data: {
      templates: templates.map((t) => ({
        id: t._id,
        name: t.name,
        description: t.description,
        thumbnail: t.thumbnail,
        category: t.category,
        tags: t.tags,
        isPublic: t.isPublic,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

/**
 * Get template by ID
 * GET /api/templates/:id
 * Private
 */
export const getTemplate = asyncHandler(async (req, res) => {
  const template = await Template.findById(req.params.id);

  if (!template) {
    res.status(404);
    throw new Error('Template not found');
  }

  // Check if user can view template (own or public)
  if (
    template.userId.toString() !== req.user._id.toString() &&
    !template.isPublic
  ) {
    res.status(403);
    throw new Error('Not authorized to view this template');
  }

  res.json({
    success: true,
    data: formatTemplateForResponse(template),
  });
});

/**
 * Create new template
 * POST /api/templates
 * Private
 */
export const createTemplate = asyncHandler(async (req, res) => {
  const { name, description, thumbnail, componentTree, category, tags, isPublic } =
    req.body;

  // Validate required fields
  if (!name) {
    res.status(400);
    throw new Error('Template name is required');
  }

  if (!componentTree || !componentTree.root) {
    res.status(400);
    throw new Error('Component tree with root is required');
  }

  const template = await Template.create({
    name: name.trim(),
    description: description?.trim() || '',
    thumbnail: thumbnail || '',
    componentTree: serializeComponentTree(componentTree),
    category: category || 'other',
    tags: Array.isArray(tags) ? tags.map((tag) => tag.trim()).filter(Boolean) : [],
    isPublic: Boolean(isPublic),
    userId: req.user._id,
  });

  res.status(201).json({
    success: true,
    data: formatTemplateForResponse(template),
  });
});

/**
 * Update template
 * PUT /api/templates/:id
 * Private
 */
export const updateTemplate = asyncHandler(async (req, res) => {
  const template = await Template.findById(req.params.id);

  if (!template) {
    res.status(404);
    throw new Error('Template not found');
  }

  // Check ownership
  if (template.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this template');
  }

  const { name, description, thumbnail, componentTree, category, tags, isPublic } =
    req.body;

  // Update fields if provided
  if (name) template.name = name.trim();
  if (description !== undefined) template.description = description.trim();
  if (thumbnail !== undefined) template.thumbnail = thumbnail;
  if (componentTree) template.componentTree = serializeComponentTree(componentTree);
  if (category) template.category = category;
  if (tags) template.tags = Array.isArray(tags) ? tags.map((tag) => tag.trim()).filter(Boolean) : [];
  if (isPublic !== undefined) template.isPublic = Boolean(isPublic);

  const updatedTemplate = await template.save();

  res.json({
    success: true,
    data: formatTemplateForResponse(updatedTemplate),
  });
});

/**
 * Delete template
 * DELETE /api/templates/:id
 * Private
 */
export const deleteTemplate = asyncHandler(async (req, res) => {
  const template = await Template.findById(req.params.id);

  if (!template) {
    res.status(404);
    throw new Error('Template not found');
  }

  // Check ownership
  if (template.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this template');
  }

  await template.deleteOne();

  res.json({
    success: true,
    message: 'Template deleted successfully',
  });
});
