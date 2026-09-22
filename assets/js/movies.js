/* Movie data store — each entry is linked to a card via its unique id. */

window.MOVIES = {
    "stranger-things": {
        id: "stranger-things",
        title: "Stranger Things",
        poster: "https://image.tmdb.org/t/p/w500/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg",
        backdrop: "https://i.ytimg.com/vi/mVsJXiI60a0/maxresdefault.jpg",
        description:
            "When a young boy disappears, his friends, family and the police are drawn into a mystery involving secret experiments and terrifying supernatural forces.",
        genres: ["Sci-Fi", "Horror", "Drama"],
        year: 2022,
        duration: "4 Seasons",
        rating: 8.6,
        trailer: "mVsJXiI60a0",
        movieUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        cast: [
            "Millie Bobby Brown",
            "Finn Wolfhard",
            "Winona Ryder",
            "David Harbour",
            "Gaten Matarazzo"
        ],
        director: "The Duffer Brothers",
        language: "English",
        ageRating: "16+"
    },

    "joker": {
        id: "joker",
        title: "Joker",
        poster: "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
        backdrop: "https://i.ytimg.com/vi/t433PEQGErc/maxresdefault.jpg",
        description:
            "Struggling stand-up comedian Arthur Fleck descends into madness in Gotham City, becoming the criminal mastermind known as the Joker.",
        genres: ["Crime", "Drama"],
        year: 2019,
        duration: "2h 2m",
        rating: 8.1,
        trailer: "t433PEQGErc",
        movieUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        cast: ["Joaquin Phoenix", "Robert De Niro", "Zazie Beetz", "Frances Conroy"],
        director: "Todd Phillips",
        language: "English",
        ageRating: "16+"
    },

    "spider-man-no-way-home": {
        id: "spider-man-no-way-home",
        title: "Spider-Man: No Way Home",
        poster: "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
        backdrop: "https://i.ytimg.com/vi/JfVOs4VSpmA/maxresdefault.jpg",
        description:
            "With his identity exposed, Peter Parker asks Doctor Strange for help, unwittingly unleashing dangerous villains from across the multiverse.",
        genres: ["Action", "Adventure"],
        year: 2021,
        duration: "2h 28m",
        rating: 8.2,
        trailer: "JfVOs4VSpmA",
        movieUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        cast: ["Tom Holland", "Zendaya", "Benedict Cumberbatch", "Jacob Batalon"],
        director: "Jon Watts",
        language: "English",
        ageRating: "13+"
    },

    "the-godfather": {
        id: "the-godfather",
        title: "The Godfather",
        poster: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
        backdrop: "https://i.ytimg.com/vi/sY1S34973zA/maxresdefault.jpg",
        description:
            "The aging patriarch of an organized crime dynasty transfers control of his empire to his reluctant son, Michael Corleone.",
        genres: ["Crime", "Drama"],
        year: 1972,
        duration: "2h 55m",
        rating: 9.2,
        trailer: "sY1S34973zA",
        movieUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        cast: ["Marlon Brando", "Al Pacino", "James Caan", "Robert Duvall"],
        director: "Francis Ford Coppola",
        language: "English",
        ageRating: "16+"
    },

    "gladiator": {
        id: "gladiator",
        title: "Gladiator",
        poster: "https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg",
        backdrop: "https://i.ytimg.com/vi/P5ieIbInFpg/maxresdefault.jpg",
        description:
            "A betrayed Roman general comes to Rome as a gladiator to seek revenge against the corrupt emperor who murdered his family.",
        genres: ["Action", "Adventure"],
        year: 2000,
        duration: "2h 35m",
        rating: 8.5,
        trailer: "P5ieIbInFpg",
        movieUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        cast: ["Russell Crowe", "Joaquin Phoenix", "Connie Nielsen", "Oliver Reed"],
        director: "Ridley Scott",
        language: "English",
        ageRating: "16+"
    },

    "fight-club": {
        id: "fight-club",
        title: "Fight Club",
        poster: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
        backdrop: "https://i.ytimg.com/vi/qtRKdVHc-cE/maxresdefault.jpg",
        description:
            "An insomniac office worker and a mysterious soap salesman channel primal male aggression into a covert network of underground fight clubs.",
        genres: ["Drama", "Thriller"],
        year: 1999,
        duration: "2h 19m",
        rating: 8.8,
        trailer: "qtRKdVHc-cE",
        movieUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
        cast: ["Brad Pitt", "Edward Norton", "Helena Bonham Carter"],
        director: "David Fincher",
        language: "English",
        ageRating: "18+"
    },

    "pulp-fiction": {
        id: "pulp-fiction",
        title: "Pulp Fiction",
        poster: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
        backdrop: "https://i.ytimg.com/vi/tGpTpVyI_OQ/maxresdefault.jpg",
        description:
            "The lives of two mob hitmen, a boxer, a gangster's wife and a pair of diner bandits intertwine in four tales of violence and redemption.",
        genres: ["Crime", "Drama"],
        year: 1994,
        duration: "2h 34m",
        rating: 8.9,
        trailer: "tGpTpVyI_OQ",
        movieUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
        cast: [
            "John Travolta",
            "Samuel L. Jackson",
            "Uma Thurman",
            "Bruce Willis"
        ],
        director: "Quentin Tarantino",
        language: "English",
        ageRating: "18+"
    },

    "wonder-woman": {
        id: "wonder-woman",
        title: "Wonder Woman",
        poster: "https://image.tmdb.org/t/p/w500/8UlWHLMpgZm9bx6QYh0NFoq67TZ.jpg",
        backdrop: "https://i.ytimg.com/vi/INLzqh7rZ-U/maxresdefault.jpg",
        description:
            "Before she was Wonder Woman, Diana of Themyscira leaves her island home to fight beside man in the middle of World War I.",
        genres: ["Action", "Adventure"],
        year: 2017,
        duration: "2h 21m",
        rating: 7.3,
        trailer: "INLzqh7rZ-U",
        movieUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
        cast: ["Gal Gadot", "Chris Pine", "Robin Wright", "Connie Nielsen"],
        director: "Patty Jenkins",
        language: "English",
        ageRating: "12+"
    },

    "wednesday": {
        id: "wednesday",
        title: "Wednesday",
        poster: "https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg",
        backdrop: "https://i.ytimg.com/vi/Di310WS8zLk/maxresdefault.jpg",
        description:
            "Wednesday Addams masters her emerging psychic ability while investigating a murder mystery at Nevermore Academy.",
        genres: ["Comedy", "Fantasy"],
        year: 2022,
        duration: "2 Seasons",
        rating: 8.0,
        trailer: "Di310WS8zLk",
        movieUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        cast: ["Jenna Ortega", "Catherine Zeta-Jones", "Christina Ricci", "Gwendoline Christie"],
        director: "Tim Burton",
        language: "English",
        ageRating: "13+"
    },

    "money-heist": {
        id: "money-heist",
        title: "Money Heist",
        poster: "https://image.tmdb.org/t/p/w500/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg",
        backdrop: "https://i.ytimg.com/vi/p_PJbmrX4uk/maxresdefault.jpg",
        description:
            "A criminal mastermind known as the Professor recruits eight raiders to carry out the biggest heist in recorded history.",
        genres: ["Crime", "Thriller"],
        year: 2017,
        duration: "5 Parts",
        rating: 8.2,
        trailer: "p_PJbmrX4uk",
        movieUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        cast: ["Úrsula Corberó", "Álvaro Morte", "Pedro Alonso", "Itziar Ituño"],
        director: "Álex Pina",
        language: "Spanish",
        ageRating: "16+"
    },

    "the-queens-gambit": {
        id: "the-queens-gambit",
        title: "The Queen's Gambit",
        poster: "https://image.tmdb.org/t/p/w500/zU0htwkhNvBQdVSIKB9s6hgVeFK.jpg",
        backdrop: "https://i.ytimg.com/vi/oZn3qSgmLqI/maxresdefault.jpg",
        description:
            "In the 1950s, a young chess prodigy rises from an orphanage to the world stage while battling an addiction to tranquilizers.",
        genres: ["Drama"],
        year: 2020,
        duration: "1 Season",
        rating: 8.5,
        trailer: "oZn3qSgmLqI",
        movieUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        cast: ["Anya Taylor-Joy", "Bill Camp", "Thomas Brodie-Sangster", "Marielle Heller"],
        director: "Scott Frank",
        language: "English",
        ageRating: "16+"
    },

    "squid-game": {
        id: "squid-game",
        title: "Squid Game",
        poster: "https://image.tmdb.org/t/p/w500/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg",
        backdrop: "https://i.ytimg.com/vi/oqxAJKy0ii4/maxresdefault.jpg",
        description:
            "Hundreds of cash-strapped players risk their lives in a mysterious survival game with a life-changing prize at stake.",
        genres: ["Thriller", "Drama"],
        year: 2021,
        duration: "2 Seasons",
        rating: 8.0,
        trailer: "oqxAJKy0ii4",
        movieUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        cast: ["Lee Jung-jae", "Park Hae-soo", "Jung Ho-yeon", "Wi Ha-joon"],
        director: "Hwang Dong-hyuk",
        language: "Korean",
        ageRating: "16+"
    },

    "breaking-bad": {
        id: "breaking-bad",
        title: "Breaking Bad",
        poster: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
        backdrop: "https://i.ytimg.com/vi/HhesaQXLuRY/maxresdefault.jpg",
        description:
            "A terminally ill chemistry teacher partners with a former student to build a meth empire that spirals out of control.",
        genres: ["Crime", "Drama"],
        year: 2008,
        duration: "5 Seasons",
        rating: 9.4,
        trailer: "HhesaQXLuRY",
        movieUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        cast: ["Bryan Cranston", "Aaron Paul", "Anna Gunn", "Bob Odenkirk"],
        director: "Vince Gilligan",
        language: "English",
        ageRating: "16+"
    },

    "interstellar": {
        id: "interstellar",
        title: "Interstellar",
        poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
        backdrop: "https://i.ytimg.com/vi/zSWdZVtXT7E/maxresdefault.jpg",
        description:
            "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
        genres: ["Sci-Fi", "Drama"],
        year: 2014,
        duration: "2h 49m",
        rating: 8.6,
        trailer: "zSWdZVtXT7E",
        movieUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain", "Michael Caine"],
        director: "Christopher Nolan",
        language: "English",
        ageRating: "13+"
    },

    "the-dark-knight": {
        id: "the-dark-knight",
        title: "The Dark Knight",
        poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        backdrop: "https://i.ytimg.com/vi/EXeTwQWrcwY/maxresdefault.jpg",
        description:
            "Batman, with the help of Commissioner Gordon and DA Harvey Dent, faces the chaos unleashed by the anarchic Joker.",
        genres: ["Action", "Crime"],
        year: 2008,
        duration: "2h 32m",
        rating: 9.0,
        trailer: "EXeTwQWrcwY",
        movieUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
        cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart", "Michael Caine"],
        director: "Christopher Nolan",
        language: "English",
        ageRating: "13+"
    },

    "parasite": {
        id: "parasite",
        title: "Parasite",
        poster: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
        backdrop: "https://i.ytimg.com/vi/5xH0HfJHsaY/maxresdefault.jpg",
        description:
            "Greed and class discrimination threaten a poor family who cunningly insinuate themselves into a wealthy household.",
        genres: ["Thriller", "Comedy"],
        year: 2019,
        duration: "2h 12m",
        rating: 8.5,
        trailer: "5xH0HfJHsaY",
        movieUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        cast: ["Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong", "Choi Woo-shik"],
        director: "Bong Joon-ho",
        language: "Korean",
        ageRating: "16+"
    },

    "avengers-endgame": {
        id: "avengers-endgame",
        title: "Avengers: Endgame",
        poster: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
        backdrop: "https://i.ytimg.com/vi/TcMBFSGVi1c/maxresdefault.jpg",
        description:
            "The Avengers assemble once more to reverse Thanos's snap and bring back everyone lost to the decimation.",
        genres: ["Action", "Adventure"],
        year: 2019,
        duration: "3h 1m",
        rating: 8.4,
        trailer: "TcMBFSGVi1c",
        movieUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        cast: [
            "Robert Downey Jr.",
            "Chris Evans",
            "Mark Ruffalo",
            "Chris Hemsworth"
        ],
        director: "Anthony & Joe Russo",
        language: "English",
        ageRating: "12+"
    },

    "the-matrix": {
        id: "the-matrix",
        title: "The Matrix",
        poster: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
        backdrop: "https://i.ytimg.com/vi/vKQi3bBA1y8/maxresdefault.jpg",
        description:
            "A hacker discovers that the world he lives in is a simulated reality and joins a rebellion to free humanity.",
        genres: ["Sci-Fi", "Action"],
        year: 1999,
        duration: "2h 16m",
        rating: 8.7,
        trailer: "vKQi3bBA1y8",
        movieUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
        cast: ["Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss", "Hugo Weaving"],
        director: "The Wachowskis",
        language: "English",
        ageRating: "16+"
    },

    "spider-man-into-the-spider-verse": {
        id: "spider-man-into-the-spider-verse",
        title: "Spider-Man: Into the Spider-Verse",
        poster: "https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg",
        backdrop: "https://i.ytimg.com/vi/g4Hbz2jLxvQ/maxresdefault.jpg",
        description:
            "Teenager Miles Morales becomes Spider-Man and must team up with Spider-heroes from other dimensions to save all realities.",
        genres: ["Animation", "Action"],
        year: 2018,
        duration: "1h 57m",
        rating: 8.4,
        trailer: "g4Hbz2jLxvQ",
        movieUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
        cast: ["Shameik Moore", "Jake Johnson", "Hailee Steinfeld", "Mahershala Ali"],
        director: "Bob Persichetti, Peter Ramsey, Rodney Rothman",
        language: "English",
        ageRating: "12+"
    },

    "the-social-network": {
        id: "the-social-network",
        title: "The Social Network",
        poster: "https://image.tmdb.org/t/p/w500/n0ybibhJtQ5icDqTp8eRytcIHJx.jpg",
        backdrop: "https://i.ytimg.com/vi/2RB3edZyeYw/maxresdefault.jpg",
        description:
            "Harvard student Mark Zuckerberg creates Facebook and is later sued by the classmates who claim he stole their idea.",
        genres: ["Drama"],
        year: 2010,
        duration: "2h 1m",
        rating: 7.8,
        trailer: "2RB3edZyeYw",
        movieUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        cast: ["Jesse Eisenberg", "Andrew Garfield", "Justin Timberlake", "Rooney Mara"],
        director: "David Fincher",
        language: "English",
        ageRating: "13+"
    },

    "the-shawshank-redemption": {
        id: "the-shawshank-redemption",
        title: "The Shawshank Redemption",
        poster: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
        backdrop: "https://i.ytimg.com/vi/6hB3S9bIaco/hqdefault.jpg",
        description:
            "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
        genres: ["Drama"],
        year: 1994,
        duration: "2h 22m",
        rating: 9.3,
        trailer: "6hB3S9bIaco",
        movieUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        cast: ["Tim Robbins", "Morgan Freeman", "Bob Gunton", "William Sadler"],
        director: "Frank Darabont",
        language: "English",
        ageRating: "16+"
    },

    "spongebob-squarepants": {
        id: "spongebob-squarepants",
        title: "The SpongeBob SquarePants Movie",
        poster: "assets/images/1cfe745c47c51fa158a33018b4eb0126498138e1a6ba2cba5afc606b2fe34500.jpg",
        backdrop: "https://i.ytimg.com/vi/Tv8xk7BKaNM/maxresdefault.jpg",
        description:
            "SpongeBob and Patrick brave a dangerous journey to Shell City to recover King Neptune's crown and save Mr. Krabs and Bikini Bottom.",
        genres: ["Animation", "Comedy"],
        year: 2004,
        duration: "1h 27m",
        rating: 7.2,
        trailer: "Tv8xk7BKaNM",
        movieUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        cast: ["Tom Kenny", "Bill Fagerbakke", "Clancy Brown", "Rodger Bumpass"],
        director: "Stephen Hillenburg",
        language: "English",
        ageRating: "7+"
    },

    /*
     * Public-domain classics, streamed free from the Internet Archive.
     * Each entry carries an archiveId; main.js resolves the real MP4 file
     * at play time so no movie key is ever needed.
     */

    "night-of-the-living-dead": {
        id: "night-of-the-living-dead",
        title: "Night of the Living Dead",
        poster: "https://archive.org/services/img/notld_201610",
        backdrop: "https://archive.org/services/img/notld_201610",
        description:
            "A group of strangers seek refuge in a rural farmhouse as a rising tide of flesh-eating ghouls surrounds them. The landmark horror film that changed the genre forever.",
        genres: ["Horror", "Thriller"],
        year: 1968,
        duration: "1h 36m",
        rating: 7.9,
        trailer: null,
        movieUrl: null,
        archiveId: "notld_201610",
        cast: ["Duane Jones", "Judith O'Dea", "Karl Hardman", "Marilyn Eastman", "Judith Ridley"],
        director: "George A. Romero",
        language: "English",
        ageRating: null
    },

    "plan-9-from-outer-space": {
        id: "plan-9-from-outer-space",
        title: "Plan 9 from Outer Space",
        poster: "https://archive.org/services/img/plan-9-from-outer-space_zomboo",
        backdrop: "https://archive.org/services/img/plan-9-from-outer-space_zomboo",
        description:
            "Aliens revive the dead on Earth to stop humanity from developing space weaponry — the famously hilarious cult classic from Ed Wood.",
        genres: ["Horror", "Sci-Fi"],
        year: 1959,
        duration: "1h 19m",
        rating: 4.0,
        trailer: null,
        movieUrl: null,
        archiveId: "plan-9-from-outer-space_zomboo",
        cast: ["Bela Lugosi", "Maila Nurmi", "Gregory Walcott", "Tor Johnson", "Duke Moore"],
        director: "Edward D. Wood Jr.",
        language: "English",
        ageRating: null
    },

    "carnival-of-souls": {
        id: "carnival-of-souls",
        title: "Carnival of Souls",
        poster: "https://archive.org/services/img/CarnivalOfSouls720p1962",
        backdrop: "https://archive.org/services/img/CarnivalOfSouls720p1962",
        description:
            "After a car accident, a young organist moves to a small town where she is haunted by an abandoned carnival and pursued by a silent, ghostly figure.",
        genres: ["Horror", "Thriller"],
        year: 1962,
        duration: "1h 18m",
        rating: 7.0,
        trailer: null,
        movieUrl: null,
        archiveId: "CarnivalOfSouls720p1962",
        cast: ["Candace Hilligoss", "Frances Feist", "Sidney Berger", "Art Ellison"],
        director: "Herk Harvey",
        language: "English",
        ageRating: null
    },

    "little-shop-of-horrors": {
        id: "little-shop-of-horrors",
        title: "The Little Shop of Horrors",
        poster: "https://archive.org/services/img/TheLittleShopOfHorrors1960_765",
        backdrop: "https://archive.org/services/img/TheLittleShopOfHorrors1960_765",
        description:
            "A clumsy flower shop assistant cultivates a blood-hungry plant that grows more and more demanding as his customers mysteriously disappear.",
        genres: ["Comedy", "Horror"],
        year: 1960,
        duration: "1h 10m",
        rating: 6.9,
        trailer: null,
        movieUrl: null,
        archiveId: "TheLittleShopOfHorrors1960_765",
        cast: ["Jonathan Haze", "Jackie Joseph", "Mel Welles", "Dick Miller"],
        director: "Roger Corman",
        language: "English",
        ageRating: null
    },

    "santa-claus-conquers-the-martians": {
        id: "santa-claus-conquers-the-martians",
        title: "Santa Claus Conquers the Martians",
        poster: "https://archive.org/services/img/santa-claus-conquers-the-martians-1964-by-nicholas-webster",
        backdrop: "https://archive.org/services/img/santa-claus-conquers-the-martians-1964-by-nicholas-webster",
        description:
            "The Martians kidnap Santa Claus to cheer up their children — a wonderfully absurd holiday classic from 1964.",
        genres: ["Comedy", "Sci-Fi"],
        year: 1964,
        duration: "1h 21m",
        rating: 4.2,
        trailer: null,
        movieUrl: null,
        archiveId: "santa-claus-conquers-the-martians-1964-by-nicholas-webster",
        cast: ["John Call", "Leonard Hicks", "Vincent Beck", "Pia Zadora"],
        director: "Nicholas Webster",
        language: "English",
        ageRating: null
    },

    "reefer-madness": {
        id: "reefer-madness",
        title: "Reefer Madness",
        poster: "https://archive.org/services/img/reefer-madness-1936-by-louis-j.-gasnier",
        backdrop: "https://archive.org/services/img/reefer-madness-1936-by-louis-j.-gasnier",
        description:
            "A cautionary tale where jazz, marijuana and high school students collide in spectacular fashion — the most rewatched 'educational' film ever made.",
        genres: ["Drama", "Comedy"],
        year: 1936,
        duration: "1h 8m",
        rating: 6.0,
        trailer: null,
        movieUrl: null,
        archiveId: "reefer-madness-1936-by-louis-j.-gasnier",
        cast: ["Dorothy Short", "Kenneth Craig", "Lillian Miles", "Dave O'Brien"],
        director: "Louis J. Gasnier",
        language: "English",
        ageRating: null
    },

    "the-general": {
        id: "the-general",
        title: "The General",
        poster: "https://archive.org/services/img/TheGeneral720p1926",
        backdrop: "https://archive.org/services/img/TheGeneral720p1926",
        description:
            "During the Civil War, a Southern train engineer chases a stolen locomotive — Buster Keaton's silent masterpiece of brick-for-brick stunt comedy.",
        genres: ["Comedy", "Action"],
        year: 1926,
        duration: "1h 15m",
        rating: 8.1,
        trailer: null,
        movieUrl: null,
        archiveId: "TheGeneral720p1926",
        cast: ["Buster Keaton", "Marion Mack", "Glen Cavender", "Jim Farley"],
        director: "Buster Keaton & Clyde Bruckman",
        language: "Silent",
        ageRating: null
    },

    "nosferatu": {
        id: "nosferatu",
        title: "Nosferatu",
        poster: "https://archive.org/services/img/nosferatu_201907",
        backdrop: "https://archive.org/services/img/nosferatu_201907",
        description:
            "A young real estate agent travels to Transylvania and visits a mysterious count — the eerie 1922 German expressionist vampire horror.",
        genres: ["Horror", "Fantasy"],
        year: 1922,
        duration: "1h 34m",
        rating: 7.9,
        trailer: null,
        movieUrl: null,
        archiveId: "nosferatu_201907",
        cast: ["Max Schreck", "Greta Schröder", "Alexander Granach", "Ruth Landshoff"],
        director: "F. W. Murnau",
        language: "Silent",
        ageRating: null
    },

    "house-on-haunted-hill": {
        id: "house-on-haunted-hill",
        title: "House on Haunted Hill",
        poster: "https://archive.org/services/img/houseonhauntedhill_201907",
        backdrop: "https://archive.org/services/img/houseonhauntedhill_201907",
        description:
            "A millionaire offers a group of strangers a fortune to spend one night in a house with a deadly history — Vincent Price at his sinister best.",
        genres: ["Horror", "Thriller"],
        year: 1959,
        duration: "1h 15m",
        rating: 6.8,
        trailer: null,
        movieUrl: null,
        archiveId: "houseonhauntedhill_201907",
        cast: ["Vincent Price", "Carol Ohmart", "Richard Long", "Elisha Cook Jr."],
        director: "William Castle",
        language: "English",
        ageRating: null
    },

    "detour": {
        id: "detour",
        title: "Detour",
        poster: "https://archive.org/services/img/detour-1945_202310",
        backdrop: "https://archive.org/services/img/detour-1945_202310",
        description:
            "A down-on-his-luck hitchhiker's ride to California takes a wrong turn into a nightmare of guilt, an ominous blonde and no way out. A micro-budget noir classic.",
        genres: ["Film-Noir", "Thriller"],
        year: 1945,
        duration: "1h 7m",
        rating: 7.3,
        trailer: null,
        movieUrl: null,
        archiveId: "detour-1945_202310",
        cast: ["Tom Neal", "Ann Savage", "Claudia Drake", "Edmund MacDonald"],
        director: "Edgar G. Ulmer",
        language: "English",
        ageRating: null
    }
};

/*
 * TMDB id -> slug lookup, used to resolve favorited movies back to the
 * static data store when the API is unavailable.
 */
window.MOVIES_IDS = {
    movie: {
        "475557": "joker",
        "634649": "spider-man-no-way-home",
        "238": "the-godfather",
        "98": "gladiator",
        "550": "fight-club",
        "680": "pulp-fiction",
        "141052": "wonder-woman",
        "157336": "interstellar",
        "155": "the-dark-knight",
        "496243": "parasite",
        "299534": "avengers-endgame",
        "603": "the-matrix",
        "324857": "spider-man-into-the-spider-verse",
        "37799": "the-social-network",
        "278": "the-shawshank-redemption",
        "161": "spongebob-squarepants"
    },
    tv: {
        "66732": "stranger-things",
        "119051": "wednesday",
        "71446": "money-heist",
        "82826": "the-queens-gambit",
        "93405": "squid-game",
        "1396": "breaking-bad"
    }
};