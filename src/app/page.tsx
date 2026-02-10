"use client";

import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabase';
import CarCard from '@/components/CarCard';
import { Search, Fuel, Banknote, RotateCcw } from "lucide-react";

export default function Home() {
  const [allCars, setAllCars] = useState<any[]>([]);
  const [filteredCars, setFilteredCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ÉTATS DES FILTRES
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMake, setSelectedMake] = useState("");
  const [selectedFuel, setSelectedFuel] = useState("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [sortBy, setSortBy] = useState("newest");

  // 1. Récupération des données
  useEffect(() => {
    async function fetchCars() {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setAllCars(data);
        setFilteredCars(data);
      }
      setLoading(false);
    }
    fetchCars();
  }, []);

  // 2. Logique de Filtrage et Tri
  useEffect(() => {
    let result = [...allCars];

    // Filtre texte
    if (searchTerm) {
      result = result.filter(car => 
        car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.model.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre Marque
    if (selectedMake) {
      result = result.filter(car => car.make === selectedMake);
    }

    // Filtre Carburant
    if (selectedFuel) {
      result = result.filter(car => car.fuel_type === selectedFuel);
    }

    // Filtre Prix Max (sur le prix d'achat Euro)
    if (maxPrice !== "" && maxPrice > 0) {
      result = result.filter(car => car.price_euro <= maxPrice);
    }

    // Tri
    result.sort((a, b) => {
      if (sortBy === "price-asc") return a.price_euro - b.price_euro;
      if (sortBy === "price-desc") return b.price_euro - a.price_euro;
      return 0;
    });

    setFilteredCars(result);
  }, [searchTerm, selectedMake, selectedFuel, maxPrice, sortBy, allCars]);

  const uniqueMakes = Array.from(new Set(allCars.map(c => c.make))).sort();
  const uniqueFuels = Array.from(new Set(allCars.map(c => c.fuel_type))).sort();

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedMake("");
    setSelectedFuel("");
    setMaxPrice("");
    setSortBy("newest");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900">Catalogue Auto 🚗</h1>
            <p className="text-gray-600 mt-2">Véhicules de moins de 3 ans éligibles pour l'Algérie.</p>
          </div>
          <a href="/simulateur" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
            Calculateur de taxes →
          </a>
        </header>

        {/* SECTION FILTRES AVANCÉS */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text"
                placeholder="Modèle, marque..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Marque */}
            <select 
              className="p-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
              value={selectedMake}
              onChange={(e) => setSelectedMake(e.target.value)}
            >
              <option value="">Toutes les marques</option>
              {uniqueMakes.map(make => (
                <option key={make} value={make}>{make}</option>
              ))}
            </select>

            {/* Carburant */}
            <div className="relative">
              <Fuel className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select 
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-sm appearance-none"
                value={selectedFuel}
                onChange={(e) => setSelectedFuel(e.target.value)}
              >
                <option value="">Tous carburants</option>
                {uniqueFuels.map(fuel => (
                  <option key={fuel} value={fuel} className="capitalize">{fuel}</option>
                ))}
              </select>
            </div>

            {/* Prix Max */}
            <div className="relative">
              <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="number"
                placeholder="Budget Max (€)"
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
            <select 
              className="bg-transparent border-none text-sm font-bold text-gray-500 focus:ring-0 cursor-pointer"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Plus récentes d'abord</option>
              <option value="price-asc">Prix : moins chers</option>
              <option value="price-desc">Prix : plus chers</option>
            </select>

            <button 
              onClick={resetFilters}
              className="flex items-center text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
            >
              <RotateCcw className="w-3 h-3 mr-1" /> Réinitialiser
            </button>
          </div>
        </div>

        {/* GRILLE DE RÉSULTATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>

        {/* MESSAGE VIDE */}
        {filteredCars.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
            <p className="text-gray-400 font-medium text-lg">Aucun véhicule ne correspond à vos filtres.</p>
            <button onClick={resetFilters} className="mt-4 bg-gray-100 text-gray-600 px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-200 transition-all">
              Afficher tout le catalogue
            </button>
          </div>
        )}
      </div>
    </main>
  );
}