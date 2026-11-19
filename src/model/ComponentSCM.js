//ORM[mysql, oracle{관계형 db테이블과 자바스크립트 객체}], ODM[몽고 db와 같은 NoSql(도큐먼트/JSON)]

/*const { DataTypes } = require('sequelize');
const sequelize = require('../db');*/
const mongoose = require('mongoose');

const componentSCMSchema = new mongoose.Schema({
//id가 사라짐 why 몽고db는 데이터를 저장할때.._id라는 고유한 기본 키(ObjectId)를 자동으로 생성해 주기 때문에 스키마에 id를 따로 적지 않습
    componentName: {
        type: String,
        required: true,
        maxlength: 100
    },
    category: {
        type: String,
        maxlength: 50
    },
    stockQuantity: {
        type: Number,
        default: 0,
    },
    minThreshold: {
        type: Number,
        default: 100,
    },
    supplier: {
        type: Number,
        default:100
    },
    status: {
        type: String
        default: 'NORMAL',
        maxlength:30
    }
}, {
    collection: 'COMPONENT_SCM',
    timestamps: true,
});

module.exports = mongoose.model(ComponentSCM, componentSCMSchema);