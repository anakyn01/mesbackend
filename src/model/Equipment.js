const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
    equipmentName: {
        type: String,
        required: true,
        maxlength: 100 // 예: "CNC Machine #3", "SMT Mounter #1"
    },
    cleanroomZone: {
        type: String,
        maxlength: 50 // 예: "Zone A (Class 100)"
    },
    temperature: {
        type: Number // 클린룸 온도 (℃) - 소수점(FLOAT) 자동 지원
    },
    humidity: {
        type: Number // 클린룸 습도 (%) - 소수점(FLOAT) 자동 지원
    },
    status: {
        type: String,
        default: 'NORMAL',
        maxlength: 30 // NORMAL, WARNING, ERROR
    }
}, {
    collection: 'EQUIPMENTS',
    timestamps: true, // createdAt, updatedAt 자동 생성
    toJSON: { virtuals: true }, // 응답 시 _id 값을 id로도 자동 포함
    toObject: { virtuals: true }
});

module.exports = mongoose.model('Equipment', equipmentSchema);