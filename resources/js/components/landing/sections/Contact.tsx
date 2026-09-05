import { useState } from "react";
import { motion } from "motion/react";
import { Mail, PhoneCall, MapPin, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTranslation } from "@/i18n/useTranslation";
import axios from "axios";
import { Eyebrow } from "../common";

export function Contact() {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [mountedAt] = useState(() => Date.now());

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      await axios.post("/api/contact", {
        name: formData.get("name"),
        organization: formData.get("org"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        message: formData.get("message"),
        website_hp: formData.get("website_hp"),
        _timer: formData.get("_timer"),
      });

      form.reset();
      toast.success(t("contact.form.success_title"), {
        description: t("contact.form.success_desc"),
      });
    } catch (error) {
      const message = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : t("contact.form.error_desc");
      toast.error(t("contact.form.error_title"), {
        description: message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="kontak" className="relative py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-[1400px] xl:max-w-[1536px] 2xl:max-w-[1680px] 3xl:max-w-[1840px] px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-[36px] border border-white/60 bg-white/80 shadow-glass backdrop-blur-md"
        >
          <div className="grid lg:grid-cols-12">
            <div className="relative overflow-hidden gradient-hero p-10 text-primary-foreground lg:col-span-5 lg:p-12">
              <div className="pointer-events-none absolute inset-0 opacity-30 gradient-mesh" />
              <div className="relative">
                <Eyebrow>
                  <div className="text-white">
                    {t("contact.eyebrow")}
                  </div>
                </Eyebrow>
                <h2 className="mt-5 font-display text-3xl font-bold leading-tight sm:text-4xl">
                  {t("contact.title")}
                </h2>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-white/80">
                  {t("contact.description")}
                </p>
                <ul className="mt-10 space-y-6">
                  <li className="flex items-center gap-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl glass-dark">
                      <Mail className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
                        {t("contact.info_email")}
                      </div>
                      <div className="mt-0.5 text-sm font-semibold text-white">
                        astadigitech@gmail.com
                      </div>
                    </div>
                  </li>
                  <li className="flex items-center gap-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl glass-dark">
                      <PhoneCall className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
                        {t("contact.info_phone")}
                      </div>
                      <div className="mt-0.5 text-sm font-semibold text-white">
                        +62 815 7822 3564
                      </div>
                    </div>
                  </li>
                  <li className="flex items-center gap-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl glass-dark">
                      <MapPin className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
                        {t("contact.info_office")}
                      </div>
                      <div className="mt-0.5 text-sm font-semibold leading-snug text-white">
                        {t("contact.info_office_address")}
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <form onSubmit={onSubmit} className="p-10 lg:col-span-7 lg:p-12">
              {/* Anti-Spam Honeypot & Timer Fields */}
              <input type="text" name="website_hp" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden opacity-0 absolute -z-10 pointer-events-none h-0 w-0" />
              <input type="hidden" name="_timer" value={mountedAt} />
              <h3 className="font-display text-2xl font-bold text-primary">{t("contact.form_title")}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {t("contact.form_description")}
              </p>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("contact.form.full_name")}</Label>
                  <Input id="name" name="name" required placeholder={t("contact.form.placeholder_first_name")} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org">{t("contact.form.organization")}</Label>
                  <Input id="org" name="org" placeholder={t("contact.form.placeholder_organization")} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("contact.form.email")}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder={t("contact.form.placeholder_email")}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("contact.form.phone")}</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    maxLength={20}
                    placeholder={t("contact.form.placeholder_phone")}
                    className="rounded-xl"
                    onKeyDown={(e) => {
                      if (
                        e.key === "Backspace" ||
                        e.key === "Delete" ||
                        e.key === "ArrowLeft" ||
                        e.key === "ArrowRight" ||
                        e.key === "ArrowUp" ||
                        e.key === "ArrowDown" ||
                        e.key === "Tab" ||
                        e.key === "Enter" ||
                        e.ctrlKey ||
                        e.metaKey
                      ) {
                        return;
                      }
                      if (!/[\d+\s-]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onInput={(e) => {
                      const target = e.currentTarget;
                      let val = target.value.replace(/[^\d+\s-]/g, "");
                      if (val.indexOf("+") > 0) {
                        val = (val.startsWith("+") ? "+" : "") + val.replace(/\+/g, "");
                      }
                      target.value = val;
                    }}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="message">{t("contact.form.message")}</Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    placeholder={t("contact.form.placeholder_message")}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={submitting}
                size="lg"
                className="mt-8 h-12 w-full rounded-full gradient-accent text-accent-foreground shadow-glass sm:w-auto sm:px-8 cursor-pointer"
              >
                {submitting ? (
                  t("contact.form.submitting")
                ) : (
                  <div className="flex items-center justify-center gap-1 text-white">
                    {t("contact.form.submit")} <MessageSquare className="ml-1.5 h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

