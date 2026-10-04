import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { setCustomerSession } from "@/lib/auth";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Send, ShieldCheck } from "lucide-react";
import logo from "@/assets/brother-queen-logo.asset.json";
import { useToast } from "@/hooks/use-toast";
import { isTelegram, requestContact, tg, tgReady, tgUser } from "@/lib/telegram";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [inTelegram, setInTelegram] = useState(true);
  const [user, setUser] = useState<ReturnType<typeof tgUser>>(null);

  useEffect(() => {
    tgReady();
    setInTelegram(isTelegram());
    setUser(tgUser());
  }, []);

  const authorize = async (contactResponse?: string, phone?: string) => {
    const webApp = tg();
    const res = await fetch("/api/telegram/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        initData: webApp?.initData ?? "",
        contactResponse: contactResponse ?? "",
        phone: phone ?? "",
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error ?? "Xatolik");
    return data;
  };

  const handleShareContact = async () => {
    if (!isTelegram()) {
      toast({
        title: "Telegram kerak",
        description: "Iltimos, ilovani Telegram bot ichidan oching",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const result = await requestContact();
      if (!result.ok) {
        setLoading(false);
        toast({
          title: "Kontakt ulashilmadi",
          description: "Davom etish uchun raqamingizni ulashing",
          variant: "destructive",
        });
        return;
      }
      const customer = await authorize(result.response, result.contact?.phone_number);
      setCustomerSession(customer);
      tg()?.HapticFeedback?.notificationOccurred?.("success");
      setLocation("/");
    } catch (e: any) {
      toast({
        title: "Xato",
        description: e?.message ?? "Kirishda xatolik yuz berdi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm text-center"
      >
        <img
          src={logo.url}
          alt="Brother&Queen logotipi"
          className="mx-auto w-44 h-44 object-contain mb-5"
        />
        <h1 className="font-display text-3xl text-foreground mb-1">Brother&Queen</h1>
        <p className="text-muted-foreground mb-6 text-sm">
          {user?.first_name
            ? `Salom, ${user.first_name}! Davom etish uchun raqamingizni ulashing.`
            : "Buyurtma berish uchun Telegram orqali kiring"}
        </p>

        {inTelegram ? (
          <>
            <Button
              onClick={handleShareContact}
              disabled={loading}
              className="w-full h-12 rounded-xl text-base font-medium gap-2"
              data-testid="button-share-contact"
            >
              <Send className="w-5 h-5" />
              {loading ? "Kuting..." : "Kontaktni ulashish"}
            </Button>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5" />
              Raqamingiz faqat buyurtma uchun ishlatiladi
            </p>
          </>
        ) : (
          <div className="rounded-2xl bg-muted/60 p-4 text-sm text-muted-foreground">
            Bu ilova Telegram mini-ilovasi sifatida ishlaydi. Iltimos, botimizni oching va{" "}
            <span className="font-semibold text-foreground">"Ochish"</span> tugmasini bosing.
          </div>
        )}
      </motion.div>
    </div>
  );
}
