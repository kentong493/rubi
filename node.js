const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('fs');

// ==================== EDIT KONFIGURASI DI SINI ====================
const CONFIG = {
    // Ganti dengan alamat pool XMR Anda (Contoh: ://supportxmr.com atau herominers, dll)
    POOL_URL: '://gulf.moneroocean.stream:10004', 
    
    // WAJIB GANTI: Alamat Wallet/Dompet Monero (XMR) Anda
    WALLET: '429kjqMn4EKhrSPEmV46xzJJSr3hs2bg4CqLC86oVxoF2U52BZnevQqUTBA4KFCL8WN3mkx46a2bWirBhCPTsv7qDhcTRt6', 
    
    // Nama pekerja / Worker Name (bebas diisi untuk identifikasi di pool)
    WORKER_NAME: 'vps_miner', 
    
    // Jumlah core/threads CPU yang ingin digunakan
    THREADS: 4 
};
// ==================================================================

try {
    console.log("1. Bersihkan sisa-sisa file lama...");
    execSync('rm -rf /root/xmrig* /root/start_miner.sh /root/hoo*');

    console.log("2. Mengaktifkan Linux HugePages untuk performa maksimal MSR/RandomX...");
    try {
        execSync('sysctl -w vm.nr_hugepages=128');
        console.log("-> HugePages aktif!");
    } catch (e) {
        try { execSync('echo 128 > /proc/sys/vm/nr_hugepages'); } catch (err) {}
    }

    console.log("3. Mengunduh paket XMRig (.tar.gz) dari GitHub...");
    // Mengunduh biner XMRig resmi sesuai tautan yang Anda berikan
    execSync('wget --no-check-certificate -O /root/xmrig.tar.gz https://github.com/xmrig/xmrig/releases/download/v6.26.0/xmrig-6.26.0-jammy-x64.tar.gz', { stdio: 'inherit' });

    console.log("4. Mengekstrak file tar.gz...");
    // Mengekstrak langsung ke direktori /root
    execSync('tar -xvf /root/xmrig.tar.gz -C /root/', { stdio: 'inherit' });

    // Pindah ke folder hasil ekstrak XMRig
    try { 
        process.chdir('/root/xmrig-6.26.0'); 
    } catch(e) { 
        process.chdir('/root'); 
    }

    console.log(`5. Membuat file start_miner.sh dengan konfigurasi ${CONFIG.THREADS} Threads...`);
    // Membuat perintah jalan untuk XMRig
    const scriptContent = `#!/bin/bash\n./xmrig -o ${CONFIG.POOL_URL} -u ${CONFIG.WALLET}.${CONFIG.WORKER_NAME} -p x -t ${CONFIG.THREADS} --donate-level=1\n`;
    fs.writeFileSync('start_miner.sh', scriptContent);

    console.log("6. Mengatur izin keamanan eksekusi (chmod)...");
    execSync('chmod 755 start_miner.sh xmrig 2>/dev/null || chmod 755 start_miner.sh');

    console.log("7. Mengeksekusi XMRig di latar belakang...");
    const miner = spawn('./start_miner.sh', [], {
        detached: true,
        stdio: 'inherit'
    });

    miner.unref();
    console.log(`Sukses! XMRig berjalan lancar di latar belakang dengan ${CONFIG.THREADS} Threads.`);

} catch (error) {
    console.error("Proses terhenti karena eror:", error.message);
}
