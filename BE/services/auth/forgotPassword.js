import crypto from "crypto";
import dbService from "../../utilities/dbService";
import { sendResetEmail, FRONTEND_URL } from "./emailHelper";

export const forgotPassword = async ({ body }) => {
  const { email } = body;
  if (!email) {
    throw new Error("Email is required.");
  }

  const user = await dbService.findOneRecord("userModel", { email });
  if (!user) {
    return { message: "If an account exists for that email, a reset link has been sent." };
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + 3600 * 1000;

  await dbService.findOneAndUpdateRecord("userModel", 
    { _id: user._id },
    { resetPasswordToken: token, resetPasswordExpires: expires }
  );

  const resetLink = `${FRONTEND_URL}/reset-password/${token}`;

  try {
    await sendResetEmail(user.email, resetLink, user.username);
  } catch (emailError) {
    console.error('Email transport failed:', emailError.message);
    console.log(`[PASSWORD RESET LINK]: ${resetLink}`);
  }

  return { message: "If an account exists for that email, a reset link has been sent." };
};
