import { db } from "@/db";
import { liveQA, liveQaQuestions } from "@/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { Youtube, Calendar, Users, MessageCircle, PlayCircle, History, ArrowRight, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { submitLiveQuestion } from "@/lib/actions/live-qa";

export default async function LiveQAPage() {
    // Fetch all sessions
    const sessions = await db.select().from(liveQA).orderBy(desc(liveQA.createdAt));
    
    // Prioritize Live session, then Upcoming, then Archived
    const liveSession = sessions.find(s => s.status === 'live');
    const upcomingSession = sessions.find(s => s.status === 'upcoming');
    const latestSession = liveSession || upcomingSession || sessions[0];
    
    const previousSessions = sessions.filter(s => s.id !== latestSession?.id);
    
    // Fetch Highlighted Question if session is live/upcoming
    let highlightedQuestion = null;
    if (latestSession) {
        highlightedQuestion = await db.query.liveQaQuestions.findFirst({
            where: and(
                eq(liveQaQuestions.sessionId, latestSession.id),
                eq(liveQaQuestions.isHighlighted, true)
            )
        });
    }

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
                        <div className="aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-secondary/5 relative">
                            <VideoEmbed url={latestSession.youtubeUrl} />
                            
                            {/* Highlighted Question Overlay */}
                            {latestSession.status === 'live' && highlightedQuestion && (
                                <div className="absolute bottom-6 left-6 right-6 bg-[#003e3e]/90 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-10 duration-700">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center shrink-0">
                                            <Star className="w-5 h-5 text-accent-foreground fill-current" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-bold text-accent uppercase tracking-widest mb-1">Live Question from {highlightedQuestion.userName}</p>
                                            <p className="text-white font-bold leading-tight line-clamp-2">{highlightedQuestion.question}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                            <div className="space-y-4 max-w-xl">
                                <div className="flex items-center gap-3">
                                    {latestSession.status === 'live' ? (
                                        <span className="bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-2 w-fit animate-pulse">
                                            <span className="w-2 h-2 bg-white rounded-full" /> Live Now
                                        </span>
                                    ) : latestSession.status === 'upcoming' ? (
                                        <span className="bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-2 w-fit">
                                            <Calendar className="w-3 h-3" /> Upcoming Session
                                        </span>
                                    ) : (
                                        <span className="bg-secondary text-secondary-foreground text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-2 w-fit">
                                            <History className="w-3 h-3" /> Archive
                                        </span>
                                    )}
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold">{latestSession.topic}</h2>
                                {latestSession.description && (
                                    <p className="text-muted-foreground leading-relaxed">
                                        {latestSession.description}
                                    </p>
                                )}
                            </div>
                            <Button size="lg" className="rounded-2xl font-bold h-14 px-8 gap-2 shrink-0 shadow-lg shadow-primary/20" asChild>
                                <a href={latestSession.youtubeUrl} target="_blank">
                                    <Youtube className="w-5 h-5" /> Join Live Chat
                                </a>
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <Card className="border-none shadow-sm bg-secondary/10 rounded-[2rem] overflow-hidden">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-xl font-bold">Session Details</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-4 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-secondary/20 transition-transform hover:scale-[1.02]">
                                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                            <Calendar className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">When</p>
                                            <p className="font-bold text-sm">{latestSession.sessionDate ? new Date(latestSession.sessionDate).toLocaleString() : "TBD"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-secondary/20 transition-transform hover:scale-[1.02]">
                                        <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center overflow-hidden">
                                            {latestSession.expertPhotoUrl ? (
                                                <img src={latestSession.expertPhotoUrl} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <Users className="w-6 h-6 text-accent" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Expert</p>
                                            <p className="font-bold text-sm leading-tight">{latestSession.expertName || "Guest Expert"}</p>
                                            {latestSession.expertTitle && (
                                                <p className="text-[10px] text-muted-foreground font-medium">{latestSession.expertTitle}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8 bg-[#003e3e] text-white rounded-[2rem] space-y-6 shadow-xl shadow-[#003e3e]/20">
                                    <div className="flex items-center gap-3">
                                        <MessageCircle className="w-6 h-6 text-accent" />
                                        <h4 className="text-lg font-bold">Audience Questions</h4>
                                    </div>
                                    <p className="text-sm opacity-80 leading-relaxed">
                                        Have a question for our experts? Submit it below and we'll answer it live!
                                    </p>
                                    <form action={submitLiveQuestion} className="space-y-4">
                                        <input type="hidden" name="sessionId" value={latestSession.id} />
                                        <div className="space-y-3">
                                            <input 
                                                name="userName" 
                                                placeholder="Your Name" 
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder:text-white/30 focus:ring-2 focus:ring-accent outline-none transition-all"
                                                required 
                                            />
                                            <textarea 
                                                name="question" 
                                                placeholder="Ask anything..." 
                                                rows={3}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder:text-white/30 focus:ring-2 focus:ring-accent outline-none transition-all resize-none"
                                                required 
                                            />
                                        </div>
                                        <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl font-bold text-sm h-12 shadow-lg shadow-accent/10">
                                            Submit Question
                                        </Button>
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
                    <h2 className="text-3xl font-bold font-heading tracking-tight">Archive Explorer</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {previousSessions.map((session) => (
                        <Card key={session.id} className="group border-none shadow-sm hover:shadow-2xl transition-all duration-500 bg-white rounded-[2rem] overflow-hidden">
                            <div className="aspect-video bg-black relative overflow-hidden">
                                <VideoEmbed url={session.youtubeUrl} />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center pointer-events-none">
                                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                                        <PlayCircle className="w-10 h-10 text-white" />
                                    </div>
                                </div>
                            </div>
                            <CardContent className="p-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="px-3 py-1 bg-secondary/50 rounded-full flex items-center gap-2">
                                        <Calendar className="w-3 h-3 text-primary" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">{session.sessionDate ? new Date(session.sessionDate).toLocaleDateString() : "Archive"}</span>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{session.status}</span>
                                </div>
                                <h3 className="text-xl font-bold mb-4 line-clamp-2 leading-snug group-hover:text-primary transition-colors">{session.topic}</h3>
                                <p className="text-sm text-muted-foreground mb-6 line-clamp-2 font-medium leading-relaxed">
                                    {session.description || `Discussion with ${session.expertName}.`}
                                </p>
                                <Button variant="link" className="p-0 h-auto text-primary font-black text-xs gap-2 group-hover:gap-4 transition-all" asChild>
                                    <a href={session.youtubeUrl} target="_blank">
                                        WATCH SESSION <ArrowRight className="w-4 h-4" />
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                    {previousSessions.length === 0 && !latestSession && (
                         <div className="col-span-full py-16 text-center border-2 border-dashed border-secondary/30 rounded-[3rem]">
                             <p className="text-muted-foreground font-bold">Archive is currently empty.</p>
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
