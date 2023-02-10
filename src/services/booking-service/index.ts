import { notFoundError } from "@/errors";
import { bookingRepository } from "@/repositories/booking-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { unauthorizedError } from "@/errors";
import { Room } from "@prisma/client";
import { forbiddenError } from "./error";

async function getBooking(userId: number) {
  const result = await bookingRepository.getBooking(userId);
  if (!result) throw notFoundError();
  return result;
}

async function reserveBooking(userId: number, roomId: number) {
  const room = await bookingRepository.getRoomById(roomId);

  await verifyCredentials(room, userId);
  
  return await bookingRepository.reserveRoom(userId, room.id);
}

async function updateRoom(userId: number, bookingId: number, roomId: number) {
  const booking = await bookingRepository.getBookingByUser(userId);
  if(booking.Booking.length === 0) throw forbiddenError();

  const room = await bookingRepository.getRoomById(roomId);
  const bookinid = await bookingRepository.getBookingById(bookingId);
  if(!room || !bookinid) throw notFoundError();
  if(room.capacity < 1) throw forbiddenError();

  return bookingRepository.updateRoom(bookingId, roomId);
}

async function verifyCredentials(room: Room, userId: number) {
  if(!room) throw notFoundError();
  if(room.capacity < 1) throw new Error("No capacity");

  const enrollment = await enrollmentRepository.findEnrollmentByUserId(userId);
  const ticket = await ticketRepository.findTicketTypeById(enrollment.Ticket[0].ticketTypeId);
  if (!ticket || ticket.isRemote || !ticket.includesHotel || enrollment.Ticket[0].status === "RESERVED") {
    throw unauthorizedError();
  }
}

const bookingServices = {
  getBooking,
  reserveBooking,
  updateRoom
};

export default bookingServices;
