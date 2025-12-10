// frontend/src/pages/reports/ReportsIndex.jsx
import { useState, useEffect } from 'react';
import { FiDownload, FiFileText, FiTrendingUp, FiDollarSign, FiShoppingCart, FiCalendar } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import MainLayout from '../../components/layout/MainLayout';
import { getSalesStats, getChartsData } from '../../services/api';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const ReportsIndex = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [statsResponse, chartsResponse] = await Promise.all([
        getSalesStats(dateRange),
        getChartsData(30)
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      if (chartsResponse.success) {
        setChartData(chartsResponse.data.chartData);
      }
    } catch (error) {
      console.error('Error al cargar reportes:', error);
      toast.error('Error al cargar reportes');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
  };

  const exportToPDF = () => {
    if (!stats) return;

    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text('Reporte de Ventas', 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Período: ${dateRange.startDate} al ${dateRange.endDate}`, 14, 30);
    
    // Resumen
    doc.setFontSize(14);
    doc.text('Resumen General', 14, 45);
    
    const summaryData = [
      ['Total de Ventas', stats.summary.totalSales],
      ['Ingresos Totales', `$${stats.summary.totalRevenue.toFixed(2)}`],
      ['IVA Total', `$${stats.summary.totalTax.toFixed(2)}`],
      ['Descuentos', `$${stats.summary.totalDiscount.toFixed(2)}`],
      ['Ticket Promedio', `$${stats.summary.averageTicket.toFixed(2)}`]
    ];
    
    doc.autoTable({
      startY: 50,
      head: [['Métrica', 'Valor']],
      body: summaryData,
      theme: 'grid'
    });
    
    // Productos más vendidos
    if (stats.topProducts && stats.topProducts.length > 0) {
      doc.setFontSize(14);
      doc.text('Productos Más Vendidos', 14, doc.lastAutoTable.finalY + 15);
      
      const productsData = stats.topProducts.map(p => [
        p.name,
        p.quantity,
        `$${p.revenue.toFixed(2)}`
      ]);
      
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Producto', 'Cantidad', 'Ingresos']],
        body: productsData,
        theme: 'striped'
      });
    }
    
    // Ventas por método de pago
    if (stats.byPaymentMethod) {
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Ventas por Método de Pago', 14, 22);
      
      const paymentData = Object.entries(stats.byPaymentMethod).map(([method, amount]) => [
        method,
        `$${amount.toFixed(2)}`
      ]);
      
      doc.autoTable({
        startY: 27,
        head: [['Método de Pago', 'Total']],
        body: paymentData,
        theme: 'grid'
      });
    }
    
    doc.save(`reporte-ventas-${dateRange.startDate}-${dateRange.endDate}.pdf`);
    toast.success('PDF generado correctamente');
  };

  const exportToExcel = () => {
    if (!stats) return;

    const wb = XLSX.utils.book_new();
    
    // Hoja 1: Resumen
    const summaryData = [
      ['Métrica', 'Valor'],
      ['Total de Ventas', stats.summary.totalSales],
      ['Ingresos Totales', stats.summary.totalRevenue.toFixed(2)],
      ['IVA Total', stats.summary.totalTax.toFixed(2)],
      ['Descuentos', stats.summary.totalDiscount.toFixed(2)],
      ['Ticket Promedio', stats.summary.averageTicket.toFixed(2)]
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Resumen');
    
    // Hoja 2: Productos más vendidos
    if (stats.topProducts && stats.topProducts.length > 0) {
      const productsData = [
        ['Producto', 'Cantidad', 'Ingresos'],
        ...stats.topProducts.map(p => [p.name, p.quantity, p.revenue.toFixed(2)])
      ];
      const ws2 = XLSX.utils.aoa_to_sheet(productsData);
      XLSX.utils.book_append_sheet(wb, ws2, 'Productos');
    }
    
    // Hoja 3: Ventas por método de pago
    if (stats.byPaymentMethod) {
      const paymentData = [
        ['Método de Pago', 'Total'],
        ...Object.entries(stats.byPaymentMethod).map(([method, amount]) => [method, amount.toFixed(2)])
      ];
      const ws3 = XLSX.utils.aoa_to_sheet(paymentData);
      XLSX.utils.book_append_sheet(wb, ws3, 'Métodos de Pago');
    }
    
    // Hoja 4: Ventas diarias
    if (stats.dailySales && stats.dailySales.length > 0) {
      const dailyData = [
        ['Fecha', 'Cantidad', 'Total'],
        ...stats.dailySales.map(d => [d.date, d.count, d.total.toFixed(2)])
      ];
      const ws4 = XLSX.utils.aoa_to_sheet(dailyData);
      XLSX.utils.book_append_sheet(wb, ws4, 'Ventas Diarias');
    }
    
    XLSX.writeFile(wb, `reporte-ventas-${dateRange.startDate}-${dateRange.endDate}.xlsx`);
    toast.success('Excel generado correctamente');
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Cargando reportes...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FiTrendingUp className="text-blue-600" />
              Reportes de Ventas
            </h1>
            <p className="text-gray-500 mt-1">Análisis detallado de tus ventas</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <FiFileText />
              Exportar PDF
            </button>
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <FiDownload />
              Exportar Excel
            </button>
          </div>
        </div>

        {/* Filtros de fecha */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center gap-4">
            <FiCalendar className="text-gray-400 text-xl" />
            <div className="flex flex-wrap gap-4 flex-1">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
                <input
                  type="date"
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleDateChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
                <input
                  type="date"
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleDateChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tarjetas de resumen */}
        {stats && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FiShoppingCart className="text-blue-600 text-2xl" />
                  </div>
                </div>
                <p className="text-gray-600 text-sm">Total Ventas</p>
                <p className="text-3xl font-bold text-gray-900">{stats.summary.totalSales}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <FiDollarSign className="text-green-600 text-2xl" />
                  </div>
                </div>
                <p className="text-gray-600 text-sm">Ingresos Totales</p>
                <p className="text-3xl font-bold text-green-600">${stats.summary.totalRevenue.toFixed(2)}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <FiTrendingUp className="text-purple-600 text-2xl" />
                  </div>
                </div>
                <p className="text-gray-600 text-sm">Ticket Promedio</p>
                <p className="text-3xl font-bold text-purple-600">${stats.summary.averageTicket.toFixed(2)}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <FiDollarSign className="text-orange-600 text-2xl" />
                  </div>
                </div>
                <p className="text-gray-600 text-sm">IVA Total</p>
                <p className="text-3xl font-bold text-orange-600">${stats.summary.totalTax.toFixed(2)}</p>
              </div>
            </div>

            {/* Gráfico de líneas - Ventas en el tiempo */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Tendencia de Ventas (Últimos 30 días)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="ventas" stroke="#8884d8" name="Cantidad de Ventas" />
                  <Line yAxisId="right" type="monotone" dataKey="ingresos" stroke="#82ca9d" name="Ingresos ($)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Productos más vendidos */}
              {stats.topProducts && stats.topProducts.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Top 10 Productos Más Vendidos</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.topProducts}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="quantity" fill="#8884d8" name="Cantidad" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Ventas por método de pago */}
              {stats.byPaymentMethod && Object.keys(stats.byPaymentMethod).length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Ventas por Método de Pago</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={Object.entries(stats.byPaymentMethod).map(([name, value]) => ({ name, value }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.keys(stats.byPaymentMethod).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default ReportsIndex;