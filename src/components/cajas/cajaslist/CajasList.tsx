import { useQuery } from "@tanstack/react-query";
import { getBatch } from "../../../api/Post/BatchApi/BatchApi";
import { useEffect, useState } from "react";

interface ModalCajasProps {
  openCaja: (Lote: string) => void;
  openBatch: (ID_Batch: number) => void;
  resetChecks: boolean;
  onResetComplete: () => void;
  searchTerm: string;
}

export interface User {
  ID_User: number;
  Name: string;
}

export interface Batch {
  ID_Batch: number;
  Lote: string;
  Date: Date;
  User: User;
  State: boolean;
}

const CajasList = ({ openCaja, openBatch, resetChecks, onResetComplete, searchTerm }: ModalCajasProps) => {

  const { data: batchsData } = useQuery({
    queryKey: ['batchs', searchTerm],
    queryFn: () => getBatch(searchTerm),
    placeholderData: (prev) => prev,
  });

  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => {
    if (resetChecks) {
      setSelected([]);
      onResetComplete();
    }
  }, [resetChecks]);

  useEffect(() => {
    if (selected.length === 0) {
      onResetComplete();
    }
  }, [selected]);

  const handleCheckToggle = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    openBatch(id);
  };

  return (
    <div className="overflow-x-auto border rounded-md shadow-sm">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100 text-gray-700 uppercase">
          <tr>
            <th className="px-5 py-2">
              <input type="checkbox" disabled />
            </th>
            <th className="px-5 py-2">ID</th>
            <th className="px-5 py-2">Lote</th>
            <th className="px-10 py-2">Creado por</th>
            <th className="px-5 py-2">Fecha</th>
            <th className="px-5 py-2">Estado</th>
          </tr>
        </thead>
        <tbody>
          {batchsData?.data?.map((batch: Batch) => (
            <tr
              key={batch.ID_Batch}
              className="border-t"
              onClick={() => openCaja(batch.Lote)}
            >
              <td className="px-5 py-2">
                <input
                  type="checkbox"
                  checked={selected.includes(batch.ID_Batch)}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => handleCheckToggle(batch.ID_Batch)}
                />
              </td>

              <td className="px-5 py-2">{batch.ID_Batch}</td>
              <td className="px-5 py-2">{batch.Lote}</td>
              <td className="px-10 py-2">{batch.User.Name}</td>
              <td className="px-5 py-2">
                {batch.Date
                  ? new Date(batch.Date).toLocaleDateString("es-MX", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : ""}
              </td>
              <td className="px-5 py-2">
                {batch.State ? "Activo" : "Inactivo"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CajasList;
