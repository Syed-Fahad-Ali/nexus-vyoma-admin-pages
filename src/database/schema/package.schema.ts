import mongoose from "mongoose";

const packageSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    eventIds: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Event",
        required: true,
    },
    isEntryTicket: {
        type: Boolean,
        default: true,
    },
    price: {
        type: Number,
        required: true,
    },
    isShowOnEntryPage: {
        type: Boolean,
        default: false,
    },
    indexPackage: {
        type: Number,
        default: 0,
    }
}, { timestamps: true, overwriteModels: true });

const Package = mongoose.models.Package || mongoose.model("Package", packageSchema);

export default Package;