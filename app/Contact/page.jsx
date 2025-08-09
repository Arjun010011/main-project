"use client";

import { motion } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Contact() {
  return (
    <div className="w-full min-h-screen overflow-hidden dark:text-white dark:bg-gray-800">
      <Header />

      {/* Hero Section */}
      <section className="py-20 px-6 md:px-20 text-center max-w-3xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl md:text-6xl font-extrabold leading-tight"
        >
          Get in Touch
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mt-6 text-lg font-light text-gray-600 dark:text-gray-300"
        >
          Have questions, feedback, or partnership ideas? We’d love to hear from
          you.
        </motion.p>
      </section>

      {/* Contact Section */}
      <section className="px-6 md:px-20 pb-20 max-w-6xl mx-auto grid gap-12 lg:grid-cols-2">
        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700"
        >
          <form className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-medium">Name</label>
              <input
                type="text"
                placeholder="Your Name"
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">Email</label>
              <input
                type="email"
                placeholder="Your Email"
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">Message</label>
              <textarea
                rows="5"
                placeholder="Your Message"
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
            <Button className="w-full">Send Message</Button>
          </form>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col gap-8 justify-center"
        >
          <div className="flex items-start gap-4">
            <Mail size={28} className="text-black dark:text-white" />
            <div>
              <h4 className="text-lg font-semibold">Email Us</h4>
              <p className="text-gray-600 dark:text-gray-300">
                support@example.com
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Phone size={28} className=" text-black dark:text-white" />
            <div>
              <h4 className="text-lg font-semibold">Call Us</h4>
              <p className="text-gray-600 dark:text-gray-300">
                +91 98765 43210
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <MapPin size={28} className=" text-black dark:text-white" />
            <div>
              <h4 className="text-lg font-semibold">Visit Us</h4>
              <p className="text-gray-600 dark:text-gray-300">
                123, College Road, Bengaluru, India
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
