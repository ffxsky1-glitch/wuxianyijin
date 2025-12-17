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

        const headers = jsonData[0].map((h: any) => String(h).trim());
        const requiredColumns = ['city_name', 'year', 'base_min', 'base_max', 'rate'];

        // 检查必要列（忽略大小写）
        const normalizedHeaders = headers.map(h => h.toLowerCase());
        for (const col of requiredColumns) {
          const foundIndex = normalizedHeaders.findIndex(h => h === col.toLowerCase());
          if (foundIndex === -1) {
            throw new Error(`Excel 文件缺少必要的列：${col}`);
          }
        }

        // 解析数据行
        const cities: ParsedCityData[] = [];
        let skippedRows = 0;

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];

          // 跳过空行
          if (!row || !row.length || row.every(cell => cell === null || cell === undefined || cell === '')) {
            continue;
          }

          try {
            // 安全地获取每个字段的值
            const cityNameRaw = row[headers.findIndex(h => h.toLowerCase() === 'city_name'.toLowerCase())];
            const yearRaw = row[headers.findIndex(h => h.toLowerCase() === 'year'.toLowerCase())];
            const baseMinRaw = row[headers.findIndex(h => h.toLowerCase() === 'base_min'.toLowerCase())];
            const baseMaxRaw = row[headers.findIndex(h => h.toLowerCase() === 'base_max'.toLowerCase())];
            const rateRaw = row[headers.findIndex(h => h.toLowerCase() === 'rate'.toLowerCase())];

            // 清理并转换数据
            const city_name = String(cityNameRaw || '').trim();
            const year = String(yearRaw || '').trim();

            // 处理数值字段 - 支持各种格式
            const parseNumber = (value: any): number => {
              if (value === null || value === undefined || value === '') {
                return 0;
              }
              // 移除所有非数字字符（除了小数点和负号）
              const cleanedValue = String(value).replace(/[^\d.-]/g, '');
              return parseFloat(cleanedValue) || 0;
            };

            const base_min = parseNumber(baseMinRaw);
            const base_max = parseNumber(baseMaxRaw);
            const rate = parseNumber(rateRaw);

            // 验证数据完整性
            if (city_name && year) {
              cities.push({
                city_name,
                year,
                base_min,
                base_max,
                rate
              });
            } else {
              skippedRows++;
              console.warn(`第 ${i + 1} 行数据不完整，已跳过`);
            }
          } catch (rowError) {
            skippedRows++;
            console.warn(`第 ${i + 1} 行解析失败，已跳过：`, rowError);
            continue;
          }
        }

        if (cities.length === 0) {
          throw new Error('没有找到有效的城市数据行');
        }

        if (skippedRows > 0) {
          console.warn(`解析完成，跳过了 ${skippedRows} 行无效数据`);
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

        const headers = jsonData[0].map((h: any) => String(h).trim());
        const requiredColumns = ['employee_id', 'employee_name', 'month', 'salary_amount'];

        // 检查必要列（忽略大小写）
        const normalizedHeaders = headers.map(h => h.toLowerCase());
        for (const col of requiredColumns) {
          const foundIndex = normalizedHeaders.findIndex(h => h === col.toLowerCase());
          if (foundIndex === -1) {
            throw new Error(`Excel 文件缺少必要的列：${col}`);
          }
        }

        // 解析数据行
        const salaries: ParsedSalaryData[] = [];
        let skippedRows = 0;

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];

          // 跳过空行
          if (!row || !row.length || row.every(cell => cell === null || cell === undefined || cell === '')) {
            continue;
          }

          try {
            // 安全地获取每个字段的值
            const employeeIdRaw = row[headers.findIndex(h => h.toLowerCase() === 'employee_id'.toLowerCase())];
            const employeeNameRaw = row[headers.findIndex(h => h.toLowerCase() === 'employee_name'.toLowerCase())];
            const monthRaw = row[headers.findIndex(h => h.toLowerCase() === 'month'.toLowerCase())];
            const salaryAmountRaw = row[headers.findIndex(h => h.toLowerCase() === 'salary_amount'.toLowerCase())];

            // 清理并转换数据
            const employee_id = String(employeeIdRaw || '').trim();
            const employee_name = String(employeeNameRaw || '').trim();
            const month = String(monthRaw || '').trim();

            // 处理工资金额 - 支持各种格式
            let salary_amount = 0;
            if (salaryAmountRaw !== null && salaryAmountRaw !== undefined && salaryAmountRaw !== '') {
              // 移除所有非数字字符（除了小数点和负号）
              const cleanedAmount = String(salaryAmountRaw).replace(/[^\d.-]/g, '');
              if (cleanedAmount) {
                salary_amount = parseFloat(cleanedAmount) || 0;
              }
            }

            // 验证数据完整性
            if (employee_id && employee_name && month) {
              salaries.push({
                employee_id,
                employee_name,
                month,
                salary_amount
              });
            } else {
              skippedRows++;
              console.warn(`第 ${i + 1} 行数据不完整，已跳过`);
            }
          } catch (rowError) {
            skippedRows++;
            console.warn(`第 ${i + 1} 行解析失败，已跳过：`, rowError);
            continue;
          }
        }

        if (salaries.length === 0) {
          throw new Error('没有找到有效的工资数据行');
        }

        if (skippedRows > 0) {
          console.warn(`解析完成，跳过了 ${skippedRows} 行无效数据`);
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