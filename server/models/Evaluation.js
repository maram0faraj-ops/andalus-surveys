const mongoose = require('mongoose');

const EvaluationSchema = new mongoose.Schema({
    organizationRating: { type: Number, required: true },
    innovationRating: { type: Number, required: true },
    understandingRating: { type: Number, required: true },
    environmentRating: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Evaluation', EvaluationSchema);