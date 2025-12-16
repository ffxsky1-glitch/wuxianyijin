-- 创建 cities 表（城市标准表）
CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  city_name TEXT NOT NULL,
  year TEXT NOT NULL,
  base_min INTEGER NOT NULL,
  base_max INTEGER NOT NULL,
  rate DECIMAL(5,4) NOT NULL
);

-- 创建 salaries 表（员工工资表）
CREATE TABLE salaries (
  id SERIAL PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  month TEXT NOT NULL,
  salary_amount INTEGER NOT NULL
);

-- 创建 results 表（计算结果表）
CREATE TABLE results (
  id SERIAL PRIMARY KEY,
  employee_name TEXT NOT NULL,
  avg_salary DECIMAL(10,2) NOT NULL,
  contribution_base DECIMAL(10,2) NOT NULL,
  company_fee DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);