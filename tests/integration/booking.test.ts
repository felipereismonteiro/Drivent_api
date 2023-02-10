import app, { init } from "@/app";
import supertest from "supertest";
import { cleanDb, generateValidToken } from "../helpers";
import httpStatus from "http-status";
import { insertBookingInUser } from "../factories/booking-factory";
import { createHotel, createRoomWithHotelId, createUser, createTicketTypeRemote, createEnrollmentWithAddress, createTicket, createTicketTypeWithHotel, createRoomWithoutCapacityWithHotelId } from "../factories";
import faker from "@faker-js/faker";

const server = supertest(app);

beforeAll( async () => {
  await init();  
  await cleanDb();
});

describe("GET /booking", () => {
  it("should return status 401 if no token", async () => {
    const result = await server.get("/booking");

    expect(result.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should return status 404 if user doesn`t have a booking", async () => {
    const token = await generateValidToken();
    const result = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(result.status).toBe(httpStatus.NOT_FOUND);
  });

  it("should return status 200 and user booking", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    await insertBookingInUser(user.id, room.id);
    const result = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(result.status).toBe(httpStatus.OK);
    expect(result.body).toEqual({
      id: expect.any(Number),
      Room: {
        capacity: expect.any(Number),
        createdAt: expect.any(String),
        hotelId: expect.any(Number),
        id: expect.any(Number),
        name: expect.any(String),
        updatedAt: expect.any(String)
      }
    });
  });
});

describe("POST /booking", () => {
  it("should respond status 401 if no token", async () => {
    const result = await server.get("/booking");

    expect(result.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  it("should respond with status 404 if roomId doesn`t exist", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const ticketType = await createTicketTypeRemote();
    const enrollment = await createEnrollmentWithAddress(user);
    await createTicket(enrollment.id, ticketType.id, "PAID");
    
    const result = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId: Number(faker.random.numeric(12)) });

    expect(result.status).toBe(httpStatus.NOT_FOUND);
  });

  it("should respond with status 409 if ticket is not face-to-face ticket", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    await insertBookingInUser(user.id, room.id);
    const ticketType = await createTicketTypeRemote();
    const enrollment = await createEnrollmentWithAddress(user);
    await createTicket(enrollment.id, ticketType.id, "PAID");
    
    const result = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId: room.id });

    expect(result.status).toBe(httpStatus.CONFLICT);
  });

  it("should respond with status 409 if ticket is not paid", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const ticketType = await createTicketTypeRemote();
    const enrollment = await createEnrollmentWithAddress(user);
    await createTicket(enrollment.id, ticketType.id, "RESERVED");
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    
    const result = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId: room.id });
    
    expect(result.status).toBe(httpStatus.CONFLICT);
  });

  it("should respond with status 200 and roomId", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const ticketType = await createTicketTypeWithHotel();
    const enrollment = await createEnrollmentWithAddress(user);
    await createTicket(enrollment.id, ticketType.id, "PAID");
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    
    const result = await server.post("/booking").send({ roomId: room.id }).set("Authorization", `Bearer ${token}`);
    
    expect(result.status).toBe(httpStatus.OK);
    expect(result.body).toEqual({
      roomId: expect.any(Number)
    });
  });
});

describe("PUT /booking/:bookingId", () => {
  it("should respond with status 401 if no token", async () => {
    const result = await server.put("/booking/1");

    expect(result.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 403 if user doesn`t have a booking", async () => {
    const token = await generateValidToken();
    const result = await server.put("/booking/1").set("Authorization", `Bearer ${token}`);

    expect(result.status).toBe(httpStatus.FORBIDDEN);
  });

  it("should respond with status 403 if there are no capacity in this room", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const hotel = await createHotel();
    const room = await createRoomWithoutCapacityWithHotelId(hotel.id);
    const booking = await insertBookingInUser(user.id, room.id);

    const result = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send({
      roomId: room.id
    });

    expect(result.status).toBe(httpStatus.FORBIDDEN);
  });

  it("should respond with status 404 if room doesn`t exist", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const hotel = await createHotel();
    const room = await createRoomWithoutCapacityWithHotelId(hotel.id);
    const booking = await insertBookingInUser(user.id, room.id);

    const result = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send({
      roomId: faker.random.numeric(2)
    });
    
    expect(result.status).toBe(httpStatus.NOT_FOUND);
  });

  it("should respond with status 404 if bookingId doesn`t exist", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    await insertBookingInUser(user.id, room.id);

    const result = await server.put(`/booking/${faker.random.numeric(2)}`).set("Authorization", `Bearer ${token}`).send({
      roomId: room.id
    });

    expect(result.status).toBe(httpStatus.NOT_FOUND);
  });

  it("should respond with status 200 and bookingId", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    const booking = await insertBookingInUser(user.id, room.id);

    const result = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send({
      roomId: room.id
    });

    expect(result.status).toBe(httpStatus.OK);
    expect(result.body).toEqual({ roomId: expect.any(Number) });
  });
});
