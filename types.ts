export type Species = 'Dog' | 'Cat';
export type Sex = 'Male' | 'Female';
export type FoodType = 'Wet' | 'Dry' | 'Both';
export type ActivityLevel = 'Low' | 'Moderate' | 'High' | 'Working/Athlete';

export interface PetInput {
  id: string;
  name: string;
  species: Species;
  breed: string;
  weight: number; // in lbs
  age: number; // in years
  sex: Sex;
  activityLevel: ActivityLevel;
  medicalConditions: string[];
  foodType: FoodType;
  foodBrands: string[];
  imageUrl?: string;
}

export interface User {
  name: string;
  email: string;
}

export interface ProductRecommendation {
  name: string;
  reason: string;
}

export interface NutritionResult {
  dailyCalories: number;
  wetFoodAmount: string;
  dryFoodAmount: string;
  summary: string;
  advice: string;
  recommendations: {
    wet: ProductRecommendation[];
    dry: ProductRecommendation[];
  };
}

export interface Pet extends PetInput {
  result?: NutritionResult;
  isLoading?: boolean;
  error?: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

// Admin Types
export type AdminItemType = 'ad-image' | 'ad-text' | 'news' | 'menu';

export interface AdminItem {
  id: string;
  type: AdminItemType;
  title?: string;
  content?: string;
  imageUrl?: string;
  linkUrl?: string;
  date?: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface PaymentConfig {
  textMonthly: string;
  textYearly: string;
  imageMonthly: string;
  imageYearly: string;
  bothMonthly: string;
  bothYearly: string;
}