import { AuthenticatedRequest } from "@/middlewares";
import bookingServices from "@/services/booking-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId } = req;

    const result = await bookingServices.getBooking((userId));
    res.status(httpStatus.OK).send({
      id: result.id,
      Room: result.Room
    });
  } catch (err) {
    res.status(404).send(err.message);
  }
}

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId } = req;
    const { roomId } = req.body;
    if (!roomId) return res.sendStatus(httpStatus.NOT_FOUND);

    const post = await bookingServices.reserveBooking(userId, roomId);
    
    res.status(httpStatus.OK).send(post);
  } catch (err) {
    if (err.name === "UnauthorizedError") return res.status(httpStatus.CONFLICT).send(err.message);
    if (err.name === "NotFoundError") return res.status(httpStatus.NOT_FOUND).send(err.message);
    res.status(httpStatus.FORBIDDEN).send(err.message);
  }
}

export async function updateRoom(req: AuthenticatedRequest, res: Response) {
  try {
    const { bookingId } = req.params;
    const { userId } = req;
    const { roomId } = req.body;

    const roomUpdated = await bookingServices.updateRoom(userId, Number(bookingId), roomId);

    res.status(httpStatus.OK).send(roomUpdated);
  } catch (err) {
    if(err.name === "FORBIDDEN") res.status(httpStatus.FORBIDDEN).send(err);
    res.status(httpStatus.NOT_FOUND).send(err.message);
  }
}
