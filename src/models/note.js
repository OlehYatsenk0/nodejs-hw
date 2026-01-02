import mongoose from "mongoose";
import { TAGS } from "../constants/tags.js";

const { Schema, model } = mongoose;

const noteSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, default: "", trim: true },
    tag: {
      type: String,
      enum: TAGS,
      default: TAGS[0],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// ✅ Text index для пошуку по назві та контенту
noteSchema.index({ title: "text", content: "text" });

export default model("Note", noteSchema);