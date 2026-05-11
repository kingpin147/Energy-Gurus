"use server";

import { db } from "@/db";
import { liveQaQuestions } from "@/db/schema";
import { revalidatePath } from "next/cache";

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
