"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { LogOut, PlusCircle, UploadCloud, Star, X } from "lucide-react";

export default function AdminPage() {
  // ... (garder tes autres états)
  const [files, setFiles] = useState<File[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState<number>(0); // Index de l'image principale

  // ... (garder handleLogin)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData(e.currentTarget);
      let imageUrls: string[] = [];

      // --- ÉTAPE A : UPLOAD ---
      if (files.length > 0) {
        const uploadPromises = files.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
          const filePath = `cars/${fileName}`;
          await supabase.storage.from('car-images').upload(filePath, file);
          const { data: { publicUrl } } = supabase.storage.from('car-images').getPublicUrl(filePath);
          return publicUrl;
        });

        imageUrls = await Promise.all(uploadPromises);

        // --- ÉTAPE B : RÉORGANISATION ---
        // On place l'image choisie en première position du tableau
        const primary = imageUrls[mainImageIndex];
        const others = imageUrls.filter((_, idx) => idx !== mainImageIndex);
        imageUrls = [primary, ...others];
      }

      // --- ÉTAPE C : INSERTION ---
      const newCar = {
        make: formData.get("make") as string,
        // ... (tes autres champs identiques)
        model: formData.get("model") as string,
        year_of_registration: parseInt(formData.get("year") as string),
        price_euro: parseFloat(formData.get("price") as string),
        fuel_type: formData.get("fuel") as string,
        engine_size: parseInt(formData.get("engine") as string),
        mileage: parseInt(formData.get("mileage") as string),
        first_registration_date: formData.get("date") as string,
        images: imageUrls, 
      };

      const { error: insertError } = await supabase.from("cars").insert([newCar]);
      if (insertError) throw insertError;

      setMessage("Annonce publiée avec l'image principale choisie ! 🚀");
      setFiles([]);
      setMainImageIndex(0);
      (e.target as HTMLFormElement).reset();

    } catch (error: any) {
      setMessage("Erreur : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        {/* ... Header ... */}
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          
          {/* ... Tes champs (make, model, etc.) ... */}

          {/* ZONE D'UPLOAD AMÉLIORÉE */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Photos du véhicule</label>
            
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors relative bg-gray-50">
              <input 
                type="file" multiple accept="image/*"
                onChange={(e) => {
                  if (e.target.files) {
                    setFiles(Array.from(e.target.files));
                    setMainImageIndex(0); // Reset l'image principale au premier fichier
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="mx-auto text-gray-300 mb-2" size={32} />
              <p className="text-sm text-gray-500 italic">Cliquez pour ajouter des photos</p>
            </div>

            {/* PRÉVISUALISATION ET CHOIX DE LA PHOTO PRINCIPALE */}
            {files.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                {files.map((file, index) => (
                  <div 
                    key={index}
                    onClick={() => setMainImageIndex(index)}
                    className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer border-4 transition-all ${
                      mainImageIndex === index ? "border-blue-500 scale-105 shadow-lg" : "border-transparent opacity-60"
                    }`}
                  >
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt="preview" 
                      className="w-full h-full object-cover" 
                    />
                    {mainImageIndex === index && (
                      <div className="absolute top-1 right-1 bg-blue-500 text-white p-1 rounded-full">
                        <Star size={12} fill="currentColor" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {files.length > 0 && (
              <p className="text-xs text-center text-blue-600 font-medium">
                ⭐ Cliquez sur une photo pour la définir comme image principale (couverture)
              </p>
            )}
          </div>

          {/* ... Bouton Submit ... */}
        </form>
      </div>
    </main>
  );
}