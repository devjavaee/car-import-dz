import { supabase } from '@/lib/supabase';

export default async function Home() {
  // On récupère les voitures depuis Supabase côté serveur !
  const { data: cars, error } = await supabase.from('cars').select('*');

  if (error) {
    return <div className="p-10 text-red-500">Erreur : {error.message}</div>;
  }

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-6">Bienvenue sur Car Import DZ</h1>
      
      <div>
        {cars && cars.length > 0 ? (
          <p>Il y a {cars.length} voiture(s) dans la base de données.</p>
        ) : (
          <p className="text-gray-600">La base de données est connectée, mais elle est vide !</p>
        )}
      </div>
    </main>
  );
}