'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { format, differenceInYears, differenceInMonths } from 'date-fns';
import { createClient } from '@/lib/supabase';
import { useChild } from '@/hooks/useChild';
import { toast } from 'sonner';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PageBackground from '@/components/PageBackground';

const profileSchema = z.object({
    weight_kg: z.string().optional(),
    height_cm: z.string().optional(),
    activity_level: z.enum(['sedentary', 'moderate', 'active']),
    allergies: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
    const { child, loading, refetchChild } = useChild();
    const router = useRouter();
    const [saving, setSaving] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isDirty },
    } = useForm<ProfileForm>({
        resolver: zodResolver(profileSchema),
        defaultValues: { activity_level: 'moderate' },
    });

    // Populate form when child loads
    useEffect(() => {
        if (child) {
            reset({
                weight_kg: child.weight_kg?.toString() ?? '',
                height_cm: child.height_cm?.toString() ?? '',
                activity_level: child.activity_level,
                allergies: child.allergies?.join(', ') ?? '',
            });
        }
    }, [child, reset]);

    const onSubmit = async (data: ProfileForm) => {
        if (!child) return;
        setSaving(true);
        try {
            const supabase = createClient();
            const allergiesArr = data.allergies
                ? data.allergies.split(',').map((a) => a.trim()).filter(Boolean)
                : [];

            const { error } = await supabase
                .from('children')
                .update({
                    weight_kg: data.weight_kg ? parseFloat(data.weight_kg) : null,
                    height_cm: data.height_cm ? parseFloat(data.height_cm) : null,
                    activity_level: data.activity_level,
                    allergies: allergiesArr,
                })
                .eq('id', child.id);

            if (error) throw error;
            toast.success('Profile updated! 🎉');
            refetchChild();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to save profile.';
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    if (loading) {
        return (
            <div className="p-6 flex flex-col gap-4">
                <div className="skeleton h-8 w-40 rounded-lg" />
                <div className="skeleton h-32 w-full rounded-2xl" />
                <div className="skeleton h-48 w-full rounded-2xl" />
            </div>
        );
    }

    if (!child) return null;

    const dob = new Date(child.dob);
    const years = differenceInYears(new Date(), dob);
    const months = differenceInMonths(new Date(), dob) % 12;
    const ageStr = years > 0 ? `${years}y ${months}m` : `${months} months`;

    const activityLevel = watch('activity_level');

    return (
        <>
            <PageBackground page="profile" />
            <div className="relative z-10 px-4 py-6 md:px-8 md:py-8">
            <div className="max-w-lg mx-auto flex flex-col gap-5">

                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-black" style={{ color: 'var(--gp-text)' }}>
                        Profile
                    </h1>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl transition-all hover:opacity-70"
                        style={{ background: '#FFF0EF', color: 'var(--gp-red)' }}
                    >
                        <LogOut size={14} />
                        Sign Out
                    </button>
                </div>

                {/* Child info card */}
                <div
                    className="rounded-2xl p-5 border"
                    style={{ background: 'var(--gp-card)', borderColor: 'var(--gp-border)' }}
                >
                    <div className="flex items-center gap-4">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black flex-shrink-0"
                            style={{ background: 'var(--gp-orange)', color: '#FFFFFF' }}
                        >
                            {child.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-xl font-black" style={{ color: 'var(--gp-text)' }}>
                                {child.name}
                            </h2>
                            <p className="text-sm font-bold" style={{ color: 'var(--gp-muted)' }}>
                                {child.sex === 'male' ? '👦 Boy' : '👧 Girl'} · Age {ageStr}
                            </p>
                            <p className="text-xs font-bold" style={{ color: 'var(--gp-muted)' }}>
                                DOB: {format(dob, 'd MMMM yyyy')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Edit form */}
                <div
                    className="rounded-2xl p-5 border"
                    style={{ background: 'var(--gp-card)', borderColor: 'var(--gp-border)' }}
                >
                    <h3 className="font-black mb-4" style={{ color: 'var(--gp-text)' }}>
                        Health Details
                    </h3>

                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        {/* Weight + Height */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-black" style={{ color: 'var(--gp-text)' }}>
                                    Weight (kg)
                                </label>
                                <input
                                    {...register('weight_kg')}
                                    type="number"
                                    step="0.1"
                                    placeholder="28.5"
                                    className="rounded-xl px-4 py-3 font-semibold text-sm outline-none border-2"
                                    style={{
                                        background: 'var(--gp-bg)',
                                        borderColor: 'var(--gp-border)',
                                        color: 'var(--gp-text)',
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-black" style={{ color: 'var(--gp-text)' }}>
                                    Height (cm)
                                </label>
                                <input
                                    {...register('height_cm')}
                                    type="number"
                                    step="0.5"
                                    placeholder="118"
                                    className="rounded-xl px-4 py-3 font-semibold text-sm outline-none border-2"
                                    style={{
                                        background: 'var(--gp-bg)',
                                        borderColor: 'var(--gp-border)',
                                        color: 'var(--gp-text)',
                                    }}
                                />
                            </div>
                        </div>

                        {/* Activity level */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-black" style={{ color: 'var(--gp-text)' }}>
                                Activity Level
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {([
                                    { value: 'sedentary', label: '🧸 Low' },
                                    { value: 'moderate', label: '🚴 Moderate' },
                                    { value: 'active', label: '⚡ Active' },
                                ] as const).map(({ value, label }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setValue('activity_level', value, { shouldDirty: true })}
                                        className="py-2.5 rounded-xl font-black text-xs border-2 transition-all text-center"
                                        style={{
                                            background: activityLevel === value ? 'var(--gp-orange)' : 'var(--gp-bg)',
                                            borderColor: activityLevel === value ? 'var(--gp-orange)' : 'var(--gp-border)',
                                            color: activityLevel === value ? '#FFFFFF' : 'var(--gp-muted)',
                                        }}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Allergies */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-black" style={{ color: 'var(--gp-text)' }}>
                                Allergies / Dietary notes
                            </label>
                            <input
                                {...register('allergies')}
                                type="text"
                                placeholder="e.g. nuts, dairy, gluten"
                                className="rounded-xl px-4 py-3 font-semibold text-sm outline-none border-2"
                                style={{
                                    background: 'var(--gp-bg)',
                                    borderColor: 'var(--gp-border)',
                                    color: 'var(--gp-text)',
                                }}
                            />
                            <p className="text-xs font-bold" style={{ color: 'var(--gp-muted)' }}>
                                Separate multiple items with commas
                            </p>
                        </div>

                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            type="submit"
                            disabled={saving || !isDirty}
                            className="w-full py-3.5 rounded-xl font-black text-base transition-all disabled:opacity-50"
                            style={{ background: 'var(--gp-orange)', color: '#FFFFFF' }}
                        >
                            {saving ? 'Saving…' : 'Save Changes'}
                        </motion.button>
                    </form>
                </div>

                {/* Multi-child stub */}
                <div
                    className="rounded-2xl p-5 border flex items-center justify-between"
                    style={{ background: 'var(--gp-card)', borderColor: 'var(--gp-border)', opacity: 0.6 }}
                >
                    <div>
                        <p className="font-black text-sm" style={{ color: 'var(--gp-text)' }}>
                            Add another child
                        </p>
                        <p className="text-xs font-bold" style={{ color: 'var(--gp-muted)' }}>
                            Multi-child support coming soon
                        </p>
                    </div>
                    <span
                        className="text-xs font-black px-3 py-1.5 rounded-full"
                        style={{ background: 'var(--gp-border)', color: 'var(--gp-muted)' }}
                    >
                        Coming soon
                    </span>
                </div>
            </div>
            </div>
        </>
    );
}
