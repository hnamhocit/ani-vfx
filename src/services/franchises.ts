import type { Anime, AnimeRelationItem, SeasonInfo } from "@/types/anime";

// Curated metadata for franchise seasons so they never fallback to fake/wrong anime
export const CURATED_ANIME_MAP: Record<number, Anime> = {
  // Jujutsu Kaisen Culling Game (Upcoming)
  57658: {
    mal_id: 57658,
    url: "https://myanimelist.net/anime/57658/Jujutsu_Kaisen__Shimotsuki-hen",
    images: {
      jpg: {
        image_url: "",
        small_image_url: "",
        large_image_url: "",
      },
      webp: {
        image_url: "",
        small_image_url: "",
        large_image_url: "",
      },
    },
    trailer: {
      youtube_id: null,
      url: null,
      embed_url: null,
      images: {
        image_url: null,
        small_image_url: null,
        medium_image_url: null,
        large_image_url: null,
        maximum_image_url: null,
      },
    },
    title: "Jujutsu Kaisen: Shimotsuki-hen (Culling Game)",
    title_english: "Jujutsu Kaisen: Culling Game Arc",
    title_japanese: "呪術廻戦 死滅回游",
    type: "TV",
    source: "Manga",
    episodes: null,
    status: "Not yet aired",
    airing: false,
    score: null,
    scored_by: null,
    rank: null,
    popularity: 1450,
    members: 185000,
    favorites: 3200,
    synopsis:
      "Phần tiếp theo của anime Jujutsu Kaisen chuyển thể từ Arc Culling Game (Tử Diệt Hồi Du) của manga Gege Akutami. Bộ phim hiện đang trong giai đoạn tiền kỳ sản xuất bởi studio MAPPA và chưa công bố ngày phát sóng cụ thể.",
    genres: [
      { mal_id: 1, type: "anime", name: "Action", url: "" },
      { mal_id: 10, type: "anime", name: "Fantasy", url: "" },
      { mal_id: 37, type: "anime", name: "Supernatural", url: "" },
    ],
    studios: [{ mal_id: 569, type: "anime", name: "MAPPA", url: "" }],
  },
  // Jujutsu Kaisen 0 Movie
  48561: {
    mal_id: 48561,
    url: "https://myanimelist.net/anime/48561/Jujutsu_Kaisen_0_Movie",
    images: {
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/1121/119044.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1121/119044t.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1121/119044l.jpg",
      },
      webp: {
        image_url: "https://cdn.myanimelist.net/images/anime/1121/119044.webp",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1121/119044t.webp",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1121/119044l.webp",
      },
    },
    trailer: {
      youtube_id: "O6qvieeqBRQ",
      url: "https://www.youtube.com/watch?v=O6qvieeqBRQ",
      embed_url:
        "https://www.youtube-nocookie.com/embed/O6qvieeqBRQ?enablejsapi=1&wmode=opaque&autoplay=1",
      images: {
        image_url: null,
        small_image_url: null,
        medium_image_url: null,
        large_image_url: null,
        maximum_image_url: null,
      },
    },
    title: "Jujutsu Kaisen 0 Movie",
    title_english: "Jujutsu Kaisen 0",
    title_japanese: "劇場版 呪術廻戦 0",
    type: "Movie",
    source: "Manga",
    episodes: 1,
    status: "Finished Airing",
    airing: false,
    score: 8.48,
    scored_by: 680000,
    rank: 140,
    popularity: 95,
    members: 1100000,
    favorites: 24500,
    synopsis:
      "Yuta Okkotsu là một nam sinh trung học bị ám bởi linh hồn Rika Orimoto - người bạn thuở ấu thơ đã qua đời trong một vụ tai nạn thảm khốc. Sau khi được chú thuật sư Satoru Gojo mời vào trường Chú Thuật Tokyo, Yuta bắt đầu hành trình kiểm soát nguồn sức mạnh khổng lồ của mình.",
    genres: [
      { mal_id: 1, type: "anime", name: "Action", url: "" },
      { mal_id: 10, type: "anime", name: "Fantasy", url: "" },
    ],
    studios: [{ mal_id: 569, type: "anime", name: "MAPPA", url: "" }],
  },
  // Kimetsu no Yaiba Movie Mugen Ressha-hen
  40456: {
    mal_id: 40456,
    url: "https://myanimelist.net/anime/40456",
    images: {
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/1703/107995.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1703/107995t.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1703/107995l.jpg",
      },
      webp: {
        image_url: "https://cdn.myanimelist.net/images/anime/1703/107995.webp",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1703/107995t.webp",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1703/107995l.webp",
      },
    },
    trailer: {
      youtube_id: "bFwdl2PPPZ8",
      url: "https://www.youtube.com/watch?v=bFwdl2PPPZ8",
      embed_url:
        "https://www.youtube-nocookie.com/embed/bFwdl2PPPZ8?enablejsapi=1&wmode=opaque&autoplay=1",
      images: {
        image_url: null,
        small_image_url: null,
        medium_image_url: null,
        large_image_url: null,
        maximum_image_url: null,
      },
    },
    title: "Kimetsu no Yaiba Movie: Mugen Ressha-hen",
    title_english: "Demon Slayer: Kimetsu no Yaiba - The Movie: Mugen Train",
    title_japanese: "劇場版 鬼滅の刃 無限列車編",
    type: "Movie",
    source: "Manga",
    episodes: 1,
    status: "Finished Airing",
    airing: false,
    score: 8.61,
    scored_by: 890000,
    rank: 82,
    popularity: 64,
    members: 1420000,
    favorites: 34000,
    synopsis:
      "Sau khóa phục hồi tại Dinh thự Hồ Điệp, Tanjiro cùng Nezuko, Zenitsu và Inosuke lên Chuyến Tàu Vô Tận để hội quân cùng Viêm Trụ Kyojuro Rengoku điều tra vụ mất tích bí ẩn của hơn 40 hành khách.",
    genres: [
      { mal_id: 1, type: "anime", name: "Action", url: "" },
      { mal_id: 10, type: "anime", name: "Fantasy", url: "" },
    ],
    studios: [{ mal_id: 43, type: "anime", name: "ufotable", url: "" }],
  },
  // Kimetsu no Yaiba Yuukaku-hen (Phần 2)
  47778: {
    mal_id: 47778,
    url: "https://myanimelist.net/anime/47778",
    images: {
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/1908/120036.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1908/120036t.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1908/120036l.jpg",
      },
      webp: {
        image_url: "https://cdn.myanimelist.net/images/anime/1908/120036.webp",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1908/120036t.webp",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1908/120036l.webp",
      },
    },
    trailer: {
      youtube_id: "0nvn6bE3eag",
      url: "https://www.youtube.com/watch?v=0nvn6bE3eag",
      embed_url:
        "https://www.youtube-nocookie.com/embed/0nvn6bE3eag?enablejsapi=1&wmode=opaque&autoplay=1",
      images: {
        image_url: null,
        small_image_url: null,
        medium_image_url: null,
        large_image_url: null,
        maximum_image_url: null,
      },
    },
    title: "Kimetsu no Yaiba: Yuukaku-hen",
    title_english: "Demon Slayer: Entertainment District Arc",
    title_japanese: "鬼滅の刃 遊郭編",
    type: "TV",
    source: "Manga",
    episodes: 11,
    status: "Finished Airing",
    airing: false,
    score: 8.77,
    scored_by: 840000,
    rank: 45,
    popularity: 58,
    members: 1480000,
    favorites: 39500,
    synopsis:
      "Tanjiro và đồng đội cùng Âm Trụ Tengen Uzui thâm nhập vào khu phố đèn đỏ Yoshiwara sầm uất để truy tìm tung tích các phu nhân gián điệp của Tengen và đối đầu với Thượng Huyền Lục Daki & Gyutaro.",
    genres: [
      { mal_id: 1, type: "anime", name: "Action", url: "" },
      { mal_id: 10, type: "anime", name: "Fantasy", url: "" },
    ],
    studios: [{ mal_id: 43, type: "anime", name: "ufotable", url: "" }],
  },
  // Kimetsu no Yaiba Katanakaji no Sato-hen (Phần 3)
  51019: {
    mal_id: 51019,
    url: "https://myanimelist.net/anime/51019",
    images: {
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/1765/135099.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1765/135099t.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1765/135099l.jpg",
      },
      webp: {
        image_url: "https://cdn.myanimelist.net/images/anime/1765/135099.webp",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1765/135099t.webp",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1765/135099l.webp",
      },
    },
    trailer: {
      youtube_id: "e-kR1yGfE08",
      url: "https://www.youtube.com/watch?v=e-kR1yGfE08",
      embed_url:
        "https://www.youtube-nocookie.com/embed/e-kR1yGfE08?enablejsapi=1&wmode=opaque&autoplay=1",
      images: {
        image_url: null,
        small_image_url: null,
        medium_image_url: null,
        large_image_url: null,
        maximum_image_url: null,
      },
    },
    title: "Kimetsu no Yaiba: Katanakaji no Sato-hen",
    title_english: "Demon Slayer: Swordsmith Village Arc",
    title_japanese: "鬼滅の刃 刀鍛冶の里編",
    type: "TV",
    source: "Manga",
    episodes: 11,
    status: "Finished Airing",
    airing: false,
    score: 8.22,
    scored_by: 520000,
    rank: 310,
    popularity: 92,
    members: 980000,
    favorites: 18500,
    synopsis:
      "Tanjiro tìm đến Làng Thợ Rèn bí mật để rèn lại thanh kiếm Nhật Luân. Tại đây, cậu gặp Hà Trụ Muichiro Tokito và Luyến Trụ Mitsuri Kanroji trước khi ngôi làng bị tấn công bất ngờ bởi Thượng Huyền Tứ Hantengu và Thượng Huyền Ngũ Gyokko.",
    genres: [
      { mal_id: 1, type: "anime", name: "Action", url: "" },
      { mal_id: 10, type: "anime", name: "Fantasy", url: "" },
    ],
    studios: [{ mal_id: 43, type: "anime", name: "ufotable", url: "" }],
  },
  // Kimetsu no Yaiba Hashira Geiko-hen (Phần 4)
  55701: {
    mal_id: 55701,
    url: "https://myanimelist.net/anime/55701",
    images: {
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/1665/142078.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1665/142078t.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1665/142078l.jpg",
      },
      webp: {
        image_url: "https://cdn.myanimelist.net/images/anime/1665/142078.webp",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1665/142078t.webp",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1665/142078l.webp",
      },
    },
    trailer: {
      youtube_id: "fV-F1U2wGkQ",
      url: "https://www.youtube.com/watch?v=fV-F1U2wGkQ",
      embed_url:
        "https://www.youtube-nocookie.com/embed/fV-F1U2wGkQ?enablejsapi=1&wmode=opaque&autoplay=1",
      images: {
        image_url: null,
        small_image_url: null,
        medium_image_url: null,
        large_image_url: null,
        maximum_image_url: null,
      },
    },
    title: "Kimetsu no Yaiba: Hashira Geiko-hen",
    title_english: "Demon Slayer: Hashira Training Arc",
    title_japanese: "鬼滅の刃 柱稽古編",
    type: "TV",
    source: "Manga",
    episodes: 8,
    status: "Finished Airing",
    airing: false,
    score: 8.28,
    scored_by: 340000,
    rank: 275,
    popularity: 135,
    members: 680000,
    favorites: 12500,
    synopsis:
      "Toàn bộ Sát Quỷ Đội bước vào khóa huấn luyện khắc nghiệt cùng các Trụ Cột nhằm khai mở Dấu Ấn Diệt Quỷ và chuẩn bị cho trận quyết chiến sinh tử cuối cùng chống lại Chúa Quỷ Muzan Kibutsuji.",
    genres: [
      { mal_id: 1, type: "anime", name: "Action", url: "" },
      { mal_id: 10, type: "anime", name: "Fantasy", url: "" },
    ],
    studios: [{ mal_id: 43, type: "anime", name: "ufotable", url: "" }],
  },
  // Kimetsu no Yaiba Mugenjou-hen (Phần 5 - Upcoming)
  59134: {
    mal_id: 59134,
    url: "https://myanimelist.net/anime/59134",
    images: {
      jpg: {
        image_url: "",
        small_image_url: "",
        large_image_url: "",
      },
      webp: {
        image_url: "",
        small_image_url: "",
        large_image_url: "",
      },
    },
    trailer: {
      youtube_id: null,
      url: null,
      embed_url: null,
      images: {
        image_url: null,
        small_image_url: null,
        medium_image_url: null,
        large_image_url: null,
        maximum_image_url: null,
      },
    },
    title: "Kimetsu no Yaiba: Mugenjou-hen",
    title_english: "Demon Slayer: Infinity Castle Arc",
    title_japanese: "劇場版 鬼滅の刃 無限城編",
    type: "Movie",
    source: "Manga",
    episodes: null,
    status: "Not yet aired",
    airing: false,
    score: null,
    scored_by: null,
    rank: null,
    popularity: 850,
    members: 240000,
    favorites: 5600,
    synopsis:
      "Trilogy phim điện ảnh chuyển thể từ Arc Vô Hạn Thành (Infinity Castle) - trận chiến sinh tử cao trào nhất của bộ truyện Kimetsu no Yaiba giữa Sát Quỷ Đội và Muzan Kibutsuji cùng các Thượng Huyền Quỷ.",
    genres: [
      { mal_id: 1, type: "anime", name: "Action", url: "" },
      { mal_id: 10, type: "anime", name: "Fantasy", url: "" },
    ],
    studios: [{ mal_id: 43, type: "anime", name: "ufotable", url: "" }],
  },
  // Frieren Season 2 (Upcoming)
  59885: {
    mal_id: 59885,
    url: "https://myanimelist.net/anime/59885",
    images: {
      jpg: {
        image_url: "",
        small_image_url: "",
        large_image_url: "",
      },
      webp: {
        image_url: "",
        small_image_url: "",
        large_image_url: "",
      },
    },
    trailer: {
      youtube_id: null,
      url: null,
      embed_url: null,
      images: {
        image_url: null,
        small_image_url: null,
        medium_image_url: null,
        large_image_url: null,
        maximum_image_url: null,
      },
    },
    title: "Sousou no Frieren 2nd Season",
    title_english: "Frieren: Beyond Journey's End Season 2",
    title_japanese: "葬送のフリーレン 第2期",
    type: "TV",
    source: "Manga",
    episodes: null,
    status: "Not yet aired",
    airing: false,
    score: null,
    scored_by: null,
    rank: null,
    popularity: 980,
    members: 210000,
    favorites: 4800,
    synopsis:
      "Mùa 2 của siêu phẩm anime Sousou no Frieren tiếp tục hành trình của pháp sư Frieren, Fern và Stark tiến về phía bắc hướng tới Aureole (nơi an nghỉ của các linh hồn). Phim đang trong quá trình sản xuất bởi Madhouse.",
    genres: [
      { mal_id: 2, type: "anime", name: "Adventure", url: "" },
      { mal_id: 8, type: "anime", name: "Drama", url: "" },
      { mal_id: 10, type: "anime", name: "Fantasy", url: "" },
    ],
    studios: [{ mal_id: 11, type: "anime", name: "Madhouse", url: "" }],
  },
};

export function getCuratedAnimeById(id: number): Anime | null {
  return CURATED_ANIME_MAP[id] || null;
}

interface FranchiseDefinition {
  franchiseName: string;
  seasons: Array<{
    mal_id: number;
    title: string;
    seasonName: string;
    type?: string;
    unreleased?: boolean;
  }>;
}

export const CURATED_FRANCHISES: FranchiseDefinition[] = [
  {
    franchiseName: "Jujutsu Kaisen",
    seasons: [
      {
        mal_id: 40748,
        title: "Jujutsu Kaisen (Phần 1)",
        seasonName: "Phần 1 (24 tập)",
      },
      {
        mal_id: 48561,
        title: "Jujutsu Kaisen 0 Movie",
        seasonName: "Movie Tiền truyện",
        type: "Movie",
      },
      {
        mal_id: 51009,
        title: "Jujutsu Kaisen Season 2 (Biến Cố Shibuya)",
        seasonName: "Phần 2 (23 tập)",
      },
      {
        mal_id: 57658,
        title: "Jujutsu Kaisen: Shimotsuki-hen (Culling Game)",
        seasonName: "Phần 3 (Chưa ra mắt)",
        unreleased: true,
      },
    ],
  },
  {
    franchiseName: "Kimetsu no Yaiba",
    seasons: [
      {
        mal_id: 38000,
        title: "Kimetsu no Yaiba (Phần 1)",
        seasonName: "Phần 1 (26 tập)",
      },
      {
        mal_id: 40456,
        title: "Kimetsu no Yaiba Movie: Mugen Ressha-hen",
        seasonName: "Chuyến Tàu Vô Tận",
        type: "Movie",
      },
      {
        mal_id: 47778,
        title: "Kimetsu no Yaiba: Yuukaku-hen",
        seasonName: "Phần 2: Kỹ Viện Trấn (11 tập)",
      },
      {
        mal_id: 51019,
        title: "Kimetsu no Yaiba: Katanakaji no Sato-hen",
        seasonName: "Phần 3: Làng Thợ Rèn (11 tập)",
      },
      {
        mal_id: 55701,
        title: "Kimetsu no Yaiba: Hashira Geiko-hen",
        seasonName: "Phần 4: Đại Trụ Đặc Huấn (8 tập)",
      },
      {
        mal_id: 59134,
        title: "Kimetsu no Yaiba: Mugenjou-hen",
        seasonName: "Phần 5: Vô Hạn Thành (Chưa ra mắt)",
        type: "Movie",
        unreleased: true,
      },
    ],
  },
  {
    franchiseName: "Shingeki no Kyojin (Attack on Titan)",
    seasons: [
      {
        mal_id: 16498,
        title: "Shingeki no Kyojin (Phần 1)",
        seasonName: "Phần 1 (25 tập)",
      },
      {
        mal_id: 25777,
        title: "Shingeki no Kyojin Season 2",
        seasonName: "Phần 2 (12 tập)",
      },
      {
        mal_id: 35760,
        title: "Shingeki no Kyojin Season 3",
        seasonName: "Phần 3 (12 tập)",
      },
      {
        mal_id: 38524,
        title: "Shingeki no Kyojin Season 3 Part 2",
        seasonName: "Phần 3 Part 2 (10 tập)",
      },
      {
        mal_id: 40028,
        title: "Shingeki no Kyojin: The Final Season",
        seasonName: "Phần 4 Part 1 (16 tập)",
      },
      {
        mal_id: 48583,
        title: "Shingeki no Kyojin: The Final Season Part 2",
        seasonName: "Phần 4 Part 2 (12 tập)",
      },
      {
        mal_id: 51535,
        title: "Shingeki no Kyojin: The Final Season Kanketsu-hen",
        seasonName: "Phần Kết (Special)",
      },
    ],
  },
  {
    franchiseName: "Sousou no Frieren",
    seasons: [
      {
        mal_id: 52991,
        title: "Sousou no Frieren (Phần 1)",
        seasonName: "Phần 1 (28 tập)",
      },
      {
        mal_id: 59885,
        title: "Sousou no Frieren Season 2",
        seasonName: "Phần 2 (Chưa ra mắt)",
        unreleased: true,
      },
    ],
  },
  {
    franchiseName: "Solo Leveling",
    seasons: [
      {
        mal_id: 52299,
        title: "Solo Leveling (Phần 1)",
        seasonName: "Phần 1 (12 tập)",
      },
      {
        mal_id: 58567,
        title: "Solo Leveling Season 2: Arise from the Shadow",
        seasonName: "Phần 2 (13 tập)",
      },
    ],
  },
  {
    franchiseName: "Chainsaw Man",
    seasons: [
      {
        mal_id: 44511,
        title: "Chainsaw Man (Phần 1)",
        seasonName: "Phần 1 (12 tập)",
      },
      {
        mal_id: 57555,
        title: "Chainsaw Man Movie: Reze-hen",
        seasonName: "Movie Reze (Chưa ra mắt)",
        type: "Movie",
        unreleased: true,
      },
    ],
  },
  {
    franchiseName: "Spy x Family",
    seasons: [
      {
        mal_id: 50265,
        title: "Spy x Family (Part 1)",
        seasonName: "Phần 1 Part 1 (12 tập)",
      },
      {
        mal_id: 50602,
        title: "Spy x Family (Part 2)",
        seasonName: "Phần 1 Part 2 (13 tập)",
      },
      {
        mal_id: 53887,
        title: "Spy x Family Season 2",
        seasonName: "Phần 2 (12 tập)",
      },
      {
        mal_id: 58081,
        title: "Spy x Family Season 3",
        seasonName: "Phần 3 (Sắp chiếu)",
      },
    ],
  },
  {
    franchiseName: "Bleach",
    seasons: [
      {
        mal_id: 269,
        title: "Bleach (Series gốc)",
        seasonName: "Phần gốc (366 tập)",
      },
      {
        mal_id: 41467,
        title: "Bleach: Sennen Kessen-hen (Huyết Chiến Ngàn Năm)",
        seasonName: "Huyết Chiến Part 1",
      },
      {
        mal_id: 53998,
        title: "Bleach: Sennen Kessen-hen - Ketsubetsu-tan",
        seasonName: "Huyết Chiến Part 2",
      },
      {
        mal_id: 56784,
        title: "Bleach: Sennen Kessen-hen - Soukoku-tan",
        seasonName: "Huyết Chiến Part 3",
      },
    ],
  },
  {
    franchiseName: "One Punch Man",
    seasons: [
      {
        mal_id: 30276,
        title: "One Punch Man (Phần 1)",
        seasonName: "Phần 1 (12 tập)",
      },
      {
        mal_id: 34134,
        title: "One Punch Man Season 2",
        seasonName: "Phần 2 (12 tập)",
      },
      {
        mal_id: 52619,
        title: "One Punch Man Season 3",
        seasonName: "Phần 3 (Sắp chiếu)",
      },
    ],
  },
  {
    franchiseName: "Boku no Hero Academia",
    seasons: [
      {
        mal_id: 31964,
        title: "Boku no Hero Academia (Phần 1)",
        seasonName: "Phần 1 (13 tập)",
      },
      {
        mal_id: 33486,
        title: "Boku no Hero Academia Season 2",
        seasonName: "Phần 2 (25 tập)",
      },
      {
        mal_id: 36456,
        title: "Boku no Hero Academia Season 3",
        seasonName: "Phần 3 (25 tập)",
      },
      {
        mal_id: 38408,
        title: "Boku no Hero Academia Season 4",
        seasonName: "Phần 4 (25 tập)",
      },
      {
        mal_id: 42203,
        title: "Boku no Hero Academia Season 5",
        seasonName: "Phần 5 (25 tập)",
      },
      {
        mal_id: 49918,
        title: "Boku no Hero Academia Season 6",
        seasonName: "Phần 6 (25 tập)",
      },
      {
        mal_id: 54789,
        title: "Boku no Hero Academia Season 7",
        seasonName: "Phần 7 (21 tập)",
      },
    ],
  },
  {
    franchiseName: "Mushoku Tensei",
    seasons: [
      {
        mal_id: 39535,
        title: "Mushoku Tensei (Phần 1 Part 1)",
        seasonName: "Phần 1 Part 1 (11 tập)",
      },
      {
        mal_id: 47077,
        title: "Mushoku Tensei (Phần 1 Part 2)",
        seasonName: "Phần 1 Part 2 (12 tập)",
      },
      {
        mal_id: 51179,
        title: "Mushoku Tensei II (Phần 2 Part 1)",
        seasonName: "Phần 2 Part 1 (12 tập)",
      },
      {
        mal_id: 55888,
        title: "Mushoku Tensei II (Phần 2 Part 2)",
        seasonName: "Phần 2 Part 2 (12 tập)",
      },
    ],
  },
  {
    franchiseName: "Re:Zero",
    seasons: [
      {
        mal_id: 31240,
        title: "Re:Zero kara Hajimeru Isekai Seikatsu (Phần 1)",
        seasonName: "Phần 1 (25 tập)",
      },
      {
        mal_id: 39587,
        title: "Re:Zero Season 2 (Part 1)",
        seasonName: "Phần 2 Part 1 (13 tập)",
      },
      {
        mal_id: 44074,
        title: "Re:Zero Season 2 (Part 2)",
        seasonName: "Phần 2 Part 2 (12 tập)",
      },
      {
        mal_id: 54857,
        title: "Re:Zero Season 3",
        seasonName: "Phần 3 (16 tập)",
      },
    ],
  },
];

// Persistent graph in memory for dynamic anime seasons
const globalSeasonGraph = new Map<number, SeasonInfo[]>();

/**
 * Resolve full franchise season chain for an anime ID.
 * Guarantee that older seasons are NEVER removed when navigating to newer seasons.
 */
export function resolveFranchiseSeasons(
  currentId: number,
  currentTitle: string,
  rawRelations: AnimeRelationItem[] = [],
): SeasonInfo[] {
  // 1. Check curated franchise registry first
  for (const franchise of CURATED_FRANCHISES) {
    const matchIndex = franchise.seasons.findIndex(
      (s) => s.mal_id === currentId,
    );
    if (matchIndex !== -1) {
      // Build full season list with dynamic status badges
      const result: SeasonInfo[] = franchise.seasons.map((s, idx) => {
        let relationType = s.seasonName;
        if (s.unreleased) {
          relationType = s.seasonName;
        } else if (s.type === "Movie") {
          relationType = "Bản điện ảnh";
        } else if (idx < matchIndex) {
          relationType = `Phần trước • ${s.seasonName}`;
        } else if (idx === matchIndex) {
          relationType = "Phần hiện tại";
        } else {
          relationType = `Phần tiếp • ${s.seasonName}`;
        }

        return {
          mal_id: s.mal_id,
          title: s.title,
          relationType,
          isCurrent: s.mal_id === currentId,
          unreleased: Boolean(s.unreleased),
        };
      });

      // Save to global graph
      for (const s of franchise.seasons) {
        globalSeasonGraph.set(s.mal_id, result);
      }
      return result;
    }
  }

  // 2. Dynamic graph merge from Jikan relations
  const existingList = globalSeasonGraph.get(currentId) || [];
  const mergedMap = new Map<number, SeasonInfo>();

  // Add existing known seasons from memory
  for (const s of existingList) {
    mergedMap.set(s.mal_id, { ...s, isCurrent: s.mal_id === currentId });
  }

  // Add current anime
  const isCurrentUnreleased =
    currentId === 57658 ||
    currentId === 59134 ||
    currentId === 59885 ||
    currentId === 57555;
  mergedMap.set(currentId, {
    mal_id: currentId,
    title: currentTitle,
    relationType: isCurrentUnreleased ? "Chưa ra mắt" : "Phần hiện tại",
    isCurrent: true,
    unreleased: isCurrentUnreleased,
  });

  // Extract from rawRelations
  for (const rel of rawRelations) {
    const relLower = rel.relation.toLowerCase();
    for (const e of rel.entry) {
      if (e.type === "anime" && !mergedMap.has(e.mal_id)) {
        let label = "Mùa liên quan";
        if (relLower.includes("prequel") || relLower.includes("parent")) {
          label = "Phần trước";
        } else if (relLower.includes("sequel")) {
          label = "Phần tiếp theo";
        } else if (relLower.includes("side") || relLower.includes("spin")) {
          label = "Ngoại truyện";
        }
        const isEntryUnreleased =
          e.mal_id === 57658 ||
          e.mal_id === 59134 ||
          e.mal_id === 59885 ||
          e.mal_id === 57555;

        mergedMap.set(e.mal_id, {
          mal_id: e.mal_id,
          title: e.name,
          relationType: isEntryUnreleased ? "Chưa ra mắt" : label,
          isCurrent: false,
          unreleased: isEntryUnreleased,
        });
      }
    }
  }

  const finalSeasons = Array.from(mergedMap.values());

  // Store bidirectionally so all connected seasons share the exact same list
  for (const item of finalSeasons) {
    globalSeasonGraph.set(item.mal_id, finalSeasons);
  }

  return finalSeasons;
}
