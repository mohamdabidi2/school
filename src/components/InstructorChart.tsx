"use client";
import Image from "next/image";
import {
  RadialBarChart,
  RadialBar,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Picked harmonious, vivid, and accessible colors
const InstructorChart = ({ male, female }: { male: number; female: number }) => {
  const data = [
    {
      name: "Total",
      count: male + female,
      fill: "#F3F4F6", // Light grey for total - better contrast on white
    },
    {
      name: "Femmes",
      count: female,
      fill: "#EC4899", // Vibrant pink - better contrast on white
    },
    {
      name: "Hommes",
      count: male,
      fill: "#3B82F6", // Vibrant blue - better contrast on white
    },
  ];
  return (
    <div className="relative w-full h-[75%]">
      <ResponsiveContainer>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="40%"
          outerRadius="100%"
          barSize={32}
          data={data}
        >
          <RadialBar 
            background 
            dataKey="count" 
            data={data} 
            cornerRadius={12}
            // Enable using the fill colors per data row
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <Image
        src="/teacher.png"
        alt="Icône enseignant"
        width={50}
        height={50}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />
    </div>
  );
};

export default InstructorChart;
