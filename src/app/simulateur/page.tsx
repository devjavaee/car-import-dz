"use client"; // Obligatoire car on utilise des états (useState) et des interactions

import { useState, useEffect } from "react";
import { calculateImportFees } from "@/lib/calculs";
import { ArrowLeft } from "lucide-react"; // Importation de l'icône
import Link from "next/link"; // Utilisation de Link pour une navigation rapide

export default function SimulateurPage() {
  // États pour le formulaire
  const [price, setPrice] = useState<number>(15000);
  const [engine, setEngine] = useState<number>(1200);
  const [fuel, setFuel] = useState<"essence" | "hybride" | "electrique">("essence");

  // État pour le résultat du calcul
  const [results, setResults] = useState<any>(null);

  // On recalcule automatiquement dès qu'une valeur change
  useEffect(() => {
    const fees = calculateImportFees({
      priceEuro: price,
      engineSize: engine,
      fuelType: fuel,
    });
    setResults(fees);
  }, [price, engine, fuel]);

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* LIEN DE RETOUR */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 font-medium mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> 
          Retour au catalogue
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-3">
            Simulateur d'Importation <span className="text-blue-600">🇩🇿</span>
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Estimez le coût de revient total de votre véhicule en Algérie selon la loi de finances (véhicules de moins de 3 ans).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* SECTION FORMULAIRE */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-6 text-gray-800">Configuration du véhicule</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-400 uppercase mb-2">
                  Prix du véhicule (EUR)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-400 uppercase mb-2">
                  Cylindrée (cm³)
                </label>
                <input
                  type="number"
                  value={engine}
                  onChange={(e) => setEngine(Number(e.target.value))}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-400 uppercase mb-2">
                  Carburant
                </label>
                <select
                  value={fuel}
                  onChange={(e) => setFuel(e.target.value as any)}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-semibold cursor-pointer"
                >
                  <option value="essence">Essence</option>
                  <option value="hybride">Hybride</option>
                  <option value="electrique">Électrique</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION RÉSULTATS */}
          <div className="bg-blue-600 text-white p-8 rounded-3xl shadow-xl shadow-blue-100 flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-xl font-bold mb-8 opacity-90">Estimation des frais</h2>
              
              {results && (
                <div className="space-y-5">
                  {/* ALERTE TAXE ÉLEVÉE */}
                  {results.taxRate >= 0.80 && (
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl mb-6">
                      <p className="font-bold text-sm flex items-center gap-2">
                        ⚠️ Attention
                      </p>
                      <p className="text-xs opacity-80 mt-1">Cylindrée élevée : les taxes douanières sont très importantes pour ce type de moteur.</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="opacity-70 text-sm">Taux de taxe :</span>
                    <span className="font-bold">{(results.taxRate * 100)} %</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="opacity-70 text-sm">Douane & Taxes :</span>
                    <span className="font-bold">+{results.customsFees.toLocaleString()} €</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="opacity-70 text-sm">Transport (estimé) :</span>
                    <span className="font-bold">{results.transportFees} €</span>
                  </div>

                  <div className="mt-10">
                    <p className="text-xs uppercase font-black text-blue-200 mb-1">Total Rendu Alger</p>
                    <div className="text-4xl font-black italic">
                      {results.totalEuro.toLocaleString()} €
                    </div>
                    <div className="text-blue-100 text-xl font-medium mt-1">
                      ≈ {results.totalDZD.toLocaleString()} DA
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <p className="relative z-10 text-[10px] text-blue-200 mt-8 italic leading-relaxed">
              *Simulation basée sur le marché parallèle. Les montants réels sont calculés par l'administration des douanes lors du dédouanement.
            </p>
            
            {/* Décoration d'arrière-plan */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </main>
  );
}