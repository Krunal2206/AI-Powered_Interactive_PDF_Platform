import type { Metadata } from "next";
import { ScrollText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service — Chat with PDF",
  description:
    "Terms of Service for Chat with PDF. Read the terms and conditions for using our platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8">
            <ScrollText className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300 font-medium">
              Terms of Service
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-slate-400">Last updated: July 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20 sm:pb-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-8 sm:p-12 space-y-8">
            <TermsSection title="1. Acceptance of Terms">
              <p>
                By accessing or using Chat with PDF, you agree to be bound by
                these Terms of Service. If you do not agree to these terms,
                please do not use the service.
              </p>
            </TermsSection>

            <TermsSection title="2. Description of Service">
              <p>
                Chat with PDF is an AI-powered platform that allows you to
                upload PDF documents and interact with them through
                conversational AI. The service processes your documents,
                generates vector embeddings, and uses AI to answer your
                questions based on document content.
              </p>
            </TermsSection>

            <TermsSection title="3. User Accounts">
              <p>
                To use Chat with PDF, you must create an account through our
                authentication provider (Clerk). You are responsible for:
              </p>
              <ul>
                <li>Maintaining the security of your account credentials</li>
                <li>All activity that occurs under your account</li>
                <li>Providing accurate account information</li>
              </ul>
            </TermsSection>

            <TermsSection title="4. Acceptable Use">
              <p>You agree not to:</p>
              <ul>
                <li>
                  Upload documents containing illegal, harmful, or infringing
                  content
                </li>
                <li>
                  Attempt to access other users&apos; documents or data
                </li>
                <li>
                  Use the service to generate misleading or harmful content
                </li>
                <li>
                  Reverse-engineer, decompile, or attempt to extract the
                  source code of the service
                </li>
                <li>
                  Overload the service through automated requests or
                  denial-of-service attacks
                </li>
              </ul>
            </TermsSection>

            <TermsSection title="5. Content Ownership">
              <p>
                You retain full ownership of any documents you upload. We do
                not claim ownership over your content. By uploading a document,
                you grant us a limited license to process, store, and analyze
                it solely for the purpose of providing the service to you.
              </p>
            </TermsSection>

            <TermsSection title="6. AI-Generated Responses">
              <p>
                Chat with PDF uses AI (Google Gemini) to generate responses
                based on your document content. Please note:
              </p>
              <ul>
                <li>
                  AI responses may not always be 100% accurate — always verify
                  important information against the source document
                </li>
                <li>
                  Responses are generated based on the text extracted from your
                  PDF and may miss information in images, charts, or scanned
                  content
                </li>
                <li>
                  The AI does not provide legal, medical, or financial advice
                </li>
              </ul>
            </TermsSection>

            <TermsSection title="7. Service Limitations">
              <p>The free tier of Chat with PDF is subject to:</p>
              <ul>
                <li>A maximum of 10 PDF uploads</li>
                <li>A file size limit of 10 MB per document</li>
                <li>Rate limiting on API requests</li>
              </ul>
              <p>
                These limits may change at any time at our discretion.
              </p>
            </TermsSection>

            <TermsSection title="8. Data Deletion">
              <p>
                You may delete your documents at any time from your dashboard.
                Deleting a document removes the PDF from storage, its vector
                embeddings, and all associated chat history. Account deletion
                can be managed through your account settings.
              </p>
            </TermsSection>

            <TermsSection title="9. Disclaimer of Warranties">
              <p>
                Chat with PDF is provided &quot;as is&quot; and &quot;as
                available&quot; without warranties of any kind, whether express
                or implied. We do not guarantee that the service will be
                uninterrupted, error-free, or that AI responses will be
                accurate.
              </p>
            </TermsSection>

            <TermsSection title="10. Limitation of Liability">
              <p>
                To the maximum extent permitted by law, Chat with PDF shall not
                be liable for any indirect, incidental, special, or
                consequential damages arising from your use of the service.
              </p>
            </TermsSection>

            <TermsSection title="11. Changes to Terms">
              <p>
                We reserve the right to modify these terms at any time.
                Continued use of the service after changes constitutes
                acceptance of the updated terms. Material changes will be
                communicated through the platform.
              </p>
            </TermsSection>

            <TermsSection title="12. Contact">
              <p>
                For questions about these terms, please visit our{" "}
                <a
                  href="/contact"
                  className="text-purple-400 hover:text-purple-300 underline underline-offset-2"
                >
                  contact page
                </a>
                .
              </p>
            </TermsSection>
          </div>
        </div>
      </section>
    </div>
  );
}

function TermsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <div className="text-slate-300 leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_li]:text-slate-400 [&_strong]:text-slate-200">
        {children}
      </div>
    </div>
  );
}
