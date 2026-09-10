import dbService from "../../utilities/dbService";
import {
  verifyRefreshTokenFn,
  generateJwtTokenFn,
  generateRefreshTokenFn,
  parseCookies,
} from "../../utilities/universal";

export const refreshTokenService = async ({ body = {}, req, res }) => {
  // Extract refreshToken from request body or incoming cookies
  let token = body?.refreshToken;
  if (!token && req) {
    const cookies = parseCookies(req);
    token = cookies?.refreshToken;
  }

  if (!token) {
    throw new Error("Refresh token is required");
  }

  let decoded;
  try {
    decoded = await verifyRefreshTokenFn(token);
  } catch (err) {
    throw new Error("Invalid or expired refresh token");
  }

  const userId = decoded.userId || decoded.id || decoded._id;
  if (!userId) {
    throw new Error("Invalid token payload");
  }

  const user = await dbService.findOneRecord("userModel", {
    _id: userId,
    isDeleted: { $ne: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Token rotation check: verify that this refresh token matches the user's active refresh token in DB
  if (user.refreshToken && user.refreshToken !== token) {
    throw new Error("Refresh token has been revoked or expired");
  }

  const payload = {
    id: user._id,
    userId: user._id,
    username: user.username,
    email: user.email,
  };

  const newAccessToken = await generateJwtTokenFn(payload, "1h");
  const newRefreshToken = await generateRefreshTokenFn(payload, "7d");

  await dbService.updateOneRecord(
    "userModel",
    { _id: user._id },
    { token: newAccessToken, refreshToken: newRefreshToken }
  );

  // Set HttpOnly cookie if response object is available
  if (res && typeof res.cookie === "function") {
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  return {
    message: "Token refreshed successfully",
    token: newAccessToken,
    refreshToken: newRefreshToken,
  };
};
