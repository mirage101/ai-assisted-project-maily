import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Template name is required'],
      trim: true,
      minlength: [1, 'Name cannot be empty'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    thumbnail: {
      type: String,
      default: '',
    },
    componentTree: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      required: [true, 'Component tree is required'],
      default: () => ({
        root: {
          id: 'root',
          type: 'root',
          children: [],
        },
      }),
    },
    category: {
      type: String,
      enum: ['newsletter', 'promotional', 'transactional', 'announcement', 'other'],
      default: 'other',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
templateSchema.index({ userId: 1, createdAt: -1 });
templateSchema.index({ category: 1, isPublic: 1 });
templateSchema.index({ tags: 1 });
templateSchema.index({ name: 'text', description: 'text' }); // Text search

/**
 * Virtual: Preview URL
 */
templateSchema.virtual('previewUrl').get(function () {
  return `/templates/${this._id}/preview`;
});

/**
 * Instance method: Check if user can edit this template
 * @param {String} userId - User ID to check
 * @returns {Boolean} True if user can edit
 */
templateSchema.methods.canEdit = function (userId) {
  return this.userId.toString() === userId.toString();
};

/**
 * Static method: Find templates by user
 * @param {String} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise} Query result
 */
templateSchema.statics.findByUser = function (userId, options = {}) {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  return this.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

/**
 * Static method: Find public templates
 * @param {Object} options - Query options
 * @returns {Promise} Query result
 */
templateSchema.statics.findPublic = function (options = {}) {
  const { page = 1, limit = 20, category, tags } = options;
  const skip = (page - 1) * limit;

  const query = { isPublic: true };

  if (category) {
    query.category = category;
  }

  if (tags && tags.length > 0) {
    query.tags = { $in: tags };
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

const Template = mongoose.model('Template', templateSchema);

export default Template;
