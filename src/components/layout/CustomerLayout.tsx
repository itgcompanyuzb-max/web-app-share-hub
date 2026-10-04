import React from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Home, ShoppingCart, Heart, User, Clock } from "lucide-react";
import { useGetCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { StickyBarProvider, useStickyBar } from "@/lib/stickyBar";

function LayoutInner({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: cartItems } = useGetCart({ query: { queryKey: getGetCartQueryKey() } });
  const { bottomBar } = useStickyBar();

  const cartCount = cartItems?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const navItems = [
    { href: "/", icon: Home, label: "Katalog" },
    { href: "/cart", icon: ShoppingCart, label: "Savat", badge: cartCount },
    { href: "/orders", icon: Clock, label: "Buyurtma" },
    { href: "/liked", icon: Heart, label: "Sevimli" },
    { href: "/profile", icon: User, label: "Profil" },
  ];

  return (
    <div className="flex justify-center bg-background min-h-dvh">
      <div
        className="w-full max-w-md relative flex flex-col shadow-2xl bg-background h-dvh overflow-hidden"
      >
        {/* Scrollable content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location}
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="min-h-0 flex-1 overflow-y-auto pb-28"
          >
            {children}
          </motion.div>
        </AnimatePresence>

        {/* Sticky bottom bar — sahifadan kelgan kontent (masalan ProductDetail) */}
        {bottomBar && (
          <div className="absolute left-0 right-0 z-40 px-4 pb-2 bottom-20">
            {bottomBar}
          </div>
        )}

        {/* iOS 26-style Floating Pill Tab Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-50 flex justify-center pb-[max(1rem,env(safe-area-inset-bottom))] px-2 pointer-events-none">
          <LayoutGroup>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex items-center justify-between w-full max-w-sm gap-0 px-1 py-1 rounded-lg border border-border bg-card shadow-lg pointer-events-auto"
            >

              {navItems.map((item) => {
                const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    data-testid={`nav-${item.label.toLowerCase()}`}
                    className="relative z-10 flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-2 transition-colors"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/20"
                        transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.9 }}
                      />
                    )}

                    <motion.div
                      className="relative"
                      animate={isActive ? { scale: 1.08 } : { scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <Icon
                        className={`w-[22px] h-[22px] transition-colors duration-200 ${
                          isActive ? "text-primary" : "text-muted-foreground"
                        }`}
                        strokeWidth={isActive ? 2.3 : 1.9}
                      />
                      {item.badge ? (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1.5 -right-2 bg-destructive text-destructive-foreground text-[9px] font-bold px-1 py-0.5 rounded-full min-w-[16px] text-center leading-none"
                        >
                          {item.badge > 99 ? "99+" : item.badge}
                        </motion.span>
                      ) : null}
                    </motion.div>

                    <motion.span
                      animate={isActive ? { opacity: 1 } : { opacity: 0.55 }}
                      transition={{ duration: 0.2 }}
                      className={`text-[10px] font-semibold leading-none transition-colors duration-200 ${
                        isActive ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {item.label}
                    </motion.span>
                  </Link>
                );
              })}
            </motion.div>
          </LayoutGroup>
        </div>
      </div>
    </div>
  );
}

export function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <StickyBarProvider>
      <LayoutInner>{children}</LayoutInner>
    </StickyBarProvider>
  );
}
