"use client";
import Image from "next/image";
import {
  RadialBarChart,
  RadialBar,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Picked harmonious, vivid, and accessible colors
const CountChart = ({ boys, girls }: { boys: number; girls: number }) => {
  const data = [
    {
      name: "Total",
      count: boys + girls,
      fill: "#F3F4F6", // Light grey for total - better contrast on white
    },
    {
      name: "Filles",
      count: girls,
      fill: "#EC4899", // Vibrant pink - better contrast on white
    },
    {
      name: "Garçons",
      count: boys,
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
        src="/maleFemale.png"
        alt="Icône garçon/fille"
        width={50}
        height={50}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />
    </div>
  );
};

export default CountChart;
