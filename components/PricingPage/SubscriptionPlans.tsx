"use client";

import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { plans } from "./PricingData";
import { Check, X } from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";
import { CheckoutButton, usePlans } from "@clerk/nextjs/experimental";

const SubscriptionPlans = () => {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();
  const { data: clerkPlans, isLoading: plansLoading } = usePlans({
    for: "user",
  });

  const clerkPlanFor = (slug: string) =>
    clerkPlans?.find((p) => p.slug === slug) ?? null;

  const formatPrice = (
    fee: { amount: number; currencySymbol: string } | undefined,
  ) => {
    if (!fee) return null;
    return `${fee.currencySymbol}${Math.round(fee.amount / 100)}`;
  };

  const handleStaticPlanClick = (plan: (typeof plans)[number]) => {
    if (plan.href?.startsWith("mailto:")) {
      window.location.href = plan.href;
      return;
    }
    if (plan.href) {
      router.push(plan.href);
    }
  };

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
      {plans.map((plan) => {
        const live = plansLoading ? null : clerkPlanFor(plan.slug);

        const displayName = live?.name ?? plan.name;
        const displayDescription = live?.description || plan.description;
        const displayPrice = formatPrice(live?.fee) ?? plan.price;
        const displayFeatures =
          live && live.features.length > 0
            ? live.features.map((f) => f.name)
            : plan.features;

        const buttonClassName = `w-full py-3 px-6 rounded-xl font-medium transition-all duration-300 cursor-pointer ${
          plan.buttonVariant === "primary"
            ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25"
            : "border border-slate-600 hover:border-slate-500 hover:bg-slate-800/50"
        }`;

        return (
          <div
            key={plan.slug}
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
              <h3 className="text-2xl font-bold mb-2">{displayName}</h3>
              <div className="mb-2">
                <span className="text-4xl font-bold">{displayPrice}</span>
                {plan.period !== "contact us" && (
                  <span className="text-slate-400 ml-2">/{plan.period}</span>
                )}
              </div>
              <p className="text-slate-400 text-sm">{displayDescription}</p>
            </div>
            <div className="space-y-3 mb-8">
              {displayFeatures.map((feature) => (
                <div
                  key={`${plan.slug}-${feature}`}
                  className="flex items-center space-x-3"
                >
                  <Check className="w-5 h-5 text-green-400 shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
              {plan.limitations.map((limitation) => (
                <div
                  key={`${plan.slug}-${limitation}`}
                  className="flex items-center space-x-3"
                >
                  <X className="w-5 h-5 text-red-400 shrink-0" />
                  <span className="text-sm text-slate-400">{limitation}</span>
                </div>
              ))}
            </div>

            {plan.clerkPlan ? (
              isSignedIn ? (
                <CheckoutButton
                  planId={plan.clerkPlan}
                  planPeriod="month"
                  newSubscriptionRedirectUrl="/dashboard"
                >
                  <Button className={buttonClassName}>{plan.buttonText}</Button>
                </CheckoutButton>
              ) : (
                <Button
                  className={buttonClassName}
                  onClick={() => openSignIn({ forceRedirectUrl: "/pricing" })}
                >
                  {plan.buttonText}
                </Button>
              )
            ) : (
              <Button
                className={buttonClassName}
                onClick={() => handleStaticPlanClick(plan)}
              >
                {plan.buttonText}
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SubscriptionPlans;
