"use client";

// import { useState } from "react";
// import { useRouter } from "next/router";
import { Button } from "../ui/button";
import { plans } from "./PricingData";
import { Check, X } from "lucide-react";
// import { useClerk, useUser } from "@clerk/nextjs";
import { usePlans } from "@clerk/nextjs/experimental";

//   const handlePlanClick = async (plan: (typeof plans)[number]) => {
//     // Free plan — just navigate to dashboard
//     if (!plan.clerkPlan && plan.href && !plan.href.startsWith("mailto:")) {
//       router.push(plan.href);
//       return;
//     }

//     // Enterprise — open mail client
//     if (plan.href?.startsWith("mailto:")) {
//       window.location.href = plan.href;
//       return;
//     }

//     // Paid plan — require sign-in first
//     if (!isSignedIn) {
//       openSignIn({ afterSignInUrl: "/pricing" });
//       return;
//     }

//     // Trigger Clerk billing checkout for the selected plan
//     if (plan.clerkPlan) {
//       setCheckoutPlanId(plan.clerkPlan);
//     }
//   };

const SubscriptionPlans = () => {
  const {
    data,
  } = usePlans({
    for: "user",
  });

  data?.forEach((plan) => {
    console.log("Plan:", plan);
  });

    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
        {plans.map((plan) => (
          <div
            key={plan.name}
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
              {plan.features.map((feature) => (
                <div
                  key={`${plan.name}-${feature}`}
                  className="flex items-center space-x-3"
                >
                  <Check className="w-5 h-5 text-green-400 shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
              {plan.limitations.map((limitation) => (
                <div
                  key={`${plan.name}-${limitation}`}
                  className="flex items-center space-x-3"
                >
                  <X className="w-5 h-5 text-red-400 shrink-0" />
                  <span className="text-sm text-slate-400">{limitation}</span>
                </div>
              ))}
            </div>
            <Button
            //   onClick={() => handlePlanClick(plan)}
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
    );
};

export default SubscriptionPlans;