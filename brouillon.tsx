import Link from 'next/link';
// On importe notre fonction de calcul
import { calculateImportFees } from "@/lib/calculs";
import Image from 'next/image';

interface CarProps {
  car: {
    id: string;
    make: string;
    model: string;
    year_of_registration: number;
    price_euro: number;
    fuel_type: string;
    engine_size: number;
    images: string[] | null; // On précise que c'est un tableau de textes ou null
  };
}

export default function CarCard({ car }: CarProps) {
  // On calcule les frais complets pour cette voiture spécifique
  const fees = calculateImportFees({
    priceEuro: car.price_euro,
    engineSize: car.engine_size,
    fuelType: car.fuel_type as any,
  });

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
    


<div className="relative h-48 w-full bg-gray-200">
  {car.images && car.images[0] ? (
    <Image 
      src={car.images[0]} 
      alt={`${car.make} ${car.model}`}
      fill
      className="object-cover"
    />
  ) : (
    <div className="flex items-center justify-center h-full text-gray-400 text-xs">
      Pas de photo disponible
    </div>
  )}
</div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900">
            {car.make} {car.model}
          </h3>
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
            {car.year_of_registration}
          </span>
        </div>

        <div className="flex gap-2 mb-4">
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded capitalize">
            {car.fuel_type}
          </span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
            {car.engine_size} cm³
          </span>
        </div>

        {/* AFFICHAGE DES PRIX */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Prix Europe</p>
              <p className="text-lg font-bold text-gray-700">
                {car.price_euro.toLocaleString()} €
              </p>
            </div>
            <Link 
              href={`/cars/${car.id}`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Voir détails
            </Link>
          </div>

          {/* Ton ajout : Le prix total estimé en DA */}
          <div className="pt-3 border-t border-dashed border-gray-200">
            <p className="text-[10px] uppercase tracking-wider text-blue-500 font-bold">Total rendu Alger (Est.)</p>
            <p className="text-xl font-black text-blue-800">
              {Math.round(fees.totalDZD).toLocaleString()} DA
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}