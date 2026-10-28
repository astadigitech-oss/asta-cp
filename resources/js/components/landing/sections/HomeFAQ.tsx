import React from "react";
import { FAQSection, FAQItem } from "@/components/common/FAQSection";
import { useTranslation } from "@/i18n/useTranslation";

export function HomeFAQ() {
  const { language } = useTranslation();

  const faqs: FAQItem[] = language === "en" ? [
    {
      question: "What core software engineering services does ASTA DIGITAL AGENCY provide?",
      answer: "<strong>ASTA DIGITAL AGENCY</strong> provides end-to-end custom software development, high-performance mobile applications (Android & iOS), modern scalable web platforms, and enterprise cloud information systems tailored to business processes.",
    },
    {
      question: "How does ASTA DIGITAL AGENCY ensure enterprise-grade security and scalability?",
      answer: "ASTA DIGITAL AGENCY implements clean architecture, role-based access control (RBAC), end-to-end data encryption, rigorous input sanitization protecting against OWASP Top 10 vulnerabilities, and automated test coverage.",
    },
    {
      question: "What is the typical project development timeline at ASTA DIGITAL AGENCY?",
      answer: "Average project development timelines range from 2 to 12 weeks, depending on system complexity, module requirements, third-party API integrations, and customized workflows.",
    },
    {
      question: "Does ASTA DIGITAL AGENCY provide post-launch maintenance and support SLAs?",
      answer: "Yes, ASTA DIGITAL AGENCY provides explicit maintenance warranties, proactive server uptime monitoring, bug-fixing guarantees, and ongoing technical support backed by transparent SLAs.",
    },
  ] : [
    {
      question: "Apa saja layanan utama yang disediakan oleh ASTA DIGITAL AGENCY?",
      answer: "<strong>ASTA DIGITAL AGENCY</strong> menyediakan layanan komprehensif berupa pengembangan aplikasi mobile native dan hybrid (Android & iOS), rekayasa sistem informasi enterprise kustom, pembuatan platform web modern, serta audit arsitektur teknologi.",
    },
    {
      question: "Bagaimana ASTA DIGITAL AGENCY menjamin keamanan data pada sistem yang dibangun?",
      answer: "ASTA DIGITAL AGENCY menerapkan prinsip security-by-design dengan enkripsi data saat transit dan saat disimpan, sanitasi input terhadap kerentanan OWASP Top 10, manajemen hak akses berbasis peran (RBAC), serta pencatatan audit log sistem yang lengkap.",
    },
    {
      question: "Berapa lama durasi rata-rata pengerjaan proyek di ASTA DIGITAL AGENCY?",
      answer: "Durasi pengerjaan proyek bervariasi antara 2 hingga 12 minggu bergantung pada ruang lingkup modul, kompleksitas integrasi API pihak ketiga, dan kebutuhan kustomisasi sistem yang disepakati.",
    },
    {
      question: "Apakah ASTA DIGITAL AGENCY menyediakan dukungan pemeliharaan (maintenance) pasca-peluncuran?",
      answer: "Ya, ASTA DIGITAL AGENCY menyediakan garansi pemeliharaan teknis, monitoring server proaktif, jaminan penanganan kendala sistem, serta SLA dukungan teknis berkelanjutan pasca-rilis.",
    },
  ];

  return (
    <div id="faq" className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <FAQSection
        title={
          language === "en"
            ? "Frequently Asked Questions about ASTA DIGITAL AGENCY (FAQ)"
            : "Pertanyaan Umum seputar Layanan ASTA DIGITAL AGENCY (FAQ)"
        }
        description={
          language === "en"
            ? "Clear, definitive answers regarding ASTA DIGITAL AGENCY development processes, system security, timelines, and technical warranties."
            : "Jawaban langsung dan definitif seputar proses kerja, keamanan sistem, estimasi waktu, serta garansi pemeliharaan dari ASTA DIGITAL AGENCY."
        }
        faqs={faqs}
      />
    </div>
  );
}

