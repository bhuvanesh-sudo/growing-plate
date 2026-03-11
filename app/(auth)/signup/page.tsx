'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Leaf, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { toast } from 'sonner';

// ── Step 1 schema ─────────────────────────────────────────────────────────────
const step1Schema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

// ── Step 2 schema ─────────────────────────────────────────────────────────────
const step2Schema = z.object({
    childName: z.string().min(2, "Child's name must be at least 2 characters"),
    dob: z.string().min(1, 'Date of birth is required'),
    sex: z.enum(['male', 'female'], { message: 'Please select a sex' }),
    activityLevel: z.enum(['sedentary', 'moderate', 'active']),
});

type Step1Form = z.infer<typeof step1Schema>;
type Step2Form = z.infer<typeof step2Schema>;

export default function SignupPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Store step 1 data across steps
    const [step1Data, setStep1Data] = useState<Step1Form | null>(null);

    const form1 = useForm<Step1Form>({ resolver: zodResolver(step1Schema) });
    const form2 = useForm<Step2Form>({
        resolver: zodResolver(step2Schema),
        defaultValues: { activityLevel: 'moderate' },
    });

    const handleStep1 = (data: Step1Form) => {
        setStep1Data(data);
        setStep(2);
    };

    const handleStep2 = async (data: Step2Form) => {
        if (!step1Data) return;
        setLoading(true);
        try {
            const supabase = createClient();

            // Create auth user with name in metadata
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: step1Data.email,
                password: step1Data.password,
                options: {
                    data: { name: step1Data.name },
                },
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('Signup failed — no user returned');

            // The handle_new_user trigger creates profiles row.
            // Small wait to ensure trigger fires:
            await new Promise((r) => setTimeout(r, 500));

            // Insert child
            const { error: childError } = await supabase.from('children').insert({
                user_id: authData.user.id,
                name: data.childName,
                dob: data.dob,
                sex: data.sex,
                activity_level: data.activityLevel,
                allergies: [],
                dietary_flags: [],
            });

            if (childError) throw childError;

            setStep(3);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Signup failed. Please try again.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{ background: 'var(--gp-bg)' }}
        >
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                        style={{ background: 'var(--gp-orange)' }}
                    >
                        <Leaf size={32} color="#FFFFFF" strokeWidth={2.5} />
                    </div>
                    <h1 className="text-3xl font-black" style={{ color: 'var(--gp-text)' }}>
                        GrowingPlate
                    </h1>
                    <p className="text-sm font-bold mt-1" style={{ color: 'var(--gp-muted)' }}>
                        Let&apos;s set up your account 🌱
                    </p>
                </div>

                {/* Step indicator */}
                {step < 3 && (
                    <div className="flex items-center justify-center gap-2 mb-6">
                        {[1, 2].map((s) => (
                            <div
                                key={s}
                                className="h-2 rounded-full transition-all"
                                style={{
                                    width: step === s ? '32px' : '8px',
                                    background: step >= s ? 'var(--gp-orange)' : 'var(--gp-border)',
                                }}
                            />
                        ))}
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {/* ── STEP 1: Parent info ── */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            transition={{ duration: 0.25 }}
                        >
                            <div
                                className="rounded-2xl p-6 shadow-sm border"
                                style={{ background: 'var(--gp-card)', borderColor: 'var(--gp-border)' }}
                            >
                                <h2 className="text-xl font-black mb-1" style={{ color: 'var(--gp-text)' }}>
                                    About you
                                </h2>
                                <p className="text-sm font-bold mb-5" style={{ color: 'var(--gp-muted)' }}>
                                    Step 1 of 2 · Parent account
                                </p>

                                <form onSubmit={form1.handleSubmit(handleStep1)} className="flex flex-col gap-4">
                                    {/* Name */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-black" style={{ color: 'var(--gp-text)' }}>
                                            Your name
                                        </label>
                                        <input
                                            {...form1.register('name')}
                                            type="text"
                                            placeholder="Priya"
                                            autoComplete="name"
                                            className="rounded-xl px-4 py-3 font-semibold text-sm outline-none border-2 transition-all"
                                            style={{
                                                background: 'var(--gp-bg)',
                                                borderColor: form1.formState.errors.name ? 'var(--gp-red)' : 'var(--gp-border)',
                                                color: 'var(--gp-text)',
                                            }}
                                        />
                                        {form1.formState.errors.name && (
                                            <p className="text-xs font-bold" style={{ color: 'var(--gp-red)' }}>
                                                {form1.formState.errors.name.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-black" style={{ color: 'var(--gp-text)' }}>
                                            Email
                                        </label>
                                        <input
                                            {...form1.register('email')}
                                            type="email"
                                            placeholder="you@example.com"
                                            autoComplete="email"
                                            className="rounded-xl px-4 py-3 font-semibold text-sm outline-none border-2 transition-all"
                                            style={{
                                                background: 'var(--gp-bg)',
                                                borderColor: form1.formState.errors.email ? 'var(--gp-red)' : 'var(--gp-border)',
                                                color: 'var(--gp-text)',
                                            }}
                                        />
                                        {form1.formState.errors.email && (
                                            <p className="text-xs font-bold" style={{ color: 'var(--gp-red)' }}>
                                                {form1.formState.errors.email.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Password */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-black" style={{ color: 'var(--gp-text)' }}>
                                            Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                {...form1.register('password')}
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                autoComplete="new-password"
                                                className="w-full rounded-xl px-4 py-3 pr-12 font-semibold text-sm outline-none border-2"
                                                style={{
                                                    background: 'var(--gp-bg)',
                                                    borderColor: form1.formState.errors.password ? 'var(--gp-red)' : 'var(--gp-border)',
                                                    color: 'var(--gp-text)',
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((p) => !p)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2"
                                                style={{ color: 'var(--gp-muted)' }}
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        {form1.formState.errors.password && (
                                            <p className="text-xs font-bold" style={{ color: 'var(--gp-red)' }}>
                                                {form1.formState.errors.password.message}
                                            </p>
                                        )}
                                    </div>

                                    <motion.button
                                        whileTap={{ scale: 0.97 }}
                                        type="submit"
                                        className="w-full py-3.5 rounded-xl font-black text-base mt-1"
                                        style={{ background: 'var(--gp-orange)', color: '#FFFFFF' }}
                                    >
                                        Continue →
                                    </motion.button>
                                </form>
                            </div>

                            <p className="text-center text-sm font-bold mt-5" style={{ color: 'var(--gp-muted)' }}>
                                Already have an account?{' '}
                                <Link href="/login" className="font-black" style={{ color: 'var(--gp-orange)' }}>
                                    Sign in
                                </Link>
                            </p>
                        </motion.div>
                    )}

                    {/* ── STEP 2: Child info ── */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            transition={{ duration: 0.25 }}
                        >
                            <div
                                className="rounded-2xl p-6 shadow-sm border"
                                style={{ background: 'var(--gp-card)', borderColor: 'var(--gp-border)' }}
                            >
                                <h2 className="text-xl font-black mb-1" style={{ color: 'var(--gp-text)' }}>
                                    About your child
                                </h2>
                                <p className="text-sm font-bold mb-5" style={{ color: 'var(--gp-muted)' }}>
                                    Step 2 of 2 · We&apos;ll personalise their nutrition goals
                                </p>

                                <form onSubmit={form2.handleSubmit(handleStep2)} className="flex flex-col gap-4">
                                    {/* Child name */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-black" style={{ color: 'var(--gp-text)' }}>
                                            Child&apos;s name
                                        </label>
                                        <input
                                            {...form2.register('childName')}
                                            type="text"
                                            placeholder="Arjun"
                                            className="rounded-xl px-4 py-3 font-semibold text-sm outline-none border-2"
                                            style={{
                                                background: 'var(--gp-bg)',
                                                borderColor: form2.formState.errors.childName ? 'var(--gp-red)' : 'var(--gp-border)',
                                                color: 'var(--gp-text)',
                                            }}
                                        />
                                        {form2.formState.errors.childName && (
                                            <p className="text-xs font-bold" style={{ color: 'var(--gp-red)' }}>
                                                {form2.formState.errors.childName.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* DOB */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-black" style={{ color: 'var(--gp-text)' }}>
                                            Date of birth
                                        </label>
                                        <input
                                            {...form2.register('dob')}
                                            type="date"
                                            max={new Date().toISOString().split('T')[0]}
                                            className="rounded-xl px-4 py-3 font-semibold text-sm outline-none border-2"
                                            style={{
                                                background: 'var(--gp-bg)',
                                                borderColor: form2.formState.errors.dob ? 'var(--gp-red)' : 'var(--gp-border)',
                                                color: 'var(--gp-text)',
                                            }}
                                        />
                                        {form2.formState.errors.dob && (
                                            <p className="text-xs font-bold" style={{ color: 'var(--gp-red)' }}>
                                                {form2.formState.errors.dob.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Sex */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-black" style={{ color: 'var(--gp-text)' }}>
                                            Sex
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {(['male', 'female'] as const).map((s) => {
                                                const selected = form2.watch('sex') === s;
                                                return (
                                                    <button
                                                        key={s}
                                                        type="button"
                                                        onClick={() => form2.setValue('sex', s)}
                                                        className="py-3 rounded-xl font-black text-sm border-2 transition-all capitalize"
                                                        style={{
                                                            background: selected ? 'var(--gp-orange)' : 'var(--gp-bg)',
                                                            borderColor: selected ? 'var(--gp-orange)' : 'var(--gp-border)',
                                                            color: selected ? '#FFFFFF' : 'var(--gp-muted)',
                                                        }}
                                                    >
                                                        {s === 'male' ? '👦 Boy' : '👧 Girl'}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {form2.formState.errors.sex && (
                                            <p className="text-xs font-bold" style={{ color: 'var(--gp-red)' }}>
                                                {form2.formState.errors.sex.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Activity level */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-black" style={{ color: 'var(--gp-text)' }}>
                                            Activity level
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {([
                                                { value: 'sedentary', label: '🧸 Low' },
                                                { value: 'moderate', label: '🚴 Moderate' },
                                                { value: 'active', label: '⚡ Active' },
                                            ] as const).map(({ value, label }) => {
                                                const selected = form2.watch('activityLevel') === value;
                                                return (
                                                    <button
                                                        key={value}
                                                        type="button"
                                                        onClick={() => form2.setValue('activityLevel', value)}
                                                        className="py-2.5 rounded-xl font-black text-xs border-2 transition-all text-center"
                                                        style={{
                                                            background: selected ? 'var(--gp-orange)' : 'var(--gp-bg)',
                                                            borderColor: selected ? 'var(--gp-orange)' : 'var(--gp-border)',
                                                            color: selected ? '#FFFFFF' : 'var(--gp-muted)',
                                                        }}
                                                    >
                                                        {label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="flex-1 py-3.5 rounded-xl font-black text-sm border-2"
                                            style={{
                                                background: 'transparent',
                                                borderColor: 'var(--gp-border)',
                                                color: 'var(--gp-muted)',
                                            }}
                                        >
                                            ← Back
                                        </button>
                                        <motion.button
                                            whileTap={{ scale: 0.97 }}
                                            type="submit"
                                            disabled={loading}
                                            className="flex-2 flex-grow py-3.5 rounded-xl font-black text-sm disabled:opacity-60"
                                            style={{ background: 'var(--gp-orange)', color: '#FFFFFF' }}
                                        >
                                            {loading ? 'Creating…' : 'Create Account'}
                                        </motion.button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    )}

                    {/* ── STEP 3: Success ── */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
                            className="text-center"
                        >
                            <div
                                className="rounded-2xl p-8 shadow-sm border"
                                style={{ background: 'var(--gp-card)', borderColor: 'var(--gp-border)' }}
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                                    className="inline-flex w-20 h-20 rounded-full items-center justify-center mb-5"
                                    style={{ background: '#E8F5ED' }}
                                >
                                    <CheckCircle size={40} style={{ color: 'var(--gp-green)' }} />
                                </motion.div>

                                <h2 className="text-2xl font-black mb-2" style={{ color: 'var(--gp-text)' }}>
                                    You&apos;re all set! 🎉
                                </h2>
                                <p className="text-sm font-bold mb-6" style={{ color: 'var(--gp-muted)' }}>
                                    Your account and child profile have been created. Start logging today&apos;s meals!
                                </p>

                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => router.push('/today')}
                                    className="w-full py-4 rounded-xl font-black text-base"
                                    style={{ background: 'var(--gp-orange)', color: '#FFFFFF' }}
                                >
                                    Let&apos;s go →
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
