const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 数据库文件路径
const dbPath = path.join(__dirname, 'database.sqlite');

async function resetDatabase() {
  let db;
  try {
    // 创建数据库连接
    db = new sqlite3.Database(dbPath);

    // 开启事务
    await new Promise((resolve, reject) => {
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // 删除所有表
    await new Promise((resolve, reject) => {
      db.exec(`
        DROP TABLE IF EXISTS work_items;
        DROP TABLE IF EXISTS work_plans;
        DROP TABLE IF EXISTS users;
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // 创建表结构
    await new Promise((resolve, reject) => {
      db.exec(`
        -- 创建用户表
        CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          openid TEXT UNIQUE NOT NULL,
          nickname TEXT,
          has_initial_data INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- 创建工作计划表
        CREATE TABLE work_plans (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          period DATE NOT NULL,
          type TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        );

        -- 创建工作项表
        CREATE TABLE work_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          plan_id INTEGER NOT NULL,
          content TEXT NOT NULL,
          status TEXT DEFAULT 'pending',
          start_date DATE NOT NULL,
          due_date DATE NOT NULL,
          evaluation TEXT,
          delay_reason TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (plan_id) REFERENCES work_plans(id) ON DELETE CASCADE
        );

        -- 创建索引
        CREATE INDEX idx_work_plans_period ON work_plans(period);
        CREATE INDEX idx_work_plans_user_period ON work_plans(user_id, period);
        CREATE INDEX idx_work_items_plan ON work_items(plan_id);
        CREATE INDEX idx_work_items_status ON work_items(status);
        CREATE INDEX idx_work_items_dates ON work_items(start_date, due_date);
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // 提交事务
    await new Promise((resolve, reject) => {
      db.run('COMMIT', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('数据库重置成功');

  } catch (err) {
    // 回滚事务
    if (db) {
      await new Promise(resolve => {
        db.run('ROLLBACK', resolve);
      });
    }
    console.error('数据库重置失败:', err);
    process.exit(1);
  } finally {
    // 关闭数据库连接
    if (db) {
      db.close(() => {
        // 运行种子数据脚本
        require('./seed');
      });
    }
  }
}

// 运行重置
resetDatabase(); 