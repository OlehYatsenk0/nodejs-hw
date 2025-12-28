import mongoose from "mongoose";

const { Schema, model } = mongoose;

const noteSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, default: "", trim: true },
    tag: {
      type: String,
      enum: ["Todo", "Work", "Personal", "Meeting"],
      default: "Todo",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default model("Note", noteSchema);
