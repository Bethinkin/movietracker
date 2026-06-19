import type { SavedMovie } from './types'

/**
 * Sample library so the UI looks populated before a TMDB key is added.
 * Image paths are real TMDB paths (served publicly via the image CDN, no key
 * needed). Seeded only when the library is empty on first load — see storage.ts.
 */
export const SEED_MOVIES: SavedMovie[] = [
  {
    id: 27205,
    title: 'Inception',
    posterPath: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
    backdropPath: '/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
    releaseYear: '2010',
    overview:
      'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets, is offered a chance to regain his old life as payment for a task considered to be impossible: "inception", the implantation of another person\'s idea into a target\'s subconscious.',
    tmdbRating: 8.4,
    genres: ['Action', 'Science Fiction', 'Adventure'],
    status: 'seen',
    userRating: 5,
    notes: 'Still holds up. The hallway fight is unreal.',
    addedAt: '2026-05-01T12:00:00.000Z',
    watchedAt: '2026-05-01T12:00:00.000Z',
  },
  {
    id: 157336,
    title: 'Interstellar',
    posterPath: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdropPath: '/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    releaseYear: '2014',
    overview:
      'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
    tmdbRating: 8.4,
    genres: ['Adventure', 'Drama', 'Science Fiction'],
    status: 'seen',
    userRating: 5,
    notes: 'The docking scene. Need I say more.',
    addedAt: '2026-05-03T12:00:00.000Z',
    watchedAt: '2026-05-03T12:00:00.000Z',
  },
  {
    id: 155,
    title: 'The Dark Knight',
    posterPath: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdropPath: '/dqK9Hag1054tghRQSqLSfrkvQnA.jpg',
    releaseYear: '2008',
    overview:
      'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets — but a rising criminal mastermind known as the Joker throws Gotham into anarchy.',
    tmdbRating: 8.5,
    genres: ['Drama', 'Action', 'Crime', 'Thriller'],
    status: 'seen',
    userRating: 5,
    addedAt: '2026-05-05T12:00:00.000Z',
    watchedAt: '2026-05-05T12:00:00.000Z',
  },
  {
    id: 496243,
    title: 'Parasite',
    posterPath: '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    backdropPath: '/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg',
    releaseYear: '2019',
    overview:
      'All unemployed, Ki-taek\'s family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.',
    tmdbRating: 8.5,
    genres: ['Comedy', 'Thriller', 'Drama'],
    status: 'seen',
    userRating: 4,
    notes: 'That basement reveal.',
    addedAt: '2026-05-08T12:00:00.000Z',
    watchedAt: '2026-05-08T12:00:00.000Z',
  },
  {
    id: 335984,
    title: 'Blade Runner 2049',
    posterPath: '/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
    backdropPath: '/ilRyazdMJwN05exqhwK4tMKBYZs.jpg',
    releaseYear: '2017',
    overview:
      'Thirty years after the events of the first film, a new blade runner, LAPD Officer K, unearths a long-buried secret that has the potential to plunge what\'s left of society into chaos.',
    tmdbRating: 7.6,
    genres: ['Science Fiction', 'Drama'],
    status: 'want',
    addedAt: '2026-05-20T12:00:00.000Z',
  },
  {
    id: 603,
    title: 'The Matrix',
    posterPath: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    backdropPath: '/icmmSD4vTTDKOq2vvdulafOGw93.jpg',
    releaseYear: '1999',
    overview:
      'Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground insurgents fighting the vast and powerful computers who now rule the earth.',
    tmdbRating: 8.2,
    genres: ['Action', 'Science Fiction'],
    status: 'want',
    addedAt: '2026-05-22T12:00:00.000Z',
  },
  {
    id: 129,
    title: 'Spirited Away',
    posterPath: '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
    backdropPath: '/Ab8mkHmkYADjU7wQiOkia9BzGvS.jpg',
    releaseYear: '2001',
    overview:
      'A young girl, Chihiro, becomes trapped in a strange new world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage she never knew she had to free her family.',
    tmdbRating: 8.5,
    genres: ['Animation', 'Family', 'Fantasy'],
    status: 'want',
    addedAt: '2026-05-25T12:00:00.000Z',
  },
  {
    id: 680,
    title: 'Pulp Fiction',
    posterPath: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    backdropPath: '/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg',
    releaseYear: '1994',
    overview:
      'A burger-loving hit man, his philosophical partner, a drug-addled gangster\'s moll and a washed-up boxer converge in this sprawling, comedic crime caper.',
    tmdbRating: 8.5,
    genres: ['Thriller', 'Crime'],
    status: 'want',
    addedAt: '2026-05-28T12:00:00.000Z',
  },
]
