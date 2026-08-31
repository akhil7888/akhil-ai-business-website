"use client";

import { FormEvent, useState } from "react";
import { supabase } from "../lib/supabase";

const services = [
  {
    title: "AC Repair",
    description: "Fast and reliable AC inspection and repair services.",
    icon: "❄️",
  },
  {
    title: "AC Installation",
    description: "Professional installation for new air conditioning systems.",
    icon: "🔧",
  },
  {
    title: "Plumbing",
    description: "Reliable solutions for leaks, repairs, and plumbing issues.",
    icon: "🚰",
  },
  {
    title: "Electrical",
    description: "Safe and professional electrical repair and installation.",
    icon: "⚡",
  },
];

export default function Home() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Prevent duplicate submissions
    if (loading) return;

    setSubmitted(false);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = formData.get("name")?.toString().trim() || "";
    const phone = formData.get("phone")?.toString().trim() || "";
    const service = formData.get("service")?.toString().trim() || "";
    const requirement =
      formData.get("requirement")?.toString().trim() || "";

    // ==========================
    // Validation
    // ==========================

    if (!name) {
      setError("Please enter your name.");
      return;
    }

    if (name.length < 2) {
      setError("Please enter a valid name.");
      return;
    }

    if (name.length > 100) {
      setError("Name must be less than 100 characters.");
      return;
    }

    if (!phone) {
      setError("Please enter your phone number.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!service) {
      setError("Please select a service.");
      return;
    }

    if (!requirement) {
      setError("Please describe your requirement.");
      return;
    }

    if (requirement.length < 5) {
      setError("Please provide a little more detail about your requirement.");
      return;
    }

    if (requirement.length > 1000) {
      setError("Requirement must be less than 1000 characters.");
      return;
    }

    // ==========================
    // Submit to Supabase
    // ==========================

    setLoading(true);

    const { error: insertError } = await supabase
      .from("enquiries")
      .insert({
        name,
        phone,
        service,
        requirement,
      });

    setLoading(false);

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      setError("Something went wrong. Please try again.");
      return;
    }

    // ==========================
    // Success
    // ==========================

    setSubmitted(true);
    form.reset();
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold">Sri Lakshmi</h1>
            <p className="text-sm text-gray-500">Home Services</p>
          </div>

          <div className="hidden gap-8 text-sm font-medium md:flex">
            <a href="#services" className="hover:text-blue-600">
              Services
            </a>

            <a href="#why-us" className="hover:text-blue-600">
              Why Us
            </a>

            <a href="#contact" className="hover:text-blue-600">
              Contact
            </a>
          </div>

          <a
            href="#contact"
            className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Book a Service
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gray-50">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-4 font-semibold text-blue-600">
              PROFESSIONAL HOME SERVICES
            </p>

            <h2 className="text-5xl font-bold leading-tight tracking-tight md:text-6xl">
              Reliable service for your home.
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
              From AC repair to plumbing and electrical work, our trained
              professionals are ready to help you with your home service needs.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#contact"
                className="rounded-full bg-blue-600 px-7 py-3.5 font-semibold text-white hover:bg-blue-700"
              >
                Book a Service
              </a>

              <a
                href="#services"
                className="rounded-full border border-gray-300 bg-white px-7 py-3.5 font-semibold hover:bg-gray-100"
              >
                Explore Services
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-6 text-sm text-gray-600">
              <span>✓ Trusted Professionals</span>
              <span>✓ Quick Response</span>
              <span>✓ Transparent Pricing</span>
            </div>
          </div>

          {/* AI Assistant Card */}
          <div className="rounded-3xl bg-gray-900 p-8 text-white shadow-xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-xl">
                AI
              </div>

              <div>
                <h3 className="font-bold">AI Service Assistant</h3>

                <p className="text-sm text-gray-400">
                  Available to help you
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-gray-800 p-5">
              <p className="text-sm text-gray-400">Customer</p>

              <p className="mt-1">
                I need help with my AC. What services do you provide?
              </p>
            </div>

            <div className="mt-4 rounded-2xl bg-blue-600 p-5">
              <p className="text-sm text-blue-100">AI Assistant</p>

              <p className="mt-1">
                We provide AC repair, installation, inspection, and maintenance
                services. I can also help you book a service.
              </p>
            </div>

            <button
              type="button"
              className="mt-6 w-full rounded-full bg-white px-5 py-3 font-semibold text-gray-900 hover:bg-gray-100"
            >
              Chat with AI Assistant
            </button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-2xl">
          <p className="font-semibold text-blue-600">OUR SERVICES</p>

          <h2 className="mt-3 text-4xl font-bold">
            Everything your home needs.
          </h2>

          <p className="mt-4 text-gray-600">
            Professional services designed to solve everyday home maintenance
            and repair problems.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <div
              key={service.title}
              className="rounded-2xl border border-gray-200 p-6 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="text-4xl">{service.icon}</div>

              <h3 className="mt-5 text-xl font-bold">{service.title}</h3>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                {service.description}
              </p>

              <a
                href="#contact"
                className="mt-5 inline-block text-sm font-semibold text-blue-600"
              >
                Get this service →
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Why Us Section */}
      <section id="why-us" className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <p className="font-semibold text-blue-600">WHY CHOOSE US</p>

              <h2 className="mt-3 text-4xl font-bold">
                Service you can depend on.
              </h2>

              <p className="mt-5 leading-7 text-gray-600">
                We focus on reliable service, clear communication, and a simple
                customer experience from enquiry to completion.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["01", "Experienced Professionals"],
                ["02", "Quick Response"],
                ["03", "Transparent Process"],
                ["04", "Customer First"],
              ].map(([number, title]) => (
                <div
                  key={number}
                  className="rounded-2xl bg-white p-6 shadow-sm"
                >
                  <p className="text-sm font-bold text-blue-600">{number}</p>

                  <h3 className="mt-3 font-bold">{title}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact / Enquiry Section */}
      <section id="contact" className="mx-auto max-w-7xl px-6 py-24">
        <div className="rounded-3xl bg-blue-600 p-8 text-white md:p-12">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <p className="font-semibold text-blue-100">NEED A SERVICE?</p>

              <h2 className="mt-3 text-4xl font-bold">
                Tell us what you need.
              </h2>

              <p className="mt-5 max-w-lg leading-7 text-blue-100">
                Submit your enquiry and our team can get back to you with the
                next steps.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 rounded-2xl bg-white p-6 text-gray-900"
            >
              <input
                type="text"
                name="name"
                placeholder="Your name"
                required
                maxLength={100}
                autoComplete="name"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-600"
              />

              <input
                type="tel"
                name="phone"
                placeholder="Phone number"
                required
                maxLength={10}
                inputMode="numeric"
                autoComplete="tel"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-600"
              />

              <select
                name="service"
                required
                defaultValue=""
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-600"
              >
                <option value="" disabled>
                  Select a service
                </option>

                <option value="AC Repair">AC Repair</option>
                <option value="AC Installation">AC Installation</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
              </select>

              <textarea
                name="requirement"
                placeholder="Describe your requirement"
                rows={4}
                required
                maxLength={1000}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-600"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Submitting..." : "Submit Enquiry"}
              </button>

              {submitted && (
                <div
                  role="alert"
                  className="rounded-xl bg-green-50 p-4 text-center text-sm font-medium text-green-700"
                >
                  ✓ Enquiry submitted successfully!
                  <br />
                  Our team will contact you soon.
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="rounded-xl bg-red-50 p-4 text-center text-sm font-medium text-red-700"
                >
                  {error}
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
          <p>© 2026 Sri Lakshmi Home Services</p>

          <p>Professional • Reliable • Customer First</p>
        </div>
      </footer>
    </main>
  );
}