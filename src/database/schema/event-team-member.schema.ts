import mongoose from "mongoose";

const eventTeamMemberSchema = new mongoose.Schema({
    event_id: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Event",
        required: true
    },
    email: {
        type: String,
        required: true
    },
    full_name: {
        type: String,
        default: null
    }
}, { timestamps: true, overwriteModels: true });

const EventTeamMember = mongoose.models.EventTeamMember || mongoose.model("EventTeamMember", eventTeamMemberSchema);

export default EventTeamMember;