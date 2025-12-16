import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Result } from '@/types';

export async function generatePDF(results: Result[]): Promise<void> {
  // 创建 PDF 文档
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // 添加中文字体支持（使用默认字体，避免字体文件问题）
  pdf.setFont('helvetica');

  // 计算总额
  const totalAmount = results.reduce((sum, result) => sum + result.company_fee, 0);
  const totalAvgSalary = results.reduce((sum, result) => sum + result.avg_salary, 0);

  // 标题
  pdf.setFontSize(20);
  pdf.text('Social Insurance Contribution Report', 105, 20, { align: 'center' });

  pdf.setFontSize(12);
  pdf.text(`Generated on: ${new Date().toLocaleString()}`, 105, 30, { align: 'center' });

  // 统计信息
  pdf.setFontSize(14);
  pdf.text('Summary', 20, 45);

  pdf.setFontSize(11);
  pdf.text(`Total Employees: ${results.length}`, 20, 55);
  pdf.text(`Total Average Salary: ¥${totalAvgSalary.toFixed(2)}`, 20, 65);
  pdf.text(`Total Monthly Contribution: ¥${totalAmount.toFixed(2)}`, 20, 75);

  // 表格标题
  pdf.setFontSize(14);
  pdf.text('Employee Details', 20, 90);

  // 表格列设置
  const tableColumns = [
    { header: 'No', dataKey: 'no', width: 20 },
    { header: 'Employee Name', dataKey: 'name', width: 50 },
    { header: 'Avg Salary', dataKey: 'avgSalary', width: 45 },
    { header: 'Contribution Base', dataKey: 'base', width: 45 },
    { header: 'Company Fee', dataKey: 'fee', width: 45 }
  ];

  // 表格数据
  const tableData = results.map((result, index) => ({
    no: (index + 1).toString(),
    name: result.employee_name,
    avgSalary: `¥${result.avg_salary.toFixed(2)}`,
    base: `¥${result.contribution_base.toFixed(2)}`,
    fee: `¥${result.company_fee.toFixed(2)}`
  }));

  // 绘制表格
  let currentY = 100;
  const rowHeight = 8;
  const maxPageHeight = 280; // A4 页面高度减去边距

  // 表头
  pdf.setFillColor(240, 240, 240);
  let currentX = 20;
  tableColumns.forEach(col => {
    pdf.rect(currentX, currentY, col.width, rowHeight, 'F');
    pdf.rect(currentX, currentY, col.width, rowHeight, 'S');
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(col.header, currentX + 2, currentY + 5);
    currentX += col.width;
  });

  // 表格数据
  pdf.setFont('helvetica', 'normal');
  currentY += rowHeight;

  for (let i = 0; i < tableData.length; i++) {
    // 检查是否需要新页
    if (currentY + rowHeight > maxPageHeight) {
      pdf.addPage();
      currentY = 20;

      // 在新页重复表头
      pdf.setFillColor(240, 240, 240);
      currentX = 20;
      tableColumns.forEach(col => {
        pdf.rect(currentX, currentY, col.width, rowHeight, 'F');
        pdf.rect(currentX, currentY, col.width, rowHeight, 'S');
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text(col.header, currentX + 2, currentY + 5);
        currentX += col.width;
      });
      currentY += rowHeight;
      pdf.setFont('helvetica', 'normal');
    }

    // 绘制数据行
    const row = tableData[i];
    currentX = 20;

    // 交替行颜色
    if (i % 2 === 0) {
      pdf.setFillColor(250, 250, 250);
      tableColumns.forEach(col => {
        pdf.rect(currentX, currentY, col.width, rowHeight, 'F');
        currentX += col.width;
      });
      currentX = 20;
    }

    // 绘制边框和文本
    tableColumns.forEach(col => {
      pdf.rect(currentX, currentY, col.width, rowHeight, 'S');
      pdf.setFontSize(9);
      pdf.text(String(row[col.dataKey as keyof typeof row]), currentX + 2, currentY + 5);
      currentX += col.width;
    });

    currentY += rowHeight;
  }

  // 页脚
  const pageCount = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(10);
    pdf.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
  }

  // 保存 PDF
  const fileName = `social_insurance_report_${new Date().getTime()}.pdf`;
  pdf.save(fileName);
}