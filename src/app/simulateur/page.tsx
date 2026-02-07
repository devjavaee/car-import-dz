"use client"; // Obligatoire car on utilise des états (useState) et des interactions

import { useState, useEffect } from "react";
import { calculateImportFees } from "@/lib/calculs";

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
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Simulateur d'Importation 🇩🇿
        </h1>
        <p className="text-gray-600 text-center mb-10">
          Estimez le coût de revient de votre véhicule (Loi de moins de 3 ans)
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* SECTION FORMULAIRE */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix du véhicule (EUR)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cylindrée (cm³)
                </label>
                <input
                  type="number"
                  value={engine}
                  onChange={(e) => setEngine(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Carburant
                </label>
                <select
                  value={fuel}
                  onChange={(e) => setFuel(e.target.value as any)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="essence">Essence</option>
                  <option value="hybride">Hybride</option>
                  <option value="electrique">Électrique</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION RÉSULTATS */}
          <div className="bg-blue-600 text-white p-6 rounded-xl shadow-lg flex flex-col justify-center">
            <h2 className="text-xl font-semibold mb-6">Estimation Totale</h2>
            
            {results && (
              <div className="space-y-4">
                {/* ALERTE TAXE ÉLEVÉE */}
                {results.taxRate >= 0.80 && (
                  <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-800 p-3 rounded mb-4 animate-pulse">
                    <p className="font-bold text-sm">⚠️ Attention</p>
                    <p className="text-xs">Cylindrée élevée : les taxes douanières dépassent 80% du prix.</p>
                  </div>
                )}

                <div className="flex justify-between border-b border-blue-400 pb-2">
                  <span>Taux appliqué :</span>
                  <span className="font-mono">{(results.taxRate * 100)} %</span>
                </div>

                <div className="flex justify-between border-b border-blue-400 pb-2">
                  <span>Douane & Taxes :</span>
                  <span className="font-mono">{results.customsFees.toLocaleString()} €</span>
                </div>
                <div className="flex justify-between border-b border-blue-400 pb-2">
                  <span>Transport estimé :</span>
                  <span>{results.transportFees} €</span>
                </div>
                <div className="mt-6">
                  <span className="text-blue-100 text-sm">Prix final rendu Alger :</span>
                  <div className="text-3xl font-bold mt-1">
                    {results.totalEuro.toLocaleString()} €
                  </div>
                  <div className="text-blue-200 text-lg italic">
                    ≈ {results.totalDZD.toLocaleString()} DZD
                  </div>
                </div>
              </div>
            )}
            
            <p className="text-[10px] text-blue-200 mt-8 italic">
              *Taux de change indicatif (Marché parallèle). Les taxes réelles dépendent du bureau de douane.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}