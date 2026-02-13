"use client";

import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabase';
import { calculateImportFees } from '@/lib/calculs';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Car, Fuel, Gauge, Calendar, ArrowLeft } from "lucide-react";

export default function CarDetailsClient({ id }: { id: string }) {
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState<string>("");

  useEffect(() => {
    async function fetchCar() {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        setLoading(false);
        return;
      }

      setCar(data);
      setMainImage(data.images?.[0] || "");
      setLoading(false);
    }
    fetchCar();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!car) return notFound();

  const fees = calculateImportFees({
    priceEuro: car.price_euro,
    engineSize: car.engine_size,
    fuelType: car.fuel_type,
  });

  const siteUrl = "https://car-import-dz.vercel.app";
  const waMessage = `Bonjour, je suis intéressé par la ${car.make} ${car.model} (${car.year_of_registration}) au prix de ${Math.round(fees.totalDZD).toLocaleString()} DA. Voici le lien : ${siteUrl}/cars/${car.id}`;

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      {/* ... TOUT TON CODE HTML DU COMPOSANT (LE MÊME QU'AVANT) ... */}
      <div className="max-w-4xl mx-auto">
         {/* Remets ici tout le JSX que tu avais dans ton fichier original */}
         {/* (Lien retour, Galerie photo, Caractéristiques, Bloc Bleu, Bouton WhatsApp) */}
         <a href="/" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-medium mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour au catalogue
         </a>
         {/* etc... */}
      </div>
    </main>
  );
}