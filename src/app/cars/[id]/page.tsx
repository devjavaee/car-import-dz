import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import CarDetailsClient from './CarDetailsClient';

// 1. SEO CÔTÉ SERVEUR
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { id } = await params;
  
  const { data: car } = await supabase
    .from('cars')
    .select('make, model, year_of_registration, images')
    .eq('id', id)
    .single();

  if (!car) return { title: "Véhicule non trouvé" };

  const title = `${car.make.toUpperCase()} ${car.model} (${car.year_of_registration}) - Import DZ`;

  return {
    title,
    openGraph: {
      title,
      images: car.images?.[0] ? [{ url: car.images[0] }] : [],
    },
  };
}

// 2. RENDU DE LA PAGE
export default async function Page({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  // On passe juste l'ID au composant client qui fera le reste
  return <CarDetailsClient id={id} />;
}