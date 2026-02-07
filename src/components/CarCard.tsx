// src/components/CarCard.tsx
import Link from 'next/link';

interface CarProps {
  car: {
    id: string;
    make: string;
    model: string;
    year_of_registration: number;
    price_euro: number;
    fuel_type: string;
    engine_size: number;
  };
}

export default function CarCard({ car }: CarProps) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
      {/* Placeholder pour l'image (en attendant le Sprint 4) */}
      <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-400">
        <span className="text-sm">Image bientôt disponible</span>
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
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
            {car.fuel_type}
          </span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
            {car.engine_size} cm³
          </span>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-gray-500">Prix Europe</p>
            <p className="text-xl font-bold text-blue-600">
              {car.price_euro.toLocaleString()} €
            </p>
          </div>
          
          <Link 
            href={`/cars/${car.id}`}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Détails
          </Link>
        </div>
      </div>
    </div>
  );
}