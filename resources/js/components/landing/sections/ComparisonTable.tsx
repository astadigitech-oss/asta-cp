import React from "react";
import { Check, X, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";

interface ComparisonRow {
  parameter: string;
  astaMethod: string;
  traditionalMethod: string;
}

export function ComparisonTable() {
  const { language } = useTranslation();

  const comparisonData: ComparisonRow[] = language === "en" ? [
    {
      parameter: "Code Architecture & Scalability",
      astaMethod: "Clean architecture, modular, and cloud-native designed for long-term scalability without full rewrites.",
      traditionalMethod: "Rigid monolithic codebase, prone to technical debt and difficult to expand.",
    },
    {
      parameter: "AI & Search Bot Readability (GEO & SEO)",
      astaMethod: "Full semantic structure, Schema.org (JSON-LD) explicit facts, and server-side pre-rendered content for instant AI extraction.",
      traditionalMethod: "Pure Client-Side Rendering with empty shell tags, hiding actual content from search and AI bots.",
    },
    {
      parameter: "Security & Vulnerability Auditing",
      astaMethod: "Strict input sanitization, RBAC access control, data encryption, and OWASP Top 10 hardening.",
      traditionalMethod: "Minimal security checks, often addressed only after security incidents occur.",
    },
    {
      parameter: "Maintenance Guarantee & SLA",
      astaMethod: "Contractual post-launch warranty, active uptime monitoring, and guaranteed response SLAs.",
      traditionalMethod: "Support ends immediately upon delivery, without bug-fixing guarantees.",
    },
  ] : [
    {
      parameter: "Arsitektur Kode & Skalabilitas",
      astaMethod: "Clean architecture, modular, dan cloud-native yang siap menangani pertumbuhan bisnis tanpa refactor total.",
      traditionalMethod: "Monolitik kaku, rentan utang teknis tinggi, dan sulit dikembangkan saat beban pengguna meningkat.",
    },
    {
      parameter: "Kesiapan Mesin Pencari & Bot AI (GEO/SEO)",
      astaMethod: "Struktur semantik lengkap, Schema.org (JSON-LD), serta Server-Side Pre-rendering untuk ekstraksi instan bot AI.",
      traditionalMethod: "Client-Side Rendering murni tanpa pre-rendering, menyembunyikan teks konten di balik JavaScript.",
    },
    {
      parameter: "Standar Keamanan & Audit Sistem",
      astaMethod: "Sanitasi input ketat, kontrol akses RBAC berlapis, enkripsi data, dan proteksi dari kerentanan OWASP Top 10.",
      traditionalMethod: "Pengujian keamanan sekunder atau diabaikan, baru diperbaiki setelah terjadi kebocoran data.",
    },
    {
      parameter: "Jaminan Garansi & SLA Dukungan",
      astaMethod: "Garansi pemeliharaan pasca-rilis dengan SLA respon cepat terikat kontrak hukum dan monitoring proaktif.",
      traditionalMethod: "Dukungan berakhir langsung setelah serah terima awal tanpa jaminan perbaikan bug.",
    },
  ];

  return (
    <div className="mt-14 sm:mt-20 w-full max-w-5xl mx-auto px-4">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-3">
          <ShieldCheck className="h-4 w-4" />
          <span>{language === "en" ? "Engineering Benchmark" : "Tolok Ukur Standar"}</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          {language === "en"
            ? "Why Leading Organizations Choose ASTA DIGITAL AGENCY?"
            : "Mengapa Instansi & Korporasi Memilih ASTA DIGITAL AGENCY?"}
        </h3>
        <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed">
          {language === "en"
            ? "Compare how ASTA DIGITAL AGENCY modern engineering standards outperform conventional agency practices:"
            : "Bandingkan bagaimana standar rekayasa modern ASTA DIGITAL AGENCY mengungguli metode agensi konvensional:"}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-gray-200/90 bg-white shadow-[0_10px_35px_rgb(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[620px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80">
                <th className="py-4 px-6 text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider w-[28%]">
                  {language === "en" ? "Evaluation Parameter" : "Parameter Evaluasi"}
                </th>
                <th className="py-4 px-6 text-xs sm:text-sm font-bold text-primary uppercase tracking-wider bg-blue-50/50 w-[42%]">
                  <span className="flex items-center gap-1.5 text-primary">
                    <Check className="h-4 w-4 stroke-[3]" />
                    ASTA DIGITAL AGENCY
                  </span>
                </th>
                <th className="py-4 px-6 text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wider w-[30%]">
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <X className="h-4 w-4" />
                    {language === "en" ? "Traditional Development" : "Metode Tradisional"}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
              {comparisonData.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-4 px-6 font-semibold text-gray-900">
                    {row.parameter}
                  </td>
                  <td className="py-4 px-6 text-gray-800 bg-blue-50/20 leading-relaxed">
                    <strong className="text-gray-900 font-bold block mb-0.5">
                      {row.astaMethod.split(":")[0] || ""}
                    </strong>
                    {row.astaMethod}
                  </td>
                  <td className="py-4 px-6 text-gray-500 leading-relaxed">
                    {row.traditionalMethod}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

