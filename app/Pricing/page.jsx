"use client";

import { motion } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Pricing() {
  const plans = [
    {
      name: "Free Trial",
      price: "₹0",
      period: "/first month",
      desc: "Try all premium features for one month at no cost.",
      features: [
        "Unlimited AI question paper generation",
        "All exam patterns included (JEE, NEET, CET)",
        "Full analytics & insights",
        "Priority email support",
      ],
      highlight: false,
    },
    {
      name: "Monthly Plan",
      price: "₹499",
      period: "/month",
      desc: "Perfect for ongoing preparation with full access.",
      features: [
        "Unlimited AI question paper generation",
        "Advanced analytics",
        "Custom difficulty & topic filters",
        "Priority email & chat support",
      ],
      highlight: true,
    },
    {
      name: "Yearly Plan",
      price: "₹4999",
      period: "/year",
      desc: "Best value — save more with annual billing.",
      features: [
        "Everything in Monthly Plan",
        "Free exam simulation pack",
        "Exclusive performance insights",
        "Dedicated support manager",
      ],
      highlight: false,
    },
  ];

  return (
    <div className="w-full min-h-screen overflow-hidden dark:text-white dark:bg-gray-800">
      <Header />

      {/* Hero */}
      <section className="py-20 px-6 md:px-20 text-center max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl md:text-6xl font-extrabold leading-tight"
        >
          Simple, Transparent Pricing
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mt-6 text-lg font-light text-gray-600 dark:text-gray-300"
        >
          Choose the plan that fits your needs — no hidden charges.
        </motion.p>
      </section>

      {/* Pricing Cards */}
      <section className="px-6 md:px-20 pb-20 max-w-6xl mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            whileHover={{ y: -5 }}
            className={`rounded-2xl p-6 shadow-md border ${
              plan.highlight
                ? "bg-black text-white dark:bg-gray-900 border-blue-500"
                : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
            }`}
          >
            <h3 className="text-xl font-bold">{plan.name}</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-300 text-sm">
              {plan.desc}
            </p>
            <div className="mt-6">
              <span className="text-4xl font-extrabold">{plan.price}</span>
              <span className="text-gray-500 dark:text-gray-400">
                {plan.period}
              </span>
            </div>
            <ul className="mt-6 space-y-3">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Check
                    size={18}
                    className={`${
                      plan.highlight
                        ? "text-blue-400"
                        : "text-blue-500 dark:text-blue-400"
                    }`}
                  />
                  {feature}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Button
                variant={plan.highlight ? "secondary" : "outline"}
                className="w-full"
              >
                {plan.highlight ? "Get Started" : "Choose Plan"}
              </Button>
            </div>
          </motion.div>
        ))}
      </section>

      <Footer />
    </div>
  );
}
