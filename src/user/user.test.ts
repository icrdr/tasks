import request from "supertest";
import { createApp } from "../app";
import Koa from "koa";
import { createDb, DbDriver } from "../db";
import { UserController } from "./user.controller/user.controller";
import { User } from "./user.entity";

describe("Test user controller", () => {
  let app: Koa;
  let db: DbDriver;
  let fakeUsers: User[];

  beforeAll(async () => {
    db = await createDb();
    await db.createDefault();
    fakeUsers = await db.createFakeUsers(8);
    app = createApp([UserController]);
  });

  afterAll(async () => {
    await db.clear();
    await db.close();
  });

  test("Fetch all users", async () => {
    const response = await request(app.callback()).get(
      "/api/users?perpage=2&page=0"
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      [
        {
          id: 1,
          username: "user1",
          fullName: "user1",
          email: null,
          mobile: null,
          gender: null,
          idNumber: null,
        },
        {
          id: 2,
          username: "user2",
          fullName: "user2",
          email: null,
          mobile: null,
          gender: null,
          idNumber: null,
        },
      ],
      2,
    ]);
  });

  // test("Fetch the first user", async () => {
  //   const response = await request(app.callback()).get("/api/users/1");

  //   expect(response.status).toBe(200);
  //   expect(response.body).toEqual({
  //     id: 1,
  //     username: "user1",
  //     fullName: "user1",
  //     email: null,
  //     mobile: null,
  //     gender: null,
  //     idNumber: null,
  //   });
  // });

  // test("Fetch no user", async () => {
  //   const response = await request(app.callback()).get("/api/users/4");

  //   expect(response.status).toBe(404);
  //   expect(response.body.message).toBe(`User was not found.`);
  // });

  // test("Create new user", async () => {
  //   const response = await request(app.callback())
  //     .post("/api/users")
  //     .send({ username: "john", password: "12345" });
  //   expect(response.status).toBe(200);
  //   expect(response.body).toEqual({
  //     username: "john",
  //     fullName: "john",
  //     email: null,
  //     mobile: null,
  //     gender: null,
  //     idNumber: null,
  //     id: 3,
  //   });
  // });

  // test("Create new user fail", async () => {
  //   const response = await request(app.callback())
  //     .post("/api/users")
  //     .send({ username: "john", password: "12345" });
  //   expect(response.status).toBe(403);
  // });

  // test("Remove user", async () => {
  //   const response = await request(app.callback()).delete("/api/users/1");
  //   expect(response.status).toBe(200);
  //   expect(response.body.message).toBe("Deleted");
  // });

  // test("Remove user not exited", async () => {
  //   const response = await request(app.callback()).delete("/api/users/10");
  //   expect(response.status).toBe(404);
  //   console.log(response.body);
  // });
});
