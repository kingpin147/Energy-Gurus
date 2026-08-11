import { SecurityGuard } from "@/components/auth/security-guard";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default async function PublicLayout({
    children
    }: {
    children: React.ReactNode;
}) {
    
    return (
        <div className="flex flex-col min-h-screen">
            <SecurityGuard />
            <Navbar />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    );
}
