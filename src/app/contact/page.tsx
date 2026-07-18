'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, MessageSquare, Send, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';

const contactSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  subject: z.string().min(4, { message: 'Subject must be at least 4 characters.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    try {
      // Simulate API submit delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('Submitted contact request:', data);
      setSubmitStatus('success');
      reset();
    } catch (e) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <PublicNavbar />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 md:py-24 w-full space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Support Portal</span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Contact Support & Sales
          </h1>
          <p className="text-sm text-muted max-w-xl mx-auto leading-relaxed">
            Need help with your workspace or looking for enterprise capabilities? Drop us a note, and our team will get back to you shortly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Support Channels */}
          <div className="md:col-span-4 space-y-6">
            <div className="rounded-2xl border border-border bg-card-bg p-6 space-y-3.5 shadow-sm">
              <Mail className="h-6 w-6 text-indigo-500" />
              <h3 className="text-sm font-bold text-foreground">Email Support</h3>
              <p className="text-xs text-muted leading-relaxed">
                Contact our support queue for technical investigations.
              </p>
              <span className="text-xs font-semibold text-indigo-500 block">support@documind.ai</span>
            </div>

            <div className="rounded-2xl border border-border bg-card-bg p-6 space-y-3.5 shadow-sm">
              <MessageSquare className="h-6 w-6 text-purple-500" />
              <h3 className="text-sm font-bold text-foreground">Live Chat</h3>
              <p className="text-xs text-muted leading-relaxed">
                Available inside the active workspace for PRO and Enterprise plans.
              </p>
              <span className="text-xs font-semibold text-purple-500 block">Response time &lt; 5m</span>
            </div>
          </div>

          {/* Form Block */}
          <div className="md:col-span-8 rounded-2xl border border-border bg-card-bg p-6 md:p-8 shadow-md">
            {submitStatus === 'success' && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-emerald-500 flex items-start gap-3 mb-6 animate-in fade-in duration-200">
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold">Message sent successfully!</h4>
                  <p className="text-[11px] text-emerald-500/80 mt-1">
                    Thank you for reaching out. We have logged your request and will follow up within 24 hours.
                  </p>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-rose-500 flex items-start gap-3 mb-6 animate-in fade-in duration-200">
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold">Submission failed</h4>
                  <p className="text-[11px] text-rose-500/80 mt-1">
                    An error occurred while dispatching your request. Please try again or email us directly.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    {...register('name')}
                    placeholder="Enter name"
                    className={`flex h-11 w-full rounded-xl border ${
                      errors.name ? 'border-rose-500' : 'border-border'
                    } bg-background px-4 py-2.5 text-xs text-foreground placeholder-muted transition-all focus:border-indigo-500 focus:outline-none`}
                  />
                  {errors.name && <p className="mt-1 text-[11px] text-rose-500">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="name@company.com"
                    className={`flex h-11 w-full rounded-xl border ${
                      errors.email ? 'border-rose-500' : 'border-border'
                    } bg-background px-4 py-2.5 text-xs text-foreground placeholder-muted transition-all focus:border-indigo-500 focus:outline-none`}
                  />
                  {errors.email && <p className="mt-1 text-[11px] text-rose-500">{errors.email.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  {...register('subject')}
                  placeholder="How can we help you?"
                  className={`flex h-11 w-full rounded-xl border ${
                    errors.subject ? 'border-rose-500' : 'border-border'
                  } bg-background px-4 py-2.5 text-xs text-foreground placeholder-muted transition-all focus:border-indigo-500 focus:outline-none`}
                />
                {errors.subject && <p className="mt-1 text-[11px] text-rose-500">{errors.subject.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                  Message Description
                </label>
                <textarea
                  rows={5}
                  {...register('message')}
                  placeholder="Outline details or queries..."
                  className={`flex w-full rounded-xl border ${
                    errors.message ? 'border-rose-500' : 'border-border'
                  } bg-background px-4 py-2.5 text-xs text-foreground placeholder-muted transition-all focus:border-indigo-500 focus:outline-none resize-none`}
                />
                {errors.message && <p className="mt-1 text-[11px] text-rose-500">{errors.message.message}</p>}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-xs font-semibold text-white shadow-md hover:opacity-95 disabled:opacity-50 transition-all duration-200 active:scale-[0.99] cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sending inquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
