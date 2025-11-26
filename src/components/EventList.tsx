import prisma from "@/lib/prisma";

const ListeEvenements = async ({ dateParam }: { dateParam: string | undefined }) => {
  // Use a more stable date handling to avoid hydration issues
  const date = dateParam ? new Date(dateParam) : new Date();
  
  // Create a new date object to avoid mutating the original
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const donnees = await prisma.event.findMany({
    where: {
      startTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  // If no events found, show a message
  if (donnees.length === 0) {
    return (
      <div className="p-5 rounded-md border-2 border-gray-100 text-center text-gray-500">
        <p className="text-sm">Aucun événement prévu pour cette date</p>
      </div>
    );
  }

  return donnees.map((evenement) => (
    <div
      className="p-5 rounded-md border-2 border-gray-100 border-t-4 odd:border-t-lamaSky even:border-t-lamaPurple"
      key={evenement.id}
    >
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-gray-600">{evenement.title}</h1>
        <span className="text-gray-300 text-xs">
          {evenement.startTime.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </span>
      </div>
      <p className="mt-2 text-gray-400 text-sm">{evenement.description}</p>
    </div>
  ));
};

export default ListeEvenements;
