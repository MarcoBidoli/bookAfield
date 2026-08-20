import { closeDB, connectDB } from "./db.js";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

function getTodayDate() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDateOffset(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

async function seedDatabase() {
  try {
    const db = await connectDB();

    console.log("--- Starting Database Seed ---");

    /*
     * ==================================================================
     * 0. CLEAN DATABASE
     * ==================================================================
     */

    console.log("Cleaning existing collections...");

    await Promise.all([
      db.collection("users").deleteMany({}),
      db.collection("fields").deleteMany({}),
      db.collection("tournaments").deleteMany({}),
      db.collection("bookings").deleteMany({}),
      db.collection("matches").deleteMany({}),
    ]);

    /*
     * ==================================================================
     * 1. INDEXES
     * ==================================================================
     */

    console.log("Creating indexes...");

    await db.collection("users").createIndex(
        { username: 1 },
        { unique: true },
    );

    await db.collection("bookings").createIndex(
        { fieldId: 1, date: 1, slot: 1 },
        { unique: true },
    );

    await db.collection("bookings").createIndex({
      userId: 1,
      date: 1,
    });

    await db.collection("matches").createIndex({
      tournamentId: 1,
      round: 1,
    });

    /*
     * ==================================================================
     * 2. USERS
     * ==================================================================
     */

    console.log("Creating users...");

    const passwordHash = await bcrypt.hash("password123", 10);

    const usersData = [
      {
        _id: new ObjectId(),
        username: "jfabbro",
        password: passwordHash,
        name: "Jacopo",
        surname: "Fabbro",
        createdAt: new Date("2026-01-10T10:00:00"),
      },
      {
        _id: new ObjectId(),
        username: "avisintin",
        password: passwordHash,
        name: "Alvise",
        surname: "Visintin",
        createdAt: new Date("2026-01-12T10:00:00"),
      },
      {
        _id: new ObjectId(),
        username: "ecalligaris",
        password: passwordHash,
        name: "Elena",
        surname: "Calligaris",
        createdAt: new Date("2026-01-15T10:00:00"),
      },
      {
        _id: new ObjectId(),
        username: "dzuliani",
        password: passwordHash,
        name: "Davide",
        surname: "Zuliani",
        createdAt: new Date("2026-01-18T10:00:00"),
      },
      {
        _id: new ObjectId(),
        username: "gpozzo",
        password: passwordHash,
        name: "Giovanni",
        surname: "Pozzo",
        createdAt: new Date("2026-01-20T10:00:00"),
      },
      {
        _id: new ObjectId(),
        username: "mrossi",
        password: passwordHash,
        name: "Marco",
        surname: "Rossi",
        createdAt: new Date("2026-02-01T10:00:00"),
      },
      {
        _id: new ObjectId(),
        username: "lbianchi",
        password: passwordHash,
        name: "Luca",
        surname: "Bianchi",
        createdAt: new Date("2026-02-05T10:00:00"),
      },
    ];

    await db.collection("users").insertMany(usersData);

    const [
      userFabbro,
      userVisintin,
      userCalligaris,
      userZuliani,
      userPozzo,
      userRossi,
      userBianchi,
    ] = usersData;

    /*
     * ==================================================================
     * 3. FIELDS
     *
     * Keep shuffle behavior, but identify fields by name afterwards so
     * the rest of the seed does not accidentally depend on shuffle order.
     * ==================================================================
     */

    console.log("Creating sports fields...");

    const fieldsData = [
      {
        _id: new ObjectId(),
        name: "Campo Sportivo Edi Colussi",
        sport: "football",
        address: "Via Capoia 3, Cervignano del Friuli (UD)",
        slots: [
          "09:00-10:00",
          "10:00-11:00",
          "11:00-12:00",
          "14:00-15:00",
          "15:00-16:00",
          "16:00-17:00",
          "17:00-18:00",
          "18:00-19:00",
        ],
      },
      {
        _id: new ObjectId(),
        name: "Campo Sportivo Centrale L. Zanussi",
        sport: "football",
        address: "Via 4 Novembre, San Daniele del Friuli (UD)",
        slots: [
          "09:00-10:00",
          "10:00-11:00",
          "11:00-12:00",
          "14:00-15:00",
          "15:00-16:00",
          "16:00-17:00",
          "17:00-18:00",
          "18:00-19:00",
        ],
      },
      {
        _id: new ObjectId(),
        name: "Stadio Nereo Rocco",
        sport: "football",
        address: "Piazzale Atleti Azzurri d'Italia 1, Trieste (TS)",
        slots: [
          "09:00-10:00",
          "10:00-11:00",
          "11:00-12:00",
          "14:00-15:00",
          "15:00-16:00",
          "16:00-17:00",
          "17:00-18:00",
          "18:00-19:00",
        ],
      },
      {
        _id: new ObjectId(),
        name: "PalaTrieste",
        sport: "volleyball",
        address: "Via Flavia 3, Trieste (TS)",
        slots: [
          "09:00-10:00",
          "10:00-11:00",
          "12:00-13:00",
          "14:00-15:00",
          "15:00-16:00",
          "16:00-17:00",
          "17:00-18:00",
          "18:00-19:00",
          "19:00-20:00",
        ],
      },
      {
        _id: new ObjectId(),
        name: "Palachiarbola G. Calza",
        sport: "volleyball",
        address: "Via di Calvola 2/1, Trieste (TS)",
        slots: [
          "09:00-10:00",
          "10:00-11:00",
          "12:00-13:00",
          "14:00-15:00",
          "15:00-16:00",
          "16:00-17:00",
          "17:00-18:00",
          "18:00-19:00",
          "19:00-20:00",
        ],
      },
      {
        _id: new ObjectId(),
        name: "Palasport Manlio Benedetti",
        sport: "volleyball",
        address: "Via Marangoni, Udine (UD)",
        slots: [
          "09:00-10:00",
          "10:00-11:00",
          "12:00-13:00",
          "14:00-15:00",
          "15:00-16:00",
          "16:00-17:00",
          "17:00-18:00",
          "18:00-19:00",
          "19:00-20:00",
        ],
      },
      {
        _id: new ObjectId(),
        name: "PalaGalvani",
        sport: "volleyball",
        address: "Via Galvani, Pordenone (PN)",
        slots: [
          "09:00-10:00",
          "10:00-11:00",
          "12:00-13:00",
          "14:00-15:00",
          "15:00-16:00",
          "16:00-17:00",
          "17:00-18:00",
          "18:00-19:00",
          "19:00-20:00",
        ],
      },
      {
        _id: new ObjectId(),
        name: "Palacalvola",
        sport: "basketball",
        address: "Via di Calvola 2/1, Trieste (TS)",
        slots: [
          "09:00-10:00",
          "10:00-11:00",
          "12:00-13:00",
          "14:00-15:00",
          "15:00-16:00",
          "16:00-17:00",
          "17:00-18:00",
          "18:00-19:00",
          "19:00-20:00",
        ],
      },
      {
        _id: new ObjectId(),
        name: "Palasport Primo Carnera",
        sport: "basketball",
        address: "Via Floriano Candonio 540, Udine (UD)",
        slots: [
          "09:00-10:00",
          "10:00-11:00",
          "12:00-13:00",
          "14:00-15:00",
          "15:00-16:00",
          "16:00-17:00",
          "17:00-18:00",
          "18:00-19:00",
          "19:00-20:00",
        ],
      },
      {
        _id: new ObjectId(),
        name: "PalaBrumatti",
        sport: "basketball",
        address: "Via Traverso, Gorizia (GO)",
        slots: [
          "09:00-10:00",
          "10:00-11:00",
          "12:00-13:00",
          "14:00-15:00",
          "15:00-16:00",
          "16:00-17:00",
          "17:00-18:00",
          "18:00-19:00",
          "19:00-20:00",
        ],
      },
    ];

    /*
     * Preserve the requested shuffle behavior.
     */
    const shuffledFields = shuffle(fieldsData);

    await db.collection("fields").insertMany(shuffledFields);

    /*
     * Resolve fields by name, so random ordering never changes their role.
     */
    const fieldColussi = fieldsData.find(
        (field) => field.name === "Campo Sportivo Edi Colussi",
    );

    const fieldZanussi = fieldsData.find(
        (field) => field.name === "Campo Sportivo Centrale L. Zanussi",
    );

    const fieldPalaTrieste = fieldsData.find(
        (field) => field.name === "PalaTrieste",
    );

    const fieldPalachiarbola = fieldsData.find(
        (field) => field.name === "Palachiarbola G. Calza",
    );

    const fieldBenedetti = fieldsData.find(
        (field) => field.name === "Palasport Manlio Benedetti",
    );

    const fieldPalacalvola = fieldsData.find(
        (field) => field.name === "Palacalvola",
    );

    const fieldCarnera = fieldsData.find(
        (field) => field.name === "Palasport Primo Carnera",
    );

    /*
     * ==================================================================
     * 4. HELPERS
     * ==================================================================
     */

    function registeredPlayer(user, jerseyNumber = null) {
      return {
        userId: user._id,
        name: user.name,
        surname: user.surname,
        jerseyNumber,
      };
    }

    function guestPlayer(name, surname, jerseyNumber = null) {
      return {
        userId: null,
        name,
        surname,
        jerseyNumber,
      };
    }

    function createTeam(name, players) {
      return {
        _id: new ObjectId(),
        name,
        players,
      };
    }

    function createBooking({
                             fieldId,
                             userId,
                             date,
                             slot,
                             tournamentId = null,
                             type = "normal",
                             createdAt = new Date(),
                           }) {
      return {
        _id: new ObjectId(),
        fieldId,
        userId,
        date,
        slot,
        type,
        ...(tournamentId && { tournamentId }),
        createdAt,
      };
    }

    /*
     * Match schema intentionally mirrors the output of:
     *
     * POST /:id/matches/generate
     */
    function createMatch({
                           tournamentId,
                           teamA,
                           teamB,
                           teamAName,
                           teamBName,
                           round,
                           status = "upcoming",
                           fieldId = null,
                           date = null,
                           slot = null,
                           bookingId = null,
                           result = null,
                         }) {
      return {
        _id: new ObjectId(),
        tournamentId,
        teamA,
        teamB,
        teamAName,
        teamBName,
        round,
        status,
        fieldId,
        date,
        slot,
        bookingId,
        result,
      };
    }

    /*
     * Creates the exact round-robin pairings produced by the route.
     *
     * This is deliberately the same algorithm as the application route,
     * except that it returns match data instead of inserting it.
     */
    function generateRoundRobinMatches(tournamentId, teams) {
      const scheduleTeams = [...teams];

      if (scheduleTeams.length % 2 !== 0) {
        scheduleTeams.push({
          _id: null,
          name: "BYE",
        });
      }

      const N = scheduleTeams.length;
      const rounds = N - 1;
      const matches = [];

      for (let round = 1; round <= rounds; round++) {
        for (let i = 0; i < N / 2; i++) {
          const home = scheduleTeams[i];
          const away = scheduleTeams[N - 1 - i];

          /*
           * Ignore BYE games. The real endpoint currently inserts them,
           * but all seeded tournaments here have an even number of teams.
           */
          if (home._id !== null && away._id !== null) {
            matches.push(
                createMatch({
                  tournamentId,
                  teamA: home._id,
                  teamB: away._id,
                  teamAName: home.name,
                  teamBName: away.name,
                  round,
                }),
            );
          }
        }

        scheduleTeams.splice(1, 0, scheduleTeams.pop());
      }

      return matches;
    }

    const today = getTodayDate();
    const yesterday = getDateOffset(-1);
    const tomorrow = getDateOffset(1);
    const inTwoDays = getDateOffset(2);
    const nextWeek = getDateOffset(7);

    /*
     * ==================================================================
     * 5. JFABBR0 - TOURNAMENT 1
     *
     * REGISTRATION
     *
     * This intentionally represents the state BEFORE
     * /:id/matches/generate is called.
     *
     * 4/4 teams
     * 0 matches
     * 0 tournament bookings
     * ==================================================================
     */

    console.log("Creating jfabbro registration tournament...");

    const readyTournamentId = new ObjectId();

    const readyTeam1 = createTeam("Trieste Sharks", [
      registeredPlayer(userFabbro, 10),
      guestPlayer("Luca", "Rossi", 7),
      guestPlayer("Marco", "Bianchi", 12),
      guestPlayer("Andrea", "Moro", 4),
    ]);

    const readyTeam2 = createTeam("Udine Eagles", [
      registeredPlayer(userVisintin, 8),
      guestPlayer("Matteo", "Verdi", 5),
      guestPlayer("Paolo", "Russo", 11),
      guestPlayer("Davide", "Furlan", 3),
    ]);

    const readyTeam3 = createTeam("Gorizia Block", [
      registeredPlayer(userCalligaris, 6),
      guestPlayer("Stefano", "Moro", 9),
      guestPlayer("Pietro", "Neri", 13),
      guestPlayer("Fabio", "Basso", 2),
    ]);

    const readyTeam4 = createTeam("Pordenone Volley", [
      registeredPlayer(userZuliani, 1),
      guestPlayer("Nicola", "Pavan", 7),
      guestPlayer("Enrico", "Moretti", 15),
      guestPlayer("Giorgio", "Rossi", 10),
    ]);

    const readyTournament = {
      _id: readyTournamentId,
      creatorId: userFabbro._id,
      name: "Cornacchia World Cup - Test",
      sport: "volleyball",
      maxTeams: 4,
      startDate: tomorrow,
      status: "registration",
      teams: [
        readyTeam1,
        readyTeam2,
        readyTeam3,
        readyTeam4,
      ],
      createdAt: new Date("2026-08-01T10:00:00"),
    };

    /*
     * ==================================================================
     * 6. JFABBR0 - TOURNAMENT 2
     *
     * ACTIVE / SCHEDULE GENERATED
     *
     * 4/4 teams
     * 6 round-robin matches
     * 6 tournament bookings
     *
     * Two matches are already played.
     * Their bookingId points to their corresponding historical booking.
     * ==================================================================
     */

    console.log("Creating jfabbro active tournament...");

    const activeTournamentId = new ObjectId();

    const activeTeam1 = createTeam("Trieste United", [
      registeredPlayer(userFabbro, 10),
      guestPlayer("Luca", "Rossi", 7),
      guestPlayer("Marco", "Bianchi", 12),
      guestPlayer("Andrea", "Moro", 4),
      guestPlayer("Stefano", "Neri", 8),
    ]);

    const activeTeam2 = createTeam("Udine FC", [
      registeredPlayer(userVisintin, 9),
      guestPlayer("Matteo", "Verdi", 5),
      guestPlayer("Paolo", "Russo", 11),
      guestPlayer("Davide", "Furlan", 3),
      guestPlayer("Giorgio", "Basso", 6),
    ]);

    const activeTeam3 = createTeam("Gorizia United", [
      registeredPlayer(userCalligaris, 1),
      guestPlayer("Stefano", "Moro", 4),
      guestPlayer("Pietro", "Neri", 8),
      guestPlayer("Fabio", "Basso", 13),
      guestPlayer("Lorenzo", "Pavan", 17),
    ]);

    const activeTeam4 = createTeam("Pordenone FC", [
      registeredPlayer(userZuliani, 12),
      guestPlayer("Nicola", "Moretti", 7),
      guestPlayer("Enrico", "Rossi", 9),
      guestPlayer("Gabriele", "Moro", 14),
      guestPlayer("Simone", "Bianchi", 18),
    ]);

    const activeTeams = [
      activeTeam1,
      activeTeam2,
      activeTeam3,
      activeTeam4,
    ];

    const activeTournament = {
      _id: activeTournamentId,
      creatorId: userFabbro._id,
      name: "Coppa Italia Dilettanti FVG - Test",
      sport: "football",
      maxTeams: 4,
      startDate: yesterday,
      status: "active",
      teams: activeTeams,
      createdAt: new Date("2026-08-10T10:00:00"),
    };

    /*
     * Generate the same six pairings as the real endpoint.
     */
    const activeMatches = generateRoundRobinMatches(
        activeTournamentId,
        activeTeams,
    );

    /*
     * Assign a realistic completed schedule.
     *
     * Round 1:
     *   match 1 -> yesterday 14:00
     *   match 2 -> yesterday 15:00
     *
     * Round 2:
     *   match 3 -> today 14:00
     *   match 4 -> today 15:00
     *
     * Round 3:
     *   match 5 -> tomorrow 17:00
     *   match 6 -> tomorrow 18:00
     */

    const activeSchedule = [
      {
        fieldId: fieldColussi._id,
        date: yesterday,
        slot: "14:00-15:00",
      },
      {
        fieldId: fieldColussi._id,
        date: yesterday,
        slot: "15:00-16:00",
      },
      {
        fieldId: fieldColussi._id,
        date: today,
        slot: "14:00-15:00",
      },
      {
        fieldId: fieldColussi._id,
        date: today,
        slot: "15:00-16:00",
      },
      {
        fieldId: fieldColussi._id,
        date: tomorrow,
        slot: "17:00-18:00",
      },
      {
        fieldId: fieldColussi._id,
        date: tomorrow,
        slot: "18:00-19:00",
      },
    ];

    activeMatches.forEach((match, index) => {
      const schedule = activeSchedule[index];

      match.fieldId = schedule.fieldId;
      match.date = schedule.date;
      match.slot = schedule.slot;

      if (index < 2) {
        match.status = "played";

        match.result =
            index === 0
                ? {
                  scoreA: 3,
                  scoreB: 1,
                }
                : {
                  scoreA: 2,
                  scoreB: 2,
                };
      }
    });

    /*
     * Create bookings AFTER matches exist, then connect the booking
     * through match.bookingId.
     *
     * This means played matches have a real historical booking ID.
     */
    const activeBookings = [];

    for (const match of activeMatches) {
      const isPlayed = match.status === "played";

      const booking = createBooking({
        fieldId: match.fieldId,
        userId: userFabbro._id,
        date: match.date,
        slot: match.slot,
        tournamentId: activeTournamentId,
        type: "tournament",
        createdAt: isPlayed
            ? new Date("2026-08-10T11:00:00")
            : new Date("2026-08-10T12:00:00"),
      });

      match.bookingId = booking._id;
      activeBookings.push(booking);
    }

    /*
     * ==================================================================
     * 7. JFABBR0 - TOURNAMENT 3
     *
     * COMPLETED
     *
     * Full historical tournament with all 6 matches played.
     * Every match has:
     *   - fieldId
     *   - date
     *   - slot
     *   - bookingId
     *   - result
     * ==================================================================
     */

    console.log("Creating jfabbro completed tournament...");

    const completedTournamentId = new ObjectId();

    const completedTeam1 = createTeam("Trieste Basketball", [
      registeredPlayer(userFabbro, 10),
      guestPlayer("Luca", "Rossi", 7),
      guestPlayer("Marco", "Bianchi", 12),
      guestPlayer("Andrea", "Moro", 4),
      guestPlayer("Stefano", "Neri", 8),
    ]);

    const completedTeam2 = createTeam("Udine Eagles", [
      registeredPlayer(userPozzo, 9),
      guestPlayer("Matteo", "Verdi", 5),
      guestPlayer("Paolo", "Russo", 11),
      guestPlayer("Davide", "Furlan", 3),
      guestPlayer("Giorgio", "Basso", 6),
    ]);

    const completedTeam3 = createTeam("Gorizia Basket", [
      registeredPlayer(userCalligaris, 6),
      guestPlayer("Stefano", "Moro", 9),
      guestPlayer("Pietro", "Neri", 13),
      guestPlayer("Fabio", "Basso", 2),
      guestPlayer("Lorenzo", "Pavan", 15),
    ]);

    const completedTeam4 = createTeam("Pordenone Hoops", [
      registeredPlayer(userZuliani, 12),
      guestPlayer("Nicola", "Moretti", 7),
      guestPlayer("Enrico", "Rossi", 9),
      guestPlayer("Gabriele", "Moro", 14),
      guestPlayer("Simone", "Bianchi", 18),
    ]);

    const completedTeams = [
      completedTeam1,
      completedTeam2,
      completedTeam3,
      completedTeam4,
    ];

    const completedTournament = {
      _id: completedTournamentId,
      creatorId: userFabbro._id,
      name: "Memorial Mario Morley - Test",
      sport: "basketball",
      maxTeams: 4,
      startDate: "2026-07-11",
      status: "completed",
      teams: completedTeams,
      createdAt: new Date("2026-06-15T10:00:00"),
    };

    const completedMatches = generateRoundRobinMatches(
        completedTournamentId,
        completedTeams,
    );

    const completedSchedule = [
      {
        date: "2026-07-11",
        slot: "14:00-15:00",
        scoreA: 78,
        scoreB: 71,
      },
      {
        date: "2026-07-11",
        slot: "15:00-16:00",
        scoreA: 65,
        scoreB: 72,
      },
      {
        date: "2026-07-11",
        slot: "16:00-17:00",
        scoreA: 84,
        scoreB: 69,
      },
      {
        date: "2026-07-11",
        slot: "17:00-18:00",
        scoreA: 76,
        scoreB: 81,
      },
      {
        date: "2026-07-12",
        slot: "14:00-15:00",
        scoreA: 88,
        scoreB: 75,
      },
      {
        date: "2026-07-12",
        slot: "15:00-16:00",
        scoreA: 82,
        scoreB: 77,
      },
    ];

    const completedBookings = [];

    completedMatches.forEach((match, index) => {
      const schedule = completedSchedule[index];

      match.status = "played";
      match.fieldId = fieldCarnera._id;
      match.date = schedule.date;
      match.slot = schedule.slot;
      match.result = {
        scoreA: schedule.scoreA,
        scoreB: schedule.scoreB,
      };

      const booking = createBooking({
        fieldId: fieldCarnera._id,
        userId: userFabbro._id,
        date: schedule.date,
        slot: schedule.slot,
        tournamentId: completedTournamentId,
        type: "tournament",
        createdAt: new Date("2026-06-15T11:00:00"),
      });

      match.bookingId = booking._id;

      completedBookings.push(booking);
    });

    /*
     * ==================================================================
     * 8. OTHER USERS' TOURNAMENTS
     * ==================================================================
     */

    console.log("Creating other users' tournaments...");

    /*
     * --------------------------------------------------------------
     * avisintin - registration
     * --------------------------------------------------------------
     */

    const otherVolleyTournamentId = new ObjectId();

    const otherVolleyTeam1 = createTeam("Udine Panthers", [
      registeredPlayer(userVisintin, 10),
      guestPlayer("Anna", "Rossi", 4),
      guestPlayer("Marta", "Visentin", 8),
    ]);

    const otherVolleyTeam2 = createTeam("Trieste Waves", [
      registeredPlayer(userRossi, 7),
      guestPlayer("Chiara", "Furlan", 3),
      guestPlayer("Elisa", "Pavan", 9),
    ]);

    const otherVolleyTournament = {
      _id: otherVolleyTournamentId,
      creatorId: userVisintin._id,
      name: "Trofeo Autunno Volley FVG",
      sport: "volleyball",
      maxTeams: 6,
      startDate: "2026-10-24",
      status: "registration",
      teams: [
        otherVolleyTeam1,
        otherVolleyTeam2,
      ],
      createdAt: new Date("2026-08-05T10:00:00"),
    };

    /*
     * --------------------------------------------------------------
     * ecalligaris - registration
     * --------------------------------------------------------------
     */

    const otherBasketTournamentId = new ObjectId();

    const otherBasketTournament = {
      _id: otherBasketTournamentId,
      creatorId: userCalligaris._id,
      name: "Trieste Basketball Cup",
      sport: "basketball",
      maxTeams: 6,
      startDate: "2026-09-20",
      status: "registration",
      teams: [
        createTeam("Trieste Lions", [
          registeredPlayer(userCalligaris, 10),
          guestPlayer("Alberto", "Rossi", 4),
          guestPlayer("Lorenzo", "Moro", 8),
        ]),
        createTeam("Muggia Basket", [
          registeredPlayer(userBianchi, 7),
          guestPlayer("Marco", "Neri", 12),
          guestPlayer("Fabio", "Pavan", 15),
        ]),
      ],
      createdAt: new Date("2026-08-06T10:00:00"),
    };

    /*
     * --------------------------------------------------------------
     * dzuliani - active, schedule generated
     * --------------------------------------------------------------
     */

    const otherFootballTournamentId = new ObjectId();

    const otherFootballTeam1 = createTeam("Cividale FC", [
      registeredPlayer(userZuliani, 10),
      guestPlayer("Alessio", "Bortolin", 7),
      guestPlayer("Matteo", "Fabbro", 9),
      guestPlayer("Luca", "Basso", 11),
    ]);

    const otherFootballTeam2 = createTeam("San Daniele United", [
      registeredPlayer(userBianchi, 8),
      guestPlayer("Mauro", "Ciani", 4),
      guestPlayer("Stefano", "Venier", 6),
      guestPlayer("Pietro", "Zorzi", 12),
    ]);

    const otherFootballTeam3 = createTeam("Cervignano Calcio", [
      registeredPlayer(userPozzo, 1),
      guestPlayer("Andrea", "Pellizzari", 5),
      guestPlayer("Nicola", "Comelli", 13),
      guestPlayer("Fabio", "Furlan", 15),
    ]);

    const otherFootballTeam4 = createTeam("Sacile United", [
      registeredPlayer(userRossi, 3),
      guestPlayer("Davide", "Saccavino", 8),
      guestPlayer("Lorenzo", "Benedetti", 10),
      guestPlayer("Marco", "Zorzi", 14),
    ]);

    const otherFootballTeams = [
      otherFootballTeam1,
      otherFootballTeam2,
      otherFootballTeam3,
      otherFootballTeam4,
    ];

    const otherFootballTournament = {
      _id: otherFootballTournamentId,
      creatorId: userZuliani._id,
      name: "Friuli Football Challenge",
      sport: "football",
      maxTeams: 4,
      startDate: today,
      status: "active",
      teams: otherFootballTeams,
      createdAt: new Date("2026-08-08T10:00:00"),
    };

    const otherFootballMatches = generateRoundRobinMatches(
        otherFootballTournamentId,
        otherFootballTeams,
    );

    const otherFootballSchedule = [
      {
        date: tomorrow,
        slot: "14:00-15:00",
      },
      {
        date: tomorrow,
        slot: "15:00-16:00",
      },
      {
        date: inTwoDays,
        slot: "14:00-15:00",
      },
      {
        date: inTwoDays,
        slot: "15:00-16:00",
      },
      {
        date: getDateOffset(3),
        slot: "17:00-18:00",
      },
      {
        date: getDateOffset(3),
        slot: "18:00-19:00",
      },
    ];

    const otherFootballBookings = [];

    otherFootballMatches.forEach((match, index) => {
      const schedule = otherFootballSchedule[index];

      match.fieldId = fieldZanussi._id;
      match.date = schedule.date;
      match.slot = schedule.slot;
      match.status = "upcoming";

      const booking = createBooking({
        fieldId: fieldZanussi._id,
        userId: userZuliani._id,
        date: schedule.date,
        slot: schedule.slot,
        tournamentId: otherFootballTournamentId,
        type: "tournament",
        createdAt: new Date("2026-08-08T11:00:00"),
      });

      match.bookingId = booking._id;

      otherFootballBookings.push(booking);
    });

    /*
     * --------------------------------------------------------------
     * gpozzo - completed
     * --------------------------------------------------------------
     */

    const otherCompletedTournamentId = new ObjectId();

    const otherCompletedTeam1 = createTeam("Udine Basket", [
      registeredPlayer(userPozzo, 10),
      guestPlayer("Federico", "Marin", 4),
      guestPlayer("Alessandro", "Comisso", 8),
    ]);

    const otherCompletedTeam2 = createTeam("Trieste Basket Club", [
      registeredPlayer(userFabbro, 7),
      guestPlayer("Gabriele", "Visentin", 9),
      guestPlayer("Davide", "Rossi", 12),
    ]);

    const otherCompletedTeam3 = createTeam("Pordenone Hoops", [
      registeredPlayer(userZuliani, 3),
      guestPlayer("Simone", "Furlan", 6),
      guestPlayer("Andrea", "Zanier", 11),
    ]);

    const otherCompletedTeam4 = createTeam("Gorizia Basket", [
      registeredPlayer(userCalligaris, 5),
      guestPlayer("Giulio", "Dri", 13),
      guestPlayer("Riccardo", "Cescutti", 15),
    ]);

    const otherCompletedTeams = [
      otherCompletedTeam1,
      otherCompletedTeam2,
      otherCompletedTeam3,
      otherCompletedTeam4,
    ];

    const otherCompletedTournament = {
      _id: otherCompletedTournamentId,
      creatorId: userPozzo._id,
      name: "Coppa delle Province FVG",
      sport: "basketball",
      maxTeams: 4,
      startDate: "2026-07-05",
      status: "completed",
      teams: otherCompletedTeams,
      createdAt: new Date("2026-06-01T10:00:00"),
    };

    const otherCompletedMatches = generateRoundRobinMatches(
        otherCompletedTournamentId,
        otherCompletedTeams,
    );

    const otherCompletedResults = [
      [70, 65],
      [62, 68],
      [75, 71],
      [69, 74],
      [80, 73],
      [77, 81],
    ];

    const otherCompletedBookings = [];

    otherCompletedMatches.forEach((match, index) => {
      const round = Math.floor(index / 2);

      match.status = "played";
      match.fieldId = fieldCarnera._id;

      if (round < 2) {
        match.date = "2026-07-05";
      } else {
        match.date = "2026-07-06";
      }

      match.slot = [
        "14:00-15:00",
        "15:00-16:00",
        "16:00-17:00",
        "17:00-18:00",
        "14:00-15:00",
        "15:00-16:00",
      ][index];

      match.result = {
        scoreA: otherCompletedResults[index][0],
        scoreB: otherCompletedResults[index][1],
      };

      const booking = createBooking({
        fieldId: fieldCarnera._id,
        userId: userPozzo._id,
        date: match.date,
        slot: match.slot,
        tournamentId: otherCompletedTournamentId,
        type: "tournament",
        createdAt: new Date("2026-06-01T11:00:00"),
      });

      match.bookingId = booking._id;

      otherCompletedBookings.push(booking);
    });

    /*
     * --------------------------------------------------------------
     * lbianchi - future registration
     * --------------------------------------------------------------
     */

    const otherFutureTournamentId = new ObjectId();

    const otherFutureTournament = {
      _id: otherFutureTournamentId,
      creatorId: userBianchi._id,
      name: "Winter Football Cup",
      sport: "football",
      maxTeams: 8,
      startDate: "2026-11-15",
      status: "registration",
      teams: [
        createTeam("Winter FC", [
          registeredPlayer(userBianchi, 10),
          guestPlayer("Luca", "Moro", 4),
          guestPlayer("Paolo", "Rossi", 7),
        ]),
      ],
      createdAt: new Date("2026-08-12T10:00:00"),
    };

    /*
     * ==================================================================
     * 9. INSERT TOURNAMENTS
     * ==================================================================
     */

    const tournamentsData = [
      readyTournament,
      activeTournament,
      completedTournament,

      otherVolleyTournament,
      otherBasketTournament,
      otherFootballTournament,
      otherCompletedTournament,
      otherFutureTournament,
    ];

    await db.collection("tournaments").insertMany(tournamentsData);

    /*
     * ==================================================================
     * 10. NORMAL BOOKINGS
     * ==================================================================
     */

    console.log("Creating normal bookings...");

    const normalBookings = [
      createBooking({
        fieldId: fieldPalachiarbola._id,
        userId: userFabbro._id,
        date: today,
        slot: "19:00-20:00",
        type: "normal",
        createdAt: new Date("2026-08-18T10:00:00"),
      }),

      createBooking({
        fieldId: fieldPalacalvola._id,
        userId: userFabbro._id,
        date: tomorrow,
        slot: "16:00-17:00",
        type: "normal",
        createdAt: new Date("2026-08-18T11:00:00"),
      }),

      createBooking({
        fieldId: fieldBenedetti._id,
        userId: userFabbro._id,
        date: nextWeek,
        slot: "18:00-19:00",
        type: "normal",
        createdAt: new Date("2026-08-19T10:00:00"),
      }),

      createBooking({
        fieldId: fieldCarnera._id,
        userId: userFabbro._id,
        date: "2026-09-05",
        slot: "14:00-15:00",
        type: "normal",
        createdAt: new Date("2026-08-19T11:00:00"),
      }),

      createBooking({
        fieldId: fieldColussi._id,
        userId: userFabbro._id,
        date: "2026-09-12",
        slot: "18:00-19:00",
        type: "normal",
        createdAt: new Date("2026-08-19T12:00:00"),
      }),
    ];

    /*
     * Other users' normal bookings.
     */

    const otherNormalBookings = [
      createBooking({
        fieldId: fieldPalaTrieste._id,
        userId: userVisintin._id,
        date: today,
        slot: "20:00-21:00",
        type: "normal",
      }),

      createBooking({
        fieldId: fieldCarnera._id,
        userId: userCalligaris._id,
        date: tomorrow,
        slot: "18:00-19:00",
        type: "normal",
      }),

      createBooking({
        fieldId: fieldColussi._id,
        userId: userPozzo._id,
        date: "2026-09-20",
        slot: "17:00-18:00",
        type: "normal",
      }),
    ];

    /*
     * ==================================================================
     * 11. INSERT MATCHES
     * ==================================================================
     */

    const allMatches = [
      ...activeMatches,
      ...completedMatches,
      ...otherFootballMatches,
      ...otherCompletedMatches,
    ];

    await db.collection("matches").insertMany(allMatches);

    /*
     * ==================================================================
     * 12. INSERT BOOKINGS
     * ==================================================================
     */

    const allBookings = [
      ...activeBookings,
      ...completedBookings,
      ...otherFootballBookings,
      ...otherCompletedBookings,
      ...normalBookings,
      ...otherNormalBookings,
    ];

    await db.collection("bookings").insertMany(allBookings);

    /*
     * ==================================================================
     * 13. SUMMARY
     * ==================================================================
     */

    console.log("");
    console.log("==============================================");
    console.log("       DATABASE SEED COMPLETED");
    console.log("==============================================");
    console.log("");

    console.log(`Today:        ${today}`);
    console.log(`Users:        ${usersData.length}`);
    console.log(`Fields:       ${fieldsData.length}`);
    console.log(`Tournaments:  ${tournamentsData.length}`);
    console.log(`Matches:      ${allMatches.length}`);
    console.log(`Bookings:     ${allBookings.length}`);

    console.log("");
    console.log("TEST ACCOUNT");
    console.log("----------------------------------------------");
    console.log("Username:     jfabbro");
    console.log("Password:     password123");
    console.log("");
    console.log("All demo users have password: password123");
    console.log("");
    console.log("Disclaimer: Any real names, sports facilities, or occurrences used in this script are for demonstration and testing purposes only, and any resemblance to actual entities or events is purely coincidental.");
    console.log("");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exitCode = 1;
  } finally {
    await closeDB();
  }
}

seedDatabase();