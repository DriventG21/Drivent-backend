import app, { close, init } from "@/app";
import { cleanDb, generateValidToken } from "../helpers";
import supertest from "supertest";
import httpStatus from "http-status";
import faker from "@faker-js/faker";
import * as jwt from "jsonwebtoken";
import { createActivity, createActivityEnroll, createUser } from "../factories";
import dayjs from "dayjs";

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

describe("GET /activities", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/activities");
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    
    const response = await server.get("/activities").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
    const response = await server.get("/activities").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should return 200 with activities", async () => {
      const token = await generateValidToken();

      await createActivity(new Date("2023-08-11"));
      await createActivity(new Date("2023-08-12"), 5, "SIDE");
      await createActivity(new Date("2023-08-13"), 20, "WORKSHOP");

      const { status, body } = await server.get("/activities").set("Authorization", `Bearer ${token}`);

      expect(status).toBe(httpStatus.OK);
      expect(body).toEqual([{
        id: expect.any(Number),
        name: expect.any(String),
        vacancy: 10,
        local: "MAIN",
        startAt: expect.any(String),
        endAt: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      }, {
        id: expect.any(Number),
        name: expect.any(String),
        vacancy: 5,
        local: "SIDE",
        startAt: expect.any(String),
        endAt: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      }, {
        id: expect.any(Number),
        name: expect.any(String),
        vacancy: 20,
        local: "WORKSHOP",
        startAt: expect.any(String),
        endAt: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      }]);
    });
  });
});

describe("GET /activities/:date", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/activities/2023-11-10");
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    
    const response = await server.get("/activities/2023-11-10").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
    const response = await server.get("/activities/2023-11-10").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 when there is no activities on the given date", async () => {
      const token = await generateValidToken();

      const response = await server.get("/activities/2025-10-11").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 200 and activities data", async () => {
      const token = await generateValidToken();
      const date = "2024-10-15";

      await createActivity(new Date(date));
      await createActivity(new Date(date), 5, "SIDE");
      await createActivity(new Date(date), 20, "WORKSHOP");

      const { status, body } = await server.get(`/activities/${date}`).set("Authorization", `Bearer ${token}`);

      expect(status).toBe(httpStatus.OK);
      expect(body).toEqual([{
        id: expect.any(Number),
        name: expect.any(String),
        vacancy: 10,
        local: "MAIN",
        startAt: new Date(date).toISOString(),
        endAt: dayjs(new Date(date)).add(1, "hour").toDate().toISOString(),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        ActivityEnroll: expect.any(Array)
      }, {
        id: expect.any(Number),
        name: expect.any(String),
        vacancy: 5,
        local: "SIDE",
        startAt: new Date(date).toISOString(),
        endAt: dayjs(new Date(date)).add(1, "hour").toDate().toISOString(),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        ActivityEnroll: expect.any(Array)
      }, {
        id: expect.any(Number),
        name: expect.any(String),
        vacancy: 20,
        local: "WORKSHOP",
        startAt: new Date(date).toISOString(),
        endAt: dayjs(new Date(date)).add(1, "hour").toDate().toISOString(),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        ActivityEnroll: expect.any(Array)
      }]);
    });
  });
});

describe("POST /activities", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.post("/activities");
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    
    const response = await server.post("/activities").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
    const response = await server.post("/activities").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 400 when there is no body", async () => {
      const token = await generateValidToken();

      const response = await server.post("/activities").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it("should respond with status 400 when body is invalid", async () => {
      const token = await generateValidToken();

      const response = await server.post("/activities").set("Authorization", `Bearer ${token}`).send({ test: "aaaaa" });

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it("should respond with status 404 when activity does not exist", async () => {
      const token = await generateValidToken();

      const response = await server.post("/activities").set("Authorization", `Bearer ${token}`).send({ activityId: 0 });

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 418 when activity vacancies are full", async () => {
      const token = await generateValidToken();

      const user1 = await createUser();
      const user2 = await createUser();

      const activity = await createActivity(new Date("2024-10-11"), 2);

      await createActivityEnroll(activity.id, user1.id);
      await createActivityEnroll(activity.id, user2.id);

      const response = await server.post("/activities").set("Authorization", `Bearer ${token}`).send({ activityId: activity.id });

      expect(response.status).toBe(httpStatus.IM_A_TEAPOT);
    });

    it("should respond with status 201 and activity enroll data", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const activity = await createActivity(new Date("2024-10-11"));

      const { status, body } = await server.post("/activities").set("Authorization", `Bearer ${token}`).send({ activityId: activity.id });

      expect(status).toBe(httpStatus.CREATED);
      expect(body).toEqual({
        id: expect.any(Number),
        activityId: activity.id,
        userId: user.id,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });
  });
});
