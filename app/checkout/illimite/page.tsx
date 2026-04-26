import { redirect } from "next/navigation";

/** Ancienne URL checkout : redirige vers l'offre 15 rapports / mois. */
export default function CheckoutIllimiteRedirectPage() {
  redirect("/checkout/pack-15");
}
