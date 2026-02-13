"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { LogOut, PlusCircle, UploadCloud, Star, X, Car, Trash2, Edit3, Save } from "lucide-react";
import imageCompression from "browser-image-compression";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  const [files, setFiles] = useState<File[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState<number>(0);
  const [inventory, setInventory] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // --- AUTHENTIFICATION SÉCURISÉE ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ password }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      setIsAuthenticated(true);
      setPassword("");
    } else {
      alert("Mot de passe incorrect !");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    setIsAuthenticated(false);
    window.location.reload();
  };

  useEffect(() => {
    async function checkAuth() {
      const res = await fetch("/api/auth-check");
      const data = await res.json();
      if (data.authenticated) setIsAuthenticated(true);
    }
    checkAuth();
  }, []);

  useEffect(() => {
    async function fetchInventory() {
      const { data } = await supabase.from('cars').select('*').order('created_at', { ascending: false });
      if (data) setInventory(data);
    }
    if (isAuthenticated) fetchInventory();
  }, [isAuthenticated, refreshKey]);

  // --- LOGIQUE DE NETTOYAGE STORAGE + SUPPRESSION ---
  const handleDeleteCar = async (car: any) => {
    if (!confirm(`Supprimer définitivement l'annonce ${car.make} ${car.model} ainsi que toutes ses photos ?`)) return;

    try {
      setLoading(true);
      // 1. Suppression des fichiers physiques dans le Storage Supabase
      if (car.images && car.images.length > 0) {
        const filePaths = car.images.map((url: string) => {
          const parts = url.split('car-images/');
          return parts[1];
        });

        const { error: storageError } = await supabase.storage
          .from('car-images')
          .remove(filePaths);

        if (storageError) console.error("Erreur nettoyage Storage:", storageError);
      }

      // 2. Suppression de la ligne SQL
      const { error: dbError } = await supabase
        .from('cars')
        .delete()
        .eq('id', car.id);

      if (dbError) throw dbError;

      setMessage("Annonce et photos supprimées avec succès !");
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      alert("Erreur lors de la suppression : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- GESTION DES FICHIERS ---
  const removeFile = (indexToRemove: number) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
    if (mainImageIndex === indexToRemove) {
      setMainImageIndex(0);
    } else if (mainImageIndex > indexToRemove) {
      setMainImageIndex(mainImageIndex - 1);
    }
  };

  // --- ÉDITION ---
  const handleEditClick = (car: any) => {
    setEditingId(car.id);
    setFiles([]); 
    setMainImageIndex(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    setTimeout(() => {
      if (formRef.current) {
        const f = formRef.current;
        (f.elements.namedItem("make") as HTMLInputElement).value = car.make;
        (f.elements.namedItem("model") as HTMLInputElement).value = car.model;
        (f.elements.namedItem("year") as HTMLInputElement).value = car.year_of_registration.toString();
        (f.elements.namedItem("price") as HTMLInputElement).value = car.price_euro.toString();
        (f.elements.namedItem("engine") as HTMLInputElement).value = car.engine_size.toString();
        (f.elements.namedItem("mileage") as HTMLInputElement).value = car.mileage.toString();
        (f.elements.namedItem("date") as HTMLInputElement).value = car.first_registration_date;
        (f.elements.namedItem("fuel") as HTMLSelectElement).value = car.fuel_type;
      }
    }, 100);
    setMessage("Mode édition activé : " + car.make + " " + car.model);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFiles([]); 
    setMainImageIndex(0);
    formRef.current?.reset();
    setMessage("");
  };

  // --- SOUMISSION DU FORMULAIRE ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData(e.currentTarget);
      let imageUrls: string[] = [];

      const compressionOptions = {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
      };

      if (files.length > 0) {
        const uploadPromises = files.map(async (file) => {
          const compressedFile = await imageCompression(file, compressionOptions);
          const fileName = `${Math.random()}-${Date.now()}.jpg`;
          const filePath = `cars/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('car-images')
            .upload(filePath, compressedFile);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('car-images')
            .getPublicUrl(filePath);
          
          return publicUrl;
        });
        
        imageUrls = await Promise.all(uploadPromises);
        // Réorganiser pour mettre l'image principale en premier
        const primary = imageUrls[mainImageIndex];
        const others = imageUrls.filter((_, idx) => idx !== mainImageIndex);
        imageUrls = [primary, ...others];
      }

      const carData: any = {
        make: formData.get("make") as string,
        model: formData.get("model") as string,
        year_of_registration: parseInt(formData.get("year") as string),
        price_euro: parseFloat(formData.get("price") as string),
        fuel_type: formData.get("fuel") as string,
        engine_size: parseInt(formData.get("engine") as string),
        mileage: parseInt(formData.get("mileage") as string),
        first_registration_date: formData.get("date") as string,
      };

      if (imageUrls.length > 0) carData.images = imageUrls;

      const { error: dbError } = editingId 
        ? await supabase.from("cars").update(carData).eq('id', editingId)
        : await supabase.from("cars").insert([carData]);

      if (dbError) throw dbError;

      setMessage(editingId ? "Annonce mise à jour ! ✨" : "Annonce publiée ! 🚀");
      setFiles([]);
      setMainImageIndex(0);
      setEditingId(null);
      setRefreshKey(prev => prev + 1);
      formRef.current?.reset();

    } catch (error: any) {
      setMessage("Erreur : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDU UI LOGIN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md text-center">
          <h1 className="text-3xl font-black mb-6 italic text-gray-900">ADMIN <span className="text-blue-600">AUTO</span></h1>
          <input 
            type="password" 
            placeholder="Mot de passe"
            className="w-full p-4 border border-gray-200 rounded-2xl mb-4 outline-none focus:ring-4 focus:ring-blue-100 transition-all text-gray-900"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full bg-gray-900 text-white p-4 rounded-2xl font-bold hover:bg-blue-600 transition-all">Déverrouiller</button>
        </form>
      </div>
    );
  }

  // --- RENDU UI DASHBOARD ---
  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12 text-gray-900">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black">{editingId ? "Modifier l'annonce" : "Nouveau Véhicule"}</h1>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 font-bold hover:bg-red-50 p-2 rounded-lg transition-colors">
            <LogOut size={18} /> Quitter
          </button>
        </div>
        
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="make" placeholder="Marque" className="border-gray-200 border p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" required />
            <input name="model" placeholder="Modèle" className="border-gray-200 border p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" required />
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
            <input name="date" type="date" className="w-full border-gray-200 border p-4 rounded-xl outline-none mt-1 text-gray-600" required />
          </div>
          
          <select name="fuel" className="w-full border-gray-200 border p-4 rounded-xl bg-white outline-none">
            <option value="essence">Essence</option>
            <option value="hybride">Hybride</option>
            <option value="electrique">Électrique</option>
          </select>

          {/* ZONE PHOTOS AVEC ÉTOILE ⭐ */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">
              Photos {editingId && "(Optionnel : remplacera les anciennes)"}
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-blue-400 relative bg-gray-50 transition-colors">
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={(e) => {
                  if (e.target.files) {
                    const newFiles = Array.from(e.target.files);
                    setFiles((prev) => [...prev, ...newFiles]);
                  }
                }} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              />
              <UploadCloud className="mx-auto text-gray-300 mb-2" size={32} />
              <p className="text-sm text-gray-500 italic">Cliquez pour ajouter des photos</p>
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
                      
                      {/* INDICATEUR ÉTOILE ⭐ */}
                      {mainImageIndex === index && (
                        <div className="absolute top-1 left-1 bg-blue-500 text-white p-1 rounded-full shadow-lg">
                          <Star size={10} fill="currentColor" />
                        </div>
                      )}
                    </div>
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors z-10"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={loading} className="flex-grow bg-blue-600 text-white p-5 rounded-2xl font-black text-lg hover:bg-blue-700 disabled:bg-gray-200 transition-all flex items-center justify-center gap-2">
              {loading ? "Traitement..." : editingId ? <><Save size={20}/> Enregistrer les modifications</> : <><PlusCircle size={20}/> Publier l'annonce</>}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="bg-gray-100 text-gray-600 p-5 rounded-2xl font-bold hover:bg-gray-200 transition-all">Annuler</button>
            )}
          </div>

          {message && <div className={`p-4 rounded-2xl text-center font-bold ${message.includes("Erreur") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>{message}</div>}
        </form>

        {/* SECTION INVENTAIRE AVEC BOUTON SUPPRESSION NETTOYAGE */}
        <section className="mt-20 mb-20">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-2"><Car className="text-blue-600" /> Stock Actuel ({inventory.length})</h2>
          <div className="grid gap-4">
            {inventory.map((car) => (
              <div key={car.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 group hover:border-blue-200 transition-all">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  <img src={car.images?.[0]} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow">
                  <h3 className="font-bold text-sm uppercase">{car.make} <span className="text-blue-600">{car.model}</span></h3>
                  <p className="text-xs text-gray-400 font-medium">{car.price_euro.toLocaleString()} € • {car.year_of_registration}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleEditClick(car)} className="p-3 text-blue-500 hover:bg-blue-50 rounded-xl transition-all" title="Modifier"><Edit3 size={18} /></button>
                  <button onClick={() => handleDeleteCar(car)} className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition-all" title="Supprimer"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}