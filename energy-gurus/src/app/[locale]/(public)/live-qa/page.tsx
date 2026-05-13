import { db } from "@/db";
import { liveQA, liveQaQuestions } from "@/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { Youtube, Calendar, Users, PlayCircle, ArrowRight, Share2, FileText, Bell, CheckCircle2, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitLiveQuestion } from "@/lib/actions/live-qa";
import { CountdownTimer } from "./countdown-timer";

export default async function LiveQAPage() {
    const sessions = await db.select().from(liveQA).orderBy(desc(liveQA.createdAt));
    
    const liveSession = sessions.find(s => s.status === 'live');
    const upcomingSession = sessions.find(s => s.status === 'upcoming');
    const latestSession = liveSession || upcomingSession || sessions[0];
    const previousSessions = sessions.filter(s => s.id !== latestSession?.id);
    
    // Fetch Questions for latest session
    let questions: any[] = [];
    if (latestSession) {
        questions = await db.select()
            .from(liveQaQuestions)
            .where(eq(liveQaQuestions.sessionId, latestSession.id))
            .orderBy(desc(liveQaQuestions.createdAt));
    }

    return (
        <div className="bg-[#eff5f5] min-h-screen font-sans pb-20">
            {/* Main Content container */}
            <div className="container mx-auto pt-8 px-4 max-w-6xl">
                
                {/* Top Banner */}
                {latestSession && (
                <div className="bg-[#0b655f] text-white rounded-xl p-8 md:p-12 mb-6 flex flex-col md:flex-row justify-between items-center relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
                        <PlayCircle className="w-96 h-96 -mt-32 -mr-32" />
                    </div>
                    <div className="md:w-3/5 z-10">
                        <span className="inline-block bg-[#bd7d19] text-white text-[10px] font-bold px-3 py-1 rounded-sm uppercase tracking-widest mb-6">
                            {latestSession.status === 'live' ? 'Live Session' : latestSession.status === 'upcoming' ? 'Upcoming Session' : 'Archived Session'}
                        </span>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{latestSession.topic}</h1>
                        <p className="text-[#a4d6d2] text-[15px] mb-8 leading-relaxed max-w-xl">
                            {latestSession.description || "Deep dive into the latest policy updates and market trends. Understanding the impact and identifying new opportunities."}
                        </p>
                        <div className="flex items-center gap-2 text-[#d1e8e6] text-xs font-semibold">
                            <Calendar className="w-4 h-4 text-[#d88d22]" />
                            <span>
                                {latestSession.sessionDate ? new Date(latestSession.sessionDate).toLocaleString('en-US', { weekday: 'long', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }) : "Date TBD"}
                            </span>
                        </div>
                    </div>
                    {latestSession.status === 'upcoming' && latestSession.sessionDate && (
                    <div className="md:w-2/5 mt-8 md:mt-0 flex justify-end z-10 w-full md:w-auto">
                         <div className="bg-[#3e8580] bg-opacity-40 p-6 rounded-xl text-center w-full max-w-sm border border-[#52948f]/50">
                            <p className="text-[#a4d6d2] text-[11px] font-bold tracking-widest uppercase mb-3">Starting In</p>
                            <CountdownTimer targetDate={latestSession.sessionDate} />
                        </div>
                    </div>
                    )}
                </div>
                )}

                {/* Two Column Layout */}
                {latestSession && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Video Player */}
                        <div>
                            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-sm relative">
                                <VideoEmbed url={latestSession.youtubeUrl} />
                                {latestSession.status === 'live' && (
                                    <div className="absolute bottom-4 left-4 bg-[#e63946] text-white text-[10px] font-bold px-3 py-1.5 rounded-sm flex items-center gap-2 shadow-md">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> LIVE
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-4 mt-4">
                                <div className="flex items-center gap-2 bg-[#dceaea] px-4 py-2 rounded-sm text-xs font-bold text-[#0b655f]">
                                    <Users className="w-4 h-4" /> {latestSession.status === 'live' ? '1,243 Watching' : 'Session Video'}
                                </div>
                                <Button variant="outline" className="bg-[#dceaea] border-none hover:bg-[#cfdfdf] text-[#0b655f] font-bold gap-2 rounded-sm text-xs h-auto py-2">
                                    <Share2 className="w-4 h-4" /> Share Stream
                                </Button>
                            </div>
                        </div>

                        {/* Ask a Question Section */}
                        <div className="bg-[#f7fafa] border border-[#dceaea] rounded-xl p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-bold text-[#0b655f]">Ask a Question</h3>
                                <div className="flex gap-2">
                                    <Button size="sm" className="bg-[#0b655f] hover:bg-[#084e49] text-white rounded-sm h-8 text-[11px] font-bold px-4">Newest</Button>
                                    <Button size="sm" variant="outline" className="bg-[#e4eff0] border-none text-[#0b655f] hover:bg-[#d4e6e8] rounded-sm h-8 text-[11px] font-bold px-4">Top Voted</Button>
                                </div>
                            </div>
                            
                            <form action={submitLiveQuestion} className="mb-8">
                                <input type="hidden" name="sessionId" value={latestSession.id} />
                                <div className="bg-white border border-[#dceaea] rounded-sm p-4 mb-3 focus-within:border-[#0b655f] transition-colors shadow-sm">
                                    <input 
                                        name="userName" 
                                        placeholder="Your Name" 
                                        className="w-full text-sm font-semibold mb-2 outline-none text-[#333] placeholder:text-gray-400"
                                        required 
                                    />
                                    <textarea 
                                        name="question" 
                                        placeholder="What's on your mind about Net Metering?" 
                                        rows={2}
                                        className="w-full outline-none resize-none text-sm text-[#555] placeholder:text-gray-400"
                                        required 
                                    />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] text-gray-500 font-medium">Remaining: 120 characters</span>
                                    <Button type="submit" className="bg-[#8c6010] hover:bg-[#734e0d] text-white font-bold rounded-sm px-6 text-xs h-9">
                                        Submit Question
                                    </Button>
                                </div>
                            </form>

                            {/* Question List */}
                            <div className="space-y-4">
                                {questions.map(q => (
                                    <div key={q.id} className="flex gap-4 p-5 bg-white rounded-sm border border-[#eef5f5] shadow-sm">
                                        <div className="flex flex-col items-center bg-[#eef5f5] p-2 rounded-sm h-fit min-w-[40px]">
                                            <ChevronUp className="w-4 h-4 text-gray-400 cursor-pointer hover:text-[#0b655f]" />
                                            <span className="font-bold text-[#0b655f] text-xs my-1">
                                                {q.isHighlighted ? '42' : '18'} {/* Dummy upvote counts matching screenshot logic */}
                                            </span>
                                            <ChevronUp className="w-4 h-4 text-gray-400 cursor-pointer hover:text-[#0b655f] rotate-180" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className="font-bold text-[#333] text-[13px]">{q.userName}</span>
                                                <span className="text-[11px] text-gray-400 font-medium">• {new Date(q.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            </div>
                                            <p className="text-[#444] text-[13px] mb-3 leading-relaxed">
                                                {q.question}
                                            </p>
                                            <div className="flex items-center gap-4">
                                                <button className="text-[11px] font-bold text-[#0b655f] flex items-center gap-1 hover:underline">
                                                    <ArrowRight className="w-3 h-3" /> Reply
                                                </button>
                                                {q.isHighlighted && (
                                                    <span className="bg-[#faebce] text-[#9c6a15] text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">Priority Thread</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {questions.length === 0 && (
                                    <p className="text-sm text-gray-500 text-center py-4">No questions asked yet. Be the first!</p>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        
                        {/* Guest Expert */}
                        <div className="bg-white border border-[#dceaea] rounded-xl p-6 shadow-sm">
                            <h3 className="text-base font-bold text-[#0b655f] mb-5">Guest Expert</h3>
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-14 h-14 rounded-md overflow-hidden bg-gray-100 shrink-0">
                                    {latestSession.expertPhotoUrl ? (
                                        <img src={latestSession.expertPhotoUrl} alt={latestSession.expertName || ''} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-[#dceaea] text-[#0b655f]">
                                            <Users className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#333] text-sm leading-tight mb-1">{latestSession.expertName || "Guest Expert"}</h4>
                                    <p className="text-[11px] text-gray-500 font-medium leading-snug">{latestSession.expertTitle || "Industry Professional"}</p>
                                </div>
                            </div>
                            <p className="text-[12px] text-gray-600 leading-relaxed">
                                {latestSession.expertName ? `${latestSession.expertName} brings extensive experience in solar infrastructure and was a lead advisor for the national net metering committee.` : 'Expert details will be announced soon.'}
                            </p>
                        </div>

                        {/* Authenticity Guaranteed */}
                        <div className="bg-[#facc6b] rounded-sm p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-3 text-[#7a5b10]">
                                <CheckCircle2 className="w-4 h-4" />
                                <h4 className="font-bold text-[11px] tracking-widest uppercase">Authenticity Guaranteed</h4>
                            </div>
                            <p className="text-[12px] text-[#7a5b10] leading-relaxed font-medium">
                                Every session is vetted by certified professionals to ensure technical accuracy in all energy advice provided.
                            </p>
                        </div>


                    </div>
                </div>
                )}

                {/* Previous Sessions */}
                <div>
                    <div className="flex items-center justify-between mb-6 border-t border-[#dceaea] pt-8">
                        <h2 className="text-2xl font-bold text-[#0b655f]">Previous Sessions</h2>
                        <a href="#" className="text-xs font-bold text-[#0b655f] hover:underline flex items-center gap-1">
                            View Full Library <ChevronUp className="w-3.5 h-3.5 rotate-90" />
                        </a>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {previousSessions.map(session => (
                            <div key={session.id} className="bg-white rounded-sm overflow-hidden shadow-sm border border-[#eef5f5] group hover:shadow-md transition-shadow cursor-pointer">
                                <div className="aspect-video bg-black relative">
                                    <VideoEmbed url={session.youtubeUrl} />
                                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                                        48:15
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="text-[9px] font-bold text-[#9c6a15] uppercase tracking-widest mb-2">EQUIPMENT DEEP DIVE</div>
                                    <h3 className="font-bold text-[#333] text-[15px] mb-4 line-clamp-1">{session.topic}</h3>
                                    <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold">
                                        <span>{session.sessionDate ? new Date(session.sessionDate).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'}) : 'Archived'}</span>
                                        <div className="flex items-center gap-1">
                                            <PlayCircle className="w-3.5 h-3.5" /> 4.2k
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
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
