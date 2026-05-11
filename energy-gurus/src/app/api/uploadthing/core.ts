import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing({
  errorFormatter: (err) => {
    console.error("UploadThing Error Logged:", err);
    return { message: err.message };
  },
});

export const ourFileRouter = {
  epcPortfolio: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
    .middleware(async ({ req }) => {
      try {
        const user = await auth();
        if (!user.userId) throw new Error("Unauthorized");
        return { userId: user.userId };
      } catch (error) {
        console.error("UploadThing EPC Auth Error:", error);
        throw error;
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL", file.url);
      return { uploadedBy: metadata.userId };
    }),
  brandLogo: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      try {
        const user = await auth();
        if (!user.userId) throw new Error("Unauthorized");
        return { userId: user.userId };
      } catch (error) {
        console.error("UploadThing Brand Auth Error:", error);
        throw error;
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
