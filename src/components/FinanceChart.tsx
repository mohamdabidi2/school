"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const GraphiqueFinancier = ({ data }: { data: { nom: string; revenu: number; depense: number }[] }) => {
  return (
    <ResponsiveContainer width="100%" height="90%">
      <LineChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
          <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
          <XAxis
            dataKey="nom"
            axisLine={false}
            tick={{ fill: "#d1d5db" }}
            tickLine={false}
            tickMargin={10}
          />
          <YAxis axisLine={false} tick={{ fill: "#d1d5db" }} tickLine={false} tickMargin={20}/>
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name === "revenu") return [`${value} TND`, "Revenu"];
              if (name === "depense") return [`${value} TND`, "Dépenses Acceptées"];
              return [value, name];
            }}
            labelFormatter={(label: string) => `Mois : ${label}`}
          />
          <Legend
            align="center"
            verticalAlign="top"
            wrapperStyle={{ paddingTop: "10px", paddingBottom: "30px" }}
            formatter={(value: string) => {
              if (value === "revenu") return "Revenu";
              if (value === "depense") return "Dépenses Acceptées";
              return value;
            }}
          />
          <Line
            type="monotone"
            dataKey="revenu"
            stroke="#059669" // Vibrant green - better contrast on white
            strokeWidth={5}
            name="Revenu"
          />
          <Line
            type="monotone"
            dataKey="depense"
            stroke="#DC2626" // Vibrant red - better contrast on white
            strokeWidth={5}
            name="Dépense"
          />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default GraphiqueFinancier;
