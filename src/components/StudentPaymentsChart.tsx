"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface StudentPaymentsData {
  totalToPay: number;
  totalPaid: number;
  remainingToPay: number;
  paymentPercentage: number;
  totalStudents: number;
  studentsWithPayments: number;
}

const StudentPaymentsChart = ({ data }: { data: StudentPaymentsData }) => {
  // Data for the bar chart
  const barChartData = [
    {
      name: "Total à payer",
      amount: data.totalToPay,
      fill: "#3B82F6", // Blue
    },
    {
      name: "Total payé",
      amount: data.totalPaid,
      fill: "#10B981", // Green
    },
    {
      name: "Reste à payer",
      amount: data.remainingToPay,
      fill: "#F59E0B", // Orange
    },
  ];

  // Data for the pie chart (payment status)
  const pieChartData = [
    {
      name: "Payé",
      value: data.totalPaid,
      fill: "#10B981", // Green
    },
    {
      name: "En attente",
      value: data.remainingToPay,
      fill: "#F59E0B", // Orange
    },
  ];

  // Custom tooltip for bar chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{label}</p>
          <p className="text-sm" style={{ color: payload[0].color }}>
            {`Montant: ${payload[0].value.toLocaleString()} TND`}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for pie chart
  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = data.payload.value + (data.payload.name === "Payé" ? 
        pieChartData.find(d => d.name === "En attente")?.value || 0 : 
        pieChartData.find(d => d.name === "Payé")?.value || 0);
      const percentage = ((data.payload.value / total) * 100).toFixed(1);
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{data.name}</p>
          <p className="text-sm" style={{ color: data.color }}>
            {`${data.value.toLocaleString()} TND (${percentage}%)`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl w-full h-full p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg font-semibold">Paiements Étudiants</h1>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Payé</span>
          <div className="w-3 h-3 bg-orange-500 rounded-full ml-4"></div>
          <span className="text-sm text-gray-600">En attente</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100%-80px)]">
        {/* Bar Chart */}
        <div className="flex flex-col">
          <h3 className="text-md font-semibold text-gray-700 mb-4">Répartition des Montants</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
                tickLine={false}
              />
              <YAxis 
                axisLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
                tickLine={false}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="amount" 
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="flex flex-col">
          <h3 className="text-md font-semibold text-gray-700 mb-4">Statut des Paiements</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-lg font-bold text-blue-800">{data.totalStudents}</p>
          <p className="text-sm text-blue-600">Total Étudiants</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-lg font-bold text-green-800">{data.studentsWithPayments}</p>
          <p className="text-sm text-green-600">Ont Payé</p>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <p className="text-lg font-bold text-orange-800">{data.totalStudents - data.studentsWithPayments}</p>
          <p className="text-sm text-orange-600">En Attente</p>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <p className="text-lg font-bold text-purple-800">{data.paymentPercentage.toFixed(1)}%</p>
          <p className="text-sm text-purple-600">Taux de Paiement</p>
        </div>
      </div>
    </div>
  );
};

export default StudentPaymentsChart;
