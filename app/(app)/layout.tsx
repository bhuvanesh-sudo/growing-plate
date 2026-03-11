import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import NavBar from '@/components/NavBar';
import { ChildProvider } from '@/hooks/useChild';

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createServerSupabaseClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    return (
        <ChildProvider>
            <div className="min-h-screen flex">
                {/* Desktop: sidebar spacer */}
                <div className="hidden md:block w-56 flex-shrink-0" />

                {/* Main content */}
                <main className="flex-1 min-w-0 pb-20 md:pb-0">
                    {children}
                </main>
            </div>
            <NavBar />
        </ChildProvider>
    );
}
