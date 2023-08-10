import app, { close, init } from "@/app";
import { cleanDb, generateValidToken } from "../helpers";
import supertest from "supertest";
import httpStatus from "http-status";
import faker from "@faker-js/faker";
import * as jwt from "jsonwebtoken";
import {
  createActivity,
  createActivityEnroll,
  createEnrollmentWithAddress,
  createEvent,
  createPayment,
  createTicket,
  createTicketTypeRemote,
  createTicketTypeWithHotel,
  createUser,
} from "../factories";
import dayjs from "dayjs";
import { TicketStatus } from ".prisma/client";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

afterAll(async () => {
  await close();
});

const server = supertest(app);

describe("GET /certificate", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/certificate");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/certificate").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/certificate").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should return 200 when no event is active", async () => {
      const token = await generateValidToken();

      const eventDates = {
        startsAt: dayjs().subtract(3, "days").toDate(),
        endsAt: dayjs().subtract(1, "day").toDate(),
      };
      await createEvent(eventDates);

      const { status } = await server.get("/certificate").set("Authorization", `Bearer ${token}`);

      expect(status).toBe(httpStatus.OK);
    });
    it("should return 403 when event is ongoing", async () => {
      const token = await generateValidToken();

      const eventDates = {
        startsAt: dayjs().subtract(3, "days").toDate(),
        endsAt: dayjs().add(1, "day").toDate(),
      };
      await createEvent(eventDates);

      const { status } = await server.get("/certificate").set("Authorization", `Bearer ${token}`);

      expect(status).toBe(httpStatus.FORBIDDEN);
    });
    it("should return 404 when there is no event", async () => {
      const token = await generateValidToken();

      const { status } = await server.get("/certificate").set("Authorization", `Bearer ${token}`);

      expect(status).toBe(httpStatus.NOT_FOUND);
    });
  });
});

describe("GET /certificate/generate", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/certificate/generate");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/certificate/generate").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/certificate/generate").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 when user does not have enrollment", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const eventDates = {
        startsAt: dayjs().subtract(3, "days").toDate(),
        endsAt: dayjs().subtract(1, "day").toDate(),
      };
      await createEvent(eventDates);

      const response = await server.get("/certificate/generate").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 403 when user does not have a paid ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const eventDates = {
        startsAt: dayjs().subtract(3, "days").toDate(),
        endsAt: dayjs().subtract(1, "day").toDate(),
      };
      await createEvent(eventDates);

      const response = await server.get("/certificate/generate").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 404 when there is no event is found", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.get("/certificate/generate").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 403 when event is still ongoing", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const eventDates = {
        startsAt: dayjs().subtract(3, "days").toDate(),
        endsAt: dayjs().add(1, "day").toDate(),
      };
      await createEvent(eventDates);

      const response = await server.get("/certificate/generate").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when ticket type is not remote and user has less than 5 activities", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const eventDates = {
        startsAt: dayjs().subtract(3, "days").toDate(),
        endsAt: dayjs().subtract(1, "day").toDate(),
      };
      await createEvent(eventDates);

      const response = await server.get("/certificate/generate").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 200 when ticket type is not remote and user has 5 or more activities", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const eventDates = {
        startsAt: dayjs().subtract(3, "days").toDate(),
        endsAt: dayjs().subtract(1, "day").toDate(),
      };
      await createEvent(eventDates);

      const amountAct = 5;
      for (let i = 0; i < amountAct; i++) {
        const activity = await createActivity(new Date());
        await createActivityEnroll(activity.id, user.id);
      }

      const response = await server.get("/certificate/generate").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({
        event: expect.any(String),
        logo: expect.any(String),
        startsAt: expect.any(String),
        endsAt: expect.any(String),
        ticketType: "IN-PERSON",
        user: {
          name: expect.any(String),
          cpf: expect.any(String),
        },
      });
    });

    it("should respond with status 200 when ticket type is remote", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const eventDates = {
        startsAt: dayjs().subtract(3, "days").toDate(),
        endsAt: dayjs().subtract(1, "day").toDate(),
      };
      await createEvent(eventDates);

      const response = await server.get("/certificate/generate").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({
        event: expect.any(String),
        logo: expect.any(String),
        startsAt: expect.any(String),
        endsAt: expect.any(String),
        ticketType: "ONLINE",
        user: {
          name: expect.any(String),
          cpf: expect.any(String),
        },
      });
    });
  });
});
