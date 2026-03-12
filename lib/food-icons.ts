/**
 * Food icon utilities — maps food names / food groups to Twemoji SVG CDN URLs.
 * Using jsDelivr CDN which serves the official Twitter Twemoji SVG assets.
 */

import type { FoodGroup } from '@/lib/types';

const CDN = 'https://cdn.jsdelivr.net/npm/twemoji@14.0.2/assets/svg';

function t(cp: string) {
    return `${CDN}/${cp}.svg`;
}

// ── Food-name keyword → Twemoji SVG URL ───────────────────────────────────────
export const FOOD_ICON_MAP: [string, string][] = [
    // Grain-based
    ['white rice', t('1f35a')],
    ['rice',       t('1f35a')],
    ['roti',       t('1fad3')],
    ['chapati',    t('1fad3')],
    ['bread',      t('1f35e')],
    ['idli',       t('1fad3')],
    ['dosa',       t('1f95e')],
    ['oats',       t('1f963')],
    ['upma',       t('1f372')],
    ['poha',       t('1f372')],
    // Protein
    ['boiled egg', t('1f95a')],
    ['egg',        t('1f95a')],
    ['chicken',    t('1f357')],
    ['fish',       t('1f41f')],
    ['toor dal',   t('1f35b')],
    ['dal',        t('1f35b')],
    ['rajma',      t('1fad8')],
    ['chana',      t('1fad8')],
    ['sambar',     t('1f372')],
    ['lentil',     t('1f35b')],
    ['paneer',     t('1f9c0')],
    // Vegetables
    ['spinach',    t('1f96c')],
    ['carrot',     t('1f955')],
    ['broccoli',   t('1f966')],
    ['tomato',     t('1f345')],
    ['peas',       t('1fadb')],
    // Fruits
    ['banana',     t('1f34c')],
    ['apple',      t('1f34e')],
    ['mango',      t('1f96d')],
    ['orange',     t('1f34a')],
    ['papaya',     t('1f348')],
    // Dairy
    ['milk',       t('1f95b')],
    ['curd',       t('1fad9')],
    ['yogurt',     t('1fad9')],
    ['cheese',     t('1f9c0')],
    ['butter',     t('1f9c8')],
    // Fats
    ['peanut butter', t('1f95c')],
    ['almond',     t('1f330')],
    ['ghee',       t('1fad9')],
];

// ── Group fallback icons ───────────────────────────────────────────────────────
export const GROUP_ICON_MAP: Record<FoodGroup, string> = {
    grains:     t('1f33e'),   // 🌾 sheaf of rice
    protein:    t('1f969'),   // 🥩 cut of meat
    vegetables: t('1f957'),   // 🥗 green salad
    fruits:     t('1f353'),   // 🍓 strawberry
    dairy:      t('1f95b'),   // 🥛 glass of milk
    fats:       t('1f95c'),   // 🥜 peanuts
    other:      t('1f37d-fe0f'), // 🍽️ plate with cutlery
};

export function getFoodIconUrl(name: string, group: FoodGroup): string {
    const lower = name.toLowerCase();
    for (const [key, url] of FOOD_ICON_MAP) {
        if (lower.includes(key)) return url;
    }
    return GROUP_ICON_MAP[group] ?? GROUP_ICON_MAP.other;
}

// ── Meal type icons (Twemoji SVG URLs) ────────────────────────────────────────
export const MEAL_ICON_MAP = {
    breakfast: t('1f305'), // 🌅 sunrise
    snack:     t('1f34e'), // 🍎 red apple
    lunch:     t('2600-fe0f'), // ☀️ sun
    dinner:    t('1f319'), // 🌙 crescent moon
} as const;
