import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, MessageSquare, Clock, ArrowRight, Instagram, Linkedin, Twitter } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Input } from "@/components/ui/input";

export default function ContactPage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Header */}
            <section className="bg-primary text-primary-foreground py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
                    <p className="text-lg opacity-90 max-w-2xl mx-auto">
                        Whether you have a question about our services, need an audit, or want to partner with us, our team is ready to help.
                    </p>
                </div>
            </section>

            <div className="container mx-auto px-4 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    {/* Contact Info Sidebar */}
                    <div className="space-y-12">
                        <div>
                            <h2 className="text-2xl font-bold mb-8">Contact Information</h2>
                            <div className="space-y-8">
                                <ContactMethod
                                    icon={<Mail className="w-6 h-6 text-primary" />}
                                    title="Email Us"
                                    value="info@energygurus.online"
                                    description="We respond within 24 hours."
                                />
                                <ContactMethod
                                    icon={<Phone className="w-6 h-6 text-primary" />}
                                    title="Call Us"
                                    value="+92 21 3XXX XXXX"
                                    description="Mon-Fri, 9am - 6pm (PKT)"
                                />
                                <ContactMethod
                                    icon={<MapPin className="w-6 h-6 text-primary" />}
                                    title="Visit Us"
                                    value="DHA Phase 6, Karachi, Pakistan"
                                    description="By appointment only."
                                />
                            </div>
                        </div>

                        <Card className="bg-accent/10 border-none p-6">
                            <h4 className="font-bold mb-4 flex items-center gap-2"><MessageSquare className="w-5 h-5" /> Quick Support</h4>
                            <p className="text-sm text-muted-foreground mb-6">Need a faster response? Reach out via WhatsApp or Social Media.</p>
                            <div className="flex gap-4">
                                <Button size="icon" variant="outline" className="rounded-full bg-white"><Instagram className="w-4 h-4" /></Button>
                                <Button size="icon" variant="outline" className="rounded-full bg-white"><Linkedin className="w-4 h-4" /></Button>
                                <Button size="icon" variant="outline" className="rounded-full bg-white"><Twitter className="w-4 h-4" /></Button>
                            </div>
                        </Card>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <Card className="shadow-2xl border-none">
                            <CardContent className="p-8 md:p-12">
                                <h3 className="text-2xl font-bold mb-8">Send us a Message</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Your Name</label>
                                        <Input placeholder="John Doe" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Email Address</label>
                                        <Input type="email" placeholder="john@example.com" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Subject</label>
                                        <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                                            <option>General Inquiry</option>
                                            <option>Request an Audit</option>
                                            <option>O&M Services</option>
                                            <option>Partnership/Sponsorship</option>
                                            <option>Media/Press</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Phone (Optional)</label>
                                        <Input placeholder="+92 3XX XXXXXXX" />
                                    </div>
                                </div>
                                <div className="space-y-2 mb-8">
                                    <label className="text-sm font-medium">Message</label>
                                    <textarea className="w-full min-h-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Tell us how we can help..." />
                                </div>
                                <Button className="w-full md:w-auto px-12 font-bold py-6 text-lg" size="lg">Send Message</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ContactMethod({ icon, title, value, description }: { icon: React.ReactNode, title: string, value: string, description: string }) {
    return (
        <div className="flex gap-4">
            <div className="p-3 bg-secondary/20 rounded-xl h-fit">{icon}</div>
            <div>
                <h4 className="font-bold text-lg mb-1">{title}</h4>
                <p className="font-medium text-primary mb-1 underline underline-offset-4">{value}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}
