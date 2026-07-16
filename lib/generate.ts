export function generateNoDokumen(jenis: string = 'SPO', unit: string = 'UMUM', count: number = 1) {
  const year = new Date().getFullYear();
  const num = String(count).padStart(3, '0');
  const kodeJenis = jenis === 'PROGRAM'? 'PG' : jenis === 'PANDUAN'? 'PD' : 'SPO';
  const cleanUnit = unit? unit.toUpperCase() : 'UMUM';
  return `${num}/${kodeJenis}/B/${cleanUnit}/RS-PJ/${year}`;
}

// buat kompatibel sama kode lama yang manggil 1 argumen
export function generateNoDokumenSimple(count: number) {
  return generateNoDokumen('SPO', 'UMUM', count);
}