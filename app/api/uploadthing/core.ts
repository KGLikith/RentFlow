import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getAuth } from "@clerk/nextjs/server";

const f = createUploadthing();

export const ourFileRouter = {

  propertyImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })

    .middleware(async ({ req }) => {
      const { userId } = getAuth(req);

      if (!userId) {
        throw new Error("Unauthorized");
      }

      return { userId };
    })

    .onUploadComplete(async ({ metadata, file }) => {
      try {
        console.log("✅ Upload complete");
        console.log("User:", metadata.userId);
        console.log("File URL:", file.url);

        return {
          uploadedBy: metadata.userId,
          url: file.url,
        };

      } catch (err) {
        console.error("❌ onUploadComplete failed:", err);
        return {};
      }
    }),

  profileImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })

    .middleware(async ({ req }) => {
      const { userId } = getAuth(req);
      if (!userId) throw new Error("Unauthorized");
      return { userId };
    })

    .onUploadComplete(async ({ metadata, file }) => {
      return {
        uploadedBy: metadata.userId,
        url: file.url,
      };
    }),

  paymentProof: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
    pdf: { maxFileSize: "4MB", maxFileCount: 1 },
  })

    .middleware(async ({ req }) => {
      const { userId } = getAuth(req);
      if (!userId) throw new Error("Unauthorized");
      return { userId };
    })

    .onUploadComplete(async ({ metadata, file }) => {
      return {
        uploadedBy: metadata.userId,
        url: file.url,
      };
    }),

} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;