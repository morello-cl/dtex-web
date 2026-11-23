import { redirect } from "next/navigation";

// Ruta antigua: el detalle ahora es un panel sobre la lista.
export default async function AbonoPage({ params }: { params: Promise<{ uuid: string }> }) {
  redirect(`/portal/abonos?abono=${encodeURIComponent((await params).uuid)}`);
}
