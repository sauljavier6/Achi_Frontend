import { useQuery } from '@tanstack/react-query';
import { getDatos } from '../../../api/Post/InformationApi/InformationApi';

interface CajasProps {
  Lote: string;
}

const DetallesCaja = ({ Lote }: CajasProps) => {

  const { data: information } = useQuery({
    queryKey: ['information', Lote],
    queryFn: () => getDatos(Lote),
    enabled: !!Lote,
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Detalle del Lote</h2>

      <div className="space-y-3">
        <div className="flex justify-between items-center border-b pb-2">
          <span className="text-gray-600">💵 Efectivo</span>
          <span className="font-semibold">${information?.totales.efectivo}</span>
        </div>

        <div className="flex justify-between items-center border-b pb-2">
          <span className="text-gray-600">💳 Tarjetas</span>
          <span className="font-semibold">${information?.totales.tarjetas}</span>
        </div>

        <div className="flex justify-between items-center border-b pb-2">
          <span className="text-gray-600">📝 Cheques</span>
          <span className="font-semibold">${information?.totales.cheques}</span>
        </div>

        <div className="flex justify-between items-center border-b pb-2 mt-4">
          <span className="text-gray-800 font-medium">📈 Ventas</span>
          <span className="text-green-600 font-semibold">${information?.totales.ventas}</span>
        </div>

        <div className="flex justify-between items-center border-b pb-2">
          <span className="text-gray-800 font-medium">📉 Salidas</span>
          <span className="text-red-600 font-semibold">-${information?.totales.salidas}</span>
        </div>

        <div className="flex justify-between items-center mt-4 pt-2 border-t">
          <span className="text-gray-900 font-bold">💰 Total Ingresos</span>
          <span className="text-blue-600 font-bold">${information?.totales.ventas - information?.totales.salidas}</span>
        </div>
      </div>
    </div>
  );
};

export default DetallesCaja;
