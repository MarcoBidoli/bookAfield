import {closeDB, connectDB} from './db.js';
import {ObjectId} from 'mongodb';
import bcrypt from 'bcryptjs';

async function seedDatabase() {
    try {
        const db = await connectDB();
        console.log('--- Starting Database Seed ---');

        // 1. Insert Indexes
        console.log('Creating database indexes...');
        // Users: Unique index on username
        await db.collection('users').createIndex({ username: 1 }, { unique: true });
        // Bookings: Compound unique index on fieldId, date, slot to prevent overlaps atomically
        await db.collection('bookings').createIndex({ fieldId: 1, date: 1, slot: 1 }, { unique: true });
        console.log('Indexes created successfully.');

        // 2. Create Users
        console.log('Hashing passwords and seeding users...');

        // (INTENTIONAL same password and salt for all mock users!)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const usersData = [
            {
                _id: new ObjectId(),
                username: 'jfabbro',
                password: hashedPassword,
                name: 'Jacopo',
                surname: 'Fabbro',
                createdAt: new Date()
            },
            {
                _id: new ObjectId(),
                username: 'avisintin',
                password: hashedPassword,
                name: 'Alvise',
                surname: 'Visintin',
                createdAt: new Date()
            },
            {
                _id: new ObjectId(),
                username: 'ecalligaris',
                password: hashedPassword,
                name: 'Elena',
                surname: 'Calligaris',
                createdAt: new Date()
            },
            {
                _id: new ObjectId(),
                username: 'dzuliani',
                password: hashedPassword,
                name: 'Davide',
                surname: 'Zuliani',
                createdAt: new Date()
            },
            {
                _id: new ObjectId(),
                username: 'gpozzo',
                password: hashedPassword,
                name: 'Giovanni',
                surname: 'Pozzo',
                createdAt: new Date()
            },
            {
                _id: new ObjectId(),
                username: 'gbasso',
                password: hashedPassword,
                name: 'Giulia',
                surname: 'Basso',
                createdAt: new Date()
            },
            {
                _id: new ObjectId(),
                username: 'mcudicini',
                password: hashedPassword,
                name: 'Marco',
                surname: 'Cudicini',
                createdAt: new Date()
            },
            {
                _id: new ObjectId(),
                username: 'fmoretti',
                password: hashedPassword,
                name: 'Francesca',
                surname: 'Moretti',
                createdAt: new Date()
            },
            {
                _id: new ObjectId(),
                username: 'pzoff',
                password: hashedPassword,
                name: 'Paolo',
                surname: 'Zoff',
                createdAt: new Date()
            },
            {
                _id: new ObjectId(),
                username: 'mtoso',
                password: hashedPassword,
                name: 'Mariangela',
                surname: 'Toso',
                createdAt: new Date()
            }
        ];

        await db.collection('users').insertMany(usersData);
        console.log(`Seeded ${usersData.length} users.`);

        const [
            userFabbro,
            userVisintin,
            userCalligaris,
            userZuliani,
            userPozzo,
            userBasso,
            userCudicini,
            userMoretti,
            userZoff,
            userToso
        ] = usersData;

        // 3. Create Fields (9 fields of different types/sports in FVG, with fixed slots)
        console.log('Seeding 9 FVG fields with fixed slots...');
        const fieldsData = [
            // --- Football (3 fields) ---
            {
                _id: new ObjectId(),
                name: 'Bella Italia EFA Village - Pitch A',
                sport: 'football',
                address: 'Viale Centrale 29, Lignano Sabbiadoro (UD)',
                slots: ['09:00-10:00', '10:00-11:00', '11:00-12:00', '15:00-16:00', '16:00-17:00', '17:00-18:00', '18:00-19:00', '19:00-20:00']
            },
            {
                _id: new ObjectId(),
                name: 'Campi Sportivi del Cormor - Campo 1',
                sport: 'football',
                address: 'Via delle Betulle 2, Udine (UD)',
                slots: ['15:00-16:00', '16:00-17:00', '17:00-18:00', '18:00-19:00', '19:00-20:00', '20:00-21:00']
            },
            {
                _id: new ObjectId(),
                name: 'Centro Sportivo Lupieri',
                sport: 'football',
                address: 'Via Roma 84, Tarcento (UD)',
                slots: ['16:00-17:00', '17:00-18:00', '18:00-19:00', '19:00-20:00', '20:00-21:00']
            },
            // --- Volleyball (3 fields) ---
            {
                _id: new ObjectId(),
                name: 'Polo Sportivo Bearzi - Indoor Gym',
                sport: 'volleyball',
                address: 'Via Don Bosco 2, Udine (UD)',
                slots: ['10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00', '19:00-20:00']
            },
            {
                _id: new ObjectId(),
                name: 'Palasport Chiarbola',
                sport: 'volleyball',
                address: 'Via del Farneto 3, Trieste (TS)',
                slots: ['09:00-10:00', '10:00-11:00', '11:00-12:00', '15:00-16:00', '16:00-17:00', '17:00-18:00', '18:00-19:00', '19:00-20:00']
            },
            {
                _id: new ObjectId(),
                name: 'Centro Sportivo Comunale di Cervignano',
                sport: 'volleyball',
                address: 'Via della Crescentia, Cervignano del Friuli (UD)',
                slots: ['17:00-18:00', '18:00-19:00', '19:00-20:00', '20:00-21:00']
            },
            // --- Basketball (3 fields) ---
            {
                _id: new ObjectId(),
                name: 'Palasport Piancavallo',
                sport: 'basketball',
                address: 'Via Collalto, Aviano (PN)',
                slots: ['09:00-10:00', '11:00-12:00', '14:00-15:00', '16:00-17:00', '18:00-19:00', '19:00-20:00']
            },
            {
                _id: new ObjectId(),
                name: 'CUS Trieste - PalaCUS',
                sport: 'basketball',
                address: 'Via Alfonso Valerio 12, Trieste (TS)',
                slots: ['09:00-10:00', '10:00-11:00', '11:00-12:00', '13:00-14:00', '15:00-16:00', '16:00-17:00', '18:00-19:00', '19:00-20:00']
            },
            {
                _id: new ObjectId(),
                name: 'Palazzetto dello Sport Manlio Benedetti',
                sport: 'basketball',
                address: 'Via Marinoni 1, Udine (UD)',
                slots: ['14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00', '18:00-19:00', '19:00-20:00', '20:00-21:00']
            }
        ];

        await db.collection('fields').insertMany(fieldsData);
        console.log(`Seeded ${fieldsData.length} fields.`);

        const [
            fieldBellaItalia,
            fieldCormor,
            fieldLupieri,
            fieldBearzi,
            fieldChiarbola,
            fieldCervignano,
            fieldPiancavallo,
            fieldCusTrieste,
            fieldBenedetti
        ] = fieldsData;

        // 4. Create Tournaments
        console.log('Seeding tournaments...');
        
        // Tournament 1: Active Volleyball Tournament (Full, matches generated, some played)
        const vTeam1Id = new ObjectId();
        const vTeam2Id = new ObjectId();
        const vTeam3Id = new ObjectId();
        const vTeam4Id = new ObjectId();

        const tournamentVolley = {
            _id: new ObjectId(),
            creatorId: userFabbro._id,
            name: 'Torneo Volley Friuli Orientale',
            sport: 'volleyball',
            maxTeams: 4,
            startDate: '2026-09-01',
            status: 'active',
            teams: [
                {
                    _id: vTeam1Id,
                    name: 'Udine Spikers',
                    players: [
                        { userId: userFabbro._id, name: userFabbro.name, surname: userFabbro.surname},
                        { userId: null, name: 'Matteo', surname: 'Bearzot'}
                    ]
                },
                {
                    _id: vTeam2Id,
                    name: 'Trieste Volley Club',
                    players: [
                        { userId: userVisintin._id, name: userVisintin.name, surname: userVisintin.surname},
                        { userId: null, name: 'Alice', surname: 'Cudicio'}
                    ]
                },
                {
                    _id: vTeam3Id,
                    name: 'Gorizia Blockers',
                    players: [
                        { userId: userCalligaris._id, name: userCalligaris.name, surname: userCalligaris.surname},
                        { userId: null, name: 'Piero', surname: 'Degano'}
                    ]
                },
                {
                    _id: vTeam4Id,
                    name: 'Pordenone Net Force',
                    players: [
                        { userId: userZuliani._id, name: userZuliani.name, surname: userZuliani.surname},
                        { userId: null, name: 'Luca', surname: 'Trevisan'}
                    ]
                }
            ],
            createdAt: new Date()
        };

        // Tournament 2: Basket Tournament in 'registration' state (Not full yet, 2/4 teams)
        const bTeam1Id = new ObjectId();
        const bTeam2Id = new ObjectId();

        const tournamentBasket = {
            _id: new ObjectId(),
            creatorId: userPozzo._id,
            name: 'Coppa Carnia Basket',
            sport: 'basketball',
            maxTeams: 4,
            startDate: '2026-10-15',
            status: 'registration',
            teams: [
                {
                    _id: bTeam1Id,
                    name: 'Tolmezzo Bulls',
                    players: [
                        { userId: userPozzo._id, name: userPozzo.name, surname: userPozzo.surname},
                        { userId: userMoretti._id, name: userMoretti.name, surname: userMoretti.surname}
                    ]
                },
                {
                    _id: bTeam2Id,
                    name: 'Gemona Warriors',
                    players: [
                        { userId: userBasso._id, name: userBasso.name, surname: userBasso.surname},
                        { userId: userCudicini._id, name: userCudicini.name, surname: userCudicini.surname}
                    ]
                }
            ],
            createdAt: new Date()
        };

        await db.collection('tournaments').insertMany([tournamentVolley, tournamentBasket]);
        console.log('Seeded 2 tournaments (1 Active Volleyball, 1 Registration Basketball).');

        // 5. Create Bookings & Matches
        console.log('Seeding bookings and matches...');

        // Booking cases:
        // A) Simple user booking one or more slots (e.g., userVisintin booking multiple dates/fields)
        const normalBooking1Id = new ObjectId();
        const normalBooking2Id = new ObjectId();
        const normalBooking3Id = new ObjectId();

        // B) Tournament bookings tied to generated matches
        const tBooking1Id = new ObjectId(); // Match 1 booking
        const tBooking2Id = new ObjectId(); // Match 2 booking

        const match1Id = new ObjectId();
        const match2Id = new ObjectId();
        const match3Id = new ObjectId(); // Unscheduled match

        const bookingsData = [
            // Simple bookings for userVisintin (Multiple slots booked)
            {
                _id: normalBooking1Id,
                fieldId: fieldCormor._id,
                userId: userVisintin._id,
                date: '2026-08-15',
                slot: '18:00-19:00',
                type: 'normal',
                createdAt: new Date()
            },
            {
                _id: normalBooking2Id,
                fieldId: fieldBenedetti._id,
                userId: userVisintin._id,
                date: '2026-08-16',
                slot: '16:00-17:00',
                type: 'normal',
                createdAt: new Date()
            },
            // Simple booking for userCalligaris
            {
                _id: normalBooking3Id,
                fieldId: fieldChiarbola._id,
                userId: userCalligaris._id,
                date: '2026-08-15',
                slot: '10:00-11:00',
                type: 'normal',
                createdAt: new Date()
            },
            // Tournament Match 1 Booking (Scheduled and Played)
            {
                _id: tBooking1Id,
                fieldId: fieldBearzi._id,
                userId: userFabbro._id,
                date: '2026-09-01',
                slot: '14:00-15:00',
                type: 'tournament',
                tournamentId: tournamentVolley._id,
                matchId: match1Id,
                createdAt: new Date()
            },
            // Tournament Match 2 Booking (Scheduled and Upcoming)
            {
                _id: tBooking2Id,
                fieldId: fieldBearzi._id,
                userId: userFabbro._id,
                date: '2026-09-02',
                slot: '16:00-17:00',
                type: 'tournament',
                tournamentId: tournamentVolley._id,
                matchId: match2Id,
                createdAt: new Date()
            }
        ];

        await db.collection('bookings').insertMany(bookingsData);
        console.log(`Seeded ${bookingsData.length} bookings.`);

        const matchesData = [
            // Match 1: Played (Volleyball - scores cannot be equal as per v1.2 rule, so 3-1 is valid)
            {
                _id: match1Id,
                tournamentId: tournamentVolley._id,
                teamA: vTeam1Id,
                teamB: vTeam2Id,
                round: 1,
                fieldId: fieldBearzi._id,
                date: '2026-09-01',
                slot: '14:00-15:00',
                bookingId: tBooking1Id,
                status: 'played',
                result: { scoreA: 3, scoreB: 1 }
            },
            // Match 2: Scheduled & Upcoming
            {
                _id: match2Id,
                tournamentId: tournamentVolley._id,
                teamA: vTeam3Id,
                teamB: vTeam4Id,
                round: 1,
                fieldId: fieldBearzi._id,
                date: '2026-09-02',
                slot: '16:00-17:00',
                bookingId: tBooking2Id,
                status: 'upcoming'
            },
            // Match 3: Unscheduled (No field, date, slot or bookingId yet)
            {
                _id: match3Id,
                tournamentId: tournamentVolley._id,
                teamA: vTeam1Id,
                teamB: vTeam3Id,
                round: 2,
                fieldId: null,
                date: null,
                slot: null,
                bookingId: null,
                status: 'upcoming'
            }
        ];

        await db.collection('matches').insertMany(matchesData);
        console.log(`Seeded ${matchesData.length} matches.`);

        console.log('--- Seeding Completed Successfully ---');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await closeDB();
        process.exit(0);
    }
}

seedDatabase();