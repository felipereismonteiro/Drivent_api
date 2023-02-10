import { getBooking, postBooking, updateRoom } from "@/controllers/booking-controller";
import { authenticateToken } from "@/middlewares";
import { Router } from "express";

export const bookingRouter = Router();

bookingRouter
  .all("/*", authenticateToken)
  .get("/", getBooking)
  .post("/", postBooking)
  .put("/:bookingId", updateRoom);
