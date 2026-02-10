// src/app/cars/[id]/page.tsx
import { supabase } from '@/lib/supabase';
import { calculateImportFees } from '@/lib/calculs';
import { notFound } from 'next/navigation';

export default async function CarDetailsPage({ 
    params 
}: { 
    params: { id: string } }) {
  // 1. Récupérer l'ID de l'URL
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // 2. Fetcher les données de CETTE voiture spécifique
  const { data: car, error } = await supabase
    .from('cars')
    .select('*')
    .eq('id', id)
    .single();

  // Si la voiture n'existe pas ou erreur, on affiche la page 404
  if (error || !car) {
    notFound();
  }

  // 3. Calculer les frais détaillés
  const fees = calculateImportFees({
    priceEuro: car.price_euro,
    engineSize: car.engine_size,
    fuelType: car.fuel_type,
  });

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* BOUTON RETOUR */}
        <a href="/" className="text-blue-600 hover:underline mb-6 inline-block">
          ← Retour au catalogue
        </a>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* BANNIÈRE TITRE */}
          <div className="bg-gray-900 text-white p-8">
            <h1 className="text-4xl font-bold">
              {car.make} {car.model}
            </h1>
            <p className="text-gray-400 mt-2">Mise en circulation : {car.first_registration_date}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* COLONNE GAUCHE : INFOS TECHNIQUES */}
            <div>
              <h2 className="text-xl font-bold mb-4 border-b pb-2">Fiche Technique</h2>
              <ul className="space-y-3">
                <li className="flex justify-between">
                  <span className="text-gray-500">Énergie</span>
                  <span className="font-semibold capitalize">{car.fuel_type}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">Cylindrée</span>
                  <span className="font-semibold">{car.engine_size} cm³</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">Kilométrage</span>
                  <span className="font-semibold">{car.mileage?.toLocaleString()} km</span>
                </li>
              </ul>
            </div>

            {/* COLONNE DROITE : RÉCAPITULATIF FINANCIER */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <h2 className="text-xl font-bold text-blue-900 mb-4">Coût de revient total</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-blue-700">Prix véhicule (Europe)</span>
                  <span className="font-bold">{car.price_euro.toLocaleString()} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Dédouanement (Est.)</span>
                  <span className="font-bold text-orange-600">+{fees.customsFees.toLocaleString()} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Fret & Logistique</span>
                  <span className="font-bold">+{fees.transportFees} €</span>
                </div>
                <div className="pt-4 border-t border-blue-200 mt-4">
                  <p className="text-sm text-blue-600 font-medium">Prix Total (Rendu Alger)</p>
                  <p className="text-3xl font-black text-blue-900">
                    {Math.round(fees.totalDZD).toLocaleString()} DA
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* AJOUT DU BOUTON WHATSAPP (Ton défi) */}
          <div className="p-8 border-t border-gray-100 bg-gray-50 text-center">
            <a 
              href={`https://wa.me/213770000000?text=Bonjour, je suis intéressé par la ${car.make} ${car.model} affichée sur votre site.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg"
            >
              <span>Contacter sur WhatsApp</span>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.588-5.946 0-6.556 5.332-11.888 11.888-11.888 3.176 0 6.161 1.237 8.404 3.48s3.481 5.229 3.481 8.404c0 6.556-5.332 11.888-11.888 11.888-2.01 0-3.987-.508-5.741-1.472l-6.143 1.612zm6.189-3.921c1.597.949 3.19 1.425 4.735 1.425 5.232 0 9.49-4.258 9.49-9.49 0-2.535-1.01-4.918-2.846-6.754s-4.219-2.846-6.754-2.846c-5.232 0-9.49 4.258-9.49 9.49 0 1.691.464 3.245 1.341 4.637l-1.012 3.693 3.836-.985z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}