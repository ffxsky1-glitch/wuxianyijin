import * as XLSX from 'xlsx';
import { ParsedCityData, ParsedSalaryData } from '@/types';

// 解析 cities.xlsx 文件
export function parseCitiesExcel(file: File): Promise<ParsedCityData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        // 验证必要的列是否存在
        if (jsonData.length < 2) {
          throw new Error('Excel 文件格式错误：没有足够的数据行');
        }

        const headers = jsonData[0];
        const requiredColumns = ['city_name', 'year', 'base_min', 'base_max', 'rate'];

        for (const col of requiredColumns) {
          if (!headers.includes(col)) {
            throw new Error(`Excel 文件缺少必要的列：${col}`);
          }
        }

        // 解析数据行
        const cities: ParsedCityData[] = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (row && row.length > 0) {
            const city: ParsedCityData = {
              city_name: String(row[headers.indexOf('city_name')] || ''),
              year: String(row[headers.indexOf('year')] || ''),
              base_min: Number(row[headers.indexOf('base_min')] || 0),
              base_max: Number(row[headers.indexOf('base_max')] || 0),
              rate: Number(row[headers.indexOf('rate')] || 0)
            };

            // 验证数据完整性
            if (city.city_name && city.year) {
              cities.push(city);
            }
          }
        }

        resolve(cities);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };

    reader.readAsBinaryString(file);
  });
}

// 解析 salaries.xlsx 文件
export function parseSalariesExcel(file: File): Promise<ParsedSalaryData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        // 验证必要的列是否存在
        if (jsonData.length < 2) {
          throw new Error('Excel 文件格式错误：没有足够的数据行');
        }

        const headers = jsonData[0];
        const requiredColumns = ['employee_id', 'employee_name', 'month', 'salary_amount'];

        for (const col of requiredColumns) {
          if (!headers.includes(col)) {
            throw new Error(`Excel 文件缺少必要的列：${col}`);
          }
        }

        // 解析数据行
        const salaries: ParsedSalaryData[] = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (row && row.length > 0) {
            const salary: ParsedSalaryData = {
              employee_id: String(row[headers.indexOf('employee_id')] || ''),
              employee_name: String(row[headers.indexOf('employee_name')] || ''),
              month: String(row[headers.indexOf('month')] || ''),
              salary_amount: Number(row[headers.indexOf('salary_amount')] || 0)
            };

            // 验证数据完整性
            if (salary.employee_id && salary.employee_name && salary.month) {
              salaries.push(salary);
            }
          }
        }

        resolve(salaries);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };

    reader.readAsBinaryString(file);
  });
}