import { db } from "@/db";
import { liveQA } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Youtube, Calendar, Users, MessageCircle, PlayCircle, History, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { submitLiveQuestion } from "@/lib/actions/live-qa";

export default async function LiveQAPage() {
    const sessions = await db.select().from(liveQA).orderBy(desc(liveQA.createdAt));
    const latestSession = sessions[0];
    const previousSessions = sessions.slice(1);

    return (
        <div className="container mx-auto py-12 px-4">
            <div className="max-w-3xl mb-16">
                <h1 className="text-4xl md:text-5xl font-bold mb-6">Live QA Sessions</h1>
                <p className="text-muted-foreground text-lg leading-relaxed">
                    Join our weekly live discussions on trending energy topics. Get your questions answered by industry experts and stay ahead of Pakistan's energy transition.
                </p>
            </div>

            {latestSession ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-secondary/5">
                            <VideoEmbed url={latestSession.youtubeUrl} />
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-2">
                                <span className="bg-red-100 text-red-600 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-2 w-fit">
                                    <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" /> Latest Session
                                </span>
                                <h2 className="text-3xl font-bold">{latestSession.topic}</h2>
                            </div>
                            <Button size="lg" className="rounded-2xl font-bold h-14 px-8 gap-2" asChild>
                                <a href={latestSession.youtubeUrl} target="_blank">
                                    <Youtube className="w-5 h-5" /> Join Live Chat
                                </a>
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <Card className="border-none shadow-sm bg-secondary/10 rounded-[2rem]">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-xl font-bold">Session Details</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-4 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-secondary/20">
                                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                            <Calendar className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">When</p>
                                            <p className="font-bold text-sm">{latestSession.sessionDate ? new Date(latestSession.sessionDate).toLocaleString() : "Every Wednesday"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-secondary/20">
                                        <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                                            <Users className="w-6 h-6 text-accent" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Expert</p>
                                            <p className="font-bold text-sm">{latestSession.expertName || "Guest Expert"}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 bg-primary text-primary-foreground rounded-2xl space-y-4">
                                    <div className="flex items-center gap-3">
                                        <MessageCircle className="w-5 h-5 text-accent" />
                                        <h4 className="font-bold">Audience Questions</h4>
                                    </div>
                                    <p className="text-sm opacity-80 leading-relaxed">
                                        Have a question for our experts? Submit it below.
                                    </p>
                                    <form action={submitLiveQuestion} className="space-y-3">
                                        <input type="hidden" name="sessionId" value={latestSession.id} />
                                        <input 
                                            name="userName" 
                                            placeholder="Your Name" 
                                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm placeholder:text-white/40 focus:ring-2 focus:ring-accent outline-none"
                                            required 
                                        />
                                        <textarea 
                                            name="question" 
                                            placeholder="Your Question..." 
                                            rows={3}
                                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm placeholder:text-white/40 focus:ring-2 focus:ring-accent outline-none"
                                            required 
                                        />
                                        <Button type="submit" variant="accent" className="w-full rounded-xl font-bold text-xs h-10">Submit Question</Button>
                                    </form>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            ) : (
                <div className="py-24 text-center bg-secondary/10 rounded-[3rem] border-2 border-dashed mb-20">
                    <Youtube className="w-20 h-20 text-muted-foreground mx-auto mb-6 opacity-20" />
                    <h2 className="text-2xl font-bold text-muted-foreground">No live sessions scheduled.</h2>
                    <p className="text-muted-foreground mt-4 max-w-md mx-auto">
                        We host weekly QA sessions. Check back soon for the next topic announcement.
                    </p>
                </div>
            )}

            <div className="space-y-12">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center">
                        <History className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold font-heading tracking-tight">Previous Sessions</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {previousSessions.map((session) => (
                        <Card key={session.id} className="group border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-secondary/5 rounded-3xl overflow-hidden">
                            <div className="aspect-video bg-black relative">
                                <VideoEmbed url={session.youtubeUrl} />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <PlayCircle className="w-16 h-16 text-white" />
                                </div>
                            </div>
                            <CardContent className="p-8">
                                <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-3">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>{session.sessionDate ? new Date(session.sessionDate).toLocaleDateString() : "Archive"}</span>
                                </div>
                                <h3 className="text-xl font-bold mb-4 line-clamp-2">{session.topic}</h3>
                                <p className="text-sm text-muted-foreground mb-6 line-clamp-2 font-medium">
                                    Featuring <span className="text-foreground">{session.expertName}</span>
                                </p>
                                <Button variant="link" className="p-0 h-auto text-primary font-bold gap-2 group-hover:translate-x-1 transition-transform">
                                    Watch Archive <ArrowRight className="w-4 h-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                    {previousSessions.length === 0 && !latestSession && (
                         <div className="col-span-full py-12 text-center border-2 border-dashed rounded-3xl">
                             <p className="text-muted-foreground font-medium">Archive is currently empty.</p>
                         </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function VideoEmbed({ url }: { url: string }) {
    const videoId = url.split("v=")[1]?.split("&")[0] || url.split("/").pop();
    if (!videoId) return null;
    
    return (
        <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
        />
    );
}
