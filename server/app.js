const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const compression = require('compression');
const { authMiddleware } = require('./routes/auth');
const securityMiddleware = require('./middleware/security');

const app = express();
const port = process.env.PORT || 3000;

// 中间件
app.use(compression());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(securityMiddleware);

// 路由
const authRouter = require('./routes/auth').router;
const workPlansRouter = require('./routes/workPlans');
const evaluationsRouter = require('./routes/evaluations');

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API 路由
app.use('/api/auth', authRouter);
app.use('/api/work-plans', authMiddleware, workPlansRouter);
app.use('/api/evaluations', authMiddleware, evaluationsRouter);

// 错误处理
app.use((err, req, res, next) => {
  console.error('全局错误处理:', err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message
  });
});

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在 ${process.env.BASE_URL || `http://localhost:${port}`}`);
}); 