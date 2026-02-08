"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // LE MOT DE PASSE "SECRET" (Dans un vrai projet, on utilise Supabase Auth)
  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;// v 

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert("Mot de passe incorrect !");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    
    const newCar = {
      make: formData.get("make") as string,
      model: formData.get("model") as string,
      year_of_registration: parseInt(formData.get("year") as string),
      price_euro: parseFloat(formData.get("price") as string),
      fuel_type: formData.get("fuel") as string,
      engine_size: parseInt(formData.get("engine") as string),
      mileage: parseInt(formData.get("mileage") as string),
      first_registration_date: formData.get("date") as string,
      images: [formData.get("imageUrl") as string],
    };

    const { error } = await supabase.from("cars").insert([newCar]);

    if (error) {
      setMessage("Erreur : " + error.message);
    } else {
      setMessage("Voiture ajoutée avec succès ! ✅");
      (e.target as HTMLFormElement).reset();
    }
    setLoading(false);
  };

  // 1. SI PAS CONNECTÉ : ON AFFICHE LE VÉRROU
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-96 text-center">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Accès Admin 🔒</h1>
          <input 
            type="password" 
            placeholder="Entrez le mot de passe"
            className="w-full p-3 border border-gray-300 rounded-lg mb-4 outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full bg-gray-900 text-white p-3 rounded-lg font-bold hover:bg-black transition-colors">
            Se connecter
          </button>
        </form>
      </div>
    );
  }

  // 2. SI CONNECTÉ : ON AFFICHE LE FORMULAIRE D'AJOUT
  return (
    <main className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Panneau d'administration</h1>
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="text-sm text-red-600 hover:underline"
          >
            Déconnexion
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          {/* ... (Garder le même contenu du formulaire qu'avant) ... */}
          <div className="grid grid-cols-2 gap-4">
            <input name="make" placeholder="Marque (ex: VW)" className="border p-3 rounded-lg" required />
            <input name="model" placeholder="Modèle (ex: Golf 8)" className="border p-3 rounded-lg" required />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <input name="year" type="number" placeholder="Année" className="border p-3 rounded-lg" required />
            <input name="price" type="number" placeholder="Prix en Euro" className="border p-3 rounded-lg" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input name="engine" type="number" placeholder="Cylindrée (cm3)" className="border p-3 rounded-lg" required />
            <input name="mileage" type="number" placeholder="Kilométrage" className="border p-3 rounded-lg" required />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-500 mb-1">Date de mise en circulation (doit avoir moins de 3 ans)</label>
            <input name="date" type="date" className="border p-3 rounded-lg" required />
          </div>
          
          <select name="fuel" className="border p-3 w-full rounded-lg bg-white">
            <option value="essence">Essence</option>
            <option value="hybride">Hybride</option>
            <option value="electrique">Électrique</option>
          </select>

          <input name="imageUrl" placeholder="Lien de l'image" className="border p-3 w-full rounded-lg" />

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-400 shadow-md transition-all"
          >
            {loading ? "Enregistrement..." : "Ajouter au catalogue"}
          </button>

          {message && (
            <div className={`p-4 rounded-lg text-center font-bold ${message.includes("Erreur") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
              {message}
            </div>
          )}
        </form>
      </div>
    </main>
  );
}