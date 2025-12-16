import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function generatePDF(tableElementId: string = 'results-table'): Promise<void> {
  try {
    // 获取表格元素
    const element = document.getElementById(tableElementId);
    if (!element) {
      throw new Error('找不到表格元素');
    }

    // 等待图片和字体加载完成
    await new Promise(resolve => setTimeout(resolve, 500));

    // 使用 html2canvas 捕获表格
    const canvas = await html2canvas(element, {
      scale: 2, // 提高清晰度
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight,
      allowTaint: true,
      foreignObjectRendering: false
    });

    const imgData = canvas.toDataURL('image/png', 1.0);

    // A4 尺寸 (mm)
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // 计算图片尺寸，适应 A4 宽度
    const imgWidth = pdfWidth - 20; // 左右各留10mm边距
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // 添加图片到 PDF
    let heightLeft = imgHeight;
    let position = 10; // 顶部边距 10mm

    // 第一页
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= (pdfHeight - position);

    // 如果内容超过一页，添加新页
    while (heightLeft > 0) {
      position = -(heightLeft - imgHeight);
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    // 保存 PDF
    const fileName = `社保费用报表_${new Date().toISOString().slice(0, 10)}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error('PDF生成失败:', error);
    alert('PDF生成失败，请重试');
    throw error;
  }
}