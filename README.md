![Logo](https://miro.medium.com/v2/format:webp/1*ZugOF6FjJDfax1Kwvj5-2Q.png)


# Tutorial



### 1. Clone Repositori GitHub

##### ```git clone https://github.com/smdbngkt/SwissTronik-Tesnet```


### 2. Masuk ke Direktori Proyek

##### ```cd SwissTronik-Tesnet```

### 3. Instalasi Dependensi

##### ```npm install --force```

### 4. Membuat File `.env`

#### Buat file `.env` di dalam direktori proyek Anda dan tambahkan baris berikut ke dalamnya:

##### ```PRIVATE_KEY=yourprivatekey```

### 4. Menjalankan Skrip Hardhat

#### Terakhir, jalankan skrip deploy dan interaksi dengan jaringan Swisstronik menggunakan perintah berikut:

##### ```npx hardhat run scripts/deploy_and_interact.js --network swisstronik```
