import dbService from "../../utilities/dbService";
import { encryptpassword, generateJwtTokenFn } from "../../utilities/universal";

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

  const newUser = await dbService.createOneRecord("userModel", {
    username,
    password: hashedPassword,
    email,
    mobilenumber
  });

  const token = await generateJwtTokenFn({ id: newUser._id, userId: newUser._id, username: newUser.username, email: newUser.email });

  return { message: "User registered successfully", token };
};
