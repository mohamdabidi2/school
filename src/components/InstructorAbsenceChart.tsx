"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Composant pour afficher un graphique d'absences des enseignants
const InstructorAbsenceChart = ({
  data,
}: {
  data: { name: string; absences: number }[];
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
          formatter={(value: number) => [`${value} absences`, "Absences"]}
          labelFormatter={(label: string) => `Enseignant : ${label}`}
        />
        <Bar
          dataKey="absences"
          fill="#F59E0B" // Vibrant orange - already good contrast on white
          radius={[10, 10, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default InstructorAbsenceChart;
