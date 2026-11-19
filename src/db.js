const mongoose = require('mongoose');
//내장형
const { MongoMemoryServer} = require('mongodb-memory-server');

let mogood = null;

const connectDB = async () => {
    
    /* 링킹 const uri = process.env.MONGO_URI;

    if(!uri){
        console.error("Render 환경변수에 MONGO_URI가 설정되지 않았습니다.");
        process.exit(1);
    } */

    try{
mongod = await MongoMemoryServer.create();
const uri = mongod.getUri()

await mongoose.connect(uri);
console.log('✅ Render - MongoDB Atlas 연결 성공')
    }catch(err){
console.error("MongoDB Atlas 연결 실패:", err.message);
process.exit(1);
    }
};
module.exports = connectDB;
/*const { Sequelize } = require('sequelize');
require('dotenv').config();

// Sequelize와 오라클 연동 설정
const sequelize = new Sequelize(
    process.env.DB_NAME || 'XE', // 서비스명 또는 SID
    process.env.DB_USER || 'MES_USR',
    process.env.DB_PASSWORD || '1234',
    {
        host: '127.0.0.1',
        port: 1521,
        dialect: 'oracle',
        logging: false, // 쿼리 로그를 보려면 true로 변경
        dialectOptions: {
            // 필요시 추가 옵션 설정 가능
        }
    }
);

module.exports = sequelize;*/