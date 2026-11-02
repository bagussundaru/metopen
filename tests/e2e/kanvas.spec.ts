import { test, expect } from "@playwright/test";

test.describe("Kanvas Topik Tesis - UAT Skenario Tugas Dosen Pascasarjana", () => {
  test("Alur Lengkap Pembuatan Kanvas Tesis, Validasi Rule-Based, dan Peta Literatur", async ({ page }) => {
    // 1. Kunjungi Beranda
    await page.goto("/");
    await expect(page.locator("text=Susun & Validasi Kanvas Topik Tesis")).toBeVisible();
    await expect(page.locator("text=Standar Pascasarjana")).toBeVisible();

    // 2. Muat Contoh Draf Kanvas Bawaan
    await page.locator('button:has-text("Muat Contoh Tesis")').click();
    await page.waitForURL(/\/editor\/.+/);

    // 3. Verifikasi Mode Rule-Based Aktif
    await expect(page.locator("text=Mode Rule-Based Aktif (Fitur AI Opsional)")).toBeVisible();

    // 4. Verifikasi Langkah 1 (Judul)
    await expect(page.locator("text=Langkah 1: Perumusan Judul Sementara")).toBeVisible();
    const subjectInput = page.locator('input[placeholder*="balok beton bertulang"]');
    await expect(subjectInput).toHaveValue("balok beton bertulang mutu tinggi");
    const interventionInput = page.locator('input[placeholder*="substitusi 15–30%"]');
    await expect(interventionInput).toHaveValue("substitusi 15-30% fly ash tipe F teraktivasi alkali");
    const outcomeInput = page.locator('input[placeholder*="kuat lentur"]');
    await expect(outcomeInput).toHaveValue("kuat lentur (MPa) dan daktilitas lendutan");

    // 5. Verifikasi Panel Validasi Live di Kanan
    await expect(page.locator("text=Evaluasi Validasi Dosen")).toBeVisible();
    await expect(page.locator("text=Siap Diajukan").first()).toBeVisible();

    // 6. Navigasi ke Langkah 2 (Latar Belakang & Gap 3 Kalimat)
    await page.locator('button:has-text("Lanjut ke Langkah 2")').click();
    await expect(page.locator("text=Langkah 2: Latar Belakang & Gap Sintesis")).toBeVisible();
    await expect(page.locator("text=Daftar Literatur Pendukung Sintesis")).toBeVisible();
    await expect(page.locator("text=Hardjito, D., & Rangan, B. V.")).toBeVisible();

    // 7. Navigasi ke Langkah 3 (Pertanyaan Riset & Anti Novelty Trap)
    await page.locator('button:has-text("Lanjut ke Langkah 3")').click();
    await expect(page.locator("text=Langkah 3: Pertanyaan Riset Utama & Pencegah Novelty Semu")).toBeVisible();

    // 8. Navigasi ke Langkah 4 (Metode & Data)
    await page.locator('button:has-text("Lanjut ke Langkah 4")').click();
    await expect(page.locator("text=Langkah 4: Metode Inti & Kepastian Kebutuhan Data")).toBeVisible();
    await expect(page.locator("text=SNI 2847:2019")).toBeVisible();

    // 9. Navigasi ke Langkah 5 (Rubrik Kelayakan & Radar Chart)
    await page.locator('button:has-text("Lanjut ke Langkah 5")').click();
    await expect(page.locator("text=Langkah 5: Validasi Kelayakan & Rubrik Evaluasi Dosen")).toBeVisible();
    await expect(page.locator("text=Siap Diajukan ke Dosen Pembimbing")).toBeVisible();

    // 10. Uji Tab Peta Literatur (VOSviewer / Scopus)
    await page.locator('button:has-text("Peta Literatur (VOSviewer / Scopus)")').click();
    await expect(page.locator("text=Peta Literatur Bibliometrik (Pencarian VOSviewer & Scopus)")).toBeVisible();
    await expect(page.locator('button:has-text("Cari & Tampilkan Peta VOSviewer")')).toBeVisible();
    
    // Uji Mode Berkas VOSviewer
    await page.locator('button:has-text("Unggah Berkas VOSviewer (.map & .net)")').click();
    await page.locator('button:has-text("Muat Sampel VOSviewer Sipil")').click();
    await expect(page.locator("text=8 kata kunci • 11 relasi tautan")).toBeVisible();
    await expect(page.locator("text=Analisis Kandidat Research Gap")).toBeVisible();

    // 11. Uji Halaman Pratinjau Cetak A4
    const printLink = page.locator('a:has-text("Pratinjau Cetak A4")');
    await expect(printLink).toBeVisible();
  });

  test("Pendeteksian Jebakan Lokasi Baru & Sindrom Software Sesuai Evaluasi Dosen", async ({ page }) => {
    await page.goto("/");
    // Buat Kanvas Baru Kosong
    await page.locator('button:has-text("Buat Kanvas Baru")').click();
    await page.waitForURL(/\/editor\/.+/);

    // Buka Langkah 3
    await page.locator('button:has-text("Pertanyaan Riset")').click();
    const rqTextarea = page.locator('textarea').first();

    // Masukkan pertanyaan riset jebakan lokasi & software
    await rqTextarea.fill("Bagaimana analisis lendutan jembatan Kali Progo menggunakan software SAP2000?");

    // Verifikasi deteksi jebakan lokasi
    await expect(
      page.locator("text=Terdeteksi indikasi 'Jebakan Lokasi Baru' pada rumusan masalah.")
    ).toBeVisible();

    // Verifikasi deteksi sindrom software
    await expect(
      page.locator("text=Terdeteksi indikasi 'Sindrom Perangkat Lunak' pada rumusan masalah.")
    ).toBeVisible();
  });
});
