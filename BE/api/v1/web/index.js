import { Router } from "express";
import { decodeJwtTokenFn } from "../../../utilities/universal";
import auth from "./auth";
import buyer from "./buyer";
import lead from "./lead";
import stage from "./stage";
import drive from "./drive";
import email from "./email";

const app = Router();

app.use("/auth", auth);
app.use("/buyer", decodeJwtTokenFn, buyer);
app.use("/leads", decodeJwtTokenFn, lead);
app.use("/stage", decodeJwtTokenFn, stage);
app.use("/drive", decodeJwtTokenFn, drive);
app.use("/email", decodeJwtTokenFn, email);

export default app;
