import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function generatePDF(contentElementId: string = 'pdf-content'): Promise<void> {
  try {
    // 获取要截图的元素
    const element = document.getElementById(contentElementId);
    if (!element) {
      throw new Error('找不到内容元素');
    }

    // 使用 html2canvas 捕获表格
    const canvas = await html2canvas(element, {
      scale: 2, // 提高清晰度
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210; // A4 宽度 (mm)
    const pageHeight = 297; // A4 高度 (mm)
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 20; // 顶部边距

    // 创建 PDF
    const pdf = new jsPDF('p', 'mm', 'a4');

    // 添加标题
    pdf.setFontSize(20);
    pdf.text('社保费用计算报表', 105, 15, { align: 'center' });

    // 添加生成时间
    pdf.setFontSize(12);
    pdf.text(`生成时间：${new Date().toLocaleString('zh-CN')}`, 105, 22, { align: 'center' });

    // 添加表格图片
    pdf.addImage(imgData, 'PNG', 0, position + 10, imgWidth, imgHeight);
    heightLeft -= (pageHeight - position - 10);

    // 如果内容超过一页，添加新页
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // 保存 PDF
    const fileName = `社保费用报表_${new Date().toISOString().slice(0, 10)}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error('PDF生成失败:', error);
    throw error;
  }
}