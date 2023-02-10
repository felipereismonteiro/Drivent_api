import { prisma } from "@/config";

async function getRoomById(roomId: number) {
  return prisma.room.findUnique({ where: { id: roomId } });
}

async function getBooking(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { Booking: true } });
  return prisma.booking.findUnique({ where: { id: user.Booking[0].id }, include: { Room: true } });
}

async function getBookingById(bookingId: number) {
  return prisma.booking.findUnique({ where: { id: bookingId }, include: { Room: true } });
}

async function getBookingByUser(userId: number) {
  return await prisma.user.findUnique({ where: { id: userId }, include: { Booking: true } });
}

async function reserveRoom(userId: number, roomId: number) {
  const result = await prisma.booking.create({ data: { userId: userId, roomId: roomId } });
  const room = await prisma.room.findUnique({ where: { id: result.roomId } });
  await prisma.room.update({ data: { capacity: room.capacity-- }, where: { id: result.roomId } });
  return { roomId: result.roomId };
}

async function updateRoom(bookingId: number, roomId: number) {
  const result = await prisma.booking.update({ data: { roomId: roomId }, where: { id: bookingId } });
  return { roomId: result.roomId };
}

export const bookingRepository = {
  getBooking,
  reserveRoom,
  getRoomById,
  getBookingByUser,
  getBookingById,
  updateRoom
};
