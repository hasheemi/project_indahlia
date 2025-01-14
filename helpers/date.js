function formatTimestamp(timestamp) {
  const date = new Date(Number(timestamp));
  const bulan = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const tanggal = date.getDate();
  const namaBulan = bulan[date.getMonth()];
  const tahun = date.getFullYear();
  return `${tanggal} ${namaBulan} ${tahun}`;
}
module.exports = formatTimestamp;
