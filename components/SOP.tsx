"use client";

export default function SOP() {
  return (
    <section className="w-full rounded-3xl border border-zinc-200 bg-zinc-50 p-6 text-left shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="mb-4 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
        Komponen SOP
      </h2>
      <p className="mb-4 text-zinc-600 dark:text-zinc-400">
        Ini adalah contoh komponen SOP yang bisa kamu kembangkan kembali.
      </p>
      <ol className="list-decimal space-y-3 pl-5 text-zinc-700 dark:text-zinc-300">
        <li>Siapkan struktur halaman utama.</li>
        <li>Tambahkan komponen-komponen sesuai alur aplikasi.</li>
        <li>Jalankan kembali `npm run dev` untuk verifikasi.</li>
      </ol>
    </section>
  );
}
