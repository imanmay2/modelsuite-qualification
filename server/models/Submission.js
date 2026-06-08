const mongoose = require('mongoose');
//   multiple times for the same task (no duplicate prevention)
const submissionSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    talentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    attemptNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    fileUrl: {
      type: String,
    },
    notes: {
      type: String,
    },
    reviewStatus: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Submission', submissionSchema);
