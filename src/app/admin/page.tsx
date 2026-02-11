"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { LogOut, PlusCircle, UploadCloud, Star, X } from "lucide-react";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  const [files, setFiles] = useState<File[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState<number>(0);

  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert("Mot de passe incorrect !");
    }
  };

  // FONCTION POUR SUPPRIMER UNE PHOTO DE LA SÉLECTION
  const removeFile = (indexToRemove: number) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
    // Si on supprime l'image principale, on remet l'index à 0
    if (mainImageIndex === indexToRemove) {
      setMainImageIndex(0);
    } else if (mainImageIndex > indexToRemove) {
      // Si on supprime une image avant la principale, on décale l'index
      setMainImageIndex(mainImageIndex - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData(e.currentTarget);
      let imageUrls: string[] = [];

      if (files.length > 0) {
        const uploadPromises = files.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
          const filePath = `cars/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('car-images')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('car-images')
            .getPublicUrl(filePath);
          
          return publicUrl;
        });

        imageUrls = await Promise.all(uploadPromises);

        const primary = imageUrls[mainImageIndex];
        const others = imageUrls.filter((_, idx) => idx !== mainImageIndex);
        imageUrls = [primary, ...others];
      }

      const newCar = {
        make: formData.get("make") as string,
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

      setMessage(`Annonce publiée avec succès ! (${imageUrls.length} photos) 🚀`);
      setFiles([]);
      setMainImageIndex(0);
      (e.target as HTMLFormElement).reset();

    } catch (error: any) {
      setMessage("Erreur : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md text-center">
          <h1 className="text-3xl font-black mb-6 text-gray-900 italic">ADMIN <span className="text-blue-600">AUTO</span></h1>
          <input 
            type="password" 
            placeholder="Mot de passe secret"
            className="w-full p-4 border border-gray-200 rounded-2xl mb-4 outline-none focus:ring-4 focus:ring-blue-100 transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full bg-gray-900 text-white p-4 rounded-2xl font-bold hover:bg-blue-600 transition-all">
            Déverrouiller
          </button>
        </form>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black text-gray-900">Nouveau Véhicule</h1>
          <button onClick={() => setIsAuthenticated(false)} className="flex items-center gap-2 text-red-500 font-bold hover:bg-red-50 p-2 rounded-lg">
            <LogOut size={18} /> Quitter
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="make" placeholder="Marque" className="border-gray-200 border p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
            <input name="model" placeholder="Modèle" className="border-gray-200 border p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <input name="year" type="number" placeholder="Année" className="border-gray-200 border p-4 rounded-xl outline-none" required />
            <input name="price" type="number" placeholder="Prix (€)" className="border-gray-200 border p-4 rounded-xl outline-none" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input name="engine" type="number" placeholder="Cylindrée" className="border-gray-200 border p-4 rounded-xl outline-none" required />
            <input name="mileage" type="number" placeholder="Kilométrage" className="border-gray-200 border p-4 rounded-xl outline-none" required />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Mise en circulation</label>
            <input name="date" type="date" className="w-full border-gray-200 border p-4 rounded-xl outline-none mt-1" required />
          </div>
          
          <select name="fuel" className="w-full border-gray-200 border p-4 rounded-xl bg-white outline-none">
            <option value="essence">Essence</option>
            <option value="hybride">Hybride</option>
            <option value="electrique">Électrique</option>
          </select>

          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Photos du véhicule</label>
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors relative bg-gray-50">
              <input 
                type="file" multiple accept="image/*"
                onChange={(e) => {
                  if (e.target.files) {
                    const newFiles = Array.from(e.target.files);
                    setFiles((prev) => [...prev, ...newFiles]); // Permet d'ajouter des photos plusieurs fois
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="mx-auto text-gray-300 mb-2" size={32} />
              <p className="text-sm text-gray-500">Cliquez pour ajouter des photos</p>
            </div>

            {files.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                {files.map((file, index) => (
                  <div key={index} className="relative group aspect-video">
                    <div 
                      onClick={() => setMainImageIndex(index)}
                      className={`w-full h-full rounded-lg overflow-hidden cursor-pointer border-4 transition-all ${
                        mainImageIndex === index ? "border-blue-500 scale-105 shadow-md" : "border-transparent opacity-70"
                      }`}
                    >
                      <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                      {mainImageIndex === index && (
                        <div className="absolute top-1 left-1 bg-blue-500 text-white p-1 rounded-full">
                          <Star size={10} fill="currentColor" />
                        </div>
                      )}
                    </div>
                    {/* BOUTON SUPPRIMER */}
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white p-5 rounded-2xl font-black text-lg hover:bg-blue-700 disabled:bg-gray-200 transition-all flex items-center justify-center gap-2"
          >
            {loading ? "Envoi en cours..." : <><PlusCircle size={20}/> Publier l'annonce</>}
          </button>

          {message && (
            <div className={`p-4 rounded-2xl text-center font-bold ${message.includes("Erreur") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
              {message}
            </div>
          )}
        </form>
      </div>
    </main>
  );
}