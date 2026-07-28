import { db } from "@/db";
import { liveQaQuestions, liveQA } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, CheckCircle2, Star, Trash2, ArrowLeft } from "lucide-react";
import { highlightQuestion, markQuestionAnswered, deleteQuestion } from "@/lib/actions/live-qa";
import { Link } from "@/i18n/routing";
import { getUserRole } from "@/lib/roles";
import { redirect } from "next/navigation";

export default async function LiveQAQuestionsPage({ params }: { params: { id: string } }) {
    const role = await getUserRole();
    if (role !== 'super-admin' && role !== 'admin') {
        redirect("/dashboard");
    }

    const sessionId = params.id;
    const session = await db.query.liveQA.findFirst({
        where: eq(liveQA.id, sessionId)
    });

    if (!session) {
        return <div className="p-8 text-center">Session not found.</div>;
    }

    const questions = await db.select()
        .from(liveQaQuestions)
        .where(eq(liveQaQuestions.sessionId, sessionId))
        .orderBy(desc(liveQaQuestions.createdAt));

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="rounded-xl" asChild>
                        <Link href="/dashboard/content">
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Session Questions</h1>
                        <p className="text-slate-custom">{session.topic}</p>
                    </div>
                </div>
                <div className="px-4 py-2 bg-amber/10 text-ink rounded-xl">
                    <p className="text-xs font-bold text-amber uppercase tracking-widest">{questions.length} Questions Submitted</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {questions.length === 0 ? (
                    <Card className="border-2 border-dashed py-12 text-center">
                        <MessageCircle className="w-12 h-12 text-slate-custom mx-auto mb-4 opacity-20" />
                        <p className="text-slate-custom font-medium">No questions submitted yet.</p>
                    </Card>
                ) : (
                    questions.map((q) => (
                        <Card key={q.id} className={`border-none shadow-sm rounded-2xl overflow-hidden transition-all ${q.isHighlighted ? 'ring-2 ring-primary bg-amber/5 text-ink' : ''}`}>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between gap-6">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm">{q.userName}</span>
                                            <span className="text-[10px] text-slate-custom">• {new Date(q.createdAt).toLocaleTimeString()}</span>
                                            {q.isAnswered && (
                                                <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                                    <CheckCircle2 className="w-3 h-3" /> Answered
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm leading-relaxed">{q.question}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!q.isAnswered && (
                                            <form action={async () => {
                                                "use server";
                                                await markQuestionAnswered(q.id);
                                            }}>
                                                <Button size="sm" variant="outline" className="rounded-lg text-[10px] font-bold h-8 gap-1.5 hover:bg-green-50 hover:text-green-600 hover:border-green-200">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark Answered
                                                </Button>
                                            </form>
                                        )}
                                        <form action={async () => {
                                            "use server";
                                            await highlightQuestion(q.id, sessionId);
                                        }}>
                                            <Button 
                                                size="sm" 
                                                variant={q.isHighlighted ? "default" : "outline"} 
                                                className={`rounded-lg text-[10px] font-bold h-8 gap-1.5 ${q.isHighlighted ? '' : 'hover:bg-amber/5 text-ink'}`}
                                            >
                                                <Star className={`w-3.5 h-3.5 ${q.isHighlighted ? 'fill-current' : ''}`} /> 
                                                {q.isHighlighted ? 'Highlighted' : 'Highlight Live'}
                                            </Button>
                                        </form>
                                        <form action={async () => {
                                            "use server";
                                            await deleteQuestion(q.id);
                                        }}>
                                            <Button size="sm" variant="ghost" className="rounded-lg h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </form>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
