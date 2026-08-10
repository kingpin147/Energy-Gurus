"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, MessageSquare, Instagram, Linkedin, Twitter, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { submitPublicContact } from "@/lib/actions/inquiry";

export function PublicContactForm() {
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

            {/* Main Section */}
            <section className="py-16 bg-paper flex-1">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Contact Information */}
                        <div className="lg:col-span-1 space-y-8">
                            <div>
                                <h3 className="text-xl font-bold mb-6">Contact Information</h3>
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-amber/10 text-amber rounded-lg">
                                            <Mail className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-custom">Email Us</p>
                                            <a href="mailto:info@energygurus.online" className="text-base font-bold hover:underline">
                                                info@energygurus.online
                                            </a>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-amber/10 text-amber rounded-lg">
                                            <Phone className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-custom">Call Us</p>
                                            <p className="text-base font-bold">+92 (300) 123-4567</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-amber/10 text-amber rounded-lg">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-custom">Location</p>
                                            <p className="text-base font-bold">Islamabad, Pakistan</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-paper/20" />

                            <div>
                                <h4 className="font-bold mb-4">Follow Us</h4>
                                <div className="flex gap-4">
                                    <a href="https://x.com/energyguruspk" target="_blank" rel="noopener noreferrer" className="p-3 bg-white border rounded-full text-slate-custom hover:text-amber hover:border-amber transition-colors">
                                        <Twitter className="w-5 h-5" />
                                    </a>
                                    <a href="https://www.linkedin.com/company/energygurusonline" target="_blank" rel="noopener noreferrer" className="p-3 bg-white border rounded-full text-slate-custom hover:text-amber hover:border-amber transition-colors">
                                        <Linkedin className="w-5 h-5" />
                                    </a>
                                    <a href="https://www.facebook.com/energygurus.online" target="_blank" rel="noopener noreferrer" className="p-3 bg-white border rounded-full text-slate-custom hover:text-amber hover:border-amber transition-colors">
                                        <Instagram className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="lg:col-span-2">
                            <Card className="shadow-lg border-none">
                                <CardContent className="p-8">
                                    {isSuccess ? (
                                        <div className="text-center py-12 space-y-4">
                                            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
                                            <h3 className="text-2xl font-bold">Message Sent Successfully!</h3>
                                            <p className="text-slate-custom max-w-md mx-auto">
                                                Thank you for reaching out to EnergyGurus. We have received your inquiry and will get back to you shortly.
                                            </p>
                                            <Button onClick={() => setIsSuccess(false)} variant="outline" className="mt-4">
                                                Send Another Message
                                            </Button>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            <h3 className="text-2xl font-bold mb-6">Send Us a Message</h3>

                                            {error && (
                                                <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
                                                    {error}
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-semibold">Your Name *</label>
                                                    <Input name="name" required placeholder="John Doe" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-semibold">Email Address *</label>
                                                    <Input name="email" type="email" required placeholder="john@example.com" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-semibold">Phone Number</label>
                                                    <Input name="phone" placeholder="+92 300 0000000" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-semibold">Subject *</label>
                                                    <Input name="subject" required placeholder="General Inquiry / Energy Audit" />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold">Message *</label>
                                                <textarea
                                                    name="message"
                                                    required
                                                    rows={5}
                                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                    placeholder="How can we help you?"
                                                />
                                            </div>

                                            <Button type="submit" size="lg" className="w-full font-bold" disabled={isSubmitting}>
                                                {isSubmitting ? "Sending..." : "Submit Inquiry"}
                                            </Button>
                                        </form>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
