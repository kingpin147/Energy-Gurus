import { getEpisodeById } from "@/lib/podbean";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Calendar, Clock, ArrowLeft, Download, Share2, PlayCircle, FileText } from "lucide-react";
import { Link } from "@/i18n/routing";

export default async function EpisodePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const episode = await getEpisodeById(id);

    if (!episode) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-12">
            {/* Back Button */}
            <Button variant="ghost" className="mb-8 p-0 hover:bg-transparent text-muted-foreground hover:text-primary transition-colors" asChild>
                <Link href="/podcast">
                    <ArrowLeft className="mr-2 w-4 h-4" /> Back to Episodes
                </Link>
            </Button>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Left Column: Metadata & Player */}
                <div className="flex-[2] space-y-8">
                    <div>
                        <span className="text-accent font-bold uppercase tracking-widest text-sm mb-2 block">EnergyGurus Podcast</span>
                        <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6">{episode.title}</h1>

                        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-8">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> {new Date(episode.publish_time).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" /> {Math.floor(episode.duration / 60)} minutes
                            </div>
                        </div>

                        {/* Audio Player Placeholder */}
                        <Card className="bg-primary text-primary-foreground border-none">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-6">
                                    <PlayCircle className="w-16 h-16 text-accent cursor-pointer hover:scale-105 transition-transform" />
                                    <div className="flex-1 space-y-4">
                                        <div className="h-1.5 w-full bg-white/20 rounded-full relative">
                                            <div className="absolute top-0 left-0 h-full w-1/4 bg-accent rounded-full" />
                                        </div>
                                        <div className="flex justify-between text-xs font-medium">
                                            <span>00:00</span>
                                            <span>{Math.floor(episode.duration / 60)}:00</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex gap-4 mt-6">
                            <Button variant="outline" size="sm" className="gap-2">
                                <Download className="w-4 h-4" /> Download MP3
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Share2 className="w-4 h-4" /> Share Episode
                            </Button>
                        </div>
                    </div>

                    <div className="prose prose-slate max-w-none">
                        <h3 className="text-2xl font-bold mb-4">Show Notes</h3>
                        <p className="text-lg leading-relaxed text-muted-foreground mb-8">
                            {episode.content}
                        </p>

                        <h3 id="transcript" className="text-2xl font-bold mb-4">Full Transcript</h3>
                        <div className="bg-secondary/10 p-8 rounded-xl space-y-6 text-muted-foreground italic leading-relaxed">
                            <p>[00:00:00] Intro Music plays.</p>
                            <p>[00:00:15] Host: Welcome back to EnergyGurus, the podcast where we break down the complex reality of Pakistan's energy sector. Today we have a very special episode...</p>
                            <p>[00:01:30] Guest: Thank you for having me. When we talk about the grid stability, we have to look at the distributed generation first...</p>
                            {/* More transcript lines would follow */}
                            <p className="text-sm font-medium not-italic text-primary/60">Full transcript continued for SEO purposes...</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Sidebar / CTAs */}
                <div className="flex-1 space-y-8">
                    <Card className="border-t-4 border-primary">
                        <CardContent className="pt-6">
                            <h4 className="text-xl font-bold mb-4">Take Action</h4>
                            <p className="text-sm text-muted-foreground mb-6">
                                Are you looking to optimize your energy consumption based on insights from this episode?
                            </p>
                            <div className="space-y-3">
                                <Button className="w-full justify-between" asChild>
                                    <Link href="/audit">Request Energy Audit <ArrowLeft className="rotate-180 w-4 h-4" /></Link>
                                </Button>
                                <Button variant="outline" className="w-full justify-between" asChild>
                                    <Link href="/monitoring">Request Demo <ArrowLeft className="rotate-180 w-4 h-4" /></Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h4 className="font-bold mb-4">Resources Mentioned</h4>
                            <ul className="space-y-3 text-sm">
                                <li>
                                    <Link href="/resources/policy-note-1" className="text-primary hover:underline flex items-center gap-2">
                                        <FileText className="w-4 h-4" /> Policy Note: Solar 2026
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-primary hover:underline flex items-center gap-2">
                                        <FileText className="w-4 h-4" /> Net-Metering Regulation PDF
                                    </Link>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="bg-accent/10 border-none">
                        <CardContent className="pt-6">
                            <h4 className="font-bold mb-2">About the Guest</h4>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-slate-300 rounded-full" />
                                <div>
                                    <p className="font-bold">Dr. Imran Khan</p>
                                    <p className="text-xs text-muted-foreground">Energy Policy Consultant</p>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Dr. Khan has over 15 years of experience in regulatory frameworks across South Asia.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}


