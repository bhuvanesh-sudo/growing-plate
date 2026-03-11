'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Leaf } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { toast } from 'sonner';

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

    const onSubmit = async (data: LoginForm) => {
        setLoading(true);
        try {
            const supabase = createClient();
            const { error } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });
            if (error) throw error;
            router.push('/today');
            router.refresh();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
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
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="w-full max-w-sm"
            >
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
                        Track what your little one eats 🌱
                    </p>
                </div>

                {/* Card */}
                <div
                    className="rounded-2xl p-6 shadow-sm border"
                    style={{ background: 'var(--gp-card)', borderColor: 'var(--gp-border)' }}
                >
                    <h2 className="text-xl font-black mb-5" style={{ color: 'var(--gp-text)' }}>
                        Welcome back!
                    </h2>

                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        {/* Email */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-black" style={{ color: 'var(--gp-text)' }}>
                                Email
                            </label>
                            <input
                                {...register('email')}
                                type="email"
                                placeholder="you@example.com"
                                autoComplete="email"
                                className="rounded-xl px-4 py-3 font-semibold text-sm outline-none border-2 transition-all"
                                style={{
                                    background: 'var(--gp-bg)',
                                    borderColor: errors.email ? 'var(--gp-red)' : 'var(--gp-border)',
                                    color: 'var(--gp-text)',
                                }}
                            />
                            {errors.email && (
                                <p className="text-xs font-bold" style={{ color: 'var(--gp-red)' }}>
                                    {errors.email.message}
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
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    className="w-full rounded-xl px-4 py-3 pr-12 font-semibold text-sm outline-none border-2 transition-all"
                                    style={{
                                        background: 'var(--gp-bg)',
                                        borderColor: errors.password ? 'var(--gp-red)' : 'var(--gp-border)',
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
                            {errors.password && (
                                <p className="text-xs font-bold" style={{ color: 'var(--gp-red)' }}>
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Submit */}
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl font-black text-base mt-1 transition-all disabled:opacity-60"
                            style={{ background: 'var(--gp-orange)', color: '#FFFFFF' }}
                        >
                            {loading ? 'Signing in…' : 'Sign In'}
                        </motion.button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-sm font-bold mt-5" style={{ color: 'var(--gp-muted)' }}>
                    New here?{' '}
                    <Link
                        href="/signup"
                        className="font-black"
                        style={{ color: 'var(--gp-orange)' }}
                    >
                        Create an account →
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
