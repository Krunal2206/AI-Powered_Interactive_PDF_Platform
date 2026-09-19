import { Building2, Crown, Users, Zap } from "lucide-react";

export const CLERK_PLAN_IDS: Record<string, string> = {
  Pro: "cplan_3I15BWSs4ZSdnwQZFflMa38eClo",
  Team: "cplan_3I15HAAEqjSuwMsc6ED7IktrNvN",
};

export interface PlanFeature {
  label: string;
  soon?: boolean;
}

export const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Everything the app can do today — free while in preview",
    icon: Zap,
    features: [
      { label: "AI chat with your PDFs" },
      { label: "Semantic search across your documents" },
      { label: "Interactive PDF viewer" },
      { label: "Document search & filtering" },
      { label: "Chat export (copy & download)" },
      { label: "Saved chat history" },
      { label: "Cross-device access" },
      { label: "Up to 10 PDFs / month" },
      { label: "10 MB per file" },
      { label: "Mobile & desktop" },
    ] as PlanFeature[],
    buttonText: "Get Started Free",
    buttonVariant: "outline",
    href: "/dashboard",
    popular: false,
    clerkPlan: null, // free plan — just navigate
    slug: "free_user",
  },
  {
    name: "Pro",
    price: "$19",
    period: "per month",
    description: "Ideal for professionals and power users",
    icon: Crown,
    features: [
      { label: "Everything in Free" },
      { label: "Unlimited PDF uploads", soon: true },
      { label: "100 MB file size limit", soon: true },
      { label: "Advanced chat memory", soon: true },
      { label: "Cloud backup & sync", soon: true },
      { label: "Priority email support", soon: true },
    ] as PlanFeature[],
    buttonText: "Start Pro Trial",
    buttonVariant: "primary",
    href: null,
    popular: true,
    clerkPlan: CLERK_PLAN_IDS.Pro,
    slug: "pro",
  },
  {
    name: "Team",
    price: "$49",
    period: "per month",
    description: "Built for teams and collaborative workflows",
    icon: Users,
    features: [
      { label: "Everything in Pro" },
      { label: "Up to 10 team members", soon: true },
      { label: "Shared PDF libraries", soon: true },
      { label: "Team chat rooms", soon: true },
      { label: "Admin dashboard", soon: true },
      { label: "Usage analytics", soon: true },
      { label: "SSO integration", soon: true },
      { label: "Priority chat support", soon: true },
    ] as PlanFeature[],
    buttonText: "Start Team Trial",
    buttonVariant: "outline",
    href: null,
    popular: false,
    clerkPlan: CLERK_PLAN_IDS.Team,
    slug: "team",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    description: "For large organizations with custom needs",
    icon: Building2,
    features: [
      { label: "Everything in Team" },
      { label: "Unlimited team members", soon: true },
      { label: "Custom integrations", soon: true },
      { label: "On-premise deployment", soon: true },
      { label: "Advanced security controls", soon: true },
      { label: "Custom AI training", soon: true },
      { label: "SLA guarantees", soon: true },
      { label: "Dedicated account manager", soon: true },
    ] as PlanFeature[],
    buttonText: "Contact Sales",
    buttonVariant: "outline",
    href: "mailto:sales@chatwithpdf.com",
    popular: false,
    clerkPlan: null,
    slug: "enterprise",
  },
];

export const faqs = [
  {
    question: "Can I upgrade or downgrade my plan anytime?",
    answer:
      "Yes, you can change your plan at any time. Changes take effect immediately, and you'll be charged or credited accordingly.",
  },
  {
    question: "What happens to my PDFs if I cancel?",
    answer:
      "You'll have 30 days to export your data. After that, your PDFs will be permanently deleted from our servers.",
  },
  {
    question: "Is there a free trial for paid plans?",
    answer:
      "Yes, we offer a 14-day free trial for all paid plans. No credit card required to start.",
  },
  {
    question: "How secure are my documents?",
    answer:
      "We use enterprise-grade encryption and comply with SOC 2 Type II standards. Your documents are never shared or used for training.",
  },
];

// Values reflect what the app enforces today. Because plans are not yet gated,
// implemented capabilities are identical across every tier; unbuilt features are
// marked "Coming soon".
export const featureComparison = [
  {
    feature: "PDF Uploads",
    free: "10 / month",
    pro: "10 / month",
    team: "10 / month",
    enterprise: "10 / month",
  },
  {
    feature: "File Size Limit",
    free: "10 MB",
    pro: "10 MB",
    team: "10 MB",
    enterprise: "10 MB",
  },
  {
    feature: "AI Chat",
    free: "✓",
    pro: "✓",
    team: "✓",
    enterprise: "✓",
  },
  {
    feature: "Semantic Search",
    free: "✓",
    pro: "✓",
    team: "✓",
    enterprise: "✓",
  },
  {
    feature: "Interactive PDF Viewer",
    free: "✓",
    pro: "✓",
    team: "✓",
    enterprise: "✓",
  },
  {
    feature: "Document Search & Filter",
    free: "✓",
    pro: "✓",
    team: "✓",
    enterprise: "✓",
  },
  {
    feature: "Chat Export",
    free: "✓",
    pro: "✓",
    team: "✓",
    enterprise: "✓",
  },
  {
    feature: "Saved Chat History",
    free: "✓",
    pro: "✓",
    team: "✓",
    enterprise: "✓",
  },
  {
    feature: "Cloud Backup & Sync",
    free: "Coming soon",
    pro: "Coming soon",
    team: "Coming soon",
    enterprise: "Coming soon",
  },
  {
    feature: "Team Members",
    free: "Coming soon",
    pro: "Coming soon",
    team: "Coming soon",
    enterprise: "Coming soon",
  },
  {
    feature: "Usage Analytics",
    free: "Coming soon",
    pro: "Coming soon",
    team: "Coming soon",
    enterprise: "Coming soon",
  },
  {
    feature: "SSO Integration",
    free: "Coming soon",
    pro: "Coming soon",
    team: "Coming soon",
    enterprise: "Coming soon",
  },
  {
    feature: "Priority Support",
    free: "Coming soon",
    pro: "Coming soon",
    team: "Coming soon",
    enterprise: "Coming soon",
  },
];
