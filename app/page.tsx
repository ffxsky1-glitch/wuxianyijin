import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* 标题区域 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            五险一金计算器
          </h1>
          <p className="text-lg text-gray-600">
            根据员工工资数据和社保标准，快速计算公司应缴纳的社保公积金费用
          </p>
        </div>

        {/* 功能卡片区域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
          {/* 数据上传卡片 */}
          <Link href="/upload" className="group">
            <div className="h-full bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-8 cursor-pointer border border-gray-200">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6 group-hover:bg-blue-200 transition-colors">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                数据上传
              </h2>
              <p className="text-gray-600">
                上传城市社保标准和员工工资数据（Excel格式），准备进行计算
              </p>
              <div className="mt-6 flex items-center text-blue-600 font-medium">
                <span>前往上传</span>
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </div>
            </div>
          </Link>

          {/* 结果查询卡片 */}
          <Link href="/results" className="group">
            <div className="h-full bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-8 cursor-pointer border border-gray-200">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6 group-hover:bg-green-200 transition-colors">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v1a3 3 0 003 3h0a3 3 0 003-3v-1m3-2V8a2 2 0 00-2-2H8a2 2 0 00-2 2v7m3-2h6"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                结果查询
              </h2>
              <p className="text-gray-600">
                查看已完成的计算结果，包括员工平均工资、缴费基数和公司应缴费用
              </p>
              <div className="mt-6 flex items-center text-green-600 font-medium">
                <span>查看结果</span>
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* 使用说明 */}
        <div className="mt-20 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">使用说明</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>首先在"数据上传"页面上传 cities.xlsx 和 salaries.xlsx 文件</li>
            <li>点击"执行计算"按钮进行社保费用计算</li>
            <li>在"结果查询"页面查看计算结果</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
