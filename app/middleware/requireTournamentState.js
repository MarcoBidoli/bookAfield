// ensures that a tournament cannot be modified once matches have started
export function requireTournamentState(allowedStatuses = ["registration"]) {
    return (req, res, next) => {
        const tournament = req.resource;

        if (!tournament) {
            return res.status(500).json({error: "Resource not found on request. Ensure the resource loader middleware runs before requireTournamentState"});
        }

        if (!allowedStatuses.includes(tournament.status)) {
            return res.status(400).json({error: `Action not allowed. Tournament status is currently in '${tournament.status}'`});
        }

        next();
    };
}