import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Fuel, Gauge, ExternalLink } from "lucide-react";
// On importe notre fonction de calcul
import { calculateImportFees } from "@/lib/calculs";


// 1. On définit l'interface pour être carré avec TypeScript
interface Car {
  id: string;
  make: string;
  model: string;
  year_of_registration: number;
  price_euro: number;
  fuel_type: string;
  engine_size: number;
  images: string[] | null; // On précise que c'est un tableau de textes ou null
}
interface CarCardProps {
  car: Car;
}

export default function CarCard({ car }: CarCardProps) {
  // On calcule les frais complets pour cette voiture spécifique
  const fees = calculateImportFees({
    priceEuro: car.price_euro,
    engineSize: car.engine_size,
    fuelType: car.fuel_type as any,
  });
  // 2. On sécurise l'accès à l'image
 const mainImage = (car.images && car.images.length > 0) ? car.images[0] : "/placeholder-car.jpg";

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
      <div className="relative h-52 w-full overflow-hidden">
        <Image 
          src={mainImage} 
          alt={car.model}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-blue-600 shadow-sm">
          {car.year_of_registration}
        </div>
      </div>

      <div className="p-5">
        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-900 mb-1 capitalize">
            {car.make} <span className="text-blue-600">{car.model}</span>
          </h3>
        
        </div>

       {/* Grille d'infos avec icônes */}
    <div className="grid grid-cols-2 gap-3 my-4">
      <div className="flex items-center text-gray-500 text-sm">
        <Gauge className="w-4 h-4 mr-2 text-gray-400" />
        {car.engine_size} cm³
      </div>
      <div className="flex items-center text-gray-500 text-sm">
        <Fuel className="w-4 h-4 mr-2 text-gray-400" />
        <span className="capitalize">{car.fuel_type}</span>
      </div>
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
              className="bg-blue-50 p-2 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors"
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