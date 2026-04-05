const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
  city: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    default: '',
  },
  temperature: Number,
  description: String,
  searchedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('SearchHistory', searchHistorySchema);
