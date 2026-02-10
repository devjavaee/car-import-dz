import { supabase } from '@/lib/supabase';
import { calculateImportFees } from '@/lib/calculs';
import { notFound } from 'next/navigation';
import Image from 'next/image'; // Importation pour l'image
import { Car, Fuel, Gauge, Calendar, ArrowLeft } from "lucide-react";

export default async function CarDetailsPage({ 
    params 
}: { 
    params: { id: string } }) {
  
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const { data: car, error } = await supabase
    .from('cars')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !car) {
    notFound();
  }

  const fees = calculateImportFees({
    priceEuro: car.price_euro,
    engineSize: car.engine_size,
    fuelType: car.fuel_type,
  });

  // URL du site pour le message WhatsApp
  const siteUrl = "https://car-import-dz.vercel.app";
  const waMessage = `Bonjour, je suis intéressé par la ${car.make} ${car.model} (${car.year_of_registration}) au prix de ${Math.round(fees.totalDZD).toLocaleString()} DA. Voici le lien : ${siteUrl}/cars/${car.id}`;

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* BOUTON RETOUR AMÉLIORÉ */}
        <a href="/" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-medium mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour au catalogue
        </a>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          
          {/* AFFICHAGE DE L'IMAGE PRINCIPALE */}
          <div className="relative h-64 md:h-[400px] w-full bg-gray-200">
            {car.images?.[0] ? (
              <Image 
                src={car.images[0]} 
                alt={`${car.make} ${car.model}`}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">Aucune image disponible</div>
            )}
            {/* Badge Année sur l'image */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-1 rounded-full font-bold text-blue-600 shadow-sm">
              {car.year_of_registration}
            </div>
          </div>

          <div className="p-8">
            <h1 className="text-4xl font-black text-gray-900 capitalize mb-2">
              {car.make} <span className="text-blue-600">{car.model}</span>
            </h1>
            <p className="text-gray-400 font-medium">Référence : #{car.id.slice(0, 8)}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-10">
              
              {/* FICHE TECHNIQUE AVEC ICÔNES */}
              <div>
                <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-800">
                  <Car className="w-5 h-5 text-blue-500" /> Caractéristiques
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-500 flex items-center gap-2"><Fuel className="w-4 h-4" /> Énergie</span>
                    <span className="font-bold capitalize">{car.fuel_type}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-500 flex items-center gap-2"><Gauge className="w-4 h-4" /> Cylindrée</span>
                    <span className="font-bold">{car.engine_size} cm³</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> Kilométrage</span>
                    <span className="font-bold">{car.mileage?.toLocaleString()} km</span>
                  </div>
                </div>
              </div>

              {/* RÉCAPITULATIF FINANCIER */}
              <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-100 relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-xl font-bold mb-6 opacity-90">Coût Estimé</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="opacity-80">Prix Europe</span>
                            <span className="font-semibold">{car.price_euro.toLocaleString()} €</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="opacity-80">Douane & Taxes</span>
                            <span className="font-semibold">+{fees.customsFees.toLocaleString()} €</span>
                        </div>
                        <div className="pt-6 border-t border-white/20">
                            <p className="text-xs uppercase font-bold opacity-70 mb-1">Total Clef en main (Alger)</p>
                            <p className="text-4xl font-black italic">
                                {Math.round(fees.totalDZD).toLocaleString()} <span className="text-lg">DA</span>
                            </p>
                        </div>
                    </div>
                </div>
                {/* Décoration en fond */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              </div>
            </div>

            {/* BOUTON WHATSAPP AMÉLIORÉ */}
            <div className="mt-12 text-center">
              <a 
                href={`https://wa.me/213770000000?text=${encodeURIComponent(waMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-[#25D366] text-white px-10 py-5 rounded-2xl font-black text-xl hover:bg-[#128C7E] transition-all hover:scale-105 shadow-xl"
              >
                Commander via WhatsApp
              </a>
              <p className="text-gray-400 text-sm mt-4 italic">
                Réponse sous 24h • Accompagnement complet
              </p>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}