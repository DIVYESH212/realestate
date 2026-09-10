import dbService from "../../utilities/dbService";
import { decryptPassword, generateJwtTokenFn, generateRefreshTokenFn } from "../../utilities/universal";

export const login = async ({ body, res }) => {
  const { username, password } = body;

  if (!username || !password) {
    throw new Error("Username and password are required");
  }
 
  const user = await dbService.findOneRecord("userModel", {
    $or: [{ username }, { email: username }],
    isDeleted: { $ne: true }
  });
  if (!user) {
    throw new Error("Invalid username or password");
  }

  const isPasswordValid = await decryptPassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid username or password");
  }

  const payload = { id: user._id, userId: user._id, username: user.username, email: user.email };
  const token = await generateJwtTokenFn(payload, "1h");
  const refreshToken = await generateRefreshTokenFn(payload, "7d");

  await dbService.updateOneRecord("userModel", { _id: user._id }, { token, refreshToken });

  if (res && typeof res.cookie === "function") {
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  return { message: "Login successful", token, refreshToken };
};
