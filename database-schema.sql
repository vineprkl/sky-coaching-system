-- Sky 代练服务客户数据反馈系统数据库设计
-- 使用 PostgreSQL (Supabase)

-- 客户表
CREATE TABLE clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    avatar VARCHAR(10) NOT NULL DEFAULT '🌟',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 每日代练记录表
CREATE TABLE daily_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    regular_candles INTEGER NOT NULL DEFAULT 0,
    regular_candles_comparison VARCHAR(20) DEFAULT '',
    seasonal_candles INTEGER NOT NULL DEFAULT 0,
    online_time TIME DEFAULT NULL,
    actual_duration INTEGER DEFAULT NULL, -- 实际用时（分钟）
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- 确保每个客户每天只有一条记录
    UNIQUE(client_id, date)
);

-- 创建索引以提高查询性能
CREATE INDEX idx_daily_records_client_id ON daily_records(client_id);
CREATE INDEX idx_daily_records_date ON daily_records(date);
CREATE INDEX idx_daily_records_client_date ON daily_records(client_id, date);

-- 插入示例数据
INSERT INTO clients (name, avatar) VALUES 
    ('小星', '🌟'),
    ('月光', '🌙'),
    ('云朵', '☁️'),
    ('彩虹', '🌈'),
    ('雪花', '❄️');

-- 插入示例代练记录
INSERT INTO daily_records (client_id, date, regular_candles, regular_candles_comparison, seasonal_candles, service_hours, notes) 
SELECT 
    c.id,
    CURRENT_DATE - INTERVAL '1 day' * generate_series(0, 6),
    80 + (random() * 40)::integer,
    '+' || (5 + (random() * 20)::integer)::text,
    (random() * 10)::integer,
    1.5 + (random() * 2)::numeric(3,1),
    CASE 
        WHEN random() > 0.5 THEN '今日任务顺利完成，收集了额外的蜡烛'
        ELSE '完成了所有日常任务和季节任务'
    END
FROM clients c
WHERE c.name = '小星';

-- 为其他客户也添加一些记录
INSERT INTO daily_records (client_id, date, regular_candles, regular_candles_comparison, seasonal_candles, service_hours, notes) 
SELECT 
    c.id,
    CURRENT_DATE - INTERVAL '1 day' * generate_series(0, 3),
    75 + (random() * 35)::integer,
    '+' || (3 + (random() * 15)::integer)::text,
    (random() * 8)::integer,
    1.0 + (random() * 2.5)::numeric(3,1),
    '日常代练完成'
FROM clients c
WHERE c.name IN ('月光', '云朵');

-- 创建更新时间戳的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为表添加自动更新时间戳的触发器
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_records_updated_at BEFORE UPDATE ON daily_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建 RLS (Row Level Security) 策略
-- 注意：在实际部署时，你可能需要根据具体的认证需求调整这些策略

-- 启用 RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_records ENABLE ROW LEVEL SECURITY;

-- 允许所有操作的策略（开发阶段使用，生产环境需要更严格的策略）
CREATE POLICY "Allow all operations on clients" ON clients
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on daily_records" ON daily_records
    FOR ALL USING (true) WITH CHECK (true);
