"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type ValeurPiece = Date | null;

type Valeur = ValeurPiece | [ValeurPiece, ValeurPiece];

const CalendrierEvenement = () => {
  const [valeur, changerValeur] = useState<Valeur>(null);
  const [mounted, setMounted] = useState(false);

  const routeur = useRouter();

  useEffect(() => {
    setMounted(true);
    changerValeur((previous) => {
      if (previous) {
        return previous;
      }
      return new Date();
    });
  }, []);

  useEffect(() => {
    if (mounted && valeur instanceof Date) {
      routeur.push(`?date=${valeur}`);
    }
  }, [valeur, routeur, mounted]);

  if (!mounted) {
    return <div className="h-[300px] bg-gray-100 rounded animate-pulse" />;
  }

  return <Calendar onChange={changerValeur} value={valeur} />;
};

export default CalendrierEvenement;
