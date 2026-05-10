import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { epcInstallers, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { updateEpcProfile } from "@/lib/actions/epc";
import { UploadButton } from "@/lib/uploadthing";

export default async function EpcDashboard() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId));
  if (!user) redirect("/dashboard");

  let [epc] = await db.select().from(epcInstallers).where(eq(epcInstallers.userId, user.id));

  // Auto-create EPC profile if it doesn't exist for an EPC user
  if (!epc) {
    [epc] = await db.insert(epcInstallers).values({
      userId: user.id,
      companyName: user.name || "My Company",
    }).returning();
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">EPC Profile & Branding</h1>
      
      <div className="space-y-8">
        <section className="bg-card border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Company Details</h2>
          <form action={updateEpcProfile} className="space-y-4">
            <input type="hidden" name="id" value={epc.id} />
            <div>
              <label className="block text-sm font-medium mb-1">Company Name</label>
              <input 
                name="companyName" 
                defaultValue={epc.companyName} 
                className="w-full border rounded p-2 bg-transparent"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">About Company</label>
              <textarea 
                name="about" 
                defaultValue={epc.about || ""} 
                rows={4}
                className="w-full border rounded p-2 bg-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Website URL</label>
              <input 
                name="website" 
                defaultValue={epc.website || ""} 
                className="w-full border rounded p-2 bg-transparent"
              />
            </div>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded font-medium hover:opacity-90">
              Update Profile
            </button>
          </form>
        </section>

        <section className="bg-card border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Branding & Portfolio</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Company Logo</label>
              <div className="flex items-center space-x-4">
                {epc.logoUrl && <img src={epc.logoUrl} className="w-16 h-16 rounded border object-contain" alt="" />}
                <UploadButton
                  endpoint="brandLogo"
                  onClientUploadComplete={async (res) => {
                    await updateEpcProfile({ logoUrl: res[0].url });
                  }}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Portfolio Images</label>
              <div className="grid grid-cols-4 gap-4 mb-4">
                {epc.portfolio?.map((url, i) => (
                  <img key={i} src={url} className="aspect-video rounded border object-cover" alt="" />
                ))}
              </div>
              <UploadButton
                endpoint="epcPortfolio"
                onClientUploadComplete={async (res) => {
                  const newPortfolio = [...(epc.portfolio || []), ...res.map(f => f.url)];
                  await updateEpcProfile({ portfolio: newPortfolio });
                }}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
