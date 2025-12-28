import { Router } from "express";
import { celebrate } from "celebrate";

import { authenticate } from "../middleware/authenticate.js";

import {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
} from "../controllers/notesController.js";

import {
  getAllNotesSchema,
  noteIdSchema,
  createNoteSchema,
  updateNoteSchema,
} from "../validations/notesValidation.js";

const router = Router();

// ✅ ВСІ notes — тільки для авторизованих
router.use(authenticate);

router.get("/notes", celebrate(getAllNotesSchema), getAllNotes);
router.get("/notes/:id", celebrate(noteIdSchema), getNoteById);
router.post("/notes", celebrate(createNoteSchema), createNote);
router.patch("/notes/:id", celebrate(updateNoteSchema), updateNote);
router.delete("/notes/:id", celebrate(noteIdSchema), deleteNote);

export default router;