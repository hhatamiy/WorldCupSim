// backend/models/Match.js
import mongoose from "mongoose";

const MatchSchema = new mongoose.Schema(
  {
    year: { type: Number, required: true },

    stage: {
      type: String,
      required: true, // e.g., "Group A", "Round of 16"
    },

    homeTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },

    awayTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    venue: {
      name: { type: String },
      city: { type: String }
    },

    kickoffTime: {
      type: String, // e.g., "20:00"
    },

    matchNumber: {
      type: Number, // For group stage matches (1-6)
    },

 
    result: {
      homeScore: { type: Number, default: null },
      awayScore: { type: Number, default: null },
      winner: { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null }, // "Argentina", "Draw"
      isPenalties: { type: Boolean, default: false },
      penaltyHomeScore: { type: Number, default: null },
      penaltyAwayScore: { type: Number, default: null }
    },
  },
  { timestamps: true }
);

export default mongoose.model("Match", MatchSchema);
