import { Building2, Crown, Users, Zap } from "lucide-react";

export const CLERK_PLAN_IDS: Record<string, string> = {
  Pro: "cplan_3I15BWSs4ZSdnwQZFflMa38eClo",
  Team: "cplan_3I15HAAEqjSuwMsc6ED7IktrNvN",
};

export const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started with PDF chat",
    icon: Zap,
    features: [
      "10 PDF uploads per month",
      "Basic chat functionality",
      "10 MB file size limit",
      "24-hour chat history",
      "Mobile & desktop access",
    ],
    limitations: [
      "No cloud backup",
      "Limited chat memory",
      "No priority support",
    ],
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
      "Unlimited PDF uploads",
      "Advanced chat with full memory",
      "100 MB file size limit",
      "Unlimited chat history",
      "Cloud backup & sync",
      "Interactive PDF viewer",
      "Priority email support",
      "Cross-device synchronization",
    ],
    limitations: [],
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
      "Everything in Pro",
      "Up to 10 team members",
      "Shared PDF libraries",
      "Team chat rooms",
      "Admin dashboard",
      "Usage analytics",
      "SSO integration",
      "Priority chat support",
    ],
    limitations: [],
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
      "Everything in Team",
      "Unlimited team members",
      "Custom integrations",
      "On-premise deployment",
      "Advanced security controls",
      "Custom AI training",
      "SLA guarantees",
      "Dedicated account manager",
    ],
    limitations: [],
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

export const featureComparison = [
  {
    feature: "PDF Uploads",
    free: "10/month",
    pro: "Unlimited",
    team: "Unlimited",
    enterprise: "Unlimited",
  },
  {
    feature: "File Size Limit",
    free: "10 MB",
    pro: "100 MB",
    team: "100 MB",
    enterprise: "No limit",
  },
  {
    feature: "Chat History",
    free: "24 hours",
    pro: "Unlimited",
    team: "Unlimited",
    enterprise: "Unlimited",
  },
  {
    feature: "Cloud Backup",
    free: "✗",
    pro: "✓",
    team: "✓",
    enterprise: "✓",
  },
  {
    feature: "Team Members",
    free: "1",
    pro: "1",
    team: "10",
    enterprise: "Unlimited",
  },
  {
    feature: "Support",
    free: "Community",
    pro: "Email",
    team: "Priority",
    enterprise: "Dedicated",
  },
];