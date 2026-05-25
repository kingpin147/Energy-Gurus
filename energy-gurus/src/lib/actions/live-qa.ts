"use server";

import { db } from "@/db";
import { liveQaQuestions } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq, and, not } from "drizzle-orm";
import { getUserRole } from "@/lib/roles";

async function checkAdmin() {
    const role = await getUserRole();
    if (role !== 'super-admin' && role !== 'admin') {
        throw new Error("Unauthorized");
    }
}

export async function submitLiveQuestion(formData: FormData) {
    const sessionId = formData.get("sessionId") as string;
    const userName = formData.get("userName") as string;
    const question = formData.get("question") as string;

    if (!sessionId || !userName || !question) return;

    try {
        await db.insert(liveQaQuestions).values({
            sessionId,
            userName,
            question,
        });
        revalidatePath("/[locale]/live-qa", "page");
    } catch (error) {
        console.error("Failed to submit question:", error);
    }
}

export async function highlightQuestion(questionId: string, sessionId: string) {
    await checkAdmin();

    // Remove highlight from all other questions in this session
    await db.update(liveQaQuestions)
        .set({ isHighlighted: false })
        .where(eq(liveQaQuestions.sessionId, sessionId));

    // Highlight the selected question
    await db.update(liveQaQuestions)
        .set({ isHighlighted: true })
        .where(eq(liveQaQuestions.id, questionId));

    revalidatePath("/[locale]/live-qa", "page");
    revalidatePath("/[locale]/dashboard/content/live-qa/[id]/questions", "page");
}

export async function markQuestionAnswered(questionId: string) {
    await checkAdmin();
    await db.update(liveQaQuestions)
        .set({ isAnswered: true })
        .where(eq(liveQaQuestions.id, questionId));

    revalidatePath("/[locale]/dashboard/content/live-qa/[id]/questions", "page");
}

export async function deleteQuestion(questionId: string) {
    await checkAdmin();
    await db.delete(liveQaQuestions)
        .where(eq(liveQaQuestions.id, questionId));

    revalidatePath("/[locale]/dashboard/content/live-qa/[id]/questions", "page");
}
