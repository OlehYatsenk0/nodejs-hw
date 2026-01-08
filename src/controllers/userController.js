import createHttpError from "http-errors";
import { User } from "../models/user.js";
import { saveFileToCloudinary } from "../utils/saveFileToCloudinary.js";

export const updateUserAvatar = async (req, res, next) => {
  try {
    // 1️⃣ перевірка файлу
    if (!req.file) {
      throw createHttpError(400, "No file");
    }

    // 2️⃣ завантаження в Cloudinary
    const result = await saveFileToCloudinary(req.file.buffer);

    // 3️⃣ оновлення користувача
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: result.secure_url },
      { new: true }
    );

    // 4️⃣ відповідь
    res.status(200).json({
      url: user.avatar,
    });
  } catch (error) {
    next(error);
  }
};