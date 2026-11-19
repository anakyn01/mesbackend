const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        maxlength: 50
    },
    lastName: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        maxlength: 100
    },
    password: {
        type: String,
        required: true,
        maxlength: 255
    },
    companyName: {
        type: String,
        maxlength: 100
    },
    position: {
        type: String,
        maxlength: 50
    },
    tel: {
        type: String,
        maxlength: 30
    },
    address: {
        type: String,
        maxlength: 255
    },
    detailAddress: {
        type: String,
        maxlength: 255
    },
    gender: {
        type: String,
        maxlength: 20
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'USERS',
    timestamps: false, // 수동 createdAt 필드 사용
    toJSON: { virtuals: true }, // 응답 시 _id 값을 id로도 자동 포함
    toObject: { virtuals: true }
});

module.exports = mongoose.model('User', userSchema);