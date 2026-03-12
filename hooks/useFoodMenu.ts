'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import type { Food, FoodGroup } from '@/lib/types';

type SortField = 'name' | 'calories_kcal' | 'protein_g' | 'carbs_g' | 'fat_g';

interface UseFoodMenuOptions {
    search: string;
    group: FoodGroup | 'all';
    sortBy: SortField;
}

export function useFoodMenu({ search, group, sortBy }: UseFoodMenuOptions) {
    const [foods, setFoods] = useState<Food[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const sb = createClient();
            let q = sb.from('foods').select('*');

            if (group !== 'all') q = q.eq('food_group', group);
            if (search.trim()) q = q.ilike('name', `%${search.trim()}%`);

            q = q.order(sortBy, { ascending: sortBy === 'name' });
            q = q.limit(100);

            const { data, error: err } = await q;
            if (err) throw err;
            setFoods((data ?? []) as Food[]);
        } catch (e) {
            setError((e as Error).message ?? 'Failed to load foods');
        } finally {
            setLoading(false);
        }
    }, [search, group, sortBy]);

    useEffect(() => {
        void fetch();
    }, [fetch]);

    return { foods, loading, error, refetch: fetch };
}
