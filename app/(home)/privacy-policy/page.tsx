import type { Metadata } from "next";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — Chat with PDF",
  description:
    "Privacy Policy for Chat with PDF. Learn how we collect, use, and protect your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8">
            <Shield className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300 font-medium">
              Privacy Policy
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-slate-400">Last updated: July 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20 sm:pb-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-8 sm:p-12 space-y-8">
            <PolicySection title="1. Information We Collect">
              <p>
                When you use Chat with PDF, we may collect the following
                information:
              </p>
              <ul>
                <li>
                  <strong>Account Information:</strong> When you sign up via
                  Clerk, we receive your name, email address, and profile
                  picture.
                </li>
                <li>
                  <strong>Uploaded Documents:</strong> PDFs you upload are stored
                  on Cloudinary to enable chat functionality.
                </li>
                <li>
                  <strong>Chat Data:</strong> Your questions and AI-generated
                  answers are stored in Firebase to persist chat history.
                </li>
                <li>
                  <strong>Usage Data:</strong> We track document count and chat
                  sessions for usage statistics.
                </li>
              </ul>
            </PolicySection>

            <PolicySection title="2. How We Use Your Information">
              <p>Your information is used solely to:</p>
              <ul>
                <li>Provide and improve the Chat with PDF service</li>
                <li>Process your PDFs and generate AI responses</li>
                <li>Maintain your chat history and document library</li>
                <li>Authenticate your identity and protect your account</li>
              </ul>
            </PolicySection>

            <PolicySection title="3. Data Storage & Security">
              <p>
                We use industry-standard services to store and protect your
                data:
              </p>
              <ul>
                <li>
                  <strong>Clerk</strong> handles authentication and user data
                  with enterprise-grade security.
                </li>
                <li>
                  <strong>Cloudinary</strong> stores your uploaded PDFs with
                  secure URLs.
                </li>
                <li>
                  <strong>Firebase</strong> stores document metadata and chat
                  history.
                </li>
                <li>
                  <strong>Pinecone</strong> stores vector embeddings of your
                  document content for search purposes.
                </li>
              </ul>
            </PolicySection>

            <PolicySection title="4. Third-Party Services">
              <p>
                We use the following third-party services to operate the
                platform:
              </p>
              <ul>
                <li>
                  <strong>Google Gemini:</strong> Processes your questions and
                  generates AI answers. Your document content is sent to
                  Google&apos;s API for processing.
                </li>
                <li>
                  <strong>Clerk:</strong> Manages user authentication.
                </li>
                <li>
                  <strong>Cloudinary:</strong> Stores and delivers PDF files.
                </li>
                <li>
                  <strong>Pinecone:</strong> Provides vector search for document
                  retrieval.
                </li>
              </ul>
            </PolicySection>

            <PolicySection title="5. Data Retention">
              <p>
                Your documents and chat history are retained as long as your
                account is active. You can delete individual documents from
                your dashboard at any time, which removes the PDF, chat
                history, and vector embeddings associated with it.
              </p>
            </PolicySection>

            <PolicySection title="6. Your Rights">
              <p>You have the right to:</p>
              <ul>
                <li>Access and download your personal data</li>
                <li>Delete your documents and associated data</li>
                <li>Delete your account and all associated data</li>
                <li>
                  Request information about how your data is being used
                </li>
              </ul>
            </PolicySection>

            <PolicySection title="7. Cookies">
              <p>
                We use essential cookies for authentication (managed by Clerk)
                and session management. We do not use tracking or advertising
                cookies.
              </p>
            </PolicySection>

            <PolicySection title="8. Changes to This Policy">
              <p>
                We may update this privacy policy from time to time. Any
                changes will be reflected on this page with an updated
                &quot;Last updated&quot; date.
              </p>
            </PolicySection>

            <PolicySection title="9. Contact">
              <p>
                If you have questions about this privacy policy, please contact
                us through our{" "}
                <a
                  href="/contact"
                  className="text-purple-400 hover:text-purple-300 underline underline-offset-2"
                >
                  contact page
                </a>
                .
              </p>
            </PolicySection>
          </div>
        </div>
      </section>
    </div>
  );
}

function PolicySection({
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
