import mongoose from "mongoose";

const referralVolunteerSchema = new mongoose.Schema({
    volunteerEmail: {
        type: String,
        required: true
    },
    referralEmails: {
        type: [String],
        default: null
    },
    eventsIds: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Event",
        required: true
    }
}, { timestamps: true, overwriteModels: true });

const ReferralVolunteer = mongoose.models.ReferralVolunteer || mongoose.model("ReferralVolunteer", referralVolunteerSchema);

export default ReferralVolunteer;