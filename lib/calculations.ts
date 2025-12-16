import { Salary, City, EmployeeSalarySummary } from '@/types';
import { getSalariesData, getCityStandard, saveCalculationResults } from './supabase';

// 按员工分组计算月平均工资
export function calculateAverageSalary(salaries: Salary[]): Map<string, number> {
  const salaryMap = new Map<string, number[]>();

  // 按员工分组
  salaries.forEach(salary => {
    const employeeName = salary.employee_name;
    if (!salaryMap.has(employeeName)) {
      salaryMap.set(employeeName, []);
    }
    salaryMap.get(employeeName)!.push(salary.salary_amount);
  });

  // 计算每个员工的平均工资
  const avgSalaryMap = new Map<string, number>();
  salaryMap.forEach((salaryList, employeeName) => {
    const avgSalary = salaryList.reduce((sum, salary) => sum + salary, 0) / salaryList.length;
    avgSalaryMap.set(employeeName, Math.round(avgSalary * 100) / 100); // 保留两位小数
  });

  return avgSalaryMap;
}

// 确定缴费基数
export function determineContributionBase(avgSalary: number, cityStandard: City): number {
  if (avgSalary < cityStandard.base_min) {
    return cityStandard.base_min;
  } else if (avgSalary > cityStandard.base_max) {
    return cityStandard.base_max;
  } else {
    return Math.round(avgSalary * 100) / 100; // 保留两位小数
  }
}

// 计算公司缴费金额
export function calculateCompanyFee(contributionBase: number, rate: number): number {
  return Math.round(contributionBase * rate * 100) / 100; // 保留两位小数
}

// 执行完整的计算流程
export async function executeFullCalculation(): Promise<void> {
  try {
    // 1. 获取所有工资数据
    const salaries = await getSalariesData();
    if (salaries.length === 0) {
      throw new Error('没有找到工资数据，请先上传工资数据');
    }

    // 2. 计算每个员工的平均工资
    const avgSalaryMap = calculateAverageSalary(salaries);

    // 3. 获取年份（从第一个工资记录中提取）
    const firstSalary = salaries[0];
    const year = firstSalary.month.substring(0, 4);

    // 4. 获取佛山该年份的社保标准
    const cityStandard = await getCityStandard(year, '佛山');

    // 5. 计算每个员工的缴费基数和公司缴费
    const results: EmployeeSalarySummary[] = [];
    avgSalaryMap.forEach((avgSalary, employeeName) => {
      const contributionBase = determineContributionBase(avgSalary, cityStandard);
      const companyFee = calculateCompanyFee(contributionBase, cityStandard.rate);

      results.push({
        employee_name: employeeName,
        avg_salary: avgSalary,
        contribution_base: contributionBase,
        company_fee: companyFee
      });
    });

    // 6. 保存计算结果到数据库
    await saveCalculationResults(results);

    console.log(`成功计算并保存了 ${results.length} 名员工的社保费用`);
  } catch (error) {
    console.error('计算过程出错：', error);
    throw error;
  }
}