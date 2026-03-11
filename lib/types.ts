// ── Shared application types ──────────────────────────────────────────────

export type Sex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'moderate' | 'active';
export type MealType = 'breakfast' | 'snack' | 'lunch' | 'dinner';
export type FoodGroup = 'grains' | 'protein' | 'vegetables' | 'fruits' | 'dairy' | 'fats' | 'other';
export type OverallStatus = 'green' | 'yellow' | 'orange' | 'red';

export interface Child {
    id: string;
    user_id: string;
    name: string;
    dob: string; // ISO date string
    sex: Sex;
    weight_kg: number | null;
    height_cm: number | null;
    activity_level: ActivityLevel;
    allergies: string[];
    dietary_flags: string[];
    created_at: string;
}

export interface Food {
    id: string;
    name: string;
    food_group: FoodGroup;
    source: string;
    calories_kcal: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number;
    calcium_mg: number;
    iron_mg: number;
    vitamin_d_mcg: number;
    zinc_mg: number;
    grams_per_piece: number | null;
    aliases: string[];
    created_at: string;
}

export interface DailyLog {
    id: string;
    child_id: string;
    log_date: string;
    total_calories: number;
    total_protein_g: number;
    total_carbs_g: number;
    total_fat_g: number;
    total_fiber_g: number;
    total_iron_mg: number;
    total_calcium_mg: number;
    overall_status: OverallStatus;
}

export interface Meal {
    id: string;
    daily_log_id: string;
    meal_type: MealType;
    logged_at: string;
}

export interface MealItem {
    id: string;
    meal_id: string;
    food_id: string;
    quantity_g: number;
    quantity_display: number | null;
    unit_display: string;
    calories_kcal: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number;
    iron_mg: number;
    calcium_mg: number;
    logged_at: string;
    // Joined
    food?: Food;
    meal_type?: MealType;
}

export interface Alert {
    id: string;
    child_id: string;
    log_date: string;
    nutrient: string;
    severity: 'yellow' | 'orange' | 'red';
    actual_value: number | null;
    target_value: number | null;
    pct_of_target: number | null;
    suggestion: string | null;
    resolved_at: string | null;
    created_at: string;
}

// Food group color map
export const GROUP_COLORS: Record<FoodGroup, string> = {
    grains: '#F5C842',
    protein: '#E8504A',
    vegetables: '#4CAF7D',
    fruits: '#F5874A',
    dairy: '#6BB8F5',
    fats: '#B47FE8',
    other: '#A0A0A0',
};

export const GROUP_LABELS: Record<FoodGroup, string> = {
    grains: 'Grains',
    protein: 'Protein',
    vegetables: 'Vegetables',
    fruits: 'Fruits',
    dairy: 'Dairy',
    fats: 'Fats',
    other: 'Other',
};

export const MEAL_LABELS: Record<MealType, string> = {
    breakfast: 'Breakfast',
    snack: 'Snack',
    lunch: 'Lunch',
    dinner: 'Dinner',
};

export const MEAL_EMOJIS: Record<MealType, string> = {
    breakfast: '🌅',
    snack: '🍎',
    lunch: '☀️',
    dinner: '🌙',
};
