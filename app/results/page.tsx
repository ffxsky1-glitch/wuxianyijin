'use client';

import { useState, useEffect } from 'react';
import { Result } from '@/types';
import { getCalculationResults } from '@/lib/supabase';
import { generatePDF } from '@/lib/pdf-generator';

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const fetchResults = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getCalculationResults();
      setResults(data);
    } catch (err) {
      console.error(err);
      setError('获取结果失败，请检查数据库连接');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const calculateTotal = () => {
    return results.reduce((sum, result) => sum + result.company_fee, 0).toFixed(2);
  };

  const handleDownloadPDF = async () => {
    if (results.length === 0) {
      alert('没有可导出的数据');
      return;
    }

    setGeneratingPDF(true);
    try {
      await generatePDF();
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('PDF 生成失败，请重试');
    } finally {
      setGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            计算结果
          </h1>
          <p className="text-lg text-gray-600">
            员工社保费用计算结果明细
          </p>
        </div>

        {/* 统计信息和下载按钮 - 不截图的部分 */}
        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <p className="text-gray-500 text-sm">员工总数</p>
                <p className="text-3xl font-bold text-gray-900">{results.length}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-sm">月均工资总和</p>
                <p className="text-3xl font-bold text-gray-900">
                  ¥{results.reduce((sum, r) => sum + r.avg_salary, 0).toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-sm">月缴费总额</p>
                <p className="text-3xl font-bold text-green-600">¥{calculateTotal()}</p>
              </div>
            </div>

            {/* 下载 PDF 按钮 */}
            <div className="flex justify-center">
              <button
                onClick={handleDownloadPDF}
                disabled={generatingPDF || loading}
                className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                {generatingPDF ? '生成 PDF 中...' : '下载 PDF 报表'}
              </button>
            </div>
          </div>
        )}

        {/* PDF 导出的内容 - 设置为隐藏的样式副本用于截图 */}
        {results.length > 0 && (
          <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '1200px', padding: '20px', backgroundColor: 'white' }}>
            <div id="pdf-content" style={{ fontFamily: 'Microsoft YaHei, Arial, sans-serif' }}>
              {/* PDF 标题 */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h1 style={{ fontSize: '24px', margin: '0 0 10px 0', fontWeight: 'bold' }}>社保费用计算报表</h1>
                <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                  生成时间：{new Date().toLocaleString('zh-CN')}
                </p>
              </div>

              {/* 统计信息 */}
              <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#333' }}>统计摘要</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '14px', color: '#666', margin: '0 0 5px 0' }}>员工总数</p>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', margin: 0 }}>{results.length}</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '14px', color: '#666', margin: '0 0 5px 0' }}>月均工资总和</p>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', margin: 0 }}>
                      ¥{results.reduce((sum, r) => sum + r.avg_salary, 0).toFixed(2)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '14px', color: '#666', margin: '0 0 5px 0' }}>月缴费总额</p>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#059669', margin: 0 }}>¥{calculateTotal()}</p>
                  </div>
                </div>
              </div>

              {/* 员工详情表格 */}
              <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#333' }}>员工缴费明细</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontWeight: '600' }}>序号</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontWeight: '600' }}>员工姓名</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontWeight: '600' }}>年度月平均工资</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontWeight: '600' }}>缴费基数</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontWeight: '600' }}>公司应缴金额</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontWeight: '600' }}>计算时间</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr key={result.id} style={index % 2 === 0 ? { backgroundColor: '#ffffff' } : { backgroundColor: '#f9fafb' }}>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', color: '#1f2937' }}>{index + 1}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', color: '#1f2937', fontWeight: '500' }}>{result.employee_name}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', color: '#1f2937' }}>¥{result.avg_salary.toFixed(2)}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', color: '#1f2937' }}>¥{result.contribution_base.toFixed(2)}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', color: '#059669', fontWeight: '600' }}>¥{result.company_fee.toFixed(2)}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontSize: '13px' }}>
                        {formatDate(result.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            {error}
          </div>
        )}

        {/* 加载中 */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        )}

        {/* 结果表格 */}
        {!loading && !error && results.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table id="results-table" className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      序号
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      员工姓名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      年度月平均工资
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      缴费基数
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      公司应缴金额
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      计算时间
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.map((result, index) => (
                    <tr key={result.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {result.employee_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ¥{result.avg_salary.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ¥{result.contribution_base.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        ¥{result.company_fee.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(result.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 无数据提示 */}
        {!loading && !error && results.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">暂无计算结果</h3>
            <p className="mt-1 text-sm text-gray-500">
              请先上传数据并执行计算
            </p>
            <div className="mt-6">
              <a
                href="/upload"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                前往上传数据
              </a>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="mt-8 flex justify-between">
          <a
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            返回首页
          </a>
          <button
            onClick={fetchResults}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            刷新数据
          </button>
        </div>
      </div>
    </div>
  );
}