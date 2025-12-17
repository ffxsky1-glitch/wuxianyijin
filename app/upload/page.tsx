'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { parseCitiesExcel, parseSalariesExcel } from '@/lib/excel-parser';
import { insertCitiesData, insertSalariesData, getCalculationResults } from '@/lib/supabase';
import { executeFullCalculation } from '@/lib/calculations';

export default function UploadPage() {
  const router = useRouter();
  const [citiesFile, setCitiesFile] = useState<File | null>(null);
  const [salariesFile, setSalariesFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFileChange = (type: 'cities' | 'salaries', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'cities') {
        setCitiesFile(file);
      } else {
        setSalariesFile(file);
      }
    }
  };

  const handleUpload = async (type: 'cities' | 'salaries') => {
    const file = type === 'cities' ? citiesFile : salariesFile;
    if (!file) {
      setMessage({ type: 'error', text: `请选择${type === 'cities' ? '城市标准' : '员工工资'}文件` });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      // 解析Excel文件
      const data = type === 'cities'
        ? await parseCitiesExcel(file)
        : await parseSalariesExcel(file);

      // 上传到数据库
      if (type === 'cities') {
        await insertCitiesData(data);
        setMessage({ type: 'success', text: `成功上传 ${data.length} 条城市数据` });
      } else {
        await insertSalariesData(data);
        setMessage({ type: 'success', text: `成功上传 ${data.length} 条工资数据` });
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: `上传失败：${error instanceof Error ? error.message : '未知错误'}` });
    } finally {
      setUploading(false);
    }
  };

  const handleCalculate = async () => {
    if (!citiesFile || !salariesFile) {
      setMessage({ type: 'error', text: '请先上传城市标准和员工工资数据' });
      return;
    }

    setCalculating(true);
    setMessage(null);

    try {
      await executeFullCalculation();

      // 计算成功后，先触发一次结果查询以刷新缓存
      await getCalculationResults();

      setMessage({
        type: 'success',
        text: '计算完成！结果已保存，正在为您跳转到结果页面...'
      });

      // 延迟跳转，让用户看到成功消息
      setTimeout(() => {
        router.push('/results?from=upload&t=' + Date.now());
      }, 1500);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: `计算失败：${error instanceof Error ? error.message : '未知错误'}` });
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            数据上传与管理
          </h1>
          <p className="text-lg text-gray-600">
            上传Excel数据文件并执行社保费用计算
          </p>
        </div>

        {/* 消息提示 */}
        {message && (
          <div className={`mb-8 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        <div className="space-y-8">
          {/* 城市标准上传 */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              上传城市社保标准
            </h2>
            <p className="text-gray-600 mb-6">
              请上传包含城市社保标准的 Excel 文件（cities.xlsx），需要包含：city_name, year, base_min, base_max, rate 等字段
            </p>
            <div className="space-y-4">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => handleFileChange('cities', e)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {citiesFile && (
                <div className="text-sm text-gray-600">
                  已选择文件：{citiesFile.name}
                </div>
              )}
              <button
                onClick={() => handleUpload('cities')}
                disabled={!citiesFile || uploading}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? '上传中...' : '上传城市数据'}
              </button>
            </div>
          </div>

          {/* 员工工资上传 */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              上传员工工资数据
            </h2>
            <p className="text-gray-600 mb-6">
              请上传包含员工工资数据的 Excel 文件（salaries.xlsx），需要包含：employee_id, employee_name, month, salary_amount 等字段
            </p>
            <div className="space-y-4">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => handleFileChange('salaries', e)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {salariesFile && (
                <div className="text-sm text-gray-600">
                  已选择文件：{salariesFile.name}
                </div>
              )}
              <button
                onClick={() => handleUpload('salaries')}
                disabled={!salariesFile || uploading}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? '上传中...' : '上传工资数据'}
              </button>
            </div>
          </div>

          {/* 执行计算按钮 */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              执行计算
            </h2>
            <p className="text-gray-600 mb-6">
              点击下方按钮，系统将根据上传的数据计算每位员工的社保费用
            </p>
            <button
              onClick={handleCalculate}
              disabled={!citiesFile || !salariesFile || calculating}
              className="px-8 py-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-lg font-semibold transition-colors"
            >
              {calculating ? '计算中，请稍候...' : '执行计算并存储结果'}
            </button>
          </div>

          {/* 返回首页按钮 */}
          <div className="text-center">
            <a
              href="/"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              返回首页
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}