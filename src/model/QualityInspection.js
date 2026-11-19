const mongoose = require('mongoose');

const qualityInspectionSchema = new mongoose.Schema({
    serialNumber: {
        type: String,
        required: true,
        unique: true,
        maxlength: 100 // 아이폰 개별 시리얼 번호
    },
    inspectionType: {
        type: String,
        maxlength: 50 // 예: "VISION_SCRATCH", "WATERPROOF_TEST"
    },
    result: {
        type: String,
        required: true,
        maxlength: 20 // PASS 또는 FAIL
    },
    defectReason: {
        type: String,
        maxlength: 255 // 불량 판정 시 사유
    },
    inspector: {
        type: String,
        maxlength: 50 // 담당 AI 유닛 또는 오퍼레이터
    }
}, {
    collection: 'QUALITY_INSPECTIONS',
    timestamps: { createdAt: 'inspectedAt', updatedAt: false }, // 검사 시간만 기록
    toJSON: { virtuals: true }, // 응답 시 _id 값을 id로도 자동 포함
    toObject: { virtuals: true }
});

module.exports = mongoose.model('QualityInspection', qualityInspectionSchema);