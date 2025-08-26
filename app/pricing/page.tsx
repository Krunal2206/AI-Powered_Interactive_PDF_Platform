import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Building2, Check, Crown, Users, X, Zap } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started with PDF chat",
    icon: Zap,
    features: [
      "3 PDF uploads per month",
      "Basic chat functionality",
      "5 MB file size limit",
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
    popular: false,
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
    popular: true,
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
    popular: false,
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
    popular: false,
  },
];

const faqs = [
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

const Page = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white">
      {/* Header */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Unlock the full potential of your PDF documents with our intelligent
            chat system. Choose the plan that fits your needs and start chatting
            with your documents today.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-8 backdrop-blur-sm border transition-all duration-300 hover:scale-105 ${
                plan.popular
                  ? "border-purple-500 bg-gradient-to-br from-purple-900/50 to-pink-900/30 shadow-2xl shadow-purple-500/25"
                  : "border-slate-700 bg-slate-900/50 hover:border-slate-600"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <plan.icon
                  className={`w-12 h-12 mx-auto mb-4 ${
                    plan.popular ? "text-purple-400" : "text-slate-400"
                  }`}
                />
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period !== "contact us" && (
                    <span className="text-slate-400 ml-2">/{plan.period}</span>
                  )}
                </div>
                <p className="text-slate-400 text-sm">{plan.description}</p>
              </div>

              <div className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div
                    key={featureIndex}
                    className="flex items-center space-x-3"
                  >
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
                {plan.limitations.map((limitation, limitIndex) => (
                  <div key={limitIndex} className="flex items-center space-x-3">
                    <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <span className="text-sm text-slate-400">{limitation}</span>
                  </div>
                ))}
              </div>

              <Button
                className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-300 cursor-pointer ${
                  plan.buttonVariant === "primary"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25"
                    : "border border-slate-600 hover:border-slate-500 hover:bg-slate-800/50"
                }`}
              >
                {plan.buttonText}
              </Button>
            </div>
          ))}
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Feature Comparison
          </h2>
          <div className="overflow-x-auto">
            <Table className="w-full rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-slate-700">
              <TableHeader>
                <TableRow className="border-b border-slate-700">
                  <TableHead className="text-left p-6 font-medium text-white">
                    Features
                  </TableHead>
                  <TableHead className="text-center p-6 font-medium text-white">
                    Free
                  </TableHead>
                  <TableHead className="text-center p-6 font-medium text-white">
                    Pro
                  </TableHead>
                  <TableHead className="text-center p-6 font-medium text-white">
                    Team
                  </TableHead>
                  <TableHead className="text-center p-6 font-medium text-white">
                    Enterprise
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {[
                  {
                    feature: "PDF Uploads",
                    free: "3/month",
                    pro: "Unlimited",
                    team: "Unlimited",
                    enterprise: "Unlimited",
                  },
                  {
                    feature: "File Size Limit",
                    free: "5 MB",
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
                ].map((row, index) => (
                  <TableRow
                    key={index}
                    className="border-b border-slate-700/50"
                  >
                    <TableCell className="p-6 font-medium">
                      {row.feature}
                    </TableCell>
                    <td className="p-6 text-center text-slate-400">
                      {row.free}
                    </td>
                    <TableCell className="p-6 text-center">{row.pro}</TableCell>
                    <TableCell className="p-6 text-center">
                      {row.team}
                    </TableCell>
                    <TableCell className="p-6 text-center">
                      {row.enterprise}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
              >
                <h3 className="text-lg font-semibold mb-3 text-purple-400">
                  {faq.question}
                </h3>
                <p className="text-slate-300">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl p-12 backdrop-blur-sm border border-purple-500/30">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your PDF Experience?
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already chatting with their
            documents. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
            >
              <Link href="/dashboard" className="flex items-center">
                Start Free Trial
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
