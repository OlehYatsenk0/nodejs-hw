import createHttpError from "http-errors";
import { Note } from "../models/note.js";

// GET /notes
export const getAllNotes = async (req, res, next) => {
  try {
    const { page = 1, perPage = 10, tag, search } = req.query;

    const pageNumber = Number(page) || 1;
    const perPageNumber = Number(perPage) || 10;

    const filter = {};

    if (tag) {
      filter.tag = tag;
    }

    if (typeof search === "string" && search.trim() !== "") {
      filter.$text = { $search: search.trim() };
    }

    const skip = (pageNumber - 1) * perPageNumber;

    const [totalNotes, notes] = await Promise.all([
      Note.countDocuments(filter),
      Note.find(filter)
        .skip(skip)
        .limit(perPageNumber)
        .sort({ createdAt: -1 }),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalNotes / perPageNumber) || 1);

    res.status(200).json({
      page: pageNumber,
      perPage: perPageNumber,
      totalNotes,
      totalPages,
      notes,
    });
  } catch (error) {
    next(error);
  }
};

// GET /notes/:noteId
export const getNoteById = async (req, res, next) => {
  try {
    const { noteId } = req.params;

    const note = await Note.findById(noteId);

    if (!note) {
      throw createHttpError(404, "Note not found");
    }

    res.status(200).json({ note });
  } catch (error) {
    next(error);
  }
};

// POST /notes
export const createNote = async (req, res, next) => {
  try {
    const { title, content = "", tag } = req.body;

    const note = await Note.create({ title, content, tag });

    res.status(201).json({ note });
  } catch (error) {
    next(error);
  }
};

// PATCH /notes/:noteId
export const updateNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;

    const note = await Note.findByIdAndUpdate(noteId, req.body, {
      new: true,
    });

    if (!note) {
      throw createHttpError(404, "Note not found");
    }

    res.status(200).json({ note });
  } catch (error) {
    next(error);
  }
};

// DELETE /notes/:noteId
export const deleteNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;

    const note = await Note.findByIdAndDelete(noteId);

    if (!note) {
      throw createHttpError(404, "Note not found");
    }

    res.status(200).json({ note });
  } catch (error) {
    next(error);
  }
};
