import { closeDB, connectDB } from "./db.js";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function getDateOffset(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

async function seedDatabase() {
  try {
    const db = await connectDB();
    console.log("Starting database seed...");

    await Promise.all([
      db.collection("users").deleteMany({}),
      db.collection("fields").deleteMany({}),
      db.collection("tournaments").deleteMany({}),
      db.collection("bookings").deleteMany({}),
      db.collection("matches").deleteMany({}),
    ]);

    await Promise.all([
      db.collection("users").createIndex({ username: 1 }, { unique: true }),
      db.collection("bookings").createIndex(
          { fieldId: 1, date: 1, slot: 1 },
          { unique: true },
      ),
      db.collection("bookings").createIndex({ userId: 1, date: 1 }),
      db.collection("matches").createIndex({ tournamentId: 1, round: 1 }),
    ]);

    const passwordHash = await bcrypt.hash("password123", 10);
    const users = [
      ["jfabbro", "Jacopo", "Fabbro"],
      ["avisintin", "Alvise", "Visintin"],
      ["ecalligaris", "Elena", "Calligaris"],
      ["dzuliani", "Davide", "Zuliani"],
      ["gpozzo", "Giovanni", "Pozzo"],
      ["mrossi", "Marco", "Rossi"],
      ["lbianchi", "Luca", "Bianchi"],
    ].map(([username, name, surname]) => ({
      _id: new ObjectId(),
      username,
      password: passwordHash,
      name,
      surname,
      createdAt: new Date(),
    }));
    await db.collection("users").insertMany(users);

    const byUsername = Object.fromEntries(users.map((user) => [user.username, user]));
    const jfabbro = byUsername.jfabbro;

    const footballSlots = [
      "14:00-15:00", "15:00-16:00", "16:00-17:00", "17:00-18:00", "18:00-19:00",
    ];
    const indoorSlots = [
      "14:00-15:00", "15:00-16:00", "16:00-17:00", "17:00-18:00", "18:00-19:00", "19:00-20:00",
    ];
    const fields = [
      {
        _id: new ObjectId(),
        name: "Campo Comunale di Basovizza",
        sport: "football",
        address: "Località Basovizza, Trieste (TS)",
        slots: footballSlots,
      },
      {
        _id: new ObjectId(),
        name: "Campo Sportivo Comunale di San Daniele",
        sport: "football",
        address: "Via Udine, San Daniele del Friuli (UD)",
        slots: footballSlots,
      },
      {
        _id: new ObjectId(),
        name: "Campo Sportivo Edi Colussi",
        sport: "football",
        address: "Via Capoia 3, Cervignano del Friuli (UD)",
        slots: footballSlots,
      },
      {
        _id: new ObjectId(),
        name: "Campo Comunale di Cividale",
        sport: "football",
        address: "Via dello Sport, Cividale del Friuli (UD)",
        slots: footballSlots,
      },
      {
        _id: new ObjectId(),
        name: "Campo Comunale di Fontanafredda",
        sport: "football",
        address: "Via del Parco 8, Fontanafredda (PN)",
        slots: footballSlots,
      },
      {
        _id: new ObjectId(),
        name: "Stadio Comunale di Monfalcone",
        sport: "football",
        address: "Via Boito 18, Monfalcone (GO)",
        slots: footballSlots,
      },
      {
        _id: new ObjectId(),
        name: "PalaTrieste",
        sport: "volleyball",
        address: "Via Flavia 3, Trieste (TS)",
        slots: indoorSlots,
      },
      {
        _id: new ObjectId(),
        name: "Palazzetto dello Sport di Chiarbola",
        sport: "volleyball",
        address: "Via Visinada 5, Trieste (TS)",
        slots: indoorSlots,
      },
      {
        _id: new ObjectId(),
        name: "Palazzetto dello Sport di Latisana",
        sport: "volleyball",
        address: "Via Giovanni Bottari 1, Latisana (UD)",
        slots: indoorSlots,
      },
      {
        _id: new ObjectId(),
        name: "Palasport di Prata di Pordenone",
        sport: "volleyball",
        address: "Via Volta 26, Prata di Pordenone (PN)",
        slots: indoorSlots,
      },
      {
        _id: new ObjectId(),
        name: "Palasport Primo Carnera",
        sport: "basketball",
        address: "Via Floriano Candonio 540, Udine (UD)",
        slots: indoorSlots,
      },
      {
        _id: new ObjectId(),
        name: "Palasport di Chiarbola",
        sport: "basketball",
        address: "Via Visinada 5, Trieste (TS)",
        slots: indoorSlots,
      },
      {
        _id: new ObjectId(),
        name: "PalaGesteco",
        sport: "basketball",
        address: "Via Perusin 18, Cividale del Friuli (UD)",
        slots: indoorSlots,
      },
      {
        _id: new ObjectId(),
        name: "Palasport di Monfalcone",
        sport: "basketball",
        address: "Via Gioacchino Rossini 48, Monfalcone (GO)",
        slots: indoorSlots,
      },
      {
        _id: new ObjectId(),
        name: "Palazzetto dello Sport di Codroipo",
        sport: "basketball",
        address: "Via Circonvallazione Sud, Codroipo (UD)",
        slots: indoorSlots,
      },
    ];
    const shuffledFields = shuffle(fields);
    await db.collection("fields").insertMany(shuffledFields);
    const field = Object.fromEntries(fields.map((item) => [item.name, item]));

    const player = (name, surname, jerseyNumber) => ({ name, surname, jerseyNumber });
    const team = (name, players) => ({ _id: new ObjectId(), name, players });
    const booking = ({ fieldId, date, slot, tournamentId = null, type = "tournament" }) => ({
      _id: new ObjectId(),
      fieldId,
      userId: jfabbro._id,
      date,
      slot,
      type,
      ...(tournamentId && { tournamentId }),
      createdAt: new Date(),
    });

    function roundRobin(tournamentId, teams) {
      const rotation = [...teams];
      const matches = [];
      for (let round = 1; round < rotation.length; round += 1) {
        for (let index = 0; index < rotation.length / 2; index += 1) {
          const teamA = rotation[index];
          const teamB = rotation[rotation.length - 1 - index];
          matches.push({
            _id: new ObjectId(), tournamentId, teamA: teamA._id, teamB: teamB._id,
            teamAName: teamA.name, teamBName: teamB.name, round,
            status: "upcoming", fieldId: null, date: null, slot: null,
            bookingId: null, result: null,
          });
        }
        rotation.splice(1, 0, rotation.pop());
      }
      return matches;
    }

    function completeTournament({ name, sport, startDate, teams, schedule }) {
      const tournamentId = new ObjectId();
      const tournament = {
        _id: tournamentId, creatorId: jfabbro._id, name, sport, maxTeams: 4,
        startDate, status: "completed", teams, createdAt: new Date(),
      };
      const matches = roundRobin(tournamentId, teams);
      const bookings = matches.map((match, index) => {
        const item = schedule[index];
        const matchBooking = booking({
          fieldId: item.field._id, date: item.date, slot: item.slot, tournamentId,
        });
        Object.assign(match, {
          status: "played", fieldId: item.field._id, date: item.date, slot: item.slot,
          bookingId: matchBooking._id,
          result: { scoreA: item.scoreA, scoreB: item.scoreB },
        });
        return matchBooking;
      });
      return { tournament, matches, bookings };
    }

    const footballTeams = [
      team("ASD Opicina", [player("Jacopo", "Fabbro", 10), player("Matteo", "Ruzzier", 7), player("Lorenzo", "Cergol", 4), player("Nicola", "Sossi", 11)]),
      team("San Daniele Calcio", [player("Alvise", "Visintin", 9), player("Marco", "Zoratti", 8), player("Davide", "Miani", 5), player("Paolo", "Tosolini", 3)]),
      team("Cervignano United", [player("Elena", "Calligaris", 1), player("Andrea", "Furlan", 6), player("Giorgio", "Pellizzari", 13), player("Fabio", "Comelli", 2)]),
      team("Cividale Sport", [player("Davide", "Zuliani", 12), player("Enrico", "Burelli", 7), player("Simone", "Venier", 14), player("Riccardo", "Zorzi", 18)]),
    ];
    const football = completeTournament({
      name: "Coppa del Carso", sport: "football", startDate: getDateOffset(-21), teams: footballTeams,
      schedule: [
        { field: field["Campo Comunale di Basovizza"], date: getDateOffset(-21), slot: "14:00-15:00", scoreA: 3, scoreB: 1 },
        { field: field["Campo Comunale di Basovizza"], date: getDateOffset(-21), slot: "15:00-16:00", scoreA: 2, scoreB: 2 },
        { field: field["Campo Sportivo Comunale di San Daniele"], date: getDateOffset(-20), slot: "14:00-15:00", scoreA: 1, scoreB: 0 },
        { field: field["Campo Sportivo Comunale di San Daniele"], date: getDateOffset(-20), slot: "15:00-16:00", scoreA: 2, scoreB: 3 },
        { field: field["Campo Comunale di Basovizza"], date: getDateOffset(-19), slot: "16:00-17:00", scoreA: 4, scoreB: 2 },
        { field: field["Campo Comunale di Basovizza"], date: getDateOffset(-19), slot: "17:00-18:00", scoreA: 1, scoreB: 1 },
      ],
    });

    const volleyballTeams = [
      team("Pallavolo Trieste", [player("Jacopo", "Fabbro", 8), player("Luca", "Moro", 7), player("Federico", "Marin", 12), player("Giulia", "Bertoli", 4)]),
      team("Volley Udine", [player("Giovanni", "Pozzo", 9), player("Marta", "Rossi", 5), player("Chiara", "Benedetti", 11), player("Tommaso", "Pavan", 3)]),
      team("Gorizia Volley", [player("Elena", "Calligaris", 6), player("Stefano", "Dri", 9), player("Pietro", "Neri", 13), player("Sara", "Furlan", 2)]),
      team("Pordenone Pallavolo", [player("Davide", "Zuliani", 1), player("Nicola", "Moretti", 7), player("Elisa", "Zanier", 15), player("Gabriele", "Basso", 10)]),
    ];
    const volleyball = completeTournament({
      name: "Trofeo delle Città FVG", sport: "volleyball", startDate: getDateOffset(-12), teams: volleyballTeams,
      schedule: [
        { field: field.PalaTrieste, date: getDateOffset(-12), slot: "14:00-15:00", scoreA: 3, scoreB: 0 },
        { field: field.PalaTrieste, date: getDateOffset(-12), slot: "15:00-16:00", scoreA: 3, scoreB: 2 },
        { field: field["Palazzetto dello Sport di Chiarbola"], date: getDateOffset(-11), slot: "14:00-15:00", scoreA: 1, scoreB: 3 },
        { field: field["Palazzetto dello Sport di Chiarbola"], date: getDateOffset(-11), slot: "15:00-16:00", scoreA: 3, scoreB: 1 },
        { field: field.PalaTrieste, date: getDateOffset(-10), slot: "16:00-17:00", scoreA: 3, scoreB: 2 },
        { field: field.PalaTrieste, date: getDateOffset(-10), slot: "17:00-18:00", scoreA: 2, scoreB: 3 },
      ],
    });

    // The first two fixtures are in the past and remain unscored on purpose.
    // They exercise the score-entry flow without requiring another account.
    const scoreEntryTournamentId = new ObjectId();
    const scoreEntryTeams = [
      team("Basket Cervignano", [player("Jacopo", "Fabbro", 10), player("Luca", "Maran", 7), player("Marco", "Bortolussi", 12), player("Andrea", "Tosolini", 4), player("Stefano", "Neri", 8)]),
      team("Libertas Gonars", [player("Alvise", "Visintin", 9), player("Matteo", "Verdi", 5), player("Paolo", "Russo", 11), player("Davide", "Furlan", 3), player("Giorgio", "Basso", 6)]),
      team("Azzurra Gorizia", [player("Elena", "Calligaris", 6), player("Stefano", "Moro", 9), player("Pietro", "Neri", 13), player("Fabio", "Basso", 2), player("Lorenzo", "Pavan", 15)]),
      team("Basket Pordenone", [player("Davide", "Zuliani", 12), player("Nicola", "Moretti", 7), player("Enrico", "Rossi", 9), player("Gabriele", "Moro", 14), player("Simone", "Bianchi", 18)]),
    ];
    const scoreEntryTournament = {
      _id: scoreEntryTournamentId, creatorId: jfabbro._id, name: "Coppa della Bassa Friulana",
      sport: "basketball", maxTeams: 4, startDate: getDateOffset(-1), status: "active",
      teams: scoreEntryTeams, createdAt: new Date(),
    };
    const scoreEntryMatches = roundRobin(scoreEntryTournamentId, scoreEntryTeams);
    const scoreEntrySchedule = [
      { date: getDateOffset(-1), slot: "18:00-19:00" },
      { date: getDateOffset(-1), slot: "19:00-20:00" },
      { date: getDateOffset(1), slot: "18:00-19:00" },
      { date: getDateOffset(1), slot: "19:00-20:00" },
      { date: getDateOffset(2), slot: "18:00-19:00" },
      { date: getDateOffset(2), slot: "19:00-20:00" },
    ];
    const scoreEntryBookings = scoreEntryMatches.map((match, index) => {
      const item = scoreEntrySchedule[index];
      const matchBooking = booking({
        fieldId: field.PalaGesteco._id, date: item.date, slot: item.slot,
        tournamentId: scoreEntryTournamentId,
      });
      Object.assign(match, {
        fieldId: field.PalaGesteco._id, date: item.date, slot: item.slot,
        bookingId: matchBooking._id,
      });
      return matchBooking;
    });

    // These belong to other users and are intentionally left alone: they make
    // the tournament lists feel populated without adding work for jfabbro.
    const avisintinTournament = {
      _id: new ObjectId(), creatorId: byUsername.avisintin._id, name: "Trofeo del Tagliamento",
      sport: "football", maxTeams: 6, startDate: getDateOffset(14), status: "registration",
      teams: [
        team("Codroipo Calcio", [player("Alvise", "Visintin", 10), player("Matteo", "Buiatti", 7), player("Andrea", "Londero", 4)]),
        team("Rive d'Arcano", [player("Marco", "Rossi", 9), player("Paolo", "Cargnelutti", 5), player("Fabio", "Pittana", 11)]),
        team("Gemona Sport", [player("Luca", "Bianchi", 8), player("Simone", "Brianti", 6), player("Davide", "Ciani", 12)]),
      ],
      createdAt: new Date(),
    };
    const ecalligarisTournament = {
      _id: new ObjectId(), creatorId: byUsername.ecalligaris._id, name: "Coppa dell'Isontino",
      sport: "volleyball", maxTeams: 4, startDate: getDateOffset(21), status: "registration",
      teams: [
        team("Pallavolo Gorizia", [player("Elena", "Calligaris", 10), player("Marta", "Londero", 4), player("Chiara", "Furlan", 8)]),
        team("Volley Muggia", [player("Giovanni", "Pozzo", 7), player("Elisa", "Pavan", 3), player("Anna", "Zanetti", 9)]),
      ],
      createdAt: new Date(),
    };

    const readyTournament = {
      _id: new ObjectId(), creatorId: jfabbro._id, name: "Memorial Città di Udine",
      sport: "basketball", maxTeams: 4, startDate: getDateOffset(7), status: "registration",
      teams: [
        team("Trieste Basket Club", [player("Jacopo", "Fabbro", 10), player("Luca", "Rossi", 7), player("Marco", "Bianchi", 12), player("Andrea", "Moro", 4), player("Stefano", "Neri", 8)]),
        team("Udine Eagles", [player("Giovanni", "Pozzo", 9), player("Matteo", "Verdi", 5), player("Paolo", "Russo", 11), player("Davide", "Furlan", 3), player("Giorgio", "Basso", 6)]),
        team("Gorizia Basket", [player("Elena", "Calligaris", 6), player("Stefano", "Moro", 9), player("Pietro", "Neri", 13), player("Fabio", "Basso", 2), player("Lorenzo", "Pavan", 15)]),
        team("Pordenone Hoops", [player("Davide", "Zuliani", 12), player("Nicola", "Moretti", 7), player("Enrico", "Rossi", 9), player("Gabriele", "Moro", 14), player("Simone", "Bianchi", 18)]),
      ],
      createdAt: new Date(),
    };

    const normalBookings = [
      booking({ fieldId: field["Palasport Primo Carnera"]._id, date: getDateOffset(2), slot: "18:00-19:00", type: "normal" }),
      booking({ fieldId: field.PalaTrieste._id, date: getDateOffset(5), slot: "19:00-20:00", type: "normal" }),
    ];

    await db.collection("tournaments").insertMany([
      football.tournament,
      volleyball.tournament,
      scoreEntryTournament,
      readyTournament,
      avisintinTournament,
      ecalligarisTournament,
    ]);
    await db.collection("matches").insertMany([
      ...football.matches,
      ...volleyball.matches,
      ...scoreEntryMatches,
    ]);
    await db.collection("bookings").insertMany([
      ...football.bookings,
      ...volleyball.bookings,
      ...scoreEntryBookings,
      ...normalBookings,
    ]);

    console.log("Database seed completed.");
    console.log("Default account: jfabbro / password123");
    console.log("All other demo users have password: password123");
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

seedDatabase().catch((error) => {
  console.error("Unexpected seed error:", error);
  process.exit(1);
});