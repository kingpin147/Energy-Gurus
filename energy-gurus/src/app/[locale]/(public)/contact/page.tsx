"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, MessageSquare, Instagram, Linkedin, Twitter, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { submitPublicContact } from "@/lib/actions/inquiry";

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const result = await submitPublicContact(formData);

        if (result.success) {
            setIsSuccess(true);
        } else {
            setError(result.error || "An unexpected error occurred.");
        }

        setIsSubmitting(false);
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Header */}
            <section className="bg-amber text-ink text-ink py-20">
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
                                    icon={<Mail className="w-6 h-6 text-amber" />}
                                    title="Email Us"
                                    value="info@energygurus.online"
                                    description="We respond within 24 hours."
                                />
                                <ContactMethod
                                    icon={<Phone className="w-6 h-6 text-amber" />}
                                    title="Call Us"
                                    value="+92 21 3XXX XXXX"
                                    description="Mon-Fri, 9am - 6pm (PKT)"
                                />
                                <ContactMethod
                                    icon={<MapPin className="w-6 h-6 text-amber" />}
                                    title="Visit Us"
                                    value="DHA Phase 6, Karachi, Pakistan"
                                    description="By appointment only."
                                />
                            </div>
                        </div>

                        <Card className="bg-paper/10 border-none p-6">
                            <h4 className="font-bold mb-4 flex items-center gap-2"><MessageSquare className="w-5 h-5" /> Quick Support</h4>
                            <p className="text-sm text-slate-custom mb-6">Need a faster response? Reach out via WhatsApp or Social Media.</p>
                            <div className="flex gap-4">
                                <Button size="icon" variant="outline" className="rounded-full bg-white"><Instagram className="w-4 h-4" /></Button>
                                <Button size="icon" variant="outline" className="rounded-full bg-white"><Linkedin className="w-4 h-4" /></Button>
                                <Button size="icon" variant="outline" className="rounded-full bg-white"><Twitter className="w-4 h-4" /></Button>
                            </div>
                        </Card>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <Card className="shadow-2xl border-none overflow-hidden relative">
                            {isSuccess ? (
                                <CardContent className="p-12 md:p-24 flex flex-col items-center justify-center text-center min-h-[500px]">
                                    <div className="w-20 h-20 bg-amber/10 text-ink text-amber rounded-full flex items-center justify-center mb-6">
                                        <CheckCircle2 className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-3xl font-bold mb-4">Message Sent!</h3>
                                    <p className="text-slate-custom text-lg mb-8 max-w-md">
                                        Thank you for reaching out to EnergyGurus. Our team will review your inquiry and get back to you shortly.
                                    </p>
                                    <Button onClick={() => setIsSuccess(false)} variant="outline" className="font-bold">
                                        Send Another Message
                                    </Button>
                                </CardContent>
                            ) : (
                                <CardContent className="p-8 md:p-12">
                                    <h3 className="text-2xl font-bold mb-8">Send us a Message</h3>

                                    {error && (
                                        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium">
                                            {error}
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Your Name *</label>
                                                <Input name="name" required placeholder="John Doe" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Email Address *</label>
                                                <Input name="email" type="email" required placeholder="john@example.com" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Subject</label>
                                                <select name="subject" className="w-full h-10 rounded-md border border-input bg-paper px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                                    <option>General Inquiry</option>
                                                    <option>Request an Audit</option>
                                                    <option>O&M Services</option>
                                                    <option>Partnership/Sponsorship</option>
                                                    <option>Media/Press</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Phone (Optional)</label>
                                                <Input name="phone" placeholder="+92 3XX XXXXXXX" />
                                            </div>
                                        </div>
                                        <div className="space-y-2 mb-8">
                                            <label className="text-sm font-medium">Message *</label>
                                            <textarea name="message" required className="w-full min-h-[150px] rounded-md border border-input bg-paper px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" placeholder="Tell us how we can help..." />
                                        </div>
                                        <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto px-12 font-bold py-6 text-lg" size="lg">
                                            {isSubmitting ? "Sending..." : "Send Message"}
                                        </Button>
                                    </form>
                                </CardContent>
                            )}
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
            <div className="p-3 bg-paper/20 rounded-xl h-fit">{icon}</div>
            <div>
                <h4 className="font-bold text-lg mb-1">{title}</h4>
                <p className="font-medium text-amber mb-1 underline underline-offset-4">{value}</p>
                <p className="text-sm text-slate-custom">{description}</p>
            </div>
        </div>
    );
}
