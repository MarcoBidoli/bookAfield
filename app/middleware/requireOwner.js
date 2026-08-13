// verifies that the currently logged-in user (req.user._id) is the creator of the resource being modified

import {getDB} from "../db.js";
import {ObjectId} from "mongodb";

export function requireOwner(collectionName, ownerField = "creatorId") {
    return async (req, res, next) => {
        try {
            const db = getDB();
            const doc = await db.collection(collectionName).findOne({_id: new ObjectId(req.params.id)});

            if (!doc) {
                return res.status(404).send({error: "Resource not found"});
            }

            // check id current user is the owner
            const docOwner = doc[ownerField]?.toString();
            const currUser = req.user?._id?.toString();
            if (docOwner !== currUser) {
                return res.status(403).json({error: "You do not own this resource"});
            }

            // document saved in req object to avoid query the db foreach future check
            req.resource = doc;

            next();
        } catch (error) {
            next(error);
        }
    };
}