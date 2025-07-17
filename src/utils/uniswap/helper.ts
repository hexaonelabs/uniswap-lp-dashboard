import TokenImageURI from "./tokenImageURI.json";
export const getFeeTierPercentage = (tier: string): number => {
  if (tier === "100") return 0.01 / 100;
  if (tier === "500") return 0.05 / 100;
  if (tier === "3000") return 0.3 / 100;
  if (tier === "10000") return 1 / 100;
  return 0;
};

export const getTokenLogoURL = (platform: string, address: string): string => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapper = TokenImageURI as any;
  const imageURL = mapper[platform][address];
  if (imageURL) return imageURL;
  return `https://friconix.com/png/fi-cnsuxl-question-mark.png`;
};

export const sortTokens = <T>(token0: T & {id: string}, token1: T & {id: string}) => {
  if (token0.id < token1.id) {
    return [token0, token1];
  }
  return [token1, token0];
};

// return unique string in string[]
export const getUniqueItems = (arr: string[]): string[] => {
  return arr.filter((v, i, a) => a.indexOf(v) === i);
};

/**
 * Volume volatility calculation
 * @param poolDayDatas - Daily pool data containing volumeUSD and date
 * @param timeframeDays - Number of days to consider for volatility calculation
 * @returns Volatility persentage, average volume, standard deviation, and volatility coefficient
 *          Coefficient can be "Low", "Medium", "High" based on volatility percentage
 */
export const calculateVolumeVolatility = (
  poolDayDatas: Array<{ volumeUSD: string | number; date: number }>,
  timeframeDays: number = 30
): {
  volatility: number;
  averageVolume: number;
  standardDeviation: number;
  coefficient: string; // "Low", "Medium", "High"
} => {
  if (!poolDayDatas || poolDayDatas.length === 0) {
    return {
      volatility: 0,
      averageVolume: 0,
      standardDeviation: 0,
      coefficient: "Unknown"
    };
  }

  // Prendre les données les plus récentes selon la timeframe
  const recentData = poolDayDatas
    .slice(-timeframeDays)
    .map(day => Number(day.volumeUSD))
    .filter(volume => volume > 0); // Filtrer les volumes nuls

  if (recentData.length < 2) {
    return {
      volatility: 0,
      averageVolume: recentData[0] || 0,
      standardDeviation: 0,
      coefficient: "Insufficient Data"
    };
  }

  // Calcul de la moyenne
  const averageVolume = recentData.reduce((sum, volume) => sum + volume, 0) / recentData.length;

  // Calcul de l'écart-type
  const variance = recentData.reduce((sum, volume) => {
    return sum + Math.pow(volume - averageVolume, 2);
  }, 0) / (recentData.length - 1);

  const standardDeviation = Math.sqrt(variance);

  // Calcul du coefficient de variation (volatilité en %)
  const volatility = averageVolume > 0 ? (standardDeviation / averageVolume) * 100 : 0;

  // Classification de la volatilité
  let coefficient: string;
  if (volatility < 30) {
    coefficient = "Stable"; // Faible volatilité - revenus stables
  } else if (volatility < 60) {
    coefficient = "Moderate"; // Volatilité modérée
  } else if (volatility < 100) {
    coefficient = "High"; // Volatilité modérée
  } else {
    coefficient = "High Volatile"; // Haute volatilité - revenus imprévisibles
  }

  return {
    volatility: Math.round(volatility * 100) / 100, // Arrondi à 2 décimales
    averageVolume,
    standardDeviation,
    coefficient
  };
};

export const calculateTokenPriceCorrelation = (
  poolDayDatas: Array<{ 
    token0Price: string | number; 
    token1Price: string | number; 
    date: number 
  }>,
  timeframeDays: number = 30
): {
  correlation: number;
  classification: "Strong Inverse" | "Moderate Inverse" | "Weak" | "Moderate Positive" | "Strong Positive" | "Unknown";
  impermanentLossRisk: "Very Low" | "Low" | "Medium" | "High" | "Very High";
  dataPoints: number;
  isStablePair: boolean;
} => {
  if (!poolDayDatas || poolDayDatas.length < 2) {
    return {
      correlation: 0,
      classification: "Unknown",
      impermanentLossRisk: "Medium",
      dataPoints: 0,
      isStablePair: false
    };
  }

  // Prendre les données les plus récentes selon la timeframe
  const recentData = poolDayDatas
    .slice(-timeframeDays)
    .map(day => ({
      token0Price: Number(day.token0Price),
      token1Price: Number(day.token1Price)
    }))
    .filter(day => day.token0Price > 0 && day.token1Price > 0);

  if (recentData.length < 3) {
    return {
      correlation: 0,
      classification: "Unknown",
      impermanentLossRisk: "Medium",
      dataPoints: recentData.length,
      isStablePair: false
    };
  }

  // Calculer la volatilité absolue de chaque token pour détecter les stablecoins
  const token0Prices = recentData.map(d => d.token0Price);
  const token1Prices = recentData.map(d => d.token1Price);
  
  const token0Volatility = calculatePriceVolatility(token0Prices);
  const token1Volatility = calculatePriceVolatility(token1Prices);
  
  // Seuil pour considérer qu'un token est stable (volatilité < 5%)
  const STABLE_THRESHOLD = 0.05; // 5%
  const isToken0Stable = token0Volatility < STABLE_THRESHOLD;
  const isToken1Stable = token1Volatility < STABLE_THRESHOLD;
  const isStablePair = isToken0Stable && isToken1Stable;

  // Pour les paires stables, utiliser une logique différente
  if (isStablePair) {
    // Calculer la différence relative moyenne entre les prix
    const priceDifferences = recentData.map(d => 
      Math.abs(d.token0Price - d.token1Price) / Math.max(d.token0Price, d.token1Price)
    );
    const avgPriceDifference = priceDifferences.reduce((sum, diff) => sum + diff, 0) / priceDifferences.length;
    
    // Si la différence moyenne est très faible (<2%), considérer comme parfaitement corrélé
    if (avgPriceDifference < 0.02) { // 2%
      return {
        correlation: 0.95, // Quasi-parfaite corrélation pour les stables
        classification: "Strong Positive",
        impermanentLossRisk: "Very Low",
        dataPoints: recentData.length,
        isStablePair: true
      };
    }
  }

  // Calculer les variations de prix jour par jour (returns)
  const token0Returns: number[] = [];
  const token1Returns: number[] = [];

  for (let i = 1; i < recentData.length; i++) {
    const token0Return = (recentData[i].token0Price - recentData[i-1].token0Price) / recentData[i-1].token0Price;
    const token1Return = (recentData[i].token1Price - recentData[i-1].token1Price) / recentData[i-1].token1Price;
    
    // Filtrer les variations extrêmement petites (bruit de marché)
    const MIN_RETURN_THRESHOLD = isStablePair ? 0.001 : 0.005; // 0.1% pour stables, 0.5% pour autres
    
    if (Math.abs(token0Return) > MIN_RETURN_THRESHOLD || Math.abs(token1Return) > MIN_RETURN_THRESHOLD) {
      token0Returns.push(token0Return);
      token1Returns.push(token1Return);
    }
  }

  // Si pas assez de variations significatives pour les stables, assumer une forte corrélation
  if (isStablePair && token0Returns.length < 3) {
    return {
      correlation: 0.90,
      classification: "Strong Positive",
      impermanentLossRisk: "Very Low",
      dataPoints: token0Returns.length,
      isStablePair: true
    };
  }

  if (token0Returns.length < 2) {
    return {
      correlation: 0,
      classification: "Unknown",
      impermanentLossRisk: "Medium",
      dataPoints: token0Returns.length,
      isStablePair
    };
  }

  // Calcul des moyennes
  const mean0 = token0Returns.reduce((sum, val) => sum + val, 0) / token0Returns.length;
  const mean1 = token1Returns.reduce((sum, val) => sum + val, 0) / token1Returns.length;

  // Calcul de la covariance et des variances
  let covariance = 0;
  let variance0 = 0;
  let variance1 = 0;

  for (let i = 0; i < token0Returns.length; i++) {
    const diff0 = token0Returns[i] - mean0;
    const diff1 = token1Returns[i] - mean1;
    
    covariance += diff0 * diff1;
    variance0 += diff0 * diff0;
    variance1 += diff1 * diff1;
  }

  covariance /= (token0Returns.length - 1);
  variance0 /= (token0Returns.length - 1);
  variance1 /= (token0Returns.length - 1);

  // Calcul du coefficient de corrélation de Pearson
  const stdDev0 = Math.sqrt(variance0);
  const stdDev1 = Math.sqrt(variance1);
  
  let correlation = (stdDev0 * stdDev1 > 0) ? covariance / (stdDev0 * stdDev1) : 0;

  // Ajustement pour les paires stables : si corrélation faible mais tokens stables, booster la corrélation
  if (isStablePair && Math.abs(correlation) < 0.3) {
    correlation = 0.85; // Corrélation artificielle élevée pour les stables
  }

  // Classification de la corrélation
  let classification: "Strong Inverse" | "Moderate Inverse" | "Weak" | "Moderate Positive" | "Strong Positive";
  let impermanentLossRisk: "Very Low" | "Low" | "Medium" | "High" | "Very High";

  if (correlation <= -0.7) {
    classification = "Strong Inverse";
    impermanentLossRisk = "Very High";
  } else if (correlation <= -0.3) {
    classification = "Moderate Inverse";
    impermanentLossRisk = "High";
  } else if (correlation < 0.3) {
    classification = "Weak";
    impermanentLossRisk = "Medium";
  } else if (correlation < 0.7) {
    classification = "Moderate Positive";
    impermanentLossRisk = "Low";
  } else {
    classification = "Strong Positive";
    impermanentLossRisk = "Very Low";
  }

  // Ajustement spécial pour les paires stables
  if (isStablePair) {
    impermanentLossRisk = "Very Low";
  }

  return {
    correlation: Math.round(correlation * 1000) / 1000,
    classification,
    impermanentLossRisk,
    dataPoints: token0Returns.length,
    isStablePair
  };
};

// Fonction helper pour calculer la volatilité d'un array de prix
function calculatePriceVolatility(prices: number[]): number {
  if (prices.length < 2) return 0;
  
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i-1]) / prices[i-1]);
  }
  
  const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / (returns.length - 1);
  
  return Math.sqrt(variance); // Écart-type (volatilité)
}