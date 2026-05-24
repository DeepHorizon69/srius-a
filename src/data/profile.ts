export const PROFILE = {
  fullName: 'Abbas Abdurrohman Al Tsauri',
  shortName: 'Abbas',
  signName: 'ALSA',
  role: 'Siswa TJKT SMK MUHAMMADIYAH 1 Surabaya',
  tagline:
    'Tertarik pada komputer, sains & fisika, teknologi, elektronika, dan IoT.',
  location: 'SMK MUHAMMADIYAH 1 Surabaya',
  email: 'razoratstudy@gmail.com',
} as const;

export const cvDownload = {
  path: 'cv/Abbas-Abdurrohman-CV.pdf',
  fileName: 'Abbas-Abdurrohman-CV.pdf',
} as const;

/** Ubah ke `false` untuk mematikan easter egg Devourer of Gods. */
export const DEVOURER_EASTER_EGG_ENABLED = true;

export const typewriterWords = [
  PROFILE.role,
  'IoT Enthusiast',
  'System Administrator',
  'Tech Explorer',
] as const;

export const skills = [
  {
    icon: 'fa-laptop-code',
    title: 'Komputer & Networking',
    desc: 'Dasar komputer, jaringan, dan teknologi informasi.',
  },
  // {
  //   icon: 'fa-atom',
  //   title: 'Sains & Fisika',
  //   desc: 'Memahami konsep fisika yang mendukung teknologi dan penerbangan.',
  // },
  {
    icon: 'fa-microchip',
    title: 'Elektronika & IoT',
    desc: 'Dasar rangkaian elektronik dan perangkat IoT sederhana.',
  },
  {
    icon: 'fa-camera',
    title: 'Photography',
    desc: 'Tertarik pada fotografi dan pengambilan gambar.',
  },
  {
    icon: 'fa-solid fa-server',
    title: 'System Administration',
    desc: 'Mengelola dan memelihara infrastruktur server.',
  },
] as const;

export type MissionLink = {
  href: string;
  label: string;
};

export type Mission = {
  title: string;
  type: string;
  description: string;
  tech: readonly string[];
  image?: string;
  links: readonly MissionLink[];
};

/** image: '' = placeholder kosong; isi path mis. '/projects/nama.jpg' setelah upload ke public/projects/ */
export const missions = [
  {
    title: 'Air Quality Monitor',
    type: 'IoT Project',
    description:
      'Merancang dan membuat alat untuk mengukur kualitas udara di sekitar.',
    tech: ['Arduino', 'Sensor', 'IoT'],
    image: '',
    links: [{ label: 'Dokumentasi', href: 'https://github.com/DeepHorizon69' }],
  },
  {
    title: 'Web Design',
    type: 'Eksperimen',
    description:
      'Membuat desain web untuk memudahkan pengguna dalam mengakses informasi.',
    tech: ['HTML', 'CSS', 'JavaScript', 'Astro'],
    image: '',
    links: [],
  },
  {
    title: 'Prototype Game Roblox',
    type: 'Game Development',
    description:
      'Membuat prototype game sederhana untuk mengasah kemampuan pemrograman.',
    tech: ['Lua'],
    image: '',
    links: [],
  },
  {
    title: 'Home Server',
    type: 'System Administration',
    description:
      'Membuat home server sederhana menggunakan komponen sederhana.',
    tech: ['Proxmox', 'Docker', 'Linux', 'Tuneling'],
    image: '',
    links: [],
  },
] as const satisfies readonly Mission[];

export const timelines = [
  {
    year: '2015',
    title: 'Siswa SDS Printis Tanjung Mandiri',
    desc: 'Membangun fondasi pendidikan dasar dan mulai menumbuhkan rasa ingin tahu pada ilmu pengetahuan.',
  },
  {
    year: '2021',
    title: 'Siswa MTsN 7 Jombang',
    desc: 'Menempuh pendidikan menengah pertama, di mana minat terhadap dunia teknologi dan komputer mulai berkembang secara signifikan.',
  },
  {
    year: '2024-Present',
    title: 'Siswa SMK MUHAMMADIYAH 1 Surabaya',
    desc: 'Fokus mendalami keahlian vokasi di bidang Teknik Jaringan Komputer dan Telekomunikasi (TJKT), mengeksplorasi IoT, serta administrasi sistem.',
  },
] as const;

export type Experience = {
  period: string;
  title: string;
  org: string;
  desc: string;
};

/** Ubah ke `true` untuk menampilkan section Pengalaman (nav, scroll spy, halaman). */
export const EXPERIENCES_ENABLED = false;

const experienceEntries: Experience[] = [
  // Contoh — hapus komentar dan isi saat EXPERIENCES_ENABLED = true:
  // {
  //   period: '2024',
  //   title: 'Magang / proyek sekolah',
  //   org: 'SMK Muhammadiyah 1 Surabaya',
  //   desc: 'Deskripsi singkat pengalaman.',
  // },
];

export const experiences: readonly Experience[] = EXPERIENCES_ENABLED
  ? experienceEntries
  : [];

export const sectionCopy = {
  projects: {
    eyebrow: 'Proyek',
    title: 'Yang Sedang Dikerjakan',
    subtitle:
      'Kumpulan eksperimen dan proyek yang mengasah kemampuan TJKT — dari IoT hingga administrasi sistem.',
  },
  experience: {
    eyebrow: 'Pengalaman',
    title: 'Perjalanan & Aktivitas',
    subtitle:
      'Ringkasan pengalaman belajar dan eksplorasi teknologi di sekolah maupun proyek mandiri.',
  },
  education: {
    eyebrow: 'Pendidikan',
    title: 'Riwayat Sekolah',
    subtitle: 'Perjalanan pendidikan dari SD hingga SMK jurusan TJKT.',
  },
} as const;

export const contactInfo = {
  title: 'Hubungi Saya',
  description:
    'Tertarik kolaborasi proyek IoT, web, atau teknologi? Kirim pesan — saya akan membalas secepatnya.',
  region: 'Indonesia',
} as const;

/** Tombol di panel Hubungi Saya (ContactPanel) */
export const socialLinks = [
  {
    icon: 'fa-discord',
    label: 'Discord',
    href: 'https://discord.com/users/937106293972430898',
  },
  {
    icon: 'fa-github',
    label: 'GitHub',
    href: 'https://github.com/DeepHorizon69',
  },
  {
    icon: 'fa-instagram',
    label: 'Instagram',
    href: 'https://www.instagram.com/aizypz?igsh=MWluM2JuZXUzbnBtYw==',
  },
  {
    icon: 'fa-steam',
    label: 'Steam',
    href: 'https://steamcommunity.com/profiles/76561199367838664/',
  },
  {
    icon: 'fa-whatsapp',
    label: 'WhatsApp',
    href: 'https://wa.me/620881027467524',
  },
] as const;

export const notes = {
  hobbies: [
    'Ngoprek komputer dan jaringan.',
    'Membaca atau mendengarkan berita sains atau teknologi.',
    'Mengambil gambar random lalu diedit.',
  ],
  extraLinks: [{ title: 'Coming soon', url: '#' }],
} as const;

/** Section IDs for anchor navigation & scroll spy */
export const sections = [
  { id: 'hero', label: 'Beranda' },
  { id: 'skills', label: 'Keahlian' },
  { id: 'about', label: 'Tentang' },
  { id: 'projects', label: 'Proyek' },
  ...(experiences.length > 0 ? [{ id: 'experience' as const, label: 'Pengalaman' as const }] : []),
  { id: 'education', label: 'Pendidikan' },
  { id: 'contact', label: 'Kontak' },
] as const;
