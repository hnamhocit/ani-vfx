import type {
  Anime,
  AnimeCharacterItem,
  AnimeEpisode,
  AnimeRecommendationItem,
  AnimeVideosData,
  GenreItem,
  JikanResponse,
} from "@/types/anime";

export const MOCK_GENRES: GenreItem[] = [
  {
    mal_id: 1,
    name: "Action",
    url: "https://myanimelist.net/anime/genre/1/Action",
    count: 4700,
  },
  {
    mal_id: 2,
    name: "Adventure",
    url: "https://myanimelist.net/anime/genre/2/Adventure",
    count: 3500,
  },
  {
    mal_id: 4,
    name: "Comedy",
    url: "https://myanimelist.net/anime/genre/4/Comedy",
    count: 6800,
  },
  {
    mal_id: 8,
    name: "Drama",
    url: "https://myanimelist.net/anime/genre/8/Drama",
    count: 2600,
  },
  {
    mal_id: 10,
    name: "Fantasy",
    url: "https://myanimelist.net/anime/genre/10/Fantasy",
    count: 5200,
  },
  {
    mal_id: 22,
    name: "Romance",
    url: "https://myanimelist.net/anime/genre/22/Romance",
    count: 2100,
  },
  {
    mal_id: 24,
    name: "Sci-Fi",
    url: "https://myanimelist.net/anime/genre/24/Sci-Fi",
    count: 3000,
  },
  {
    mal_id: 36,
    name: "Slice of Life",
    url: "https://myanimelist.net/anime/genre/36/Slice_of_Life",
    count: 1900,
  },
  {
    mal_id: 37,
    name: "Supernatural",
    url: "https://myanimelist.net/anime/genre/37/Supernatural",
    count: 1800,
  },
  {
    mal_id: 41,
    name: "Suspense",
    url: "https://myanimelist.net/anime/genre/41/Suspense",
    count: 950,
  },
  {
    mal_id: 62,
    name: "Isekai",
    url: "https://myanimelist.net/anime/genre/62/Isekai",
    count: 620,
  },
];

export const MOCK_ANIMES: Anime[] = [
  {
    mal_id: 52991,
    url: "https://myanimelist.net/anime/52991/Sousou_no_Frieren",
    images: {
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/1015/138006.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1015/138006.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1015/138006.jpg",
      },
      webp: {
        image_url: "https://cdn.myanimelist.net/images/anime/1015/138006.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1015/138006.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1015/138006.jpg",
      },
    },
    trailer: {
      youtube_id: "tMrydjRD_H0",
      url: "https://www.youtube.com/watch?v=tMrydjRD_H0",
      embed_url:
        "https://www.youtube.com/embed/tMrydjRD_H0?enablejsapi=1&wmode=opaque&autoplay=1",
      images: {
        image_url: "https://img.youtube.com/vi/tMrydjRD_H0/default.jpg",
        small_image_url: "https://img.youtube.com/vi/tMrydjRD_H0/sddefault.jpg",
        medium_image_url:
          "https://img.youtube.com/vi/tMrydjRD_H0/mqdefault.jpg",
        large_image_url: "https://img.youtube.com/vi/tMrydjRD_H0/hqdefault.jpg",
        maximum_image_url:
          "https://img.youtube.com/vi/tMrydjRD_H0/maxresdefault.jpg",
      },
    },
    title: "Sousou no Frieren",
    title_english: "Frieren: Beyond Journey's End",
    title_japanese: "\u846c\u9001\u306e\u30d5\u30ea\u30fc\u30ec\u30f3",
    type: "TV",
    source: "Manga",
    episodes: 28,
    status: "Currently Airing",
    airing: true,
    aired: {
      from: "2023-01-01T00:00:00+00:00",
      to: "2023-12-31T00:00:00+00:00",
      string: "Fall 2023",
    },
    duration: "24 min per ep",
    rating: "PG-13 - Teens 13 or older",
    score: 9.32,
    scored_by: 580000,
    rank: 1,
    popularity: 18,
    members: 1160000,
    favorites: 68000,
    synopsis:
      "The demon king has been defeated, and the victorious hero party returns home before disbanding. The four\u2014mage Frieren, hero Himmel, priest Heiter, and warrior Eisen\u2014reminisce about their decade-long journey as the moment to bid each other farewell arrives. But the passing of time is different for elves, thus Frieren witnesses her companions slowly pass away one by one.",
    background: null,
    season: "fall",
    year: 2023,
    studios: [
      {
        mal_id: 11,
        type: "anime",
        name: "Madhouse",
        url: "https://myanimelist.net/anime/producer/11",
      },
    ],
    genres: [
      {
        mal_id: 2,
        type: "anime",
        name: "Adventure",
        url: "https://myanimelist.net/anime/genre/2",
      },
      {
        mal_id: 8,
        type: "anime",
        name: "Drama",
        url: "https://myanimelist.net/anime/genre/8",
      },
      {
        mal_id: 10,
        type: "anime",
        name: "Fantasy",
        url: "https://myanimelist.net/anime/genre/10",
      },
    ],
  },
  {
    mal_id: 5114,
    url: "https://myanimelist.net/anime/5114/Fullmetal_Alchemist__Brotherhood",
    images: {
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/1208/94745.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1208/94745.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1208/94745.jpg",
      },
      webp: {
        image_url: "https://cdn.myanimelist.net/images/anime/1208/94745.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1208/94745.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1208/94745.jpg",
      },
    },
    trailer: {
      youtube_id: "-GoNo0DGroU",
      url: "https://www.youtube.com/watch?v=-GoNo0DGroU",
      embed_url:
        "https://www.youtube.com/embed/-GoNo0DGroU?enablejsapi=1&wmode=opaque&autoplay=1",
      images: {
        image_url: "https://img.youtube.com/vi/-GoNo0DGroU/default.jpg",
        small_image_url: "https://img.youtube.com/vi/-GoNo0DGroU/sddefault.jpg",
        medium_image_url:
          "https://img.youtube.com/vi/-GoNo0DGroU/mqdefault.jpg",
        large_image_url: "https://img.youtube.com/vi/-GoNo0DGroU/hqdefault.jpg",
        maximum_image_url:
          "https://img.youtube.com/vi/-GoNo0DGroU/maxresdefault.jpg",
      },
    },
    title: "Fullmetal Alchemist: Brotherhood",
    title_english: "Fullmetal Alchemist: Brotherhood",
    title_japanese: "\u92fc\u306e\u932c\u91d1\u8853\u5e2b FULLMETAL ALCHEMIST",
    type: "TV",
    source: "Manga",
    episodes: 64,
    status: "Finished Airing",
    airing: false,
    aired: {
      from: "2009-01-01T00:00:00+00:00",
      to: "2009-12-31T00:00:00+00:00",
      string: "Spring 2009",
    },
    duration: "24 min per ep",
    rating: "PG-13 - Teens 13 or older",
    score: 9.1,
    scored_by: 2100000,
    rank: 2,
    popularity: 3,
    members: 4200000,
    favorites: 225000,
    synopsis:
      "After a horrific alchemy experiment goes wrong in the Elric household, brothers Edward and Alphonse are left in a catastrophic new reality. Ignoring the alchemical principle banning human transmutation, the boys attempted to bring their recently deceased mother back to life.",
    background: null,
    season: "spring",
    year: 2009,
    studios: [
      {
        mal_id: 4,
        type: "anime",
        name: "Bones",
        url: "https://myanimelist.net/anime/producer/4",
      },
    ],
    genres: [
      {
        mal_id: 1,
        type: "anime",
        name: "Action",
        url: "https://myanimelist.net/anime/genre/1",
      },
      {
        mal_id: 2,
        type: "anime",
        name: "Adventure",
        url: "https://myanimelist.net/anime/genre/2",
      },
      {
        mal_id: 8,
        type: "anime",
        name: "Drama",
        url: "https://myanimelist.net/anime/genre/8",
      },
      {
        mal_id: 10,
        type: "anime",
        name: "Fantasy",
        url: "https://myanimelist.net/anime/genre/10",
      },
    ],
  },
  {
    mal_id: 40748,
    url: "https://myanimelist.net/anime/40748/Jujutsu_Kaisen",
    images: {
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/1171/109222.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1171/109222.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1171/109222.jpg",
      },
      webp: {
        image_url: "https://cdn.myanimelist.net/images/anime/1171/109222.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1171/109222.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1171/109222.jpg",
      },
    },
    trailer: {
      youtube_id: "pkKu9hLT-t8",
      url: "https://www.youtube.com/watch?v=pkKu9hLT-t8",
      embed_url:
        "https://www.youtube.com/embed/pkKu9hLT-t8?enablejsapi=1&wmode=opaque&autoplay=1",
      images: {
        image_url: "https://img.youtube.com/vi/pkKu9hLT-t8/default.jpg",
        small_image_url: "https://img.youtube.com/vi/pkKu9hLT-t8/sddefault.jpg",
        medium_image_url:
          "https://img.youtube.com/vi/pkKu9hLT-t8/mqdefault.jpg",
        large_image_url: "https://img.youtube.com/vi/pkKu9hLT-t8/hqdefault.jpg",
        maximum_image_url:
          "https://img.youtube.com/vi/pkKu9hLT-t8/maxresdefault.jpg",
      },
    },
    title: "Jujutsu Kaisen",
    title_english: "Jujutsu Kaisen",
    title_japanese: "\u546a\u8853\u5efb\u6226",
    type: "TV",
    source: "Manga",
    episodes: 24,
    status: "Currently Airing",
    airing: true,
    aired: {
      from: "2020-01-01T00:00:00+00:00",
      to: "2020-12-31T00:00:00+00:00",
      string: "Fall 2020",
    },
    duration: "24 min per ep",
    rating: "PG-13 - Teens 13 or older",
    score: 8.61,
    scored_by: 1700000,
    rank: 75,
    popularity: 12,
    members: 3400000,
    favorites: 95000,
    synopsis:
      "Idly indulging in paranormal activities with the Occult Club, high schooler Yuuji Itadori spends his days at either the clubroom or the hospital, where he visits his bedridden grandfather. However, this leisurely lifestyle soon takes a turn for the strange when he unknowingly encounters a cursed item.",
    background: null,
    season: "fall",
    year: 2020,
    studios: [
      {
        mal_id: 569,
        type: "anime",
        name: "MAPPA",
        url: "https://myanimelist.net/anime/producer/569",
      },
    ],
    genres: [
      {
        mal_id: 1,
        type: "anime",
        name: "Action",
        url: "https://myanimelist.net/anime/genre/1",
      },
      {
        mal_id: 10,
        type: "anime",
        name: "Fantasy",
        url: "https://myanimelist.net/anime/genre/10",
      },
      {
        mal_id: 37,
        type: "anime",
        name: "Supernatural",
        url: "https://myanimelist.net/anime/genre/37",
      },
    ],
  },
  {
    mal_id: 38000,
    url: "https://myanimelist.net/anime/38000/Kimetsu_no_Yaiba",
    images: {
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1286/99889.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1286/99889.jpg",
      },
      webp: {
        image_url: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1286/99889.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1286/99889.jpg",
      },
    },
    trailer: {
      youtube_id: "6vMuWuWlW4I",
      url: "https://www.youtube.com/watch?v=6vMuWuWlW4I",
      embed_url:
        "https://www.youtube.com/embed/6vMuWuWlW4I?enablejsapi=1&wmode=opaque&autoplay=1",
      images: {
        image_url: "https://img.youtube.com/vi/6vMuWuWlW4I/default.jpg",
        small_image_url: "https://img.youtube.com/vi/6vMuWuWlW4I/sddefault.jpg",
        medium_image_url:
          "https://img.youtube.com/vi/6vMuWuWlW4I/mqdefault.jpg",
        large_image_url: "https://img.youtube.com/vi/6vMuWuWlW4I/hqdefault.jpg",
        maximum_image_url:
          "https://img.youtube.com/vi/6vMuWuWlW4I/maxresdefault.jpg",
      },
    },
    title: "Kimetsu no Yaiba",
    title_english: "Demon Slayer: Kimetsu no Yaiba",
    title_japanese: "\u9b3c\u6ec5\u306e\u5203",
    type: "TV",
    source: "Manga",
    episodes: 26,
    status: "Finished Airing",
    airing: false,
    aired: {
      from: "2019-01-01T00:00:00+00:00",
      to: "2019-12-31T00:00:00+00:00",
      string: "Spring 2019",
    },
    duration: "24 min per ep",
    rating: "PG-13 - Teens 13 or older",
    score: 8.48,
    scored_by: 2200000,
    rank: 140,
    popularity: 4,
    members: 4400000,
    favorites: 88000,
    synopsis:
      "Ever since the death of his father, the burden of supporting the family has fallen upon Tanjirou Kamado's shoulders. Though living impoverished on a remote mountain, the Kamado family are able to enjoy a relatively peaceful and happy life. One day, Tanjirou decides to go down to the local village to make a little money selling charcoal.",
    background: null,
    season: "spring",
    year: 2019,
    studios: [
      {
        mal_id: 43,
        type: "anime",
        name: "ufotable",
        url: "https://myanimelist.net/anime/producer/43",
      },
    ],
    genres: [
      {
        mal_id: 1,
        type: "anime",
        name: "Action",
        url: "https://myanimelist.net/anime/genre/1",
      },
      {
        mal_id: 10,
        type: "anime",
        name: "Fantasy",
        url: "https://myanimelist.net/anime/genre/10",
      },
      {
        mal_id: 37,
        type: "anime",
        name: "Supernatural",
        url: "https://myanimelist.net/anime/genre/37",
      },
    ],
  },
  {
    mal_id: 52299,
    url: "https://myanimelist.net/anime/52299/Ore_dake_Level_Up_na_Ken",
    images: {
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/1741/134577.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1741/134577.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1741/134577.jpg",
      },
      webp: {
        image_url: "https://cdn.myanimelist.net/images/anime/1741/134577.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1741/134577.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1741/134577.jpg",
      },
    },
    trailer: {
      youtube_id: "1Pe02qI_7c4",
      url: "https://www.youtube.com/watch?v=1Pe02qI_7c4",
      embed_url:
        "https://www.youtube.com/embed/1Pe02qI_7c4?enablejsapi=1&wmode=opaque&autoplay=1",
      images: {
        image_url: "https://img.youtube.com/vi/1Pe02qI_7c4/default.jpg",
        small_image_url: "https://img.youtube.com/vi/1Pe02qI_7c4/sddefault.jpg",
        medium_image_url:
          "https://img.youtube.com/vi/1Pe02qI_7c4/mqdefault.jpg",
        large_image_url: "https://img.youtube.com/vi/1Pe02qI_7c4/hqdefault.jpg",
        maximum_image_url:
          "https://img.youtube.com/vi/1Pe02qI_7c4/maxresdefault.jpg",
      },
    },
    title: "Ore dake Level Up na Ken",
    title_english: "Solo Leveling",
    title_japanese:
      "\u4ffa\u3060\u3051\u30ec\u30d9\u30eb\u30a2\u30c3\u30d7\u306a\u4ef6",
    type: "TV",
    source: "Manga",
    episodes: 12,
    status: "Currently Airing",
    airing: true,
    aired: {
      from: "2024-01-01T00:00:00+00:00",
      to: "2024-12-31T00:00:00+00:00",
      string: "Winter 2024",
    },
    duration: "24 min per ep",
    rating: "PG-13 - Teens 13 or older",
    score: 8.32,
    scored_by: 420000,
    rank: 210,
    popularity: 35,
    members: 840000,
    favorites: 34000,
    synopsis:
      "A decade ago, the 'Gate' appeared and connected the real world with the realm of magic and monsters. To combat these vile beasts, ordinary people received superhuman powers and became known as 'Hunters'. Twenty-year-old Sung Jin-Woo is one such Hunter, but he is known as the 'Weakest', owing to his pathetic power.",
    background: null,
    season: "winter",
    year: 2024,
    studios: [
      {
        mal_id: 56,
        type: "anime",
        name: "A-1 Pictures",
        url: "https://myanimelist.net/anime/producer/56",
      },
    ],
    genres: [
      {
        mal_id: 1,
        type: "anime",
        name: "Action",
        url: "https://myanimelist.net/anime/genre/1",
      },
      {
        mal_id: 2,
        type: "anime",
        name: "Adventure",
        url: "https://myanimelist.net/anime/genre/2",
      },
      {
        mal_id: 10,
        type: "anime",
        name: "Fantasy",
        url: "https://myanimelist.net/anime/genre/10",
      },
    ],
  },
  {
    mal_id: 57334,
    url: "https://myanimelist.net/anime/57334/Dandadan",
    images: {
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/1584/143719.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1584/143719.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1584/143719.jpg",
      },
      webp: {
        image_url: "https://cdn.myanimelist.net/images/anime/1584/143719.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1584/143719.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1584/143719.jpg",
      },
    },
    trailer: {
      youtube_id: "V3xNYDFsnN8",
      url: "https://www.youtube.com/watch?v=V3xNYDFsnN8",
      embed_url:
        "https://www.youtube.com/embed/V3xNYDFsnN8?enablejsapi=1&wmode=opaque&autoplay=1",
      images: {
        image_url: "https://img.youtube.com/vi/V3xNYDFsnN8/default.jpg",
        small_image_url: "https://img.youtube.com/vi/V3xNYDFsnN8/sddefault.jpg",
        medium_image_url:
          "https://img.youtube.com/vi/V3xNYDFsnN8/mqdefault.jpg",
        large_image_url: "https://img.youtube.com/vi/V3xNYDFsnN8/hqdefault.jpg",
        maximum_image_url:
          "https://img.youtube.com/vi/V3xNYDFsnN8/maxresdefault.jpg",
      },
    },
    title: "Dandadan",
    title_english: "DAN DA DAN",
    title_japanese: "\u30c0\u30f3\u30c0\u30c0\u30f3",
    type: "TV",
    source: "Manga",
    episodes: 12,
    status: "Currently Airing",
    airing: true,
    aired: {
      from: "2024-01-01T00:00:00+00:00",
      to: "2024-12-31T00:00:00+00:00",
      string: "Fall 2024",
    },
    duration: "24 min per ep",
    rating: "PG-13 - Teens 13 or older",
    score: 8.68,
    scored_by: 280000,
    rank: 70,
    popularity: 45,
    members: 560000,
    favorites: 28000,
    synopsis:
      "Momo Ayase strikes up an unusual friendship with her school's UFO fanatic, whom she nicknames 'Okarun' because he has a name that she refuses to say aloud. While Momo believes in spirits, she thinks aliens are utter nonsense. Her new friend thinks the exact opposite.",
    background: null,
    season: "fall",
    year: 2024,
    studios: [
      {
        mal_id: 1591,
        type: "anime",
        name: "Science SARU",
        url: "https://myanimelist.net/anime/producer/1591",
      },
    ],
    genres: [
      {
        mal_id: 1,
        type: "anime",
        name: "Action",
        url: "https://myanimelist.net/anime/genre/1",
      },
      {
        mal_id: 4,
        type: "anime",
        name: "Comedy",
        url: "https://myanimelist.net/anime/genre/4",
      },
      {
        mal_id: 37,
        type: "anime",
        name: "Supernatural",
        url: "https://myanimelist.net/anime/genre/37",
      },
    ],
  },
  {
    mal_id: 16498,
    url: "https://myanimelist.net/anime/16498/Shingeki_no_Kyojin",
    images: {
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
      },
      webp: {
        image_url: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
      },
    },
    trailer: {
      youtube_id: "M_OauHnAFc8",
      url: "https://www.youtube.com/watch?v=M_OauHnAFc8",
      embed_url:
        "https://www.youtube.com/embed/M_OauHnAFc8?enablejsapi=1&wmode=opaque&autoplay=1",
      images: {
        image_url: "https://img.youtube.com/vi/M_OauHnAFc8/default.jpg",
        small_image_url: "https://img.youtube.com/vi/M_OauHnAFc8/sddefault.jpg",
        medium_image_url:
          "https://img.youtube.com/vi/M_OauHnAFc8/mqdefault.jpg",
        large_image_url: "https://img.youtube.com/vi/M_OauHnAFc8/hqdefault.jpg",
        maximum_image_url:
          "https://img.youtube.com/vi/M_OauHnAFc8/maxresdefault.jpg",
      },
    },
    title: "Shingeki no Kyojin",
    title_english: "Attack on Titan",
    title_japanese: "\u9032\u6483\u306e\u5de8\u4eba",
    type: "TV",
    source: "Manga",
    episodes: 25,
    status: "Finished Airing",
    airing: false,
    aired: {
      from: "2013-01-01T00:00:00+00:00",
      to: "2013-12-31T00:00:00+00:00",
      string: "Spring 2013",
    },
    duration: "24 min per ep",
    rating: "PG-13 - Teens 13 or older",
    score: 8.56,
    scored_by: 2900000,
    rank: 105,
    popularity: 1,
    members: 5800000,
    favorites: 180000,
    synopsis:
      "Centuries ago, mankind was slaughtered to near extinction by monstrous humanoid creatures called Titans, forcing humans to hide in fear behind enormous concentric walls. What makes these giants truly terrifying is that their taste for human flesh is not born out of hunger but what appears to be out of pleasure.",
    background: null,
    season: "spring",
    year: 2013,
    studios: [
      {
        mal_id: 858,
        type: "anime",
        name: "Wit Studio",
        url: "https://myanimelist.net/anime/producer/858",
      },
    ],
    genres: [
      {
        mal_id: 1,
        type: "anime",
        name: "Action",
        url: "https://myanimelist.net/anime/genre/1",
      },
      {
        mal_id: 8,
        type: "anime",
        name: "Drama",
        url: "https://myanimelist.net/anime/genre/8",
      },
      {
        mal_id: 41,
        type: "anime",
        name: "Suspense",
        url: "https://myanimelist.net/anime/genre/41",
      },
    ],
  },
  {
    mal_id: 52034,
    url: "https://myanimelist.net/anime/52034/Oshi_no_Ko",
    images: {
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/1812/134736.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1812/134736.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1812/134736.jpg",
      },
      webp: {
        image_url: "https://cdn.myanimelist.net/images/anime/1812/134736.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1812/134736.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1812/134736.jpg",
      },
    },
    trailer: {
      youtube_id: "rNjmXuIXfJs",
      url: "https://www.youtube.com/watch?v=rNjmXuIXfJs",
      embed_url:
        "https://www.youtube.com/embed/rNjmXuIXfJs?enablejsapi=1&wmode=opaque&autoplay=1",
      images: {
        image_url: "https://img.youtube.com/vi/rNjmXuIXfJs/default.jpg",
        small_image_url: "https://img.youtube.com/vi/rNjmXuIXfJs/sddefault.jpg",
        medium_image_url:
          "https://img.youtube.com/vi/rNjmXuIXfJs/mqdefault.jpg",
        large_image_url: "https://img.youtube.com/vi/rNjmXuIXfJs/hqdefault.jpg",
        maximum_image_url:
          "https://img.youtube.com/vi/rNjmXuIXfJs/maxresdefault.jpg",
      },
    },
    title: "[Oshi no Ko]",
    title_english: "[Oshi No Ko]",
    title_japanese: "\u3010\u63a8\u3057\u306e\u5b50\u3011",
    type: "TV",
    source: "Manga",
    episodes: 11,
    status: "Currently Airing",
    airing: true,
    aired: {
      from: "2023-01-01T00:00:00+00:00",
      to: "2023-12-31T00:00:00+00:00",
      string: "Spring 2023",
    },
    duration: "24 min per ep",
    rating: "PG-13 - Teens 13 or older",
    score: 8.65,
    scored_by: 520000,
    rank: 80,
    popularity: 40,
    members: 1040000,
    favorites: 42000,
    synopsis:
      "In the entertainment world, celebrities often show exaggerated versions of themselves to the public, concealing their true thoughts and struggles beneath elaborate lies. Fans eagerly buy into these fabrications, showering their idols with undying love and support.",
    background: null,
    season: "spring",
    year: 2023,
    studios: [
      {
        mal_id: 95,
        type: "anime",
        name: "Doga Kobo",
        url: "https://myanimelist.net/anime/producer/95",
      },
    ],
    genres: [
      {
        mal_id: 8,
        type: "anime",
        name: "Drama",
        url: "https://myanimelist.net/anime/genre/8",
      },
      {
        mal_id: 37,
        type: "anime",
        name: "Supernatural",
        url: "https://myanimelist.net/anime/genre/37",
      },
    ],
  },
  {
    mal_id: 44511,
    url: "https://myanimelist.net/anime/44511/Chainsaw_Man",
    images: {
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/1806/126216.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1806/126216.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1806/126216.jpg",
      },
      webp: {
        image_url: "https://cdn.myanimelist.net/images/anime/1806/126216.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1806/126216.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1806/126216.jpg",
      },
    },
    trailer: {
      youtube_id: "cl8QwcqTc6I",
      url: "https://www.youtube.com/watch?v=cl8QwcqTc6I",
      embed_url:
        "https://www.youtube.com/embed/cl8QwcqTc6I?enablejsapi=1&wmode=opaque&autoplay=1",
      images: {
        image_url: "https://img.youtube.com/vi/cl8QwcqTc6I/default.jpg",
        small_image_url: "https://img.youtube.com/vi/cl8QwcqTc6I/sddefault.jpg",
        medium_image_url:
          "https://img.youtube.com/vi/cl8QwcqTc6I/mqdefault.jpg",
        large_image_url: "https://img.youtube.com/vi/cl8QwcqTc6I/hqdefault.jpg",
        maximum_image_url:
          "https://img.youtube.com/vi/cl8QwcqTc6I/maxresdefault.jpg",
      },
    },
    title: "Chainsaw Man",
    title_english: "Chainsaw Man",
    title_japanese: "\u30c1\u30a7\u30f3\u30bd\u30fc\u30de\u30f3",
    type: "TV",
    source: "Manga",
    episodes: 12,
    status: "Currently Airing",
    airing: true,
    aired: {
      from: "2022-01-01T00:00:00+00:00",
      to: "2022-12-31T00:00:00+00:00",
      string: "Fall 2022",
    },
    duration: "24 min per ep",
    rating: "PG-13 - Teens 13 or older",
    score: 8.46,
    scored_by: 1100000,
    rank: 150,
    popularity: 15,
    members: 2200000,
    favorites: 62000,
    synopsis:
      "Denji is robbed of a normal teenage life, left with nothing but his deadbeat father's overwhelming debt. His only companion is his pet, the chainsaw devil Pochita, with whom he slays devils for money that inevitably ends up in the yakuza's pockets.",
    background: null,
    season: "fall",
    year: 2022,
    studios: [
      {
        mal_id: 569,
        type: "anime",
        name: "MAPPA",
        url: "https://myanimelist.net/anime/producer/569",
      },
    ],
    genres: [
      {
        mal_id: 1,
        type: "anime",
        name: "Action",
        url: "https://myanimelist.net/anime/genre/1",
      },
      {
        mal_id: 37,
        type: "anime",
        name: "Supernatural",
        url: "https://myanimelist.net/anime/genre/37",
      },
    ],
  },
  {
    mal_id: 41467,
    url: "https://myanimelist.net/anime/41467/Bleach__Sennen_Kessen-hen",
    images: {
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/1908/135431.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1908/135431.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1908/135431.jpg",
      },
      webp: {
        image_url: "https://cdn.myanimelist.net/images/anime/1908/135431.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1908/135431.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1908/135431.jpg",
      },
    },
    trailer: {
      youtube_id: "e8YBesRKq_U",
      url: "https://www.youtube.com/watch?v=e8YBesRKq_U",
      embed_url:
        "https://www.youtube.com/embed/e8YBesRKq_U?enablejsapi=1&wmode=opaque&autoplay=1",
      images: {
        image_url: "https://img.youtube.com/vi/e8YBesRKq_U/default.jpg",
        small_image_url: "https://img.youtube.com/vi/e8YBesRKq_U/sddefault.jpg",
        medium_image_url:
          "https://img.youtube.com/vi/e8YBesRKq_U/mqdefault.jpg",
        large_image_url: "https://img.youtube.com/vi/e8YBesRKq_U/hqdefault.jpg",
        maximum_image_url:
          "https://img.youtube.com/vi/e8YBesRKq_U/maxresdefault.jpg",
      },
    },
    title: "Bleach: Sennen Kessen-hen",
    title_english: "Bleach: Thousand-Year Blood War",
    title_japanese: "BLEACH \u5343\u5e74\u8840\u6226\u7bc7",
    type: "TV",
    source: "Manga",
    episodes: 13,
    status: "Currently Airing",
    airing: true,
    aired: {
      from: "2022-01-01T00:00:00+00:00",
      to: "2022-12-31T00:00:00+00:00",
      string: "Fall 2022",
    },
    duration: "24 min per ep",
    rating: "PG-13 - Teens 13 or older",
    score: 9.01,
    scored_by: 530000,
    rank: 10,
    popularity: 55,
    members: 1060000,
    favorites: 48000,
    synopsis:
      "Substitute Soul Reaper Ichigo Kurosaki spends his days fighting against Hollows, dangerous evil spirits that threaten Karakura Town. Ichigo carries on his quest with his closest allies: Orihime Inoue, Yasutora Sado, and Uryuu Ishida.",
    background: null,
    season: "fall",
    year: 2022,
    studios: [
      {
        mal_id: 1,
        type: "anime",
        name: "Pierrot",
        url: "https://myanimelist.net/anime/producer/1",
      },
    ],
    genres: [
      {
        mal_id: 1,
        type: "anime",
        name: "Action",
        url: "https://myanimelist.net/anime/genre/1",
      },
      {
        mal_id: 2,
        type: "anime",
        name: "Adventure",
        url: "https://myanimelist.net/anime/genre/2",
      },
      {
        mal_id: 10,
        type: "anime",
        name: "Fantasy",
        url: "https://myanimelist.net/anime/genre/10",
      },
    ],
  },
  {
    mal_id: 50265,
    url: "https://myanimelist.net/anime/50265/Spy_x_Family",
    images: {
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/1441/122795.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1441/122795.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1441/122795.jpg",
      },
      webp: {
        image_url: "https://cdn.myanimelist.net/images/anime/1441/122795.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1441/122795.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1441/122795.jpg",
      },
    },
    trailer: {
      youtube_id: "EZy_vHyFedw",
      url: "https://www.youtube.com/watch?v=EZy_vHyFedw",
      embed_url:
        "https://www.youtube.com/embed/EZy_vHyFedw?enablejsapi=1&wmode=opaque&autoplay=1",
      images: {
        image_url: "https://img.youtube.com/vi/EZy_vHyFedw/default.jpg",
        small_image_url: "https://img.youtube.com/vi/EZy_vHyFedw/sddefault.jpg",
        medium_image_url:
          "https://img.youtube.com/vi/EZy_vHyFedw/mqdefault.jpg",
        large_image_url: "https://img.youtube.com/vi/EZy_vHyFedw/hqdefault.jpg",
        maximum_image_url:
          "https://img.youtube.com/vi/EZy_vHyFedw/maxresdefault.jpg",
      },
    },
    title: "Spy x Family",
    title_english: "SPY x FAMILY",
    title_japanese: "SPY\u00d7FAMILY",
    type: "TV",
    source: "Manga",
    episodes: 25,
    status: "Finished Airing",
    airing: false,
    aired: {
      from: "2022-01-01T00:00:00+00:00",
      to: "2022-12-31T00:00:00+00:00",
      string: "Spring 2022",
    },
    duration: "24 min per ep",
    rating: "PG-13 - Teens 13 or older",
    score: 8.49,
    scored_by: 1300000,
    rank: 130,
    popularity: 22,
    members: 2600000,
    favorites: 51000,
    synopsis:
      "Corrupt politicians, frenzied nationalists, and other warmongering forces constantly jeopardize the thin veneer of peace between neighboring countries Ostania and Westalis. In spite of their plots, renowned spy and master of disguise 'Twilight' fulfills dangerous missions.",
    background: null,
    season: "spring",
    year: 2022,
    studios: [
      {
        mal_id: 858,
        type: "anime",
        name: "Wit Studio",
        url: "https://myanimelist.net/anime/producer/858",
      },
      {
        mal_id: 1835,
        type: "anime",
        name: "CloverWorks",
        url: "https://myanimelist.net/anime/producer/1835",
      },
    ],
    genres: [
      {
        mal_id: 1,
        type: "anime",
        name: "Action",
        url: "https://myanimelist.net/anime/genre/1",
      },
      {
        mal_id: 4,
        type: "anime",
        name: "Comedy",
        url: "https://myanimelist.net/anime/genre/4",
      },
    ],
  },
  {
    mal_id: 21,
    url: "https://myanimelist.net/anime/21/One_Piece",
    images: {
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/1244/138851.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1244/138851.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1244/138851.jpg",
      },
      webp: {
        image_url: "https://cdn.myanimelist.net/images/anime/1244/138851.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1244/138851.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1244/138851.jpg",
      },
    },
    trailer: {
      youtube_id: "S8_YwFLCh4U",
      url: "https://www.youtube.com/watch?v=S8_YwFLCh4U",
      embed_url:
        "https://www.youtube.com/embed/S8_YwFLCh4U?enablejsapi=1&wmode=opaque&autoplay=1",
      images: {
        image_url: "https://img.youtube.com/vi/S8_YwFLCh4U/default.jpg",
        small_image_url: "https://img.youtube.com/vi/S8_YwFLCh4U/sddefault.jpg",
        medium_image_url:
          "https://img.youtube.com/vi/S8_YwFLCh4U/mqdefault.jpg",
        large_image_url: "https://img.youtube.com/vi/S8_YwFLCh4U/hqdefault.jpg",
        maximum_image_url:
          "https://img.youtube.com/vi/S8_YwFLCh4U/maxresdefault.jpg",
      },
    },
    title: "One Piece",
    title_english: "One Piece",
    title_japanese: "ONE PIECE",
    type: "TV",
    source: "Manga",
    episodes: 1100,
    status: "Currently Airing",
    airing: true,
    aired: {
      from: "1999-01-01T00:00:00+00:00",
      to: "1999-12-31T00:00:00+00:00",
      string: "Fall 1999",
    },
    duration: "24 min per ep",
    rating: "PG-13 - Teens 13 or older",
    score: 8.72,
    scored_by: 1800000,
    rank: 50,
    popularity: 8,
    members: 3600000,
    favorites: 230000,
    synopsis:
      "Barely surviving in a barrel after passing through a terrible whirlpool at sea, carefree Monkey D. Luffy ends up aboard a ship under attack by pirates. Despite being a naive-looking teenager, he is not to be underestimated. In search of the legendary treasure One Piece, Luffy journeys across the Grand Line.",
    background: null,
    season: "fall",
    year: 1999,
    studios: [
      {
        mal_id: 18,
        type: "anime",
        name: "Toei Animation",
        url: "https://myanimelist.net/anime/producer/18",
      },
    ],
    genres: [
      {
        mal_id: 1,
        type: "anime",
        name: "Action",
        url: "https://myanimelist.net/anime/genre/1",
      },
      {
        mal_id: 2,
        type: "anime",
        name: "Adventure",
        url: "https://myanimelist.net/anime/genre/2",
      },
      {
        mal_id: 10,
        type: "anime",
        name: "Fantasy",
        url: "https://myanimelist.net/anime/genre/10",
      },
    ],
  },
  {
    mal_id: 11061,
    url: "https://myanimelist.net/anime/11061/Hunter_x_Hunter_2011",
    images: {
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/1337/99013.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1337/99013.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1337/99013.jpg",
      },
      webp: {
        image_url: "https://cdn.myanimelist.net/images/anime/1337/99013.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1337/99013.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1337/99013.jpg",
      },
    },
    trailer: {
      youtube_id: "IV6UWhFxg-Y",
      url: "https://www.youtube.com/watch?v=IV6UWhFxg-Y",
      embed_url:
        "https://www.youtube.com/embed/IV6UWhFxg-Y?enablejsapi=1&wmode=opaque&autoplay=1",
      images: {
        image_url: "https://img.youtube.com/vi/IV6UWhFxg-Y/default.jpg",
        small_image_url: "https://img.youtube.com/vi/IV6UWhFxg-Y/sddefault.jpg",
        medium_image_url:
          "https://img.youtube.com/vi/IV6UWhFxg-Y/mqdefault.jpg",
        large_image_url: "https://img.youtube.com/vi/IV6UWhFxg-Y/hqdefault.jpg",
        maximum_image_url:
          "https://img.youtube.com/vi/IV6UWhFxg-Y/maxresdefault.jpg",
      },
    },
    title: "Hunter x Hunter (2011)",
    title_english: "Hunter x Hunter",
    title_japanese: "HUNTER\u00d7HUNTER\uff082011\uff09",
    type: "TV",
    source: "Manga",
    episodes: 148,
    status: "Finished Airing",
    airing: false,
    aired: {
      from: "2011-01-01T00:00:00+00:00",
      to: "2011-12-31T00:00:00+00:00",
      string: "Fall 2011",
    },
    duration: "24 min per ep",
    rating: "PG-13 - Teens 13 or older",
    score: 9.04,
    scored_by: 1800000,
    rank: 9,
    popularity: 10,
    members: 3600000,
    favorites: 215000,
    synopsis:
      "Hunters devote themselves to accomplishing hazardous tasks, all from traversing the world's uncharted territories to locating rare items and monsters. Before becoming a Hunter, one must pass the rigorous Hunter Examination.",
    background: null,
    season: "fall",
    year: 2011,
    studios: [
      {
        mal_id: 11,
        type: "anime",
        name: "Madhouse",
        url: "https://myanimelist.net/anime/producer/11",
      },
    ],
    genres: [
      {
        mal_id: 1,
        type: "anime",
        name: "Action",
        url: "https://myanimelist.net/anime/genre/1",
      },
      {
        mal_id: 2,
        type: "anime",
        name: "Adventure",
        url: "https://myanimelist.net/anime/genre/2",
      },
      {
        mal_id: 10,
        type: "anime",
        name: "Fantasy",
        url: "https://myanimelist.net/anime/genre/10",
      },
    ],
  },
  {
    mal_id: 9253,
    url: "https://myanimelist.net/anime/9253/Steins_Gate",
    images: {
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/1935/127974.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1935/127974.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1935/127974.jpg",
      },
      webp: {
        image_url: "https://cdn.myanimelist.net/images/anime/1935/127974.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1935/127974.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1935/127974.jpg",
      },
    },
    trailer: {
      youtube_id: "QT3OHKPzQ1A",
      url: "https://www.youtube.com/watch?v=QT3OHKPzQ1A",
      embed_url:
        "https://www.youtube.com/embed/QT3OHKPzQ1A?enablejsapi=1&wmode=opaque&autoplay=1",
      images: {
        image_url: "https://img.youtube.com/vi/QT3OHKPzQ1A/default.jpg",
        small_image_url: "https://img.youtube.com/vi/QT3OHKPzQ1A/sddefault.jpg",
        medium_image_url:
          "https://img.youtube.com/vi/QT3OHKPzQ1A/mqdefault.jpg",
        large_image_url: "https://img.youtube.com/vi/QT3OHKPzQ1A/hqdefault.jpg",
        maximum_image_url:
          "https://img.youtube.com/vi/QT3OHKPzQ1A/maxresdefault.jpg",
      },
    },
    title: "Steins;Gate",
    title_english: "Steins;Gate",
    title_japanese: "STEINS;GATE",
    type: "TV",
    source: "Manga",
    episodes: 24,
    status: "Finished Airing",
    airing: false,
    aired: {
      from: "2011-01-01T00:00:00+00:00",
      to: "2011-12-31T00:00:00+00:00",
      string: "Spring 2011",
    },
    duration: "24 min per ep",
    rating: "PG-13 - Teens 13 or older",
    score: 9.07,
    scored_by: 1450000,
    rank: 4,
    popularity: 14,
    members: 2900000,
    favorites: 190000,
    synopsis:
      "Eccentric scientist Rintarou Okabe has a never-ending thirst for scientific exploration. Together with his ditzy friend Mayuri Shiina and the awkward conspiracy theorist Itaru Hashida, Okabe founds the Future Gadget Laboratory in the hopes of creating innovations that baffle the human psyche.",
    background: null,
    season: "spring",
    year: 2011,
    studios: [
      {
        mal_id: 314,
        type: "anime",
        name: "White Fox",
        url: "https://myanimelist.net/anime/producer/314",
      },
    ],
    genres: [
      {
        mal_id: 8,
        type: "anime",
        name: "Drama",
        url: "https://myanimelist.net/anime/genre/8",
      },
      {
        mal_id: 24,
        type: "anime",
        name: "Sci-Fi",
        url: "https://myanimelist.net/anime/genre/24",
      },
      {
        mal_id: 41,
        type: "anime",
        name: "Suspense",
        url: "https://myanimelist.net/anime/genre/41",
      },
    ],
  },
  {
    mal_id: 1535,
    url: "https://myanimelist.net/anime/1535/Death_Note",
    images: {
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/1079/138100.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1079/138100.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1079/138100.jpg",
      },
      webp: {
        image_url: "https://cdn.myanimelist.net/images/anime/1079/138100.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1079/138100.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1079/138100.jpg",
      },
    },
    trailer: {
      youtube_id: "OCkjvhrIcEE",
      url: "https://www.youtube.com/watch?v=OCkjvhrIcEE",
      embed_url:
        "https://www.youtube.com/embed/OCkjvhrIcEE?enablejsapi=1&wmode=opaque&autoplay=1",
      images: {
        image_url: "https://img.youtube.com/vi/OCkjvhrIcEE/default.jpg",
        small_image_url: "https://img.youtube.com/vi/OCkjvhrIcEE/sddefault.jpg",
        medium_image_url:
          "https://img.youtube.com/vi/OCkjvhrIcEE/mqdefault.jpg",
        large_image_url: "https://img.youtube.com/vi/OCkjvhrIcEE/hqdefault.jpg",
        maximum_image_url:
          "https://img.youtube.com/vi/OCkjvhrIcEE/maxresdefault.jpg",
      },
    },
    title: "Death Note",
    title_english: "Death Note",
    title_japanese: "\u30c7\u30b9\u30ce\u30fc\u30c8",
    type: "TV",
    source: "Manga",
    episodes: 37,
    status: "Finished Airing",
    airing: false,
    aired: {
      from: "2006-01-01T00:00:00+00:00",
      to: "2006-12-31T00:00:00+00:00",
      string: "Fall 2006",
    },
    duration: "24 min per ep",
    rating: "PG-13 - Teens 13 or older",
    score: 8.62,
    scored_by: 2800000,
    rank: 78,
    popularity: 2,
    members: 5600000,
    favorites: 175000,
    synopsis:
      "Brutal murders, petty thefts, and senseless violence pollute the human world. In contrast, the realm of death gods is a humdrum, unchanging gambling den. The ingenious 17-year-old Japanese student Light Yagami and the sadistic god of death Ryuk share one common belief: that their worlds are rotten.",
    background: null,
    season: "fall",
    year: 2006,
    studios: [
      {
        mal_id: 11,
        type: "anime",
        name: "Madhouse",
        url: "https://myanimelist.net/anime/producer/11",
      },
    ],
    genres: [
      {
        mal_id: 37,
        type: "anime",
        name: "Supernatural",
        url: "https://myanimelist.net/anime/genre/37",
      },
      {
        mal_id: 41,
        type: "anime",
        name: "Suspense",
        url: "https://myanimelist.net/anime/genre/41",
      },
    ],
  },
  {
    mal_id: 37521,
    url: "https://myanimelist.net/anime/37521/Vinland_Saga",
    images: {
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/1500/103005.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1500/103005.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1500/103005.jpg",
      },
      webp: {
        image_url: "https://cdn.myanimelist.net/images/anime/1500/103005.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1500/103005.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1500/103005.jpg",
      },
    },
    trailer: {
      youtube_id: "f8JrZ7Q_p-8",
      url: "https://www.youtube.com/watch?v=f8JrZ7Q_p-8",
      embed_url:
        "https://www.youtube.com/embed/f8JrZ7Q_p-8?enablejsapi=1&wmode=opaque&autoplay=1",
      images: {
        image_url: "https://img.youtube.com/vi/f8JrZ7Q_p-8/default.jpg",
        small_image_url: "https://img.youtube.com/vi/f8JrZ7Q_p-8/sddefault.jpg",
        medium_image_url:
          "https://img.youtube.com/vi/f8JrZ7Q_p-8/mqdefault.jpg",
        large_image_url: "https://img.youtube.com/vi/f8JrZ7Q_p-8/hqdefault.jpg",
        maximum_image_url:
          "https://img.youtube.com/vi/f8JrZ7Q_p-8/maxresdefault.jpg",
      },
    },
    title: "Vinland Saga",
    title_english: "Vinland Saga",
    title_japanese: "\u30f4\u30a3\u30f3\u30e9\u30f3\u30c9\u30fb\u30b5\u30ac",
    type: "TV",
    source: "Manga",
    episodes: 24,
    status: "Finished Airing",
    airing: false,
    aired: {
      from: "2019-01-01T00:00:00+00:00",
      to: "2019-12-31T00:00:00+00:00",
      string: "Summer 2019",
    },
    duration: "24 min per ep",
    rating: "PG-13 - Teens 13 or older",
    score: 8.75,
    scored_by: 950000,
    rank: 42,
    popularity: 38,
    members: 1900000,
    favorites: 52000,
    synopsis:
      "Young Thorfinn grew up listening to the stories of old sailors that had traveled the ocean and reached the place of legend, Vinland. It's said to be warm and fertile, a place where there would be no need for fighting\u2014not at all like the frozen village in Iceland where he was born.",
    background: null,
    season: "summer",
    year: 2019,
    studios: [
      {
        mal_id: 858,
        type: "anime",
        name: "Wit Studio",
        url: "https://myanimelist.net/anime/producer/858",
      },
    ],
    genres: [
      {
        mal_id: 1,
        type: "anime",
        name: "Action",
        url: "https://myanimelist.net/anime/genre/1",
      },
      {
        mal_id: 2,
        type: "anime",
        name: "Adventure",
        url: "https://myanimelist.net/anime/genre/2",
      },
      {
        mal_id: 8,
        type: "anime",
        name: "Drama",
        url: "https://myanimelist.net/anime/genre/8",
      },
    ],
  },
  {
    mal_id: 30276,
    url: "https://myanimelist.net/anime/30276/One_Punch_Man",
    images: {
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/12/76049.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/12/76049.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/12/76049.jpg",
      },
      webp: {
        image_url: "https://cdn.myanimelist.net/images/anime/12/76049.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/12/76049.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/12/76049.jpg",
      },
    },
    trailer: {
      youtube_id: "Poo5lqoWSGw",
      url: "https://www.youtube.com/watch?v=Poo5lqoWSGw",
      embed_url:
        "https://www.youtube.com/embed/Poo5lqoWSGw?enablejsapi=1&wmode=opaque&autoplay=1",
      images: {
        image_url: "https://img.youtube.com/vi/Poo5lqoWSGw/default.jpg",
        small_image_url: "https://img.youtube.com/vi/Poo5lqoWSGw/sddefault.jpg",
        medium_image_url:
          "https://img.youtube.com/vi/Poo5lqoWSGw/mqdefault.jpg",
        large_image_url: "https://img.youtube.com/vi/Poo5lqoWSGw/hqdefault.jpg",
        maximum_image_url:
          "https://img.youtube.com/vi/Poo5lqoWSGw/maxresdefault.jpg",
      },
    },
    title: "One Punch Man",
    title_english: "One Punch Man",
    title_japanese: "\u30ef\u30f3\u30d1\u30f3\u30de\u30f3",
    type: "TV",
    source: "Manga",
    episodes: 12,
    status: "Finished Airing",
    airing: false,
    aired: {
      from: "2015-01-01T00:00:00+00:00",
      to: "2015-12-31T00:00:00+00:00",
      string: "Fall 2015",
    },
    duration: "24 min per ep",
    rating: "PG-13 - Teens 13 or older",
    score: 8.5,
    scored_by: 2300000,
    rank: 120,
    popularity: 5,
    members: 4600000,
    favorites: 64000,
    synopsis:
      "The seemingly ordinary and unimpressive Saitama has a rather unique hobby: being a hero. In order to pursue his childhood dream, Saitama relentlessly trained for three years, losing all of his hair in the process. Now, Saitama is so powerful that he can defeat any enemy with just one punch.",
    background: null,
    season: "fall",
    year: 2015,
    studios: [
      {
        mal_id: 11,
        type: "anime",
        name: "Madhouse",
        url: "https://myanimelist.net/anime/producer/11",
      },
    ],
    genres: [
      {
        mal_id: 1,
        type: "anime",
        name: "Action",
        url: "https://myanimelist.net/anime/genre/1",
      },
      {
        mal_id: 4,
        type: "anime",
        name: "Comedy",
        url: "https://myanimelist.net/anime/genre/4",
      },
    ],
  },
  {
    mal_id: 32182,
    url: "https://myanimelist.net/anime/32182/Mob_Psycho_100",
    images: {
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/8/80356.jpg",
        small_image_url: "https://cdn.myanimelist.net/images/anime/8/80356.jpg",
        large_image_url: "https://cdn.myanimelist.net/images/anime/8/80356.jpg",
      },
      webp: {
        image_url: "https://cdn.myanimelist.net/images/anime/8/80356.jpg",
        small_image_url: "https://cdn.myanimelist.net/images/anime/8/80356.jpg",
        large_image_url: "https://cdn.myanimelist.net/images/anime/8/80356.jpg",
      },
    },
    trailer: {
      youtube_id: "aFPGhSkx7eA",
      url: "https://www.youtube.com/watch?v=aFPGhSkx7eA",
      embed_url:
        "https://www.youtube.com/embed/aFPGhSkx7eA?enablejsapi=1&wmode=opaque&autoplay=1",
      images: {
        image_url: "https://img.youtube.com/vi/aFPGhSkx7eA/default.jpg",
        small_image_url: "https://img.youtube.com/vi/aFPGhSkx7eA/sddefault.jpg",
        medium_image_url:
          "https://img.youtube.com/vi/aFPGhSkx7eA/mqdefault.jpg",
        large_image_url: "https://img.youtube.com/vi/aFPGhSkx7eA/hqdefault.jpg",
        maximum_image_url:
          "https://img.youtube.com/vi/aFPGhSkx7eA/maxresdefault.jpg",
      },
    },
    title: "Mob Psycho 100",
    title_english: "Mob Psycho 100",
    title_japanese: "\u30e2\u30d6\u30b5\u30a4\u30b3100",
    type: "TV",
    source: "Manga",
    episodes: 12,
    status: "Finished Airing",
    airing: false,
    aired: {
      from: "2016-01-01T00:00:00+00:00",
      to: "2016-12-31T00:00:00+00:00",
      string: "Summer 2016",
    },
    duration: "24 min per ep",
    rating: "PG-13 - Teens 13 or older",
    score: 8.49,
    scored_by: 1400000,
    rank: 135,
    popularity: 25,
    members: 2800000,
    favorites: 49000,
    synopsis:
      "Eighth-grader Shigeo 'Mob' Kageyama has tapped into his inner wellspring of psychic prowess at a young age. But the power quickly proves to be a liability when he realizes the potential danger in his skills. Choosing to suppress his power, Mob's only present use for his ability is to impress his longtime crush, Tsubomi.",
    background: null,
    season: "summer",
    year: 2016,
    studios: [
      {
        mal_id: 4,
        type: "anime",
        name: "Bones",
        url: "https://myanimelist.net/anime/producer/4",
      },
    ],
    genres: [
      {
        mal_id: 1,
        type: "anime",
        name: "Action",
        url: "https://myanimelist.net/anime/genre/1",
      },
      {
        mal_id: 4,
        type: "anime",
        name: "Comedy",
        url: "https://myanimelist.net/anime/genre/4",
      },
      {
        mal_id: 37,
        type: "anime",
        name: "Supernatural",
        url: "https://myanimelist.net/anime/genre/37",
      },
    ],
  },
  {
    mal_id: 47917,
    url: "https://myanimelist.net/anime/47917/Bocchi_the_Rock",
    images: {
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/1448/127956.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1448/127956.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1448/127956.jpg",
      },
      webp: {
        image_url: "https://cdn.myanimelist.net/images/anime/1448/127956.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1448/127956.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1448/127956.jpg",
      },
    },
    trailer: {
      youtube_id: "QycW-bqD1BY",
      url: "https://www.youtube.com/watch?v=QycW-bqD1BY",
      embed_url:
        "https://www.youtube.com/embed/QycW-bqD1BY?enablejsapi=1&wmode=opaque&autoplay=1",
      images: {
        image_url: "https://img.youtube.com/vi/QycW-bqD1BY/default.jpg",
        small_image_url: "https://img.youtube.com/vi/QycW-bqD1BY/sddefault.jpg",
        medium_image_url:
          "https://img.youtube.com/vi/QycW-bqD1BY/mqdefault.jpg",
        large_image_url: "https://img.youtube.com/vi/QycW-bqD1BY/hqdefault.jpg",
        maximum_image_url:
          "https://img.youtube.com/vi/QycW-bqD1BY/maxresdefault.jpg",
      },
    },
    title: "Bocchi the Rock!",
    title_english: "Bocchi the Rock!",
    title_japanese:
      "\u307c\u3063\u3061\u30fb\u3056\u30fb\u308d\u3063\u304f\uff01",
    type: "TV",
    source: "Manga",
    episodes: 12,
    status: "Finished Airing",
    airing: false,
    aired: {
      from: "2022-01-01T00:00:00+00:00",
      to: "2022-12-31T00:00:00+00:00",
      string: "Fall 2022",
    },
    duration: "24 min per ep",
    rating: "PG-13 - Teens 13 or older",
    score: 8.76,
    scored_by: 480000,
    rank: 39,
    popularity: 72,
    members: 960000,
    favorites: 38000,
    synopsis:
      "Yearning to make friends and perform live with a band, socially anxious and introverted Hitori 'Bocchi' Gotou devotes her time to playing the guitar. On a fateful day, Bocchi meets the outgoing drummer Nijika Ijichi, who invites her to join Kessoku Band.",
    background: null,
    season: "fall",
    year: 2022,
    studios: [
      {
        mal_id: 1835,
        type: "anime",
        name: "CloverWorks",
        url: "https://myanimelist.net/anime/producer/1835",
      },
    ],
    genres: [
      {
        mal_id: 4,
        type: "anime",
        name: "Comedy",
        url: "https://myanimelist.net/anime/genre/4",
      },
      {
        mal_id: 36,
        type: "anime",
        name: "Slice of Life",
        url: "https://myanimelist.net/anime/genre/36",
      },
    ],
  },
  {
    mal_id: 52588,
    url: "https://myanimelist.net/anime/52588/Kaijuu_8-gou",
    images: {
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/1370/140362.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1370/140362.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1370/140362.jpg",
      },
      webp: {
        image_url: "https://cdn.myanimelist.net/images/anime/1370/140362.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1370/140362.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1370/140362.jpg",
      },
    },
    trailer: {
      youtube_id: "TMdcTkYVVVk",
      url: "https://www.youtube.com/watch?v=TMdcTkYVVVk",
      embed_url:
        "https://www.youtube.com/embed/TMdcTkYVVVk?enablejsapi=1&wmode=opaque&autoplay=1",
      images: {
        image_url: "https://img.youtube.com/vi/TMdcTkYVVVk/default.jpg",
        small_image_url: "https://img.youtube.com/vi/TMdcTkYVVVk/sddefault.jpg",
        medium_image_url:
          "https://img.youtube.com/vi/TMdcTkYVVVk/mqdefault.jpg",
        large_image_url: "https://img.youtube.com/vi/TMdcTkYVVVk/hqdefault.jpg",
        maximum_image_url:
          "https://img.youtube.com/vi/TMdcTkYVVVk/maxresdefault.jpg",
      },
    },
    title: "Kaijuu 8-gou",
    title_english: "Kaiju No. 8",
    title_japanese: "\u602a\u73638\u53f7",
    type: "TV",
    source: "Manga",
    episodes: 12,
    status: "Currently Airing",
    airing: true,
    aired: {
      from: "2024-01-01T00:00:00+00:00",
      to: "2024-12-31T00:00:00+00:00",
      string: "Spring 2024",
    },
    duration: "24 min per ep",
    rating: "PG-13 - Teens 13 or older",
    score: 8.35,
    scored_by: 320000,
    rank: 205,
    popularity: 60,
    members: 640000,
    favorites: 24000,
    synopsis:
      "Grotesque, Godzilla-like monsters called 'kaijuu' have been appearing around Japan for many years. To combat these beasts, an elite military unit known as the Defense Corps risks their lives daily to protect civilians.",
    background: null,
    season: "spring",
    year: 2024,
    studios: [
      {
        mal_id: 10,
        type: "anime",
        name: "Production I.G",
        url: "https://myanimelist.net/anime/producer/10",
      },
    ],
    genres: [
      {
        mal_id: 1,
        type: "anime",
        name: "Action",
        url: "https://myanimelist.net/anime/genre/1",
      },
      {
        mal_id: 24,
        type: "anime",
        name: "Sci-Fi",
        url: "https://myanimelist.net/anime/genre/24",
      },
    ],
  },
  {
    mal_id: 49596,
    url: "https://myanimelist.net/anime/49596/Blue_Lock",
    images: {
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/1258/126929.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1258/126929.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1258/126929.jpg",
      },
      webp: {
        image_url: "https://cdn.myanimelist.net/images/anime/1258/126929.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1258/126929.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1258/126929.jpg",
      },
    },
    trailer: {
      youtube_id: "qpTOdrS4B4Y",
      url: "https://www.youtube.com/watch?v=qpTOdrS4B4Y",
      embed_url:
        "https://www.youtube.com/embed/qpTOdrS4B4Y?enablejsapi=1&wmode=opaque&autoplay=1",
      images: {
        image_url: "https://img.youtube.com/vi/qpTOdrS4B4Y/default.jpg",
        small_image_url: "https://img.youtube.com/vi/qpTOdrS4B4Y/sddefault.jpg",
        medium_image_url:
          "https://img.youtube.com/vi/qpTOdrS4B4Y/mqdefault.jpg",
        large_image_url: "https://img.youtube.com/vi/qpTOdrS4B4Y/hqdefault.jpg",
        maximum_image_url:
          "https://img.youtube.com/vi/qpTOdrS4B4Y/maxresdefault.jpg",
      },
    },
    title: "Blue Lock",
    title_english: "Blue Lock",
    title_japanese: "\u30d6\u30eb\u30fc\u30ed\u30c3\u30af",
    type: "TV",
    source: "Manga",
    episodes: 24,
    status: "Currently Airing",
    airing: true,
    aired: {
      from: "2022-01-01T00:00:00+00:00",
      to: "2022-12-31T00:00:00+00:00",
      string: "Fall 2022",
    },
    duration: "24 min per ep",
    rating: "PG-13 - Teens 13 or older",
    score: 8.23,
    scored_by: 580000,
    rank: 290,
    popularity: 48,
    members: 1160000,
    favorites: 29000,
    synopsis:
      "After reflecting on the current state of Japanese soccer, the Japan Football Association decides to hire the enigmatic and eccentric coach Jinpachi Ego to achieve their dream of winning the World Cup.",
    background: null,
    season: "fall",
    year: 2022,
    studios: [
      {
        mal_id: 441,
        type: "anime",
        name: "8bit",
        url: "https://myanimelist.net/anime/producer/441",
      },
    ],
    genres: [
      {
        mal_id: 1,
        type: "anime",
        name: "Action",
        url: "https://myanimelist.net/anime/genre/1",
      },
    ],
  },
  {
    mal_id: 31240,
    url: "https://myanimelist.net/anime/31240/Re_Zero_kara_Hajimeru_Isekai_Seikatsu",
    images: {
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/1522/128039.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1522/128039.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1522/128039.jpg",
      },
      webp: {
        image_url: "https://cdn.myanimelist.net/images/anime/1522/128039.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1522/128039.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1522/128039.jpg",
      },
    },
    trailer: {
      youtube_id: "lXs3yIc_2CU",
      url: "https://www.youtube.com/watch?v=lXs3yIc_2CU",
      embed_url:
        "https://www.youtube.com/embed/lXs3yIc_2CU?enablejsapi=1&wmode=opaque&autoplay=1",
      images: {
        image_url: "https://img.youtube.com/vi/lXs3yIc_2CU/default.jpg",
        small_image_url: "https://img.youtube.com/vi/lXs3yIc_2CU/sddefault.jpg",
        medium_image_url:
          "https://img.youtube.com/vi/lXs3yIc_2CU/mqdefault.jpg",
        large_image_url: "https://img.youtube.com/vi/lXs3yIc_2CU/hqdefault.jpg",
        maximum_image_url:
          "https://img.youtube.com/vi/lXs3yIc_2CU/maxresdefault.jpg",
      },
    },
    title: "Re:Zero kara Hajimeru Isekai Seikatsu",
    title_english: "Re:ZERO -Starting Life in Another World-",
    title_japanese:
      "Re:\u30bc\u30ed\u304b\u3089\u59cb\u3081\u308b\u7570\u4e16\u754c\u751f\u6d3b",
    type: "TV",
    source: "Manga",
    episodes: 25,
    status: "Currently Airing",
    airing: true,
    aired: {
      from: "2016-01-01T00:00:00+00:00",
      to: "2016-12-31T00:00:00+00:00",
      string: "Spring 2016",
    },
    duration: "24 min per ep",
    rating: "PG-13 - Teens 13 or older",
    score: 8.23,
    scored_by: 1600000,
    rank: 285,
    popularity: 16,
    members: 3200000,
    favorites: 82000,
    synopsis:
      "When Subaru Natsuki leaves the convenience store, the last thing he expects is to be wrenched from his everyday life and dropped into a fantasy world. Things aren't looking good for the bewildered teenager; however, not long after his arrival, he is attacked by some thugs.",
    background: null,
    season: "spring",
    year: 2016,
    studios: [
      {
        mal_id: 314,
        type: "anime",
        name: "White Fox",
        url: "https://myanimelist.net/anime/producer/314",
      },
    ],
    genres: [
      {
        mal_id: 8,
        type: "anime",
        name: "Drama",
        url: "https://myanimelist.net/anime/genre/8",
      },
      {
        mal_id: 10,
        type: "anime",
        name: "Fantasy",
        url: "https://myanimelist.net/anime/genre/10",
      },
      {
        mal_id: 41,
        type: "anime",
        name: "Suspense",
        url: "https://myanimelist.net/anime/genre/41",
      },
      {
        mal_id: 62,
        type: "anime",
        name: "Isekai",
        url: "https://myanimelist.net/anime/genre/62",
      },
    ],
  },
  {
    mal_id: 39535,
    url: "https://myanimelist.net/anime/39535/Mushoku_Tensei__Isekai_Ittara_Honki_Dasu",
    images: {
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/1530/117776.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1530/117776.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1530/117776.jpg",
      },
      webp: {
        image_url: "https://cdn.myanimelist.net/images/anime/1530/117776.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1530/117776.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1530/117776.jpg",
      },
    },
    trailer: {
      youtube_id: "hZ6TnKvB2rc",
      url: "https://www.youtube.com/watch?v=hZ6TnKvB2rc",
      embed_url:
        "https://www.youtube.com/embed/hZ6TnKvB2rc?enablejsapi=1&wmode=opaque&autoplay=1",
      images: {
        image_url: "https://img.youtube.com/vi/hZ6TnKvB2rc/default.jpg",
        small_image_url: "https://img.youtube.com/vi/hZ6TnKvB2rc/sddefault.jpg",
        medium_image_url:
          "https://img.youtube.com/vi/hZ6TnKvB2rc/mqdefault.jpg",
        large_image_url: "https://img.youtube.com/vi/hZ6TnKvB2rc/hqdefault.jpg",
        maximum_image_url:
          "https://img.youtube.com/vi/hZ6TnKvB2rc/maxresdefault.jpg",
      },
    },
    title: "Mushoku Tensei: Isekai Ittara Honki Dasu",
    title_english: "Mushoku Tensei: Jobless Reincarnation",
    title_japanese:
      "\u7121\u8077\u8ee2\u751f \uff5e\u7570\u4e16\u754c\u884c\u3063\u305f\u3089\u672c\u6c17\u3060\u3059\uff5e",
    type: "TV",
    source: "Manga",
    episodes: 23,
    status: "Currently Airing",
    airing: true,
    aired: {
      from: "2021-01-01T00:00:00+00:00",
      to: "2021-12-31T00:00:00+00:00",
      string: "Winter 2021",
    },
    duration: "24 min per ep",
    rating: "PG-13 - Teens 13 or older",
    score: 8.36,
    scored_by: 890000,
    rank: 195,
    popularity: 32,
    members: 1780000,
    favorites: 53000,
    synopsis:
      "Despite being bullied, scorned, and oppressed all his life, a 34-year-old shut-in still found the resolve to attempt something heroic\u2014only for it to end in a tragic accident. But in a twist of fate, he awakens in another world as Rudeus Greyrat, starting life again as a baby born to two loving parents.",
    background: null,
    season: "winter",
    year: 2021,
    studios: [
      {
        mal_id: 1993,
        type: "anime",
        name: "Studio Bind",
        url: "https://myanimelist.net/anime/producer/1993",
      },
    ],
    genres: [
      {
        mal_id: 2,
        type: "anime",
        name: "Adventure",
        url: "https://myanimelist.net/anime/genre/2",
      },
      {
        mal_id: 8,
        type: "anime",
        name: "Drama",
        url: "https://myanimelist.net/anime/genre/8",
      },
      {
        mal_id: 10,
        type: "anime",
        name: "Fantasy",
        url: "https://myanimelist.net/anime/genre/10",
      },
      {
        mal_id: 62,
        type: "anime",
        name: "Isekai",
        url: "https://myanimelist.net/anime/genre/62",
      },
    ],
  },
  {
    mal_id: 30831,
    url: "https://myanimelist.net/anime/30831/Kono_Subarashii_Sekai_ni_Shukufuku_wo",
    images: {
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/1895/142748.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1895/142748.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1895/142748.jpg",
      },
      webp: {
        image_url: "https://cdn.myanimelist.net/images/anime/1895/142748.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1895/142748.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1895/142748.jpg",
      },
    },
    trailer: {
      youtube_id: "p37syJvrlro",
      url: "https://www.youtube.com/watch?v=p37syJvrlro",
      embed_url:
        "https://www.youtube.com/embed/p37syJvrlro?enablejsapi=1&wmode=opaque&autoplay=1",
      images: {
        image_url: "https://img.youtube.com/vi/p37syJvrlro/default.jpg",
        small_image_url: "https://img.youtube.com/vi/p37syJvrlro/sddefault.jpg",
        medium_image_url:
          "https://img.youtube.com/vi/p37syJvrlro/mqdefault.jpg",
        large_image_url: "https://img.youtube.com/vi/p37syJvrlro/hqdefault.jpg",
        maximum_image_url:
          "https://img.youtube.com/vi/p37syJvrlro/maxresdefault.jpg",
      },
    },
    title: "Kono Subarashii Sekai ni Shukufuku wo!",
    title_english: "KonoSuba: God's Blessing on This Wonderful World!",
    title_japanese:
      "\u3053\u306e\u7d20\u6674\u3089\u3057\u3044\u4e16\u754c\u306b\u795d\u798f\u3092\uff01",
    type: "TV",
    source: "Manga",
    episodes: 10,
    status: "Currently Airing",
    airing: true,
    aired: {
      from: "2016-01-01T00:00:00+00:00",
      to: "2016-12-31T00:00:00+00:00",
      string: "Winter 2016",
    },
    duration: "24 min per ep",
    rating: "PG-13 - Teens 13 or older",
    score: 8.11,
    scored_by: 1200000,
    rank: 410,
    popularity: 28,
    members: 2400000,
    favorites: 44000,
    synopsis:
      "After dying a laughable and pathetic death on his way back from buying a game, high school student and recluse Kazuma Satou finds himself sitting before a beautiful but obnoxious goddess named Aqua.",
    background: null,
    season: "winter",
    year: 2016,
    studios: [
      {
        mal_id: 37,
        type: "anime",
        name: "Studio Deen",
        url: "https://myanimelist.net/anime/producer/37",
      },
    ],
    genres: [
      {
        mal_id: 2,
        type: "anime",
        name: "Adventure",
        url: "https://myanimelist.net/anime/genre/2",
      },
      {
        mal_id: 4,
        type: "anime",
        name: "Comedy",
        url: "https://myanimelist.net/anime/genre/4",
      },
      {
        mal_id: 10,
        type: "anime",
        name: "Fantasy",
        url: "https://myanimelist.net/anime/genre/10",
      },
      {
        mal_id: 62,
        type: "anime",
        name: "Isekai",
        url: "https://myanimelist.net/anime/genre/62",
      },
    ],
  },
  {
    mal_id: 46569,
    url: "https://myanimelist.net/anime/46569/Jigokuraku",
    images: {
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/1075/131925.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1075/131925.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1075/131925.jpg",
      },
      webp: {
        image_url: "https://cdn.myanimelist.net/images/anime/1075/131925.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1075/131925.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1075/131925.jpg",
      },
    },
    trailer: {
      youtube_id: "MLdk3HL09WQ",
      url: "https://www.youtube.com/watch?v=MLdk3HL09WQ",
      embed_url:
        "https://www.youtube.com/embed/MLdk3HL09WQ?enablejsapi=1&wmode=opaque&autoplay=1",
      images: {
        image_url: "https://img.youtube.com/vi/MLdk3HL09WQ/default.jpg",
        small_image_url: "https://img.youtube.com/vi/MLdk3HL09WQ/sddefault.jpg",
        medium_image_url:
          "https://img.youtube.com/vi/MLdk3HL09WQ/mqdefault.jpg",
        large_image_url: "https://img.youtube.com/vi/MLdk3HL09WQ/hqdefault.jpg",
        maximum_image_url:
          "https://img.youtube.com/vi/MLdk3HL09WQ/maxresdefault.jpg",
      },
    },
    title: "Jigokuraku",
    title_english: "Hell's Paradise",
    title_japanese: "\u5730\u7344\u697d",
    type: "TV",
    source: "Manga",
    episodes: 13,
    status: "Upcoming",
    airing: false,
    aired: {
      from: "2023-01-01T00:00:00+00:00",
      to: "2023-12-31T00:00:00+00:00",
      string: "Spring 2023",
    },
    duration: "24 min per ep",
    rating: "PG-13 - Teens 13 or older",
    score: 8.08,
    scored_by: 490000,
    rank: 450,
    popularity: 85,
    members: 980000,
    favorites: 18000,
    synopsis:
      "Gabimaru the Hollow, a ninja of Iwagakure Village known for being cold and emotionless, was set up by his fellow ninja and is now on death row. Tired of killing and betrayal, he wants to die.",
    background: null,
    season: "spring",
    year: 2023,
    studios: [
      {
        mal_id: 569,
        type: "anime",
        name: "MAPPA",
        url: "https://myanimelist.net/anime/producer/569",
      },
    ],
    genres: [
      {
        mal_id: 1,
        type: "anime",
        name: "Action",
        url: "https://myanimelist.net/anime/genre/1",
      },
      {
        mal_id: 2,
        type: "anime",
        name: "Adventure",
        url: "https://myanimelist.net/anime/genre/2",
      },
      {
        mal_id: 10,
        type: "anime",
        name: "Fantasy",
        url: "https://myanimelist.net/anime/genre/10",
      },
    ],
  },
  {
    mal_id: 37430,
    url: "https://myanimelist.net/anime/37430/Tensei_shitara_Slime_Datta_Ken",
    images: {
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/1069/123309.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1069/123309.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1069/123309.jpg",
      },
      webp: {
        image_url: "https://cdn.myanimelist.net/images/anime/1069/123309.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1069/123309.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1069/123309.jpg",
      },
    },
    trailer: {
      youtube_id: "W2_V7X6fJ18",
      url: "https://www.youtube.com/watch?v=W2_V7X6fJ18",
      embed_url:
        "https://www.youtube.com/embed/W2_V7X6fJ18?enablejsapi=1&wmode=opaque&autoplay=1",
      images: {
        image_url: "https://img.youtube.com/vi/W2_V7X6fJ18/default.jpg",
        small_image_url: "https://img.youtube.com/vi/W2_V7X6fJ18/sddefault.jpg",
        medium_image_url:
          "https://img.youtube.com/vi/W2_V7X6fJ18/mqdefault.jpg",
        large_image_url: "https://img.youtube.com/vi/W2_V7X6fJ18/hqdefault.jpg",
        maximum_image_url:
          "https://img.youtube.com/vi/W2_V7X6fJ18/maxresdefault.jpg",
      },
    },
    title: "Tensei shitara Slime Datta Ken",
    title_english: "That Time I Got Reincarnated as a Slime",
    title_japanese:
      "\u8ee2\u751f\u3057\u305f\u3089\u30b9\u30e9\u30a4\u30e0\u3060\u3063\u305f\u4ef6",
    type: "TV",
    source: "Manga",
    episodes: 24,
    status: "Currently Airing",
    airing: true,
    aired: {
      from: "2018-01-01T00:00:00+00:00",
      to: "2018-12-31T00:00:00+00:00",
      string: "Fall 2018",
    },
    duration: "24 min per ep",
    rating: "PG-13 - Teens 13 or older",
    score: 8.14,
    scored_by: 1150000,
    rank: 380,
    popularity: 29,
    members: 2300000,
    favorites: 39000,
    synopsis:
      "Thirty-seven-year-old Satoru Mikami is a typical corporate worker, who is perfectly content with his monotonous lifestyle in Tokyo. While in the midst of a casual encounter with his colleague, he falls victim to a random assailant on the streets and is stabbed. However, as he succumbs to his injuries, a peculiar voice echoes in his mind.",
    background: null,
    season: "fall",
    year: 2018,
    studios: [
      {
        mal_id: 441,
        type: "anime",
        name: "8bit",
        url: "https://myanimelist.net/anime/producer/441",
      },
    ],
    genres: [
      {
        mal_id: 1,
        type: "anime",
        name: "Action",
        url: "https://myanimelist.net/anime/genre/1",
      },
      {
        mal_id: 2,
        type: "anime",
        name: "Adventure",
        url: "https://myanimelist.net/anime/genre/2",
      },
      {
        mal_id: 4,
        type: "anime",
        name: "Comedy",
        url: "https://myanimelist.net/anime/genre/4",
      },
      {
        mal_id: 10,
        type: "anime",
        name: "Fantasy",
        url: "https://myanimelist.net/anime/genre/10",
      },
      {
        mal_id: 62,
        type: "anime",
        name: "Isekai",
        url: "https://myanimelist.net/anime/genre/62",
      },
    ],
  },
  {
    mal_id: 48583,
    url: "https://myanimelist.net/anime/48583/Shingeki_no_Kyojin__The_Final_Season_Part_2",
    images: {
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/1948/120625.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1948/120625.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1948/120625.jpg",
      },
      webp: {
        image_url: "https://cdn.myanimelist.net/images/anime/1948/120625.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1948/120625.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1948/120625.jpg",
      },
    },
    trailer: {
      youtube_id: "OBqw818mQ1E",
      url: "https://www.youtube.com/watch?v=OBqw818mQ1E",
      embed_url:
        "https://www.youtube.com/embed/OBqw818mQ1E?enablejsapi=1&wmode=opaque&autoplay=1",
      images: {
        image_url: "https://img.youtube.com/vi/OBqw818mQ1E/default.jpg",
        small_image_url: "https://img.youtube.com/vi/OBqw818mQ1E/sddefault.jpg",
        medium_image_url:
          "https://img.youtube.com/vi/OBqw818mQ1E/mqdefault.jpg",
        large_image_url: "https://img.youtube.com/vi/OBqw818mQ1E/hqdefault.jpg",
        maximum_image_url:
          "https://img.youtube.com/vi/OBqw818mQ1E/maxresdefault.jpg",
      },
    },
    title: "Shingeki no Kyojin: The Final Season Part 2",
    title_english: "Attack on Titan Final Season Part 2",
    title_japanese: "\u9032\u6483\u306e\u5de8\u4eba The Final Season Part 2",
    type: "TV",
    source: "Manga",
    episodes: 12,
    status: "Upcoming",
    airing: false,
    aired: {
      from: "2022-01-01T00:00:00+00:00",
      to: "2022-12-31T00:00:00+00:00",
      string: "Winter 2022",
    },
    duration: "24 min per ep",
    rating: "PG-13 - Teens 13 or older",
    score: 8.78,
    scored_by: 720000,
    rank: 35,
    popularity: 65,
    members: 1440000,
    favorites: 31000,
    synopsis:
      "Turning against his former allies and enemies alike, Eren Yeager sets a catastrophic plan into motion. Guided by the Beast Titan, Zeke, Eren takes extreme measures to end the ancient conflict between Marley and Eldia.",
    background: null,
    season: "winter",
    year: 2022,
    studios: [
      {
        mal_id: 569,
        type: "anime",
        name: "MAPPA",
        url: "https://myanimelist.net/anime/producer/569",
      },
    ],
    genres: [
      {
        mal_id: 1,
        type: "anime",
        name: "Action",
        url: "https://myanimelist.net/anime/genre/1",
      },
      {
        mal_id: 8,
        type: "anime",
        name: "Drama",
        url: "https://myanimelist.net/anime/genre/8",
      },
      {
        mal_id: 41,
        type: "anime",
        name: "Suspense",
        url: "https://myanimelist.net/anime/genre/41",
      },
    ],
  },
  {
    mal_id: 51009,
    url: "https://myanimelist.net/anime/51009/Jujutsu_Kaisen_2nd_Season",
    images: {
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/1792/138022.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1792/138022.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1792/138022.jpg",
      },
      webp: {
        image_url: "https://cdn.myanimelist.net/images/anime/1792/138022.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1792/138022.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1792/138022.jpg",
      },
    },
    trailer: {
      youtube_id: "pkKu9hLT-t8",
      url: "https://www.youtube.com/watch?v=pkKu9hLT-t8",
      embed_url:
        "https://www.youtube.com/embed/pkKu9hLT-t8?enablejsapi=1&wmode=opaque&autoplay=1",
      images: {
        image_url: "https://img.youtube.com/vi/pkKu9hLT-t8/default.jpg",
        small_image_url: "https://img.youtube.com/vi/pkKu9hLT-t8/sddefault.jpg",
        medium_image_url:
          "https://img.youtube.com/vi/pkKu9hLT-t8/mqdefault.jpg",
        large_image_url: "https://img.youtube.com/vi/pkKu9hLT-t8/hqdefault.jpg",
        maximum_image_url:
          "https://img.youtube.com/vi/pkKu9hLT-t8/maxresdefault.jpg",
      },
    },
    title: "Jujutsu Kaisen 2nd Season",
    title_english: "Jujutsu Kaisen Season 2",
    title_japanese:
      "\u546a\u8853\u5efb\u6226 \u61d0\u7389\u30fb\u7389\u6298\uff0f\u6e0b\u8c37\u4e8b\u5909",
    type: "TV",
    source: "Manga",
    episodes: 23,
    status: "Currently Airing",
    airing: true,
    aired: {
      from: "2023-01-01T00:00:00+00:00",
      to: "2023-12-31T00:00:00+00:00",
      string: "Summer 2023",
    },
    duration: "24 min per ep",
    rating: "PG-13 - Teens 13 or older",
    score: 8.77,
    scored_by: 780000,
    rank: 36,
    popularity: 42,
    members: 1560000,
    favorites: 46000,
    synopsis:
      "The year is 2006, and the halls of Tokyo Prefectural Jujutsu High School echo with the endless bickering and intense debate between two inseparable peers: Satoru Gojo and Suguru Geto.",
    background: null,
    season: "summer",
    year: 2023,
    studios: [
      {
        mal_id: 569,
        type: "anime",
        name: "MAPPA",
        url: "https://myanimelist.net/anime/producer/569",
      },
    ],
    genres: [
      {
        mal_id: 1,
        type: "anime",
        name: "Action",
        url: "https://myanimelist.net/anime/genre/1",
      },
      {
        mal_id: 10,
        type: "anime",
        name: "Fantasy",
        url: "https://myanimelist.net/anime/genre/10",
      },
      {
        mal_id: 37,
        type: "anime",
        name: "Supernatural",
        url: "https://myanimelist.net/anime/genre/37",
      },
    ],
  },
  {
    mal_id: 54492,
    url: "https://myanimelist.net/anime/54492/Kusuriya_no_Hitorigoto",
    images: {
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/1708/138033.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1708/138033.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1708/138033.jpg",
      },
      webp: {
        image_url: "https://cdn.myanimelist.net/images/anime/1708/138033.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1708/138033.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1708/138033.jpg",
      },
    },
    trailer: {
      youtube_id: "3lfb_KeqdEM",
      url: "https://www.youtube.com/watch?v=3lfb_KeqdEM",
      embed_url:
        "https://www.youtube.com/embed/3lfb_KeqdEM?enablejsapi=1&wmode=opaque&autoplay=1",
      images: {
        image_url: "https://img.youtube.com/vi/3lfb_KeqdEM/default.jpg",
        small_image_url: "https://img.youtube.com/vi/3lfb_KeqdEM/sddefault.jpg",
        medium_image_url:
          "https://img.youtube.com/vi/3lfb_KeqdEM/mqdefault.jpg",
        large_image_url: "https://img.youtube.com/vi/3lfb_KeqdEM/hqdefault.jpg",
        maximum_image_url:
          "https://img.youtube.com/vi/3lfb_KeqdEM/maxresdefault.jpg",
      },
    },
    title: "Kusuriya no Hitorigoto",
    title_english: "The Apothecary Diaries",
    title_japanese: "\u85ac\u5c4b\u306e\u3072\u3068\u308a\u3054\u3068",
    type: "TV",
    source: "Manga",
    episodes: 24,
    status: "Upcoming",
    airing: false,
    aired: {
      from: "2023-01-01T00:00:00+00:00",
      to: "2023-12-31T00:00:00+00:00",
      string: "Fall 2023",
    },
    duration: "24 min per ep",
    rating: "PG-13 - Teens 13 or older",
    score: 8.87,
    scored_by: 380000,
    rank: 25,
    popularity: 58,
    members: 760000,
    favorites: 33000,
    synopsis:
      "Maomao lived a peaceful life with her apothecary father. Until one day, she is sold as a lowly servant to the emperor's palace. But she wasn't meant for a compliant life among royalty.",
    background: null,
    season: "fall",
    year: 2023,
    studios: [
      {
        mal_id: 28,
        type: "anime",
        name: "OLM",
        url: "https://myanimelist.net/anime/producer/28",
      },
      {
        mal_id: 1440,
        type: "anime",
        name: "TOHO animation STUDIO",
        url: "https://myanimelist.net/anime/producer/1440",
      },
    ],
    genres: [
      {
        mal_id: 8,
        type: "anime",
        name: "Drama",
        url: "https://myanimelist.net/anime/genre/8",
      },
      {
        mal_id: 41,
        type: "anime",
        name: "Suspense",
        url: "https://myanimelist.net/anime/genre/41",
      },
    ],
  },
  {
    mal_id: 55644,
    url: "https://myanimelist.net/anime/55644/Dr_Stone__New_World_Part_2",
    images: {
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/1236/138696.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1236/138696.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1236/138696.jpg",
      },
      webp: {
        image_url: "https://cdn.myanimelist.net/images/anime/1236/138696.jpg",
        small_image_url:
          "https://cdn.myanimelist.net/images/anime/1236/138696.jpg",
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1236/138696.jpg",
      },
    },
    trailer: {
      youtube_id: "JxaJXnWDAN8",
      url: "https://www.youtube.com/watch?v=JxaJXnWDAN8",
      embed_url:
        "https://www.youtube.com/embed/JxaJXnWDAN8?enablejsapi=1&wmode=opaque&autoplay=1",
      images: {
        image_url: "https://img.youtube.com/vi/JxaJXnWDAN8/default.jpg",
        small_image_url: "https://img.youtube.com/vi/JxaJXnWDAN8/sddefault.jpg",
        medium_image_url:
          "https://img.youtube.com/vi/JxaJXnWDAN8/mqdefault.jpg",
        large_image_url: "https://img.youtube.com/vi/JxaJXnWDAN8/hqdefault.jpg",
        maximum_image_url:
          "https://img.youtube.com/vi/JxaJXnWDAN8/maxresdefault.jpg",
      },
    },
    title: "Dr. Stone: New World Part 2",
    title_english: "Dr. STONE New World Part 2",
    title_japanese: "Dr.STONE NEW WORLD \u7b2c2\u30af\u30fc\u30eb",
    type: "TV",
    source: "Manga",
    episodes: 11,
    status: "Upcoming",
    airing: false,
    aired: {
      from: "2023-01-01T00:00:00+00:00",
      to: "2023-12-31T00:00:00+00:00",
      string: "Fall 2023",
    },
    duration: "24 min per ep",
    rating: "PG-13 - Teens 13 or older",
    score: 8.28,
    scored_by: 210000,
    rank: 260,
    popularity: 95,
    members: 420000,
    favorites: 14000,
    synopsis:
      "Senku and the Kingdom of Science set out to explore the other side of the planet to find the source of the petrification phenomenon and rebuild civilization from scratch.",
    background: null,
    season: "fall",
    year: 2023,
    studios: [
      {
        mal_id: 73,
        type: "anime",
        name: "TMS Entertainment",
        url: "https://myanimelist.net/anime/producer/73",
      },
    ],
    genres: [
      {
        mal_id: 2,
        type: "anime",
        name: "Adventure",
        url: "https://myanimelist.net/anime/genre/2",
      },
      {
        mal_id: 4,
        type: "anime",
        name: "Comedy",
        url: "https://myanimelist.net/anime/genre/4",
      },
      {
        mal_id: 24,
        type: "anime",
        name: "Sci-Fi",
        url: "https://myanimelist.net/anime/genre/24",
      },
    ],
  },
];

export const MOCK_VIDEOS: Record<number, AnimeVideosData> = {
  52991: {
    promo: [
      {
        title: "Official Trailer 3",
        trailer: {
          youtube_id: "tMrydjRD_H0",
          url: "https://www.youtube.com/watch?v=tMrydjRD_H0",
          embed_url:
            "https://www.youtube.com/embed/tMrydjRD_H0?enablejsapi=1&wmode=opaque&autoplay=1",
          images: {
            image_url: "https://img.youtube.com/vi/tMrydjRD_H0/default.jpg",
            small_image_url:
              "https://img.youtube.com/vi/tMrydjRD_H0/sddefault.jpg",
            medium_image_url:
              "https://img.youtube.com/vi/tMrydjRD_H0/mqdefault.jpg",
            large_image_url:
              "https://img.youtube.com/vi/tMrydjRD_H0/hqdefault.jpg",
            maximum_image_url:
              "https://img.youtube.com/vi/tMrydjRD_H0/maxresdefault.jpg",
          },
        },
      },
      {
        title: "Teaser PV 2",
        trailer: {
          youtube_id: "ZEkwCGJ3o7M",
          url: "https://www.youtube.com/watch?v=ZEkwCGJ3o7M",
          embed_url:
            "https://www.youtube.com/embed/ZEkwCGJ3o7M?enablejsapi=1&wmode=opaque&autoplay=1",
          images: {
            image_url: "https://img.youtube.com/vi/ZEkwCGJ3o7M/default.jpg",
            small_image_url:
              "https://img.youtube.com/vi/ZEkwCGJ3o7M/sddefault.jpg",
            medium_image_url:
              "https://img.youtube.com/vi/ZEkwCGJ3o7M/mqdefault.jpg",
            large_image_url:
              "https://img.youtube.com/vi/ZEkwCGJ3o7M/hqdefault.jpg",
            maximum_image_url:
              "https://img.youtube.com/vi/ZEkwCGJ3o7M/maxresdefault.jpg",
          },
        },
      },
    ],
    episodes: [],
    music_videos: [
      {
        title: "OP - Yuusha (YOASOBI)",
        video: {
          youtube_id: "OIBODIPC_8Y",
          url: "https://www.youtube.com/watch?v=OIBODIPC_8Y",
          embed_url: "https://www.youtube.com/embed/OIBODIPC_8Y",
          images: {
            image_url: "https://img.youtube.com/vi/OIBODIPC_8Y/default.jpg",
          },
        },
        meta: {
          title: "Yuusha",
          author: "YOASOBI",
        },
      },
    ],
  },
  5114: {
    promo: [
      {
        title: "Main PV",
        trailer: {
          youtube_id: "-GoNo0DGroU",
          url: "https://www.youtube.com/watch?v=-GoNo0DGroU",
          embed_url:
            "https://www.youtube.com/embed/-GoNo0DGroU?enablejsapi=1&wmode=opaque&autoplay=1",
          images: {
            image_url: "https://img.youtube.com/vi/-GoNo0DGroU/default.jpg",
            small_image_url:
              "https://img.youtube.com/vi/-GoNo0DGroU/sddefault.jpg",
            medium_image_url:
              "https://img.youtube.com/vi/-GoNo0DGroU/mqdefault.jpg",
            large_image_url:
              "https://img.youtube.com/vi/-GoNo0DGroU/hqdefault.jpg",
            maximum_image_url:
              "https://img.youtube.com/vi/-GoNo0DGroU/maxresdefault.jpg",
          },
        },
      },
      {
        title: "Teaser PV",
        trailer: {
          youtube_id: "cpzZ9QJdK1A",
          url: "https://www.youtube.com/watch?v=cpzZ9QJdK1A",
          embed_url:
            "https://www.youtube.com/embed/cpzZ9QJdK1A?enablejsapi=1&wmode=opaque&autoplay=1",
          images: {
            image_url: "https://img.youtube.com/vi/cpzZ9QJdK1A/default.jpg",
            small_image_url:
              "https://img.youtube.com/vi/cpzZ9QJdK1A/sddefault.jpg",
            medium_image_url:
              "https://img.youtube.com/vi/cpzZ9QJdK1A/mqdefault.jpg",
            large_image_url:
              "https://img.youtube.com/vi/cpzZ9QJdK1A/hqdefault.jpg",
            maximum_image_url:
              "https://img.youtube.com/vi/cpzZ9QJdK1A/maxresdefault.jpg",
          },
        },
      },
    ],
    episodes: [],
    music_videos: [
      {
        title: "Again (YUI)",
        video: {
          youtube_id: "2uq34TeWEdQ",
          url: "https://www.youtube.com/watch?v=2uq34TeWEdQ",
          embed_url: "https://www.youtube.com/embed/2uq34TeWEdQ",
          images: {
            image_url: "https://img.youtube.com/vi/2uq34TeWEdQ/default.jpg",
          },
        },
        meta: {
          title: "Again",
          author: "YUI",
        },
      },
    ],
  },
};

export const MOCK_CHARACTERS: Record<number, AnimeCharacterItem[]> = {
  52299: [
    {
      character: {
        mal_id: 169650,
        name: "Sung Jin-Woo",
        url: "https://myanimelist.net/character/169650/Jin-woo_Sung",
        images: {
          jpg: {
            image_url:
              "https://cdn.myanimelist.net/images/anime/1741/134577.jpg",
          },
          webp: {
            image_url:
              "https://cdn.myanimelist.net/images/anime/1741/134577.webp",
            small_image_url:
              "https://cdn.myanimelist.net/images/anime/1741/134577t.webp",
          },
        },
      },
      role: "Main",
      favorites: 65400,
      voice_actors: [
        {
          person: {
            mal_id: 48937,
            name: "Ban, Taito",
            url: "https://myanimelist.net/people/48937/Taito_Ban",
            images: {
              jpg: {
                image_url:
                  "https://cdn.myanimelist.net/images/voiceactors/3/73776.jpg",
              },
            },
          },
          language: "Japanese",
        },
      ],
    },
    {
      character: {
        mal_id: 183620,
        name: "Cha Hae-In",
        url: "https://myanimelist.net/character/183620/Hae-in_Cha",
        images: {
          jpg: {
            image_url:
              "https://cdn.myanimelist.net/images/characters/2/241413.jpg",
          },
          webp: {
            image_url:
              "https://cdn.myanimelist.net/images/characters/2/241413.webp",
            small_image_url:
              "https://cdn.myanimelist.net/images/characters/2/241413t.webp",
          },
        },
      },
      role: "Main",
      favorites: 21300,
      voice_actors: [
        {
          person: {
            mal_id: 21522,
            name: "Ueda, Reina",
            url: "https://myanimelist.net/people/21522/Reina_Ueda",
            images: {
              jpg: {
                image_url:
                  "https://cdn.myanimelist.net/images/voiceactors/3/56684.jpg",
              },
            },
          },
          language: "Japanese",
        },
      ],
    },
    {
      character: {
        mal_id: 183621,
        name: "Go Gun-Hee",
        url: "https://myanimelist.net/character/183621/Gun-hee_Go",
        images: {
          jpg: {
            image_url:
              "https://cdn.myanimelist.net/images/characters/10/216895.jpg",
          },
          webp: {
            image_url:
              "https://cdn.myanimelist.net/images/characters/10/216895.webp",
            small_image_url:
              "https://cdn.myanimelist.net/images/characters/10/216895t.webp",
          },
        },
      },
      role: "Supporting",
      favorites: 9200,
      voice_actors: [
        {
          person: {
            mal_id: 1084,
            name: "Ginga, Banjou",
            url: "https://myanimelist.net/people/1084/Banjou_Ginga",
            images: {
              jpg: {
                image_url:
                  "https://cdn.myanimelist.net/images/voiceactors/1/54602.jpg",
              },
            },
          },
          language: "Japanese",
        },
      ],
    },
    {
      character: {
        mal_id: 183622,
        name: "Woo Jin-Chul",
        url: "https://myanimelist.net/character/183622/Jin-chul_Woo",
        images: {
          jpg: {
            image_url:
              "https://cdn.myanimelist.net/images/characters/9/72533.jpg",
          },
          webp: {
            image_url:
              "https://cdn.myanimelist.net/images/characters/9/72533.webp",
            small_image_url:
              "https://cdn.myanimelist.net/images/characters/9/72533t.webp",
          },
        },
      },
      role: "Supporting",
      favorites: 6100,
      voice_actors: [
        {
          person: {
            mal_id: 11635,
            name: "Furukawa, Makoto",
            url: "https://myanimelist.net/people/11635/Makoto_Furukawa",
            images: {
              jpg: {
                image_url:
                  "https://cdn.myanimelist.net/images/voiceactors/2/65500.jpg",
              },
            },
          },
          language: "Japanese",
        },
      ],
    },
    {
      character: {
        mal_id: 183623,
        name: "Baek Yoon-Ho",
        url: "https://myanimelist.net/character/183623/Yoon-ho_Baek",
        images: {
          jpg: {
            image_url:
              "https://cdn.myanimelist.net/images/characters/5/54265.jpg",
          },
          webp: {
            image_url:
              "https://cdn.myanimelist.net/images/characters/5/54265.webp",
            small_image_url:
              "https://cdn.myanimelist.net/images/characters/5/54265t.webp",
          },
        },
      },
      role: "Supporting",
      favorites: 4800,
      voice_actors: [
        {
          person: {
            mal_id: 396,
            name: "Touchi, Hiroki",
            url: "https://myanimelist.net/people/396/Hiroki_Touchi",
            images: {
              jpg: {
                image_url:
                  "https://cdn.myanimelist.net/images/voiceactors/3/73776.jpg",
              },
            },
          },
          language: "Japanese",
        },
      ],
    },
    {
      character: {
        mal_id: 183624,
        name: "Choi Jong-In",
        url: "https://myanimelist.net/character/183624/Jong-in_Choi",
        images: {
          jpg: {
            image_url:
              "https://cdn.myanimelist.net/images/characters/7/525105.jpg",
          },
          webp: {
            image_url:
              "https://cdn.myanimelist.net/images/characters/7/525105.webp",
            small_image_url:
              "https://cdn.myanimelist.net/images/characters/7/525105t.webp",
          },
        },
      },
      role: "Supporting",
      favorites: 3900,
      voice_actors: [
        {
          person: {
            mal_id: 282,
            name: "Hirakawa, Daisuke",
            url: "https://myanimelist.net/people/282/Daisuke_Hirakawa",
            images: {
              jpg: {
                image_url:
                  "https://cdn.myanimelist.net/images/voiceactors/2/65500.jpg",
              },
            },
          },
          language: "Japanese",
        },
      ],
    },
  ],
  52991: [
    {
      character: {
        mal_id: 184947,
        name: "Frieren",
        url: "https://myanimelist.net/character/184947/Frieren",
        images: {
          jpg: {
            image_url:
              "https://cdn.myanimelist.net/images/characters/7/525105.jpg",
          },
          webp: {
            image_url:
              "https://cdn.myanimelist.net/images/characters/7/525105.webp",
            small_image_url:
              "https://cdn.myanimelist.net/images/characters/7/525105t.webp",
          },
        },
      },
      role: "Main",
      favorites: 24000,
      voice_actors: [
        {
          person: {
            mal_id: 20156,
            name: "Tanezaki, Atsumi",
            url: "https://myanimelist.net/people/20156/Atsumi_Tanezaki",
            images: {
              jpg: {
                image_url:
                  "https://cdn.myanimelist.net/images/voiceactors/3/73776.jpg",
              },
            },
          },
          language: "Japanese",
        },
      ],
    },
    {
      character: {
        mal_id: 184948,
        name: "Fern",
        url: "https://myanimelist.net/character/184948/Fern",
        images: {
          jpg: {
            image_url:
              "https://cdn.myanimelist.net/images/characters/2/241413.jpg",
          },
          webp: {
            image_url:
              "https://cdn.myanimelist.net/images/characters/2/241413.webp",
            small_image_url:
              "https://cdn.myanimelist.net/images/characters/2/241413t.webp",
          },
        },
      },
      role: "Main",
      favorites: 8500,
      voice_actors: [
        {
          person: {
            mal_id: 48937,
            name: "Ichinose, Kana",
            url: "https://myanimelist.net/people/48937/Kana_Ichinose",
            images: {
              jpg: {
                image_url:
                  "https://cdn.myanimelist.net/images/voiceactors/3/56684.jpg",
              },
            },
          },
          language: "Japanese",
        },
      ],
    },
    {
      character: {
        mal_id: 184949,
        name: "Stark",
        url: "https://myanimelist.net/character/184949/Stark",
        images: {
          jpg: {
            image_url:
              "https://cdn.myanimelist.net/images/characters/10/216895.jpg",
          },
          webp: {
            image_url:
              "https://cdn.myanimelist.net/images/characters/10/216895.webp",
            small_image_url:
              "https://cdn.myanimelist.net/images/characters/10/216895t.webp",
          },
        },
      },
      role: "Main",
      favorites: 5200,
      voice_actors: [
        {
          person: {
            mal_id: 43232,
            name: "Kobayashi, Chiaki",
            url: "https://myanimelist.net/people/43232/Chiaki_Kobayashi",
            images: {
              jpg: {
                image_url:
                  "https://cdn.myanimelist.net/images/voiceactors/2/65500.jpg",
              },
            },
          },
          language: "Japanese",
        },
      ],
    },
    {
      character: {
        mal_id: 184950,
        name: "Himmel",
        url: "https://myanimelist.net/character/184950/Himmel",
        images: {
          jpg: {
            image_url:
              "https://cdn.myanimelist.net/images/characters/9/72533.jpg",
          },
          webp: {
            image_url:
              "https://cdn.myanimelist.net/images/characters/9/72533.webp",
            small_image_url:
              "https://cdn.myanimelist.net/images/characters/9/72533t.webp",
          },
        },
      },
      role: "Main",
      favorites: 12500,
      voice_actors: [
        {
          person: {
            mal_id: 99,
            name: "Okamoto, Nobuhiko",
            url: "https://myanimelist.net/people/99/Nobuhiko_Okamoto",
            images: {
              jpg: {
                image_url:
                  "https://cdn.myanimelist.net/images/voiceactors/1/54602.jpg",
              },
            },
          },
          language: "Japanese",
        },
      ],
    },
  ],
  5114: [
    {
      character: {
        mal_id: 11,
        name: "Edward Elric",
        url: "https://myanimelist.net/character/11/Edward_Elric",
        images: {
          jpg: {
            image_url:
              "https://cdn.myanimelist.net/images/characters/9/72533.jpg",
          },
          webp: {
            image_url:
              "https://cdn.myanimelist.net/images/characters/9/72533.webp",
            small_image_url:
              "https://cdn.myanimelist.net/images/characters/9/72533t.webp",
          },
        },
      },
      role: "Main",
      favorites: 88000,
      voice_actors: [
        {
          person: {
            mal_id: 82,
            name: "Romi Park",
            url: "https://myanimelist.net/people/82/Romi_Park",
            images: {
              jpg: {
                image_url:
                  "https://cdn.myanimelist.net/images/voiceactors/1/54602.jpg",
              },
            },
          },
          language: "Japanese",
        },
      ],
    },
    {
      character: {
        mal_id: 12,
        name: "Alphonse Elric",
        url: "https://myanimelist.net/character/12/Alphonse_Elric",
        images: {
          jpg: {
            image_url:
              "https://cdn.myanimelist.net/images/characters/5/54265.jpg",
          },
          webp: {
            image_url:
              "https://cdn.myanimelist.net/images/characters/5/54265.webp",
            small_image_url:
              "https://cdn.myanimelist.net/images/characters/5/54265t.webp",
          },
        },
      },
      role: "Main",
      favorites: 16000,
      voice_actors: [
        {
          person: {
            mal_id: 8,
            name: "Rie Kugimiya",
            url: "https://myanimelist.net/people/8/Rie_Kugimiya",
            images: {
              jpg: {
                image_url:
                  "https://cdn.myanimelist.net/images/voiceactors/3/63374.jpg",
              },
            },
          },
          language: "Japanese",
        },
      ],
    },
  ],
  40748: [
    {
      character: {
        mal_id: 164472,
        name: "Gojo Satoru",
        url: "https://myanimelist.net/character/164472/Satoru_Gojou",
        images: {
          jpg: {
            image_url:
              "https://cdn.myanimelist.net/images/characters/8/427644.jpg",
          },
          webp: {
            image_url:
              "https://cdn.myanimelist.net/images/characters/8/427644.webp",
            small_image_url:
              "https://cdn.myanimelist.net/images/characters/8/427644t.webp",
          },
        },
      },
      role: "Main",
      favorites: 145000,
      voice_actors: [
        {
          person: {
            mal_id: 270,
            name: "Nakamura, Yuuichi",
            url: "https://myanimelist.net/people/270/Yuuichi_Nakamura",
            images: {
              jpg: {
                image_url:
                  "https://cdn.myanimelist.net/images/voiceactors/3/73776.jpg",
              },
            },
          },
          language: "Japanese",
        },
      ],
    },
    {
      character: {
        mal_id: 164470,
        name: "Itadori Yuuji",
        url: "https://myanimelist.net/character/164470/Yuuji_Itadori",
        images: {
          jpg: {
            image_url:
              "https://cdn.myanimelist.net/images/characters/11/427643.jpg",
          },
          webp: {
            image_url:
              "https://cdn.myanimelist.net/images/characters/11/427643.webp",
            small_image_url:
              "https://cdn.myanimelist.net/images/characters/11/427643t.webp",
          },
        },
      },
      role: "Main",
      favorites: 42000,
      voice_actors: [
        {
          person: {
            mal_id: 39911,
            name: "Enoki, Junya",
            url: "https://myanimelist.net/people/39911/Junya_Enoki",
            images: {
              jpg: {
                image_url:
                  "https://cdn.myanimelist.net/images/voiceactors/2/65500.jpg",
              },
            },
          },
          language: "Japanese",
        },
      ],
    },
    {
      character: {
        mal_id: 164471,
        name: "Fushiguro Megumi",
        url: "https://myanimelist.net/character/164471/Megumi_Fushiguro",
        images: {
          jpg: {
            image_url:
              "https://cdn.myanimelist.net/images/characters/15/427645.jpg",
          },
          webp: {
            image_url:
              "https://cdn.myanimelist.net/images/characters/15/427645.webp",
            small_image_url:
              "https://cdn.myanimelist.net/images/characters/15/427645t.webp",
          },
        },
      },
      role: "Main",
      favorites: 38000,
      voice_actors: [
        {
          person: {
            mal_id: 34951,
            name: "Uchida, Yuuma",
            url: "https://myanimelist.net/people/34951/Yuuma_Uchida",
            images: {
              jpg: {
                image_url:
                  "https://cdn.myanimelist.net/images/voiceactors/1/54602.jpg",
              },
            },
          },
          language: "Japanese",
        },
      ],
    },
    {
      character: {
        mal_id: 164473,
        name: "Kugisaki Nobara",
        url: "https://myanimelist.net/character/164473/Nobara_Kugisaki",
        images: {
          jpg: {
            image_url:
              "https://cdn.myanimelist.net/images/characters/7/427646.jpg",
          },
          webp: {
            image_url:
              "https://cdn.myanimelist.net/images/characters/7/427646.webp",
            small_image_url:
              "https://cdn.myanimelist.net/images/characters/7/427646t.webp",
          },
        },
      },
      role: "Main",
      favorites: 22000,
      voice_actors: [
        {
          person: {
            mal_id: 11579,
            name: "Seto, Asami",
            url: "https://myanimelist.net/people/11579/Asami_Seto",
            images: {
              jpg: {
                image_url:
                  "https://cdn.myanimelist.net/images/voiceactors/3/56684.jpg",
              },
            },
          },
          language: "Japanese",
        },
      ],
    },
  ],
  38000: [
    {
      character: {
        mal_id: 146156,
        name: "Kamado Tanjirou",
        url: "https://myanimelist.net/character/146156/Tanjirou_Kamado",
        images: {
          jpg: {
            image_url:
              "https://cdn.myanimelist.net/images/characters/11/397120.jpg",
          },
          webp: {
            image_url:
              "https://cdn.myanimelist.net/images/characters/11/397120.webp",
            small_image_url:
              "https://cdn.myanimelist.net/images/characters/11/397120t.webp",
          },
        },
      },
      role: "Main",
      favorites: 48000,
      voice_actors: [
        {
          person: {
            mal_id: 14757,
            name: "Hanae, Natsuki",
            url: "https://myanimelist.net/people/14757/Natsuki_Hanae",
            images: {
              jpg: {
                image_url:
                  "https://cdn.myanimelist.net/images/voiceactors/2/65500.jpg",
              },
            },
          },
          language: "Japanese",
        },
      ],
    },
    {
      character: {
        mal_id: 146157,
        name: "Kamado Nezuko",
        url: "https://myanimelist.net/character/146157/Nezuko_Kamado",
        images: {
          jpg: {
            image_url:
              "https://cdn.myanimelist.net/images/characters/5/378601.jpg",
          },
          webp: {
            image_url:
              "https://cdn.myanimelist.net/images/characters/5/378601.webp",
            small_image_url:
              "https://cdn.myanimelist.net/images/characters/5/378601t.webp",
          },
        },
      },
      role: "Main",
      favorites: 32000,
      voice_actors: [
        {
          person: {
            mal_id: 34951,
            name: "Kitou, Akari",
            url: "https://myanimelist.net/people/34951/Akari_Kitou",
            images: {
              jpg: {
                image_url:
                  "https://cdn.myanimelist.net/images/voiceactors/3/56684.jpg",
              },
            },
          },
          language: "Japanese",
        },
      ],
    },
  ],
  16498: [
    {
      character: {
        mal_id: 40882,
        name: "Eren Yeager",
        url: "https://myanimelist.net/character/40882/Eren_Yeager",
        images: {
          jpg: {
            image_url:
              "https://cdn.myanimelist.net/images/characters/10/216895.jpg",
          },
          webp: {
            image_url:
              "https://cdn.myanimelist.net/images/characters/10/216895.webp",
            small_image_url:
              "https://cdn.myanimelist.net/images/characters/10/216895t.webp",
          },
        },
      },
      role: "Main",
      favorites: 120000,
      voice_actors: [
        {
          person: {
            mal_id: 672,
            name: "Kaji, Yuuki",
            url: "https://myanimelist.net/people/672/Yuuki_Kaji",
            images: {
              jpg: {
                image_url:
                  "https://cdn.myanimelist.net/images/voiceactors/2/65500.jpg",
              },
            },
          },
          language: "Japanese",
        },
      ],
    },
    {
      character: {
        mal_id: 45627,
        name: "Levi Ackerman",
        url: "https://myanimelist.net/character/45627/Levi",
        images: {
          jpg: {
            image_url:
              "https://cdn.myanimelist.net/images/characters/2/241413.jpg",
          },
          webp: {
            image_url:
              "https://cdn.myanimelist.net/images/characters/2/241413.webp",
            small_image_url:
              "https://cdn.myanimelist.net/images/characters/2/241413t.webp",
          },
        },
      },
      role: "Main",
      favorites: 150000,
      voice_actors: [
        {
          person: {
            mal_id: 118,
            name: "Kamiya, Hiroshi",
            url: "https://myanimelist.net/people/118/Hiroshi_Kamiya",
            images: {
              jpg: {
                image_url:
                  "https://cdn.myanimelist.net/images/voiceactors/1/54602.jpg",
              },
            },
          },
          language: "Japanese",
        },
      ],
    },
  ],
};

export const MOCK_RECOMMENDATIONS: Record<number, AnimeRecommendationItem[]> = {
  52991: [
    {
      entry: {
        mal_id: 5114,
        url: "https://myanimelist.net/anime/5114/Fullmetal_Alchemist__Brotherhood",
        images: {
          jpg: {
            image_url:
              "https://cdn.myanimelist.net/images/anime/1208/94745.jpg",
            small_image_url:
              "https://cdn.myanimelist.net/images/anime/1208/94745t.jpg",
            large_image_url:
              "https://cdn.myanimelist.net/images/anime/1208/94745l.jpg",
          },
          webp: {
            image_url:
              "https://cdn.myanimelist.net/images/anime/1208/94745.webp",
            small_image_url:
              "https://cdn.myanimelist.net/images/anime/1208/94745t.webp",
            large_image_url:
              "https://cdn.myanimelist.net/images/anime/1208/94745l.webp",
          },
        },
        title: "Fullmetal Alchemist: Brotherhood",
      },
      url: "https://myanimelist.net/recommendations/anime/5114-52991",
      votes: 110,
    },
    {
      entry: {
        mal_id: 40748,
        url: "https://myanimelist.net/anime/40748/Jujutsu_Kaisen",
        images: {
          jpg: {
            image_url:
              "https://cdn.myanimelist.net/images/anime/1171/109222.jpg",
            small_image_url:
              "https://cdn.myanimelist.net/images/anime/1171/109222t.jpg",
            large_image_url:
              "https://cdn.myanimelist.net/images/anime/1171/109222l.jpg",
          },
          webp: {
            image_url:
              "https://cdn.myanimelist.net/images/anime/1171/109222.webp",
            small_image_url:
              "https://cdn.myanimelist.net/images/anime/1171/109222t.webp",
            large_image_url:
              "https://cdn.myanimelist.net/images/anime/1171/109222l.webp",
          },
        },
        title: "Jujutsu Kaisen",
      },
      url: "https://myanimelist.net/recommendations/anime/40748-52991",
      votes: 85,
    },
  ],
};

export function getMockEpisodes(
  animeId: number,
  totalEpisodes = 24,
  page = 1,
  perPage = 25,
): JikanResponse<AnimeEpisode[]> {
  const episodes: AnimeEpisode[] = [];
  const start = (page - 1) * perPage + 1;
  const end = Math.min(start + perPage - 1, totalEpisodes);

  for (let i = start; i <= end; i++) {
    episodes.push({
      mal_id: i,
      url: `https://myanimelist.net/anime/${animeId}/episode/${i}`,
      title: `Episode ${i}`,
      title_japanese: `第${i}話`,
      title_romanji: `Dai ${i} Wa`,
      aired: new Date(
        Date.now() - (totalEpisodes - i) * 7 * 24 * 3600 * 1000,
      ).toISOString(),
      score: +(8.0 + (i % 10) * 0.15).toFixed(2),
      filler: i % 8 === 0,
      recap: false,
      forum_url: null,
    });
  }

  const lastPage = Math.ceil(totalEpisodes / perPage) || 1;

  return {
    data: episodes,
    pagination: {
      last_visible_page: lastPage,
      has_next_page: page < lastPage,
      current_page: page,
      items: {
        count: episodes.length,
        total: totalEpisodes,
        per_page: perPage,
      },
    },
  };
}
