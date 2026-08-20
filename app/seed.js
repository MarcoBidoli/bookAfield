import {closeDB, connectDB} from "./db.js";
import {ObjectId} from "mongodb";
import bcrypt from "bcryptjs";

async function seedDatabase() {
  try {
    const db = await connectDB();

    console.log("--- Starting Database Seed ---");

    /*
     * ------------------------------------------------------------------
     * 0. CLEAN EXISTING SEED DATA
     * ------------------------------------------------------------------
     *
     * Makes the script safe to run repeatedly during development.
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
     * ------------------------------------------------------------------
     * 1. INDEXES
     * ------------------------------------------------------------------
     */

    console.log("Creating database indexes...");

    await db.collection("users").createIndex({ username: 1 }, { unique: true });

    await db
      .collection("bookings")
      .createIndex({ fieldId: 1, date: 1, slot: 1 }, { unique: true });

    await db.collection("bookings").createIndex({ userId: 1, date: 1 });

    await db.collection("matches").createIndex({ tournamentId: 1, round: 1 });

    console.log("Indexes created.");

    /*
     * ------------------------------------------------------------------
     * 2. USERS
     * ------------------------------------------------------------------
     *
     * All accounts use:
     *
     *     password123
     *
     * The people/names are fictional but use realistic Italian/FVG
     * names and surnames.
     */

    console.log("Seeding 5 users...");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    const usersData = [
      {
        _id: new ObjectId(),
        username: "jfabbro",
        password: hashedPassword,
        name: "Jacopo",
        surname: "Fabbro",
        createdAt: new Date(),
      },
      {
        _id: new ObjectId(),
        username: "avisintin",
        password: hashedPassword,
        name: "Alvise",
        surname: "Visintin",
        createdAt: new Date(),
      },
      {
        _id: new ObjectId(),
        username: "ecalligaris",
        password: hashedPassword,
        name: "Elena",
        surname: "Calligaris",
        createdAt: new Date(),
      },
      {
        _id: new ObjectId(),
        username: "dzuliani",
        password: hashedPassword,
        name: "Davide",
        surname: "Zuliani",
        createdAt: new Date(),
      },
      {
        _id: new ObjectId(),
        username: "gpozzo",
        password: hashedPassword,
        name: "Giovanni",
        surname: "Pozzo",
        createdAt: new Date(),
      },
    ];

    await db.collection("users").insertMany(usersData);

    const [userFabbro, userVisintin, userCalligaris, userZuliani, userPozzo] =
      usersData;

    console.log(`Seeded ${usersData.length} users.`);

    /*
     * ------------------------------------------------------------------
     * 3. SPORTS FIELDS
     * ------------------------------------------------------------------
     *
     * Real facilities in Friuli Venezia Giulia.
     *
     * Slots are application booking slots, not claims about the
     * facilities' official opening hours.
     */

    console.log("Seeding 10 FVG sports fields...");

    const fieldsData = [
      // ==============================================================
      // FOOTBALL
      // ==============================================================

      {
        _id: new ObjectId(),
        name: "Campo Sportivo Edi Colussi",
        sport: "football",
        address: "Via Capoia 3, Cervignano del Friuli (UD)",
        slots: [
          "09:00-10:00",
          "10:00-11:00",
          "11:00-12:00",
          "15:00-16:00",
          "16:00-17:00",
          "17:00-18:00",
          "18:00-19:00",
          "19:00-20:00",
          "20:00-21:00",
        ],
      },

      {
        _id: new ObjectId(),
        name: "Campo sportivo centrale L. Zanussi",
        sport: "football",
        address: "Via 4 Novembre, San Daniele del Friuli (UD)",
        slots: [
          "09:00-10:00",
          "10:00-11:00",
          "11:00-12:00",
          "15:00-16:00",
          "16:00-17:00",
          "17:00-18:00",
          "18:00-19:00",
          "19:00-20:00",
        ],
      },

      {
        _id: new ObjectId(),
        name: "Campo Comunale sintetico",
        sport: "football",
        address: "Via Mezzana 11, Cividale del Friuli (UD)",
        slots: [
          "09:00-10:00",
          "10:00-11:00",
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
        name: "Campo Comunale E. Sfriso",
        sport: "football",
        address: "Via Martiri Sfriso 12/D, Sacile (PN)",
        slots: [
          "09:00-10:00",
          "10:00-11:00",
          "11:00-12:00",
          "15:00-16:00",
          "16:00-17:00",
          "17:00-18:00",
          "18:00-19:00",
          "19:00-20:00",
          "20:00-21:00",
        ],
      },

      // ==============================================================
      // VOLLEYBALL
      // ==============================================================

      {
        _id: new ObjectId(),
        name: "PalaTrieste",
        sport: "volleyball",
        address: "Via Flavia 3, Trieste (TS)",
        slots: [
          "09:00-10:00",
          "10:00-11:00",
          "11:00-12:00",
          "14:00-15:00",
          "15:00-16:00",
          "16:00-17:00",
          "17:00-18:00",
          "18:00-19:00",
          "19:00-20:00",
          "20:00-21:00",
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
          "11:00-12:00",
          "14:00-15:00",
          "15:00-16:00",
          "16:00-17:00",
          "17:00-18:00",
          "18:00-19:00",
          "19:00-20:00",
          "20:00-21:00",
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
          "11:00-12:00",
          "14:00-15:00",
          "15:00-16:00",
          "16:00-17:00",
          "17:00-18:00",
          "18:00-19:00",
          "19:00-20:00",
          "20:00-21:00",
        ],
      },

      // ==============================================================
      // BASKETBALL
      // ==============================================================

      {
        _id: new ObjectId(),
        name: "Palasport Primo Carnera",
        sport: "basketball",
        address: "Via Floriano Candonio 540, Udine (UD)",
        slots: [
          "09:00-10:00",
          "10:00-11:00",
          "11:00-12:00",
          "14:00-15:00",
          "15:00-16:00",
          "16:00-17:00",
          "17:00-18:00",
          "18:00-19:00",
          "19:00-20:00",
          "20:00-21:00",
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
          "11:00-12:00",
          "14:00-15:00",
          "15:00-16:00",
          "16:00-17:00",
          "17:00-18:00",
          "18:00-19:00",
          "19:00-20:00",
          "20:00-21:00",
        ],
      },

      {
        _id: new ObjectId(),
        name: "Palamicheletto",
        sport: "basketball",
        address: "Via Cartiera Vecchia 52, Sacile (PN)",
        slots: [
          "09:00-10:00",
          "10:00-11:00",
          "11:00-12:00",
          "14:00-15:00",
          "15:00-16:00",
          "16:00-17:00",
          "17:00-18:00",
          "18:00-19:00",
          "19:00-20:00",
          "20:00-21:00",
        ],
      },
    ];

    fieldsData.sort(() => Math.random() - 0.5); // to avoid ordered fields type
    await db.collection("fields").insertMany(fieldsData);

    const [
      fieldColussi,
      fieldZanussi,
      fieldCividale,
      fieldSfriso,
      fieldPalaTrieste,
      fieldPalachiarbola,
      fieldBenedetti,
      fieldCarnera,
      fieldPalacalvola,
      fieldPalamicheletto,
    ] = fieldsData;

    console.log(`Seeded ${fieldsData.length} fields.`);

    /*
     * ------------------------------------------------------------------
     * 4. HELPER FOR PLAYERS
     * ------------------------------------------------------------------
     */

    function registeredPlayer(user) {
      return {
        userId: user._id,
        name: user.name,
        surname: user.surname,
      };
    }

    function guestPlayer(name, surname) {
      return {
        userId: null,
        name,
        surname,
      };
    }

    /*
     * ------------------------------------------------------------------
     * 5. PAST TOURNAMENT #1 - VOLLEYBALL
     * ------------------------------------------------------------------
     *
     * Completed tournament in June 2026.
     */

    console.log("Creating completed volleyball tournament...");

    const pastVolleyId = new ObjectId();

    const pvTeam1Id = new ObjectId();
    const pvTeam2Id = new ObjectId();
    const pvTeam3Id = new ObjectId();
    const pvTeam4Id = new ObjectId();

    const pastVolley = {
      _id: pastVolleyId,
      creatorId: userFabbro._id,
      name: "Coppa Friuli Volley 2026",
      sport: "volleyball",
      maxTeams: 4,
      startDate: "2026-06-13",
      status: "completed",

      teams: [
        {
          _id: pvTeam1Id,
          name: "Udine Volley",
          players: [
            registeredPlayer(userFabbro),
            registeredPlayer(userVisintin),
            guestPlayer("Matteo", "Bearzot"),
            guestPlayer("Luca", "Trevisan"),
          ],
        },
        {
          _id: pvTeam2Id,
          name: "Trieste Sharks",
          players: [
            registeredPlayer(userCalligaris),
            guestPlayer("Alice", "Cudicio"),
            guestPlayer("Marta", "Del Fabro"),
            guestPlayer("Elisa", "Rossi"),
          ],
        },
        {
          _id: pvTeam3Id,
          name: "Gorizia Block",
          players: [
            registeredPlayer(userZuliani),
            guestPlayer("Piero", "Degano"),
            guestPlayer("Marco", "Bertossi"),
            guestPlayer("Andrea", "Furlan"),
          ],
        },
        {
          _id: pvTeam4Id,
          name: "Pordenone Volley",
          players: [
            registeredPlayer(userPozzo),
            guestPlayer("Nicola", "Basso"),
            guestPlayer("Davide", "Moretti"),
            guestPlayer("Stefano", "Moro"),
          ],
        },
      ],

      createdAt: new Date("2026-05-20T10:00:00"),
    };

    /*
     * ------------------------------------------------------------------
     * 6. PAST TOURNAMENT #2 - BASKETBALL
     * ------------------------------------------------------------------
     */

    console.log("Creating completed basketball tournament...");

    const pastBasketId = new ObjectId();

    const pbTeam1Id = new ObjectId();
    const pbTeam2Id = new ObjectId();
    const pbTeam3Id = new ObjectId();
    const pbTeam4Id = new ObjectId();

    const pastBasket = {
      _id: pastBasketId,
      creatorId: userPozzo._id,
      name: "Torneo Basket delle Province FVG",
      sport: "basketball",
      maxTeams: 4,
      startDate: "2026-07-11",
      status: "completed",

      teams: [
        {
          _id: pbTeam1Id,
          name: "Udine Eagles",
          players: [
            registeredPlayer(userPozzo),
            guestPlayer("Federico", "Marin"),
            guestPlayer("Alessandro", "Comisso"),
            guestPlayer("Lorenzo", "Venuti"),
            guestPlayer("Matteo", "Bergamasco"),
          ],
        },
        {
          _id: pbTeam2Id,
          name: "Trieste Basket Club",
          players: [
            registeredPlayer(userFabbro),
            guestPlayer("Gabriele", "Visentin"),
            guestPlayer("Davide", "Rossi"),
            guestPlayer("Enrico", "Miani"),
            guestPlayer("Tommaso", "Degrassi"),
          ],
        },
        {
          _id: pbTeam3Id,
          name: "Pordenone Hoops",
          players: [
            registeredPlayer(userZuliani),
            guestPlayer("Simone", "Furlan"),
            guestPlayer("Andrea", "Zanier"),
            guestPlayer("Luca", "Bortolussi"),
            guestPlayer("Marco", "Benedetti"),
          ],
        },
        {
          _id: pbTeam4Id,
          name: "Gorizia Basket",
          players: [
            registeredPlayer(userCalligaris),
            guestPlayer("Giulio", "Dri"),
            guestPlayer("Riccardo", "Cescutti"),
            guestPlayer("Michele", "Schiavo"),
            guestPlayer("Paolo", "Bertoni"),
          ],
        },
      ],

      createdAt: new Date("2026-06-15T10:00:00"),
    };

    await db.collection("tournaments").insertMany([pastVolley, pastBasket]);

    /*
     * ------------------------------------------------------------------
     * 7. UPCOMING TOURNAMENT #1 - FOOTBALL
     * ------------------------------------------------------------------
     *
     * 3/6 teams => 3 spaces available.
     */

    console.log("Creating upcoming football tournament...");

    const upcomingFootballId = new ObjectId();

    const ufTeam1Id = new ObjectId();
    const ufTeam2Id = new ObjectId();
    const ufTeam3Id = new ObjectId();

    const upcomingFootball = {
      _id: upcomingFootballId,
      creatorId: userZuliani._id,
      name: "Coppa del Friuli Calcio a 7",
      sport: "football",
      maxTeams: 6,
      startDate: "2026-09-19",
      status: "registration",

      teams: [
        {
          _id: ufTeam1Id,
          name: "Udine Rizzi FC",
          players: [
            registeredPlayer(userZuliani),
            guestPlayer("Alessio", "Bortolin"),
            guestPlayer("Matteo", "Fabbro"),
            guestPlayer("Luca", "Basso"),
            guestPlayer("Davide", "Saccavino"),
          ],
        },
        {
          _id: ufTeam2Id,
          name: "San Daniele United",
          players: [
            registeredPlayer(userFabbro),
            guestPlayer("Mauro", "Della Vedova"),
            guestPlayer("Stefano", "Ciani"),
            guestPlayer("Pietro", "Venier"),
            guestPlayer("Marco", "Zorzi"),
          ],
        },
        {
          _id: ufTeam3Id,
          name: "Cervignano Calcio",
          players: [
            registeredPlayer(userPozzo),
            guestPlayer("Andrea", "Pellizzari"),
            guestPlayer("Nicola", "Comelli"),
            guestPlayer("Fabio", "Furlan"),
            guestPlayer("Lorenzo", "Benedetti"),
          ],
        },
      ],

      createdAt: new Date("2026-08-01T10:00:00"),
    };

    /*
     * ------------------------------------------------------------------
     * 8. UPCOMING TOURNAMENT #2 - VOLLEYBALL
     * ------------------------------------------------------------------
     *
     * 2/6 teams => 4 spaces available.
     */

    console.log("Creating upcoming volleyball tournament...");

    const upcomingVolleyId = new ObjectId();

    const uvTeam1Id = new ObjectId();
    const uvTeam2Id = new ObjectId();

    const upcomingVolley = {
      _id: upcomingVolleyId,
      creatorId: userCalligaris._id,
      name: "Trofeo Autunno Volley FVG",
      sport: "volleyball",
      maxTeams: 6,
      startDate: "2026-10-24",
      status: "registration",

      teams: [
        {
          _id: uvTeam1Id,
          name: "Trieste Waves",
          players: [
            registeredPlayer(userCalligaris),
            guestPlayer("Sara", "Bertossi"),
            guestPlayer("Chiara", "Furlan"),
            guestPlayer("Elisa", "Pavan"),
          ],
        },
        {
          _id: uvTeam2Id,
          name: "Udine Panthers",
          players: [
            registeredPlayer(userVisintin),
            guestPlayer("Anna", "Rossi"),
            guestPlayer("Marta", "Visentin"),
            guestPlayer("Francesca", "Basso"),
          ],
        },
      ],

      createdAt: new Date("2026-08-05T10:00:00"),
    };

    await db
      .collection("tournaments")
      .insertMany([upcomingFootball, upcomingVolley]);

    /*
     * ------------------------------------------------------------------
     * 9. MATCHES FOR COMPLETED VOLLEYBALL TOURNAMENT
     * ------------------------------------------------------------------
     *
     * Round-robin:
     *
     * R1:
     * Udine 2-0 Trieste
     * Gorizia 2-1 Pordenone
     *
     * R2:
     * Udine 2-1 Gorizia
     * Trieste 2-0 Pordenone
     *
     * R3:
     * Udine 2-0 Pordenone
     * Trieste 1-2 Gorizia
     */

    const volleyMatch1Id = new ObjectId();
    const volleyMatch2Id = new ObjectId();
    const volleyMatch3Id = new ObjectId();
    const volleyMatch4Id = new ObjectId();
    const volleyMatch5Id = new ObjectId();
    const volleyMatch6Id = new ObjectId();

    const volleyBooking1Id = new ObjectId();
    const volleyBooking2Id = new ObjectId();
    const volleyBooking3Id = new ObjectId();
    const volleyBooking4Id = new ObjectId();
    const volleyBooking5Id = new ObjectId();
    const volleyBooking6Id = new ObjectId();

    const completedVolleyBookings = [
      {
        _id: volleyBooking1Id,
        fieldId: fieldBenedetti._id,
        userId: userFabbro._id,
        date: "2026-06-13",
        slot: "14:00-15:00",
        type: "tournament",
        tournamentId: pastVolleyId,
        matchId: volleyMatch1Id,
        createdAt: new Date("2026-05-20T11:00:00"),
      },
      {
        _id: volleyBooking2Id,
        fieldId: fieldBenedetti._id,
        userId: userFabbro._id,
        date: "2026-06-13",
        slot: "15:00-16:00",
        type: "tournament",
        tournamentId: pastVolleyId,
        matchId: volleyMatch2Id,
        createdAt: new Date("2026-05-20T11:00:00"),
      },
      {
        _id: volleyBooking3Id,
        fieldId: fieldBenedetti._id,
        userId: userFabbro._id,
        date: "2026-06-13",
        slot: "16:00-17:00",
        type: "tournament",
        tournamentId: pastVolleyId,
        matchId: volleyMatch3Id,
        createdAt: new Date("2026-05-20T11:00:00"),
      },
      {
        _id: volleyBooking4Id,
        fieldId: fieldBenedetti._id,
        userId: userFabbro._id,
        date: "2026-06-13",
        slot: "17:00-18:00",
        type: "tournament",
        tournamentId: pastVolleyId,
        matchId: volleyMatch4Id,
        createdAt: new Date("2026-05-20T11:00:00"),
      },
      {
        _id: volleyBooking5Id,
        fieldId: fieldBenedetti._id,
        userId: userFabbro._id,
        date: "2026-06-14",
        slot: "14:00-15:00",
        type: "tournament",
        tournamentId: pastVolleyId,
        matchId: volleyMatch5Id,
        createdAt: new Date("2026-05-20T11:00:00"),
      },
      {
        _id: volleyBooking6Id,
        fieldId: fieldBenedetti._id,
        userId: userFabbro._id,
        date: "2026-06-14",
        slot: "15:00-16:00",
        type: "tournament",
        tournamentId: pastVolleyId,
        matchId: volleyMatch6Id,
        createdAt: new Date("2026-05-20T11:00:00"),
      },
    ];

    const completedVolleyMatches = [
      {
        _id: volleyMatch1Id,
        tournamentId: pastVolleyId,
        teamA: pvTeam1Id,
        teamB: pvTeam2Id,
        round: 1,
        fieldId: fieldBenedetti._id,
        date: "2026-06-13",
        slot: "14:00-15:00",
        bookingId: volleyBooking1Id,
        status: "played",
        result: { scoreA: 2, scoreB: 0 },
      },
      {
        _id: volleyMatch2Id,
        tournamentId: pastVolleyId,
        teamA: pvTeam3Id,
        teamB: pvTeam4Id,
        round: 1,
        fieldId: fieldBenedetti._id,
        date: "2026-06-13",
        slot: "15:00-16:00",
        bookingId: volleyBooking2Id,
        status: "played",
        result: { scoreA: 2, scoreB: 1 },
      },
      {
        _id: volleyMatch3Id,
        tournamentId: pastVolleyId,
        teamA: pvTeam1Id,
        teamB: pvTeam3Id,
        round: 2,
        fieldId: fieldBenedetti._id,
        date: "2026-06-13",
        slot: "16:00-17:00",
        bookingId: volleyBooking3Id,
        status: "played",
        result: { scoreA: 2, scoreB: 1 },
      },
      {
        _id: volleyMatch4Id,
        tournamentId: pastVolleyId,
        teamA: pvTeam2Id,
        teamB: pvTeam4Id,
        round: 2,
        fieldId: fieldBenedetti._id,
        date: "2026-06-13",
        slot: "17:00-18:00",
        bookingId: volleyBooking4Id,
        status: "played",
        result: { scoreA: 2, scoreB: 0 },
      },
      {
        _id: volleyMatch5Id,
        tournamentId: pastVolleyId,
        teamA: pvTeam1Id,
        teamB: pvTeam4Id,
        round: 3,
        fieldId: fieldBenedetti._id,
        date: "2026-06-14",
        slot: "14:00-15:00",
        bookingId: volleyBooking5Id,
        status: "played",
        result: { scoreA: 2, scoreB: 0 },
      },
      {
        _id: volleyMatch6Id,
        tournamentId: pastVolleyId,
        teamA: pvTeam2Id,
        teamB: pvTeam3Id,
        round: 3,
        fieldId: fieldBenedetti._id,
        date: "2026-06-14",
        slot: "15:00-16:00",
        bookingId: volleyBooking6Id,
        status: "played",
        result: { scoreA: 1, scoreB: 2 },
      },
    ];

    /*
     * ------------------------------------------------------------------
     * 10. MATCHES FOR COMPLETED BASKETBALL TOURNAMENT
     * ------------------------------------------------------------------
     *
     * Round-robin, realistic basketball scores.
     */

    const basketMatch1Id = new ObjectId();
    const basketMatch2Id = new ObjectId();
    const basketMatch3Id = new ObjectId();
    const basketMatch4Id = new ObjectId();
    const basketMatch5Id = new ObjectId();
    const basketMatch6Id = new ObjectId();

    const basketBooking1Id = new ObjectId();
    const basketBooking2Id = new ObjectId();
    const basketBooking3Id = new ObjectId();
    const basketBooking4Id = new ObjectId();
    const basketBooking5Id = new ObjectId();
    const basketBooking6Id = new ObjectId();

    const completedBasketBookings = [
      {
        _id: basketBooking1Id,
        fieldId: fieldCarnera._id,
        userId: userPozzo._id,
        date: "2026-07-11",
        slot: "14:00-15:00",
        type: "tournament",
        tournamentId: pastBasketId,
        matchId: basketMatch1Id,
        createdAt: new Date("2026-06-15T11:00:00"),
      },
      {
        _id: basketBooking2Id,
        fieldId: fieldCarnera._id,
        userId: userPozzo._id,
        date: "2026-07-11",
        slot: "15:00-16:00",
        type: "tournament",
        tournamentId: pastBasketId,
        matchId: basketMatch2Id,
        createdAt: new Date("2026-06-15T11:00:00"),
      },
      {
        _id: basketBooking3Id,
        fieldId: fieldCarnera._id,
        userId: userPozzo._id,
        date: "2026-07-11",
        slot: "16:00-17:00",
        type: "tournament",
        tournamentId: pastBasketId,
        matchId: basketMatch3Id,
        createdAt: new Date("2026-06-15T11:00:00"),
      },
      {
        _id: basketBooking4Id,
        fieldId: fieldCarnera._id,
        userId: userPozzo._id,
        date: "2026-07-11",
        slot: "17:00-18:00",
        type: "tournament",
        tournamentId: pastBasketId,
        matchId: basketMatch4Id,
        createdAt: new Date("2026-06-15T11:00:00"),
      },
      {
        _id: basketBooking5Id,
        fieldId: fieldCarnera._id,
        userId: userPozzo._id,
        date: "2026-07-12",
        slot: "14:00-15:00",
        type: "tournament",
        tournamentId: pastBasketId,
        matchId: basketMatch5Id,
        createdAt: new Date("2026-06-15T11:00:00"),
      },
      {
        _id: basketBooking6Id,
        fieldId: fieldCarnera._id,
        userId: userPozzo._id,
        date: "2026-07-12",
        slot: "15:00-16:00",
        type: "tournament",
        tournamentId: pastBasketId,
        matchId: basketMatch6Id,
        createdAt: new Date("2026-06-15T11:00:00"),
      },
    ];

    const completedBasketMatches = [
      {
        _id: basketMatch1Id,
        tournamentId: pastBasketId,
        teamA: pbTeam1Id,
        teamB: pbTeam2Id,
        round: 1,
        fieldId: fieldCarnera._id,
        date: "2026-07-11",
        slot: "14:00-15:00",
        bookingId: basketBooking1Id,
        status: "played",
        result: { scoreA: 78, scoreB: 71 },
      },
      {
        _id: basketMatch2Id,
        tournamentId: pastBasketId,
        teamA: pbTeam3Id,
        teamB: pbTeam4Id,
        round: 1,
        fieldId: fieldCarnera._id,
        date: "2026-07-11",
        slot: "15:00-16:00",
        bookingId: basketBooking2Id,
        status: "played",
        result: { scoreA: 65, scoreB: 72 },
      },
      {
        _id: basketMatch3Id,
        tournamentId: pastBasketId,
        teamA: pbTeam1Id,
        teamB: pbTeam3Id,
        round: 2,
        fieldId: fieldCarnera._id,
        date: "2026-07-11",
        slot: "16:00-17:00",
        bookingId: basketBooking3Id,
        status: "played",
        result: { scoreA: 84, scoreB: 69 },
      },
      {
        _id: basketMatch4Id,
        tournamentId: pastBasketId,
        teamA: pbTeam2Id,
        teamB: pbTeam4Id,
        round: 2,
        fieldId: fieldCarnera._id,
        date: "2026-07-11",
        slot: "17:00-18:00",
        bookingId: basketBooking4Id,
        status: "played",
        result: { scoreA: 76, scoreB: 81 },
      },
      {
        _id: basketMatch5Id,
        tournamentId: pastBasketId,
        teamA: pbTeam1Id,
        teamB: pbTeam4Id,
        round: 3,
        fieldId: fieldCarnera._id,
        date: "2026-07-12",
        slot: "14:00-15:00",
        bookingId: basketBooking5Id,
        status: "played",
        result: { scoreA: 88, scoreB: 75 },
      },
      {
        _id: basketMatch6Id,
        tournamentId: pastBasketId,
        teamA: pbTeam2Id,
        teamB: pbTeam3Id,
        round: 3,
        fieldId: fieldCarnera._id,
        date: "2026-07-12",
        slot: "15:00-16:00",
        bookingId: basketBooking6Id,
        status: "played",
        result: { scoreA: 82, scoreB: 77 },
      },
    ];

    /*
     * ------------------------------------------------------------------
     * 12. NORMAL USER BOOKINGS
     * ------------------------------------------------------------------
     *
     * These are distributed between all five users.
     *
     * Dates span:
     *
     *   17 August 2026 -> 30 November 2026
     *
     * The bookings intentionally cover different sports and locations.
     */

    console.log("Creating normal bookings from August through November...");

    const normalBookings = [
      // --------------------------------------------------------------
      // AUGUST
      // --------------------------------------------------------------

      {
        _id: new ObjectId(),
        fieldId: fieldColussi._id,
        userId: userFabbro._id,
        date: "2026-08-18",
        slot: "18:00-19:00",
        type: "normal",
        createdAt: new Date(),
      },
      {
        _id: new ObjectId(),
        fieldId: fieldPalachiarbola._id,
        userId: userVisintin._id,
        date: "2026-08-20",
        slot: "19:00-20:00",
        type: "normal",
        createdAt: new Date(),
      },
      {
        _id: new ObjectId(),
        fieldId: fieldCarnera._id,
        userId: userCalligaris._id,
        date: "2026-08-22",
        slot: "16:00-17:00",
        type: "normal",
        createdAt: new Date(),
      },
      {
        _id: new ObjectId(),
        fieldId: fieldZanussi._id,
        userId: userZuliani._id,
        date: "2026-08-24",
        slot: "19:00-20:00",
        type: "normal",
        createdAt: new Date(),
      },
      {
        _id: new ObjectId(),
        fieldId: fieldPalamicheletto._id,
        userId: userPozzo._id,
        date: "2026-08-27",
        slot: "20:00-21:00",
        type: "normal",
        createdAt: new Date(),
      },

      // --------------------------------------------------------------
      // SEPTEMBER
      // --------------------------------------------------------------

      {
        _id: new ObjectId(),
        fieldId: fieldCividale._id,
        userId: userFabbro._id,
        date: "2026-09-03",
        slot: "18:00-19:00",
        type: "normal",
        createdAt: new Date(),
      },
      {
        _id: new ObjectId(),
        fieldId: fieldPalaTrieste._id,
        userId: userVisintin._id,
        date: "2026-09-05",
        slot: "17:00-18:00",
        type: "normal",
        createdAt: new Date(),
      },
      {
        _id: new ObjectId(),
        fieldId: fieldPalacalvola._id,
        userId: userCalligaris._id,
        date: "2026-09-08",
        slot: "19:00-20:00",
        type: "normal",
        createdAt: new Date(),
      },
      {
        _id: new ObjectId(),
        fieldId: fieldSfriso._id,
        userId: userZuliani._id,
        date: "2026-09-12",
        slot: "18:00-19:00",
        type: "normal",
        createdAt: new Date(),
      },
      {
        _id: new ObjectId(),
        fieldId: fieldBenedetti._id,
        userId: userPozzo._id,
        date: "2026-09-15",
        slot: "20:00-21:00",
        type: "normal",
        createdAt: new Date(),
      },

      // --------------------------------------------------------------
      // OCTOBER
      // --------------------------------------------------------------

      {
        _id: new ObjectId(),
        fieldId: fieldColussi._id,
        userId: userFabbro._id,
        date: "2026-10-02",
        slot: "19:00-20:00",
        type: "normal",
        createdAt: new Date(),
      },
      {
        _id: new ObjectId(),
        fieldId: fieldPalachiarbola._id,
        userId: userVisintin._id,
        date: "2026-10-04",
        slot: "18:00-19:00",
        type: "normal",
        createdAt: new Date(),
      },
      {
        _id: new ObjectId(),
        fieldId: fieldCarnera._id,
        userId: userCalligaris._id,
        date: "2026-10-09",
        slot: "19:00-20:00",
        type: "normal",
        createdAt: new Date(),
      },
      {
        _id: new ObjectId(),
        fieldId: fieldZanussi._id,
        userId: userZuliani._id,
        date: "2026-10-17",
        slot: "17:00-18:00",
        type: "normal",
        createdAt: new Date(),
      },
      {
        _id: new ObjectId(),
        fieldId: fieldPalamicheletto._id,
        userId: userPozzo._id,
        date: "2026-10-22",
        slot: "20:00-21:00",
        type: "normal",
        createdAt: new Date(),
      },

      // --------------------------------------------------------------
      // NOVEMBER
      // --------------------------------------------------------------

      {
        _id: new ObjectId(),
        fieldId: fieldCividale._id,
        userId: userFabbro._id,
        date: "2026-11-03",
        slot: "18:00-19:00",
        type: "normal",
        createdAt: new Date(),
      },
      {
        _id: new ObjectId(),
        fieldId: fieldPalaTrieste._id,
        userId: userVisintin._id,
        date: "2026-11-07",
        slot: "16:00-17:00",
        type: "normal",
        createdAt: new Date(),
      },
      {
        _id: new ObjectId(),
        fieldId: fieldPalacalvola._id,
        userId: userCalligaris._id,
        date: "2026-11-10",
        slot: "19:00-20:00",
        type: "normal",
        createdAt: new Date(),
      },
      {
        _id: new ObjectId(),
        fieldId: fieldSfriso._id,
        userId: userZuliani._id,
        date: "2026-11-14",
        slot: "18:00-19:00",
        type: "normal",
        createdAt: new Date(),
      },
      {
        _id: new ObjectId(),
        fieldId: fieldBenedetti._id,
        userId: userPozzo._id,
        date: "2026-11-21",
        slot: "19:00-20:00",
        type: "normal",
        createdAt: new Date(),
      },
    ];

    /*
     * ------------------------------------------------------------------
     * 13. INSERT BOOKINGS
     * ------------------------------------------------------------------
     */

    const allBookings = [
      ...completedVolleyBookings,
      ...completedBasketBookings,
      ...normalBookings,
    ];

    await db.collection("bookings").insertMany(allBookings);

    /*
     * ------------------------------------------------------------------
     * 14. INSERT MATCHES
     * ------------------------------------------------------------------
     */

    await db
      .collection("matches")
      .insertMany([...completedVolleyMatches, ...completedBasketMatches]);

    /*
     * ------------------------------------------------------------------
     * 15. SUMMARY
     * ------------------------------------------------------------------
     */

    console.log("");
    console.log("--- Seeding Completed Successfully ---");
    console.log(`Users:       ${usersData.length}`);
    console.log(`Fields:      ${fieldsData.length}`);
    console.log(`Tournaments: 4`);
    console.log(`  - Past:    2`);
    console.log(`  - Upcoming: 2`);
    console.log(
      `Matches:     ${completedVolleyMatches.length + completedBasketMatches.length + 1}`,
    );
    console.log(`Bookings:    ${allBookings.length}`);
    console.log("");
    console.log("Test password for every user: password123");
    console.log("");
    console.log("Users:");
    usersData.forEach((user) => {
      console.log(`  ${user.username} / password123`);
    });
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exitCode = 1;
  } finally {
    await closeDB();
  }
}

seedDatabase();
