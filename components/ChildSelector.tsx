'use client';

import { useChild } from '@/hooks/useChild';

export default function ChildSelector() {
    const { child, loading } = useChild();

    if (loading) {
        return (
            <div className="skeleton h-8 w-32 rounded-lg" />
        );
    }

    if (!child) return null;

    return (
        <div className="flex items-center gap-2">
            <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                style={{ background: 'var(--gp-orange)', color: '#FFFFFF' }}
            >
                {child.name.charAt(0).toUpperCase()}
            </div>
            <span className="font-black text-sm" style={{ color: 'var(--gp-text)' }}>
                {child.name}
            </span>
        </div>
    );
}
