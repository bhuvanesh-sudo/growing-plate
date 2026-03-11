'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CalendarDays, User } from 'lucide-react';

const NAV_ITEMS = [
    { href: '/today', label: 'Today', icon: Home },
    { href: '/calendar', label: 'Calendar', icon: CalendarDays },
    { href: '/profile', label: 'Profile', icon: User },
];

export default function NavBar() {
    const pathname = usePathname();

    return (
        <>
            {/* ── Mobile bottom bar ── */}
            <nav
                className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t"
                style={{ background: 'var(--gp-card)', borderColor: 'var(--gp-border)' }}
            >
                {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href || pathname.startsWith(href + '/');
                    return (
                        <Link
                            key={href}
                            href={href}
                            className="flex flex-1 flex-col items-center gap-1 py-3 transition-all"
                            style={{ color: active ? 'var(--gp-orange)' : 'var(--gp-muted)' }}
                        >
                            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                            <span className="text-xs font-bold">{label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* ── Desktop left sidebar ── */}
            <aside
                className="hidden md:flex fixed inset-y-0 left-0 z-50 w-56 flex-col border-r px-4 py-8 gap-2"
                style={{ background: 'var(--gp-card)', borderColor: 'var(--gp-border)' }}
            >
                {/* Logo */}
                <div className="mb-6 px-2">
                    <span className="text-2xl font-black" style={{ color: 'var(--gp-orange)' }}>
                        🌱 GrowingPlate
                    </span>
                </div>

                {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href || pathname.startsWith(href + '/');
                    return (
                        <Link
                            key={href}
                            href={href}
                            className="flex items-center gap-3 rounded-xl px-4 py-3 font-bold transition-all"
                            style={{
                                background: active ? 'var(--gp-orange)' : 'transparent',
                                color: active ? '#FFFFFF' : 'var(--gp-muted)',
                            }}
                        >
                            <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                            {label}
                        </Link>
                    );
                })}
            </aside>
        </>
    );
}
