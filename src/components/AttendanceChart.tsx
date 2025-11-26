"use client";
import Image from "next/image";
import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Composant pour afficher un graphique de présence
const AttendanceChart = ({
  data,
}: {
  data: { name: string; present: number; absent: number }[];
}) => {
  return (
    <ResponsiveContainer width="100%" height="90%">
      <BarChart width={500} height={300} data={data} barSize={20}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ddd" />
        <XAxis
          dataKey="name"
          axisLine={false}
          tick={{ fill: "#d1d5db" }}
          tickLine={false}
        />
        <YAxis axisLine={false} tick={{ fill: "#d1d5db" }} tickLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: "10px", borderColor: "lightgray" }}
          // Texte en français pour l'infobulle
          formatter={(value: number, name: string) => {
            if (name === "present") {
              return [value, "Présent"];
            }
            if (name === "absent") {
              return [value, "Absent"];
            }
            return [value, name];
          }}
          labelFormatter={(label: string) => `Nom : ${label}`}
        />
        <Legend
          align="left"
          verticalAlign="top"
          wrapperStyle={{ paddingTop: "20px", paddingBottom: "40px" }}
          // Traduction des libellés de la légende
          formatter={(value: string) => {
            if (value === "present") return "Présent";
            if (value === "absent") return "Absent";
            return value;
          }}
        />
        <Bar
          dataKey="present"
          fill="#10B981" // Vibrant green - better contrast on white
          legendType="circle"
          radius={[10, 10, 0, 0]}
        />
        <Bar
          dataKey="absent"
          fill="#EF4444" // Vibrant red - better contrast on white
          legendType="circle"
          radius={[10, 10, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AttendanceChart;
