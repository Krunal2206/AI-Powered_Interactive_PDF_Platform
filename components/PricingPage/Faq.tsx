"use client"

import { faqs } from "./PricingData";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const Faq = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={faq.question}
            className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden transition-all duration-300"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="w-full flex items-center justify-between p-6 text-left font-semibold text-lg text-purple-300 hover:bg-slate-800/30 transition-colors focus:outline-none cursor-pointer"
            >
              <span className={isOpen ? "text-purple-400" : "text-slate-100"}>
                {faq.question}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-slate-400 transition-transform duration-300 shrink-0 ${
                  isOpen ? "transform rotate-180 text-purple-400" : ""
                }`}
              />
            </button>
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isOpen
                  ? "max-h-[300px] opacity-100 border-t border-slate-800/50"
                  : "max-h-0 opacity-0 pointer-events-none"
              }`}
            >
              <div className="p-6 text-slate-300 text-sm leading-relaxed bg-slate-900/20">
                {faq.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Faq