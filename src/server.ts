const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./db');
const User = require('./model/User');
const ProcessLine = require('./model/ProcessLine');
const ComponentSCM = require('./model/ComponentSCM');
const QualityInspection = require('./model/QualityInspection');
const Equipment = require('./model/Equipment');
const ProductionRecord = require('./model/ProductionRecord');

const app = express();
app.use(express.json());
app.use(cors({
    origin: true,
    credentials: true
}));

const JWT_SECRET = process.env.JWT_SECRET || 'aB3$fG9!zXqW#mK7*vL2@pN5$sD8%yH1';

// ==========================================
// 🔍 [전역 장치 1] 모든 요청 자동 로깅 미들웨어 (Render Logs 확인용)
// ==========================================
app.use((req, res, next) => {
    const time = new Date().toLocaleTimeString('ko-KR', { timeZone: 'Asia/Seoul' });
    console.log(`📥 [${time}] ${req.method} ${req.originalUrl}`);
    next();
});

// ==========================================
// 🚨 [전역 장치 2] 공통 500 에러 로깅 및 상세 응답 헬퍼
// ==========================================
const sendServerError = (req, res, message, err) => {
    console.error(`\n❌ ================= [API ERROR] =================`);
    console.error(`📍 경로: ${req.method} ${req.originalUrl}`);
    console.error(`💬 메시지: ${message}`);
    console.error(`🔥 원인: ${err.message}`);
    console.error(`📌 스택:\n${err.stack}`);
    console.error(`=================================================\n`);

    return res.status(500).json({
        success: false,
        message,
        errorDetail: err.message // 프론트엔드 네트워크 탭에서도 바로 원인 확인 가능
    });
};

// ==========================================
// 0. Render 서버 & DB 상태 확인용 (브라우저 접속 테스트)
// ==========================================
app.get('/', async (req, res) => {
    try {
        const dbStatus = mongoose.connection.readyState === 1 ? '✅ 연결됨 (Connected)' : '❌ 끊김 (Disconnected)';
        const userCount = await User.countDocuments().catch(() => 0);

        return res.status(200).json({
            success: true,
            message: '🚀 MES 백엔드 Render 서버 정상 작동 중',
            database: dbStatus,
            registeredUsers: userCount,
            serverTime: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
        });
    } catch (err) {
        return sendServerError(req, res, '상태 확인 실패', err);
    }
});

// ==========================================
// 1. 인증 API (회원가입 / 로그인 / 프로필)
// ==========================================
app.post('/api/auth/register', async (req, res) => {
    try {
        const {
            firstName, lastName, email, password,
            companyName, position, tel, address, detailAddress, gender
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: '이메일과 비밀번호는 필수입니다.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ success: false, message: '이미 존재하는 이메일 입니다' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create({
            firstName, lastName, email,
            password: hashedPassword,
            companyName, position, tel, address, detailAddress,
            gender
        });

        console.log(`✅ 회원가입 완료: ${email}`);
        return res.status(201).json({
            success: true,
            message: '회원가입이 완료되었습니다.'
        });
    } catch (err) {
        return sendServerError(req, res, '회원가입 처리 중 서버 오류가 발생했습니다', err);
    }
});

// JWT 인증 미들웨어
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer')) {
        console.warn(`⚠️ [인증 실패] 토큰 없음 - ${req.method} ${req.originalUrl}`);
        return res.status(401).json({ success: false, message: '인증 토큰이 제공되지 않았습니다' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error(`⚠️ [JWT 검증 실패] ${req.method} ${req.originalUrl} ->`, err.message);
        return res.status(403).json({
            success: false,
            message: '유효하지 않거나 만료된 토큰입니다',
            errorDetail: err.message
        });
    }
};

app.get('/api/user/profile', verifyToken, async (req, res) => {
    return res.status(200).json({ success: true, user: req.user });
});

// 로그인 API
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: '이메일과 비밀번호를 입력해주세요.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            console.warn(`⚠️ [로그인 실패] 미등록 이메일: ${email}`);
            return res.status(401).json({
                success: false, message: '존재하지 않는 이메일이거나 비밀번호가 틀렸습니다.'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.warn(`⚠️ [로그인 실패] 비밀번호 불일치: ${email}`);
            return res.status(401).json({
                success: false, message: '존재하지 않는 이메일이거나 비밀번호가 틀렸습니다.'
            });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '48h' }
        );

        console.log(`✅ 로그인 성공: ${email}`);
        return res.status(200).json({
            success: true,
            message: '로그인 성공',
            token,
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        });
    } catch (err) {
        return sendServerError(req, res, '로그인 처리 중 서버 오류가 발생했습니다', err);
    }
});

// ==========================================
// 2. 라인 공정 제어 API (/process)
// ==========================================
app.get('/api/process/lines', verifyToken, async (req, res) => {
    try {
        const lines = await ProcessLine.find();
        return res.status(200).json({ success: true, lines });
    } catch (err) {
        return sendServerError(req, res, '공정 라인 조회 실패', err);
    }
});

app.post('/api/process/lines', verifyToken, async (req, res) => {
    try {
        const { lineName, processType, currentProduct, operator } = req.body;
        const newLine = await ProcessLine.create({
            lineName, processType, currentProduct, operator
        });
        return res.status(201).json({ success: true, line: newLine });
    } catch (err) {
        return sendServerError(req, res, '공정 라인 등록 실패', err);
    }
});

// ==========================================
// 3. 핵심 부품 SCM API (/components)
// ==========================================
app.get('/api/scm/components', verifyToken, async (req, res) => {
    try {
        const components = await ComponentSCM.find();
        return res.status(200).json({ success: true, components });
    } catch (err) {
        return sendServerError(req, res, 'SCM 자재 조회 실패', err);
    }
});

app.post('/api/scm/components', verifyToken, async (req, res) => {
    try {
        const { componentName, category, stockQuantity, minThreshold, supplier } = req.body;
        const status = stockQuantity <= minThreshold ? 'WARNING' : 'NORMAL';
        const component = await ComponentSCM.create({
            componentName, category, stockQuantity, minThreshold, status, supplier
        });
        return res.status(201).json({ success: true, component });
    } catch (err) {
        return sendServerError(req, res, 'SCM 자재 등록 실패', err);
    }
});

// ==========================================
// 4. 비전 품질 검사 API (/quality)
// ==========================================
app.get('/api/quality/inspections', verifyToken, async (req, res) => {
    try {
        const inspections = await QualityInspection.find().sort({ inspectedAt: -1 }).limit(50);
        return res.status(200).json({ success: true, inspections });
    } catch (err) {
        return sendServerError(req, res, '품질 검사 이력 조회 실패', err);
    }
});

app.post('/api/quality/inspections', verifyToken, async (req, res) => {
    try {
        const { serialNumber, inspectionType, result, defectReason, inspector } = req.body;
        const inspection = await QualityInspection.create({
            serialNumber, inspectionType, result, defectReason, inspector
        });
        return res.status(201).json({ success: true, inspection });
    } catch (err) {
        return sendServerError(req, res, '품질 검사 결과 등록 실패', err);
    }
});

// ==========================================
// 5. 클린룸 및 설비 제어 API (/cleanroom)
// ==========================================
app.get('/api/equipment/status', verifyToken, async (req, res) => {
    try {
        const equipments = await Equipment.find();
        return res.status(200).json({ success: true, equipments });
    } catch (err) {
        return sendServerError(req, res, '설비 상태 조회 실패', err);
    }
});

app.post('/api/equipment/status', verifyToken, async (req, res) => {
    try {
        const { equipmentName, cleanroomZone, temperature, humidity, status } = req.body;
        const equipment = await Equipment.create({
            equipmentName, cleanroomZone, temperature, humidity, status
        });
        return res.status(201).json({ success: true, equipment });
    } catch (err) {
        return sendServerError(req, res, '설비 상태 등록 실패', err);
    }
});

// ==========================================
// 6. 실시간 통합 관제(생산 실적 및 수율) API (/analytics)
// ==========================================
app.get('/api/analytics/records', verifyToken, async (req, res) => {
    try {
        const records = await ProductionRecord.find();
        return res.status(200).json({ success: true, records });
    } catch (err) {
        return sendServerError(req, res, '통합 관제 데이터 조회 실패', err);
    }
});

app.post('/api/analytics/records', verifyToken, async (req, res) => {
    try {
        const { lineName, targetCount, actualCount, defectCount } = req.body;
        const total = actualCount + defectCount;
        const yieldRate = total > 0 ? Number(((actualCount / total) * 100).toFixed(2)) : 100.0;

        const record = await ProductionRecord.create({
            lineName, targetCount, actualCount, defectCount, yieldRate
        });
        return res.status(201).json({ success: true, record });
    } catch (err) {
        return sendServerError(req, res, '통합 관제 데이터 등록 실패', err);
    }
});

// ==========================================
// 🛡️ [전역 장치 3] 404 및 미처리 전역 에러 핸들러
// ==========================================
app.use((req, res) => {
    console.warn(`⚠️ [404 Not Found] 존재하지 않는 API 요청: ${req.method} ${req.originalUrl}`);
    return res.status(404).json({
        success: false,
        message: `요청하신 경로(${req.originalUrl})를 찾을 수 없습니다.`
    });
});

app.use((err, req, res, next) => {
    return sendServerError(req, res, '예기치 못한 전역 서버 오류가 발생했습니다', err);
});

// 프로세스 치명적 오류 감지 (Render 서버 강제 종료 원인 추적)
process.on('uncaughtException', (err) => {
    console.error('💥 [치명적 오류 - uncaughtException]:', err.stack);
});

process.on('unhandledRejection', (reason) => {
    console.error('💥 [미처리 Promise 거부 - unhandledRejection]:', reason);
});

// ==========================================
// 7. 서버 실행
// ==========================================
const PORT = process.env.PORT || 4000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 렌더서버 실행중 (Port: ${PORT})`);
    });
}).catch((err) => {
    console.error('💥 [서버 부팅 실패]:', err.stack);
    process.exit(1);
});