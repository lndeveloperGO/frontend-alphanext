# Practice Session Improvements - TODO

## Performance Improvements ✅
- [x] Implementasi question caching system
- [x] Implementasi prefetching untuk soal berikutnya
- [x] Implementasi auto-save dengan debounce (2 detik)
- [x] Implementasi optimistic UI updates

## UX Improvements ✅
- [x] Tambah loading skeleton saat berpindah soal
- [x] Tambah confirmation dialog untuk exit
- [x] Tambah confirmation dialog untuk finish dengan summary
- [x] Tambah progress indicator yang lebih jelas (answered/unanswered/marked)
- [x] Tambah keyboard shortcuts (Arrow keys, 1-5 untuk jawaban, M untuk mark, ? untuk help)
- [x] Perbaiki mobile sidebar UX dengan backdrop
- [x] Tambah visual feedback untuk auto-save status (saving/saved/error)
- [x] Tambah keyboard help dialog
- [x] Tambah badge untuk status soal (terjawab/belum/ditandai)
- [x] Tambah visual hints untuk keyboard shortcuts pada options

## Code Quality ✅
- [x] Better error handling dengan optimistic updates dan revert on error
- [x] Improved type safety dengan update SubmitResponse interface
- [x] Better code organization dengan separated concerns

## Fitur Tambahan yang Sudah Diimplementasi
- [x] Auto-save indicator di header (Menyimpan.../Tersimpan/Gagal)
- [x] Timer dengan warning visual saat < 60 detik
- [x] Progress bar dengan persentase dan jumlah soal
- [x] Loading state untuk navigasi soal
- [x] Improved button labels dalam Bahasa Indonesia
- [x] Better visual feedback untuk selected answers
- [x] Question navigation grid dengan visual indicators
- [x] Mobile-responsive design dengan sidebar toggle

## Testing (Perlu Dilakukan Manual)
- [ ] Test navigasi antar soal (performance - should be instant with cache)
- [ ] Test auto-save functionality (wait 2 seconds after selecting answer)
- [ ] Test keyboard shortcuts (arrows, 1-5, M, ?)
- [ ] Test mobile responsiveness
- [ ] Test confirmation dialogs (exit & finish)
- [ ] Test timer countdown dan auto-submit saat habis
- [ ] Test prefetching (check network tab)
- [ ] Test error handling (disconnect network)

## Catatan Implementasi
- Question caching: Soal yang sudah di-load disimpan di state, navigasi instant
- Prefetching: Soal berikutnya di-load di background saat user membuka soal
- Auto-save: Jawaban otomatis tersimpan 2 detik setelah user memilih
- Optimistic updates: UI langsung update, revert jika API gagal
- Keyboard shortcuts: Meningkatkan kecepatan user dalam menjawab soal
