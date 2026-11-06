import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RegisterUser",
      required: true,
    },
    enrolledIndividualEvents: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "EnrolledIndividualEvent",
      default: [],
    },
    enrolledTeamEvents: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "EnrolledTeamEvent",
      default: [],
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "idle", "creating"],
      required: true,
      default: "idle",
    },
    paymentId: {
      type: String,
      default: undefined,
    },
    individualEventsAmount: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isFinite,
        message: "totalAmount must be a finite number",
      },
    },
    teamEventsAmount: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isFinite,
        message: "totalAmount must be a finite number",
      },
    },
    isTechEvents: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, overwriteModels: true },
);

const Transaction =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", transactionSchema);

export default Transaction;
