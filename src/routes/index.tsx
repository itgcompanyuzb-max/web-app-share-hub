import { createFileRoute } from "@tanstack/react-router";
import { ComoMount } from "@/como-mount";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Brother&Queen — Menyu va buyurtmalar" },
      {
        name: "description",
        content:
          "Brother&Queen menyusi va buyurtmalar. Telegram orqali buyurtma bering va yetkazib berishni kuzating.",
      },
      { property: "og:title", content: "Brother&Queen — Menyu va buyurtmalar" },
      {
        property: "og:description",
        content: "Brother&Queen menyusi va buyurtmalar. Telegram orqali buyurtma bering.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ComoMount,
});
