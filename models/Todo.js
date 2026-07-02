const mongoose = require('mongoose');

const subItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Sub-item title is required'],
      trim: true,
      maxlength: [200, 'Sub-item title cannot be more than 200 characters'],
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    subItems: {
      type: [subItemSchema],
      default: [],
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt fields
  },
);

module.exports = mongoose.model('Todo', todoSchema);
