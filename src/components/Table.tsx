const Tableau = ({
  colonnes = [],
  afficherLigne,
  donnees = [],
}: {
  colonnes?: { enTete: string; cle: string; classeNom?: string }[];
  afficherLigne: (element: any) => React.ReactNode;
  donnees?: any[];
}) => {
  return (
    <div className="responsive-table mt-4">
      <table className="w-full">
        <thead>
          <tr className="text-left text-gray-500 text-sm">
            {(colonnes ?? []).map((col) => (
              <th key={col.cle} className={col.classeNom}>
                {col.enTete}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{(donnees ?? []).map((element) => afficherLigne(element))}</tbody>
      </table>
    </div>
  );
};

export default Tableau;
