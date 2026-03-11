'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { getRDATargets } from '@/lib/nutrition';
import type { NutrientTargets } from '@/lib/nutrition';
import type { Child } from '@/lib/types';

interface ChildContextValue {
    child: Child | null;
    loading: boolean;
    targets: NutrientTargets | null;
    refetchChild: () => void;
}

const ChildContext = createContext<ChildContextValue>({
    child: null,
    loading: true,
    targets: null,
    refetchChild: () => { },
});

export function ChildProvider({ children }: { children: React.ReactNode }) {
    const [child, setChild] = useState<Child | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchChild = async () => {
        setLoading(true);
        try {
            const supabase = createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) {
                setChild(null);
                return;
            }
            const { data, error } = await supabase
                .from('children')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: true })
                .limit(1)
                .single();
            if (error) {
                setChild(null);
            } else {
                setChild(data as Child);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChild();
    }, []);

    const targets = child
        ? getRDATargets(new Date(child.dob), child.sex, child.activity_level)
        : null;

    return (
        <ChildContext.Provider value={{ child, loading, targets, refetchChild: fetchChild }}>
            {children}
        </ChildContext.Provider>
    );
}

export function useChild() {
    return useContext(ChildContext);
}
