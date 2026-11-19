const mongoose = require('mongoose');

const productionRecordSchema = new mongoose.Schema({
    lineName: {
        type: String,
        required: true,
        maxlength: 100
    },
    targetCount: {
        type: Number,
        default: 0 // 목표 생산 대수
    },
    actualCount: {
        type: Number,
        default: 0 // 실제 양품 생산 대수
    },
    defectCount: {
        type: Number,
        default: 0 // 불량 대수
    },
    yieldRate: {
        type: Number,
        default: 100.0 // 수율 (%)
    }
}, {
    collection: 'PRODUCTION_RECORDS',
    timestamps: { createdAt: 'recordedAt', updatedAt: 'updatedAt' }, // 기록 시간 필드명 반영
    toJSON: { virtuals: true }, // 응답 시 _id 값을 id로도 자동 포함
    toObject: { virtuals: true }
});

module.exports = mongoose.model('ProductionRecord', productionRecordSchema);