import mongoose from "mongoose";

const eventEntrySchema = new mongoose.Schema({
    attender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EventTeamMember",
        required: true
    },
    attendee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    event_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true
    },
    enrolled_individual_event_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EnrolledIndividualEvent",
    },
    enrolled_team_event_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EnrolledTeamEvent",
    },
    checked_in_at: {
        type: Date,
        default: null
    }
}, { timestamps: true, overwriteModels: true });

const EventEntry = mongoose.models.EventEntry || mongoose.model("EventEntry", eventEntrySchema);

export default EventEntry;