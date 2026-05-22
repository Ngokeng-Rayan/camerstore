"use client";

import { useState } from "react";
import { FrontNavbar } from "@/components/FrontNavbar";
import { FrontFooter } from "@/components/FrontFooter";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from "lucide-react";
import { submitContact } from "@/app/actions/contact";
import { fbEvent } from "@/components/FacebookPixel";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await submitContact(formData);

    if (result.success) {
      setIsSuccess(true);
      (e.target as HTMLFormElement).reset();
      
      // Tracker l'événement Lead sur Facebook
      fbEvent("Lead", {
        content_name: "Contact Form"
      });
    } else {
      setError(result.error || "Une erreur est survenue.");
    }
    
    setIsSubmitting(false);
  };
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <FrontNavbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="mb-8 sm:mb-12 text-center">
          <h1 className="text-2xl sm:text-4xl font-black text-brand-navy mb-3 sm:mb-4 px-2">Contactez-nous</h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-sm sm:text-base px-2">
            Notre équipe est à votre disposition pour répondre à toutes vos questions. N'hésitez pas à nous écrire ou nous appeler.
          </p>
          <div className="w-16 sm:w-24 h-1 bg-brand-green mx-auto rounded-full mt-4 sm:mt-6"></div>
        </div>

        <div className="max-w-2xl mx-auto items-start">
          {/* Formulaire de contact */}
          <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold text-brand-navy mb-6">Envoyez-nous un message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-200 text-sm font-bold">
                  {error}
                </div>
              )}
              {isSuccess && (
                <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 flex items-center gap-3">
                  <CheckCircle size={24} className="shrink-0" />
                  <p className="text-sm font-bold">Votre message a été envoyé avec succès ! Nous vous recontacterons vite.</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-bold text-brand-navy mb-2">Nom complet</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  placeholder="Votre nom" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-brand-navy mb-2">Numéro de téléphone</label>
                <input 
                  type="tel" 
                  name="phone"
                  required
                  placeholder="Votre numéro (WhatsApp de préférence)" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-brand-navy mb-2">Message</label>
                <textarea 
                  name="message"
                  required
                  rows={5}
                  placeholder="Comment pouvons-nous vous aider ?" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green focus:bg-white transition-all resize-none"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-brand-green hover:bg-lime-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-brand-navy font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <Send size={20} />
                {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
              </button>
            </form>
          </div>
        </div>
      </main>

      <FrontFooter />
    </div>
  );
}
