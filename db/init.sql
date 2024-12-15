-- 用户表
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    openid VARCHAR(100) UNIQUE NOT NULL,
    nickname VARCHAR(50),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 工作计划表
CREATE TABLE work_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    period VARCHAR(10) NOT NULL, -- 格式：2024-03 或 2024-W10
    type VARCHAR(10) NOT NULL,   -- month 或 week
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, period, type)
);

-- 工作项表
CREATE TABLE work_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, delayed
    evaluation TEXT,
    delay_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES work_plans(id)
);

-- 评估记录表
CREATE TABLE evaluations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    work_item_id INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    evaluation TEXT,
    delay_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (work_item_id) REFERENCES work_items(id)
);

-- 创建索引
CREATE INDEX idx_work_plans_user_period ON work_plans(user_id, period);
CREATE INDEX idx_work_items_plan ON work_items(plan_id);
CREATE INDEX idx_evaluations_work_item ON evaluations(work_item_id); 