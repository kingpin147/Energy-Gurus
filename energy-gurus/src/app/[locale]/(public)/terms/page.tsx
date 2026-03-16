export default function TermsOfUsePage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8">Terms of Use</h1>
            <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
                <p className="lead text-lg text-muted-foreground">
                    Last updated: {new Date().toLocaleDateString()}
                </p>

                <h2 className="text-2xl font-semibold mt-10 mb-4">1. Acceptance of Terms</h2>
                <p>
                    By accessing and using the EnergyGurus website (the "Site"), you agree to abide by these Terms of Use and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this Site.
                </p>

                <h2 className="text-2xl font-semibold mt-10 mb-4">2. Use License</h2>
                <p>
                    Permission is granted to temporarily download one copy of the materials (information or software) on EnergyGurus' website for personal, non-commercial transitory viewing only.
                </p>
                <p>
                    This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4 ml-4">
                    <li>modify or copy the materials;</li>
                    <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
                    <li>attempt to decompile or reverse engineer any software contained on EnergyGurus' website;</li>
                    <li>remove any copyright or other proprietary notations from the materials; or</li>
                    <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-10 mb-4">3. Disclaimer</h2>
                <p>
                    The materials on EnergyGurus' website are provided on an 'as is' basis. EnergyGurus makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                </p>

                <h2 className="text-2xl font-semibold mt-10 mb-4">4. Limitations</h2>
                <p>
                    In no event shall EnergyGurus or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on EnergyGurus' website, even if EnergyGurus or a EnergyGurus authorized representative has been notified orally or in writing of the possibility of such damage.
                </p>

                <h2 className="text-2xl font-semibold mt-10 mb-4">5. Governing Law</h2>
                <p>
                    These terms and conditions are governed by and construed in accordance with the laws of Pakistan, and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
                </p>
            </div>
        </div>
    );
}
