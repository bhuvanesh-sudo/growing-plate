export type Sex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'moderate' | 'active';
export type AlertSeverity = 'green' | 'yellow' | 'orange' | 'red';

export interface NutrientTargets {
    calories_kcal: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number;
    calcium_mg: number;
    iron_mg: number;
    vitamin_d_mcg: number;
    zinc_mg: number;
}

export interface FoodNutrients {
    calories_kcal: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number;
    calcium_mg: number;
    iron_mg: number;
    vitamin_d_mcg: number;
    zinc_mg: number;
}

// Convert display quantity + unit to grams
export function toGrams(qty: number, unit: string, gramsPerPiece?: number): number {
    const map: Record<string, number> = {
        g: 1,
        kg: 1000,
        ml: 1,
        l: 1000,
        oz: 28.35,
        lb: 453.59,
        cup: 240,
        tbsp: 15,
        tsp: 5,
    };
    if (unit === 'piece' || unit === 'serving') return qty * (gramsPerPiece ?? 100);
    return qty * (map[unit.toLowerCase()] ?? 1);
}

// Calculate nutrients for a food item given grams
export function calcNutrientsForItem(food: FoodNutrients, grams: number): FoodNutrients {
    const f = grams / 100;
    return {
        calories_kcal: r2(food.calories_kcal * f),
        protein_g: r2(food.protein_g * f),
        carbs_g: r2(food.carbs_g * f),
        fat_g: r2(food.fat_g * f),
        fiber_g: r2(food.fiber_g * f),
        calcium_mg: r2(food.calcium_mg * f),
        iron_mg: r2(food.iron_mg * f),
        vitamin_d_mcg: r2(food.vitamin_d_mcg * f),
        zinc_mg: r2(food.zinc_mg * f),
    };
}

// Sum nutrients across items
export function sumNutrients(items: FoodNutrients[]): FoodNutrients {
    return items.reduce(
        (acc, i) => ({
            calories_kcal: r2(acc.calories_kcal + i.calories_kcal),
            protein_g: r2(acc.protein_g + i.protein_g),
            carbs_g: r2(acc.carbs_g + i.carbs_g),
            fat_g: r2(acc.fat_g + i.fat_g),
            fiber_g: r2(acc.fiber_g + i.fiber_g),
            calcium_mg: r2(acc.calcium_mg + i.calcium_mg),
            iron_mg: r2(acc.iron_mg + i.iron_mg),
            vitamin_d_mcg: r2(acc.vitamin_d_mcg + i.vitamin_d_mcg),
            zinc_mg: r2(acc.zinc_mg + i.zinc_mg),
        }),
        {
            calories_kcal: 0,
            protein_g: 0,
            carbs_g: 0,
            fat_g: 0,
            fiber_g: 0,
            calcium_mg: 0,
            iron_mg: 0,
            vitamin_d_mcg: 0,
            zinc_mg: 0,
        }
    );
}

// Age in months from DOB
export function ageInMonths(dob: Date, asOf = new Date()): number {
    const y = asOf.getFullYear() - dob.getFullYear();
    const m = asOf.getMonth() - dob.getMonth();
    const d = asOf.getDate() - dob.getDate();
    return y * 12 + m + (d < 0 ? -1 : 0);
}

// RDA lookup table (ICMR 2020 / WHO)
const RDA = [
    { lo: 12, hi: 23, sex: 'both', cal: 1000, pro: 13, car: 135, fat: 30, fib: 14, ca: 500, fe: 9, vd: 15, zn: 3 },
    { lo: 24, hi: 35, sex: 'both', cal: 1200, pro: 16, car: 160, fat: 35, fib: 16, ca: 600, fe: 9, vd: 15, zn: 3.5 },
    { lo: 36, hi: 59, sex: 'both', cal: 1400, pro: 20, car: 190, fat: 40, fib: 18, ca: 600, fe: 9, vd: 15, zn: 4 },
    { lo: 60, hi: 95, sex: 'both', cal: 1600, pro: 24, car: 220, fat: 44, fib: 20, ca: 700, fe: 12, vd: 15, zn: 5 },
    { lo: 96, hi: 131, sex: 'male', cal: 1800, pro: 28, car: 250, fat: 50, fib: 22, ca: 800, fe: 13, vd: 15, zn: 6 },
    { lo: 96, hi: 131, sex: 'female', cal: 1600, pro: 26, car: 220, fat: 45, fib: 22, ca: 800, fe: 15, vd: 15, zn: 6 },
    { lo: 132, hi: 155, sex: 'male', cal: 2200, pro: 40, car: 300, fat: 60, fib: 25, ca: 1200, fe: 15, vd: 15, zn: 8 },
    { lo: 132, hi: 155, sex: 'female', cal: 2000, pro: 40, car: 270, fat: 55, fib: 25, ca: 1200, fe: 27, vd: 15, zn: 8 },
    { lo: 156, hi: 191, sex: 'male', cal: 2600, pro: 54, car: 360, fat: 72, fib: 28, ca: 1200, fe: 17, vd: 15, zn: 11 },
    { lo: 156, hi: 191, sex: 'female', cal: 2200, pro: 52, car: 300, fat: 61, fib: 26, ca: 1200, fe: 27, vd: 15, zn: 9 },
    { lo: 192, hi: 216, sex: 'male', cal: 3000, pro: 60, car: 410, fat: 83, fib: 30, ca: 1200, fe: 17, vd: 15, zn: 11 },
    { lo: 192, hi: 216, sex: 'female', cal: 2400, pro: 55, car: 330, fat: 67, fib: 26, ca: 1200, fe: 27, vd: 15, zn: 9 },
];

const ACT_MULT: Record<ActivityLevel, number> = { sedentary: 0.85, moderate: 1, active: 1.15 };

export function getRDATargets(dob: Date, sex: Sex, activity: ActivityLevel = 'moderate'): NutrientTargets {
    const months = ageInMonths(dob);
    const mult = ACT_MULT[activity];
    const row =
        RDA.find((r) => r.lo <= months && months <= r.hi && r.sex === sex) ??
        RDA.find((r) => r.lo <= months && months <= r.hi && r.sex === 'both');
    if (!row) {
        return {
            calories_kcal: 2000,
            protein_g: 50,
            carbs_g: 275,
            fat_g: 55,
            fiber_g: 25,
            calcium_mg: 1000,
            iron_mg: 15,
            vitamin_d_mcg: 15,
            zinc_mg: 8,
        };
    }
    return {
        calories_kcal: Math.round(row.cal * mult),
        protein_g: r2(row.pro * mult),
        carbs_g: r2(row.car * mult),
        fat_g: r2(row.fat * mult),
        fiber_g: row.fib,
        calcium_mg: row.ca,
        iron_mg: row.fe,
        vitamin_d_mcg: row.vd,
        zinc_mg: row.zn,
    };
}

// Severity thresholds
export function getSeverity(pct: number): AlertSeverity {
    if (pct >= 90 && pct <= 110) return 'green';
    if ((pct >= 60 && pct < 90) || (pct > 110 && pct <= 130)) return 'yellow';
    if ((pct >= 40 && pct < 60) || (pct > 130 && pct <= 150)) return 'orange';
    return 'red';
}

const SUGGESTIONS: Partial<Record<keyof NutrientTargets, string>> = {
    calories_kcal: 'Try a nutritious snack like peanut butter on whole grain bread.',
    protein_g: 'Add eggs, dal, paneer, or chicken to boost protein.',
    iron_mg: 'Spinach, ragi, rajma, or jaggery can boost iron.',
    calcium_mg: 'Milk, curd, paneer, or ragi are excellent calcium sources.',
    fiber_g: 'Add fruits, vegetables, or whole grains to increase fiber.',
};

export interface NutrientStatus {
    nutrient: keyof NutrientTargets;
    label: string;
    actual: number;
    target: number;
    pct: number;
    severity: AlertSeverity;
    unit: string;
    suggestion?: string;
}

export function computeNutrientStatus(totals: FoodNutrients, targets: NutrientTargets): NutrientStatus[] {
    const defs: Array<{ key: keyof NutrientTargets; label: string; unit: string }> = [
        { key: 'calories_kcal', label: 'Calories', unit: 'kcal' },
        { key: 'protein_g', label: 'Protein', unit: 'g' },
        { key: 'carbs_g', label: 'Carbs', unit: 'g' },
        { key: 'fat_g', label: 'Fat', unit: 'g' },
        { key: 'fiber_g', label: 'Fiber', unit: 'g' },
        { key: 'calcium_mg', label: 'Calcium', unit: 'mg' },
        { key: 'iron_mg', label: 'Iron', unit: 'mg' },
    ];
    return defs.map(({ key, label, unit }) => {
        const actual = (totals as unknown as Record<string, number>)[key] ?? 0;
        const target = (targets as unknown as Record<string, number>)[key] ?? 1;
        const pct = r2((actual / target) * 100);
        return {
            nutrient: key,
            label,
            actual,
            target,
            pct,
            severity: getSeverity(pct),
            unit,
            suggestion: SUGGESTIONS[key],
        };
    });
}

export function getOverallSeverity(statuses: NutrientStatus[]): AlertSeverity {
    for (const s of ['red', 'orange', 'yellow'] as AlertSeverity[]) {
        if (statuses.some((n) => n.severity === s)) return s;
    }
    return 'green';
}

function r2(n: number) {
    return Math.round(n * 100) / 100;
}
