import { Link } from "@/i18n/routing";
import { Mic, Facebook, Twitter, Linkedin, Youtube, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NewsletterForm } from "@/components/forms/newsletter-form";

export function Footer() {
    return (
        <footer className="bg-secondary/20 border-t py-12 lg:py-16">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="bg-primary p-1 rounded-lg">
                                <Mic className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-primary">EnergyGurus</span>
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Energy insights for Pakistan. Delivering expert analysis, weekly podcast episodes, and real‑time telemetry solutions.
                        </p>
                        <div className="flex space-x-4">
                            <Link href="#" className="text-muted-foreground hover:text-primary"><Facebook className="h-5 w-5" /></Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5" /></Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary"><Linkedin className="h-5 w-5" /></Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary"><Youtube className="h-5 w-5" /></Link>
                        </div>
                    </div>

                    {/* Sitemap Column */}
                    <div>
                        <h4 className="font-bold mb-4">Sitemap</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/podcast" className="hover:text-primary">Podcast</Link></li>
                            <li><Link href="/audit" className="hover:text-primary">Audit</Link></li>
                            <li><Link href="/monitoring" className="hover:text-primary">Monitoring</Link></li>
                            <li><Link href="/om" className="hover:text-primary">O&M</Link></li>
                            <li><Link href="/resources" className="hover:text-primary">Resources</Link></li>
                        </ul>
                    </div>

                    {/* Legal Column */}
                    <div>
                        <h4 className="font-bold mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-primary">Terms of Use</Link></li>
                            <li><Link href="/cookies" className="hover:text-primary">Cookie Policy</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter Column */}
                    <div>
                        <h4 className="font-bold mb-4">Newsletter</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                            Get the latest energy news and podcast episodes delivered to your inbox.
                        </p>
                        <div className="flex space-x-2">
                            <NewsletterForm variant="minimal" />
                        </div>
                    </div>
                </div>

                <div className="border-t pt-8 text-center text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} EnergyGurus. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
