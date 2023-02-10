import { prisma } from "@/config";

export async function insertBookingInUser(userId: number, roomId: number) {
  return prisma.booking.create({ data: { userId: userId, roomId: roomId } } );
}
