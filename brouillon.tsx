import { supabase } from '@/lib/supabase';
import CarCard from '@/components/CarCard';
export const revalidate = 0; // Cela force la page à se recharger à chaque visite
export default async function Home() {
  // Fetch des données depuis Supabase
  const { data: cars, error } = await supabase
    .from('cars')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return <p>Erreur lors du chargement des voitures.</p>;

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900">Catalogue Auto 🚗</h1>
            <p className="text-gray-600 mt-2">Sélection de véhicules de moins de 3 ans éligibles pour l'Algérie.</p>
          </div>
          <a href="/simulateur" className="text-blue-600 font-semibold hover:underline">
            Calculer les taxes →
          </a>
        </header>

        {/* GRILLE DE VOITURES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {cars?.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>

        {cars?.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed">
            <p className="text-gray-500">Aucune voiture disponible pour le moment.</p>
          </div>
        )}
      </div>
    </main>
  );
}