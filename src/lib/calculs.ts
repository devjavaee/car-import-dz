// Définition des types pour la clarté
export interface CalculateParams {
  priceEuro: number;
  engineSize: number; // en cm3
  fuelType: 'essence' | 'hybride' | 'electrique';
}

export const calculateImportFees = ({ priceEuro, engineSize, fuelType }: CalculateParams) => {
  let taxRate = 0;

  // 1. Détermination du taux selon la cylindrée (Exemple de paliers courants)
  if (fuelType === 'electrique') {
    taxRate = 0.15; // Taxe très réduite pour l'électrique
  } else {
    if (engineSize <= 1200) taxRate = 0.30;      // 30% de taxe
    else if (engineSize <= 2000) taxRate = 0.50; // 50% de taxe
    else taxRate = 0.80;                         // 80% de taxe
  }

  const customsFees = priceEuro * taxRate;
  const transportFees = 800; // Estimation forfaitaire transport ferry (Marseille-Alger)
  
  return {
    customsFees,
    transportFees,
    totalDZD: (priceEuro + customsFees + transportFees) * 230, // Taux Square indicatif
    totalEuro: priceEuro + customsFees + transportFees
  };
};