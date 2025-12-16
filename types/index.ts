// 数据库表类型定义

export interface City {
  id: number;
  city_name: string;
  year: string;
  base_min: number;
  base_max: number;
  rate: number;
}

export interface Salary {
  id: number;
  employee_id: string;
  employee_name: string;
  month: string; // YYYYMM 格式
  salary_amount: number;
}

export interface Result {
  id: number;
  employee_name: string;
  avg_salary: number;
  contribution_base: number;
  company_fee: number;
  created_at: string;
}

// Excel 解析类型
export interface ParsedCityData {
  city_name: string;
  year: string;
  base_min: number;
  base_max: number;
  rate: number;
}

export interface ParsedSalaryData {
  employee_id: string;
  employee_name: string;
  month: string;
  salary_amount: number;
}

// 计算结果中间类型
export interface EmployeeSalarySummary {
  employee_name: string;
  avg_salary: number;
  contribution_base: number;
  company_fee: number;
}