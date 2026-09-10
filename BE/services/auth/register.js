import dbService from "../../utilities/dbService";
import { encryptpassword, generateJwtTokenFn, generateRefreshTokenFn } from "../../utilities/universal";

export const register = async ({ body }) => {
  const { username, password, email, mobilenumber } = body;
  if (!username || !password || !email || !mobilenumber) {
    throw new Error("All fields are required");
  }

  const existingUser = await dbService.findOneRecord("userModel", { username }) || 
                       await dbService.findOneRecord("userModel", { email });
  if (existingUser) {
    if (existingUser.username === username) {
      throw new Error("Username is already taken");
    } else {
      throw new Error("Email is already registered");
    }
  }

  const hashedPassword = await encryptpassword(password);

  const payloadTemp = { username, email };
  const newUser = await dbService.createOneRecord("userModel", {
    username,
    password: hashedPassword,
    email,
    mobilenumber
  });

  const payload = { id: newUser._id, userId: newUser._id, username: newUser.username, email: newUser.email };
  const token = await generateJwtTokenFn(payload, "1h");
  const refreshToken = await generateRefreshTokenFn(payload, "7d");

  await dbService.updateOneRecord("userModel", { _id: newUser._id }, { token, refreshToken });

  return { message: "User registered successfully", token, refreshToken };
};
