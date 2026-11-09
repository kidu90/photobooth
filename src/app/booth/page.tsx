import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BoothFlow from "@/components/booth/BoothFlow";

export const metadata: Metadata = {
  title: "Booth — Pose",
  description: "Squeeze in, take four shots, and get your photo strip.",
};

export default function BoothPage() {
  return (
    <>
      <SiteHeader showCta={false} />
      <main id="main">
        <BoothFlow />
      </main>
      <SiteFooter />
    </>
  );
}
