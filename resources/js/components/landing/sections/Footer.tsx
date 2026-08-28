import { Instagram, Mail, LinkedinIcon, MapPin, Clock } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import logo from "@/assets/logo/LOGO PUTIH.png";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="relative overflow-hidden bg-primary text-primary-foreground">
      <svg
        className="absolute inset-x-0 top-0 h-16 w-full -translate-y-px text-primary"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
      >
        <path
          d="M0,40 C240,110 480,0 720,50 C960,110 1200,20 1440,60 L1440,0 L0,0 Z"
          fill="var(--background)"
        />
        <path
          d="M0,80 C240,20 480,110 720,60 C960,10 1200,80 1440,50 L1440,0 L0,0 Z"
          fill="var(--surface)"
          opacity="0.35"
        />
      </svg>

      <div className="relative mx-auto max-w-[1400px] xl:max-w-[1536px] 2xl:max-w-[1680px] 3xl:max-w-[1840px] px-4 pt-20 pb-10 sm:px-6 sm:pt-24 lg:px-10 xl:px-12 2xl:px-16">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2.5">
              <img src={logo} alt="Asta Digital Agency" className="mb-4 h-auto w-[135px] p-1" />
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
              {t("footer.description")}
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://www.instagram.com/astadigitalagency/"
                target="_blank"
                rel="noreferrer"
                className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-all hover:bg-white/20 hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="mailto:astadigitech@gmail.com"
                className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-all hover:bg-white/20 hover:scale-110"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
              <a
                href="https://www.linkedin.com/in/asta-digital-agency-b9441637a/"
                target="_blank"
                rel="noreferrer"
                className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-all hover:bg-white/20 hover:scale-110"
                aria-label="LinkedIn"
              >
                <LinkedinIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:col-span-8">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent">
                <MapPin className="h-3.5 w-3.5" />
                {t("footer.office_title")}
              </div>
              <p className="mt-4 text-xs leading-relaxed text-white/80">
                {t("contact.info_office_address")}
              </p>
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                {t("footer.solutions_title")}
              </div>
              <ul className="mt-4 space-y-2 text-xs text-white/80">
                <li>{t("footer.sol_consultant")}</li>
                <li>{t("footer.sol_services")}</li>
                <li>{t("footer.sol_web")}</li>
                <li>{t("footer.sol_mobile")}</li>
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent">
                <Clock className="h-3.5 w-3.5" />
                {t("footer.hours_title")}
              </div>
              <ul className="mt-4 space-y-2 text-xs text-white/80">
                <li>{t("footer.hours_weekdays")}</li>
                <li>{t("footer.hours_saturday")}</li>
                <li>{t("footer.hours_sunday")}</li>
              </ul>
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                {t("footer.contact_title")}
              </div>
              <ul className="mt-4 space-y-2 text-xs text-white/80">
                <li><strong className="text-white">Email:</strong> astadigitech@gmail.com</li>
                <li><strong className="text-white">Telp/WA:</strong> +62 815 7822 3564</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/55 sm:flex-row">
          <div>{t("footer.copyright")}</div>
        </div>
      </div>
    </footer>
  );
}

