const mongoose = require('mongoose');

const processLineSchema = new mongoose.Schema({
    lineName: {
        type: String,
        required: true,
        maxlength: 100 // 예: "AP SMT Line 1", "Titanium CNC Line"
    },
    processType: {
        type: String,
        maxlength: 50 // 예: "SMT", "CNC", "ASSEMBLY"
    },
    status: {
        type: String,
        default: 'RUNNING',
        maxlength: 30 // RUNNING(가동), STOP(정지), MAINTENANCE(점검)
    },
    currentProduct: {
        type: String,
        maxlength: 50 // 예: "iPhone 18 Pro"
    },
    operator: {
        type: String,
        maxlength: 50
    }
}, {
    collection: 'PROCESS_LINES',
    timestamps: true, // createdAt, updatedAt 자동 생성
    toJSON: { virtuals: true }, // 응답 시 _id 값을 id로도 자동 포함
    toObject: { virtuals: true }
});

module.exports = mongoose.model('ProcessLine', processLineSchema);