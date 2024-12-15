const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// 连接数据库
const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'), (err) => {
  if (err) {
    console.error('连接数据库失败:', err);
    process.exit(1);
  }
});

async function runMigration() {
  try {
    // 读取迁移SQL文件
    const sql = fs.readFileSync(
      path.join(__dirname, 'migrations', '001_update_schema.sql'),
      'utf8'
    );

    // 开始事务
    await new Promise((resolve, reject) => {
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // 执行迁移脚本
    await new Promise((resolve, reject) => {
      db.exec(sql, (err) => {
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

    console.log('数据库迁移成功');
  } catch (err) {
    // 发生错误时回滚
    await new Promise((resolve) => {
      db.run('ROLLBACK', resolve);
    });
    console.error('数据库迁移失败:', err);
    process.exit(1);
  } finally {
    // 关闭数据库连接
    db.close();
  }
}

// 运行迁移
runMigration(); 