import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import * as dotenv from "dotenv";
dotenv.config();

import { ExecutionContext, INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";

import { AppModule } from "../src/app.module";
import { AuthenticatedGuard } from "../src/common/auth/authenticated.guard";
import { PrismaService } from "../src/prisma/prisma.service";

describe("Objects (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testUser: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(AuthenticatedGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = testUser;
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  it("Malo by úspešne vytvoriť objekt pre hostiteľa", async () => {
    testUser = await prisma.user.create({
      data: {
        email: `host-${Date.now()}@example.com`,
        passwordHash: "hash",
        fullName: "Host User",
        role: "HOST",
      },
    });

    const payload = {
      title: "River View Apartment",
      description: "Spacious apartment near the center",
      type: "APARTMENT",
      city: "Bratislava",
      country: "Slovakia",
      address: "River St 10",
    };

    const response = await request(app.getHttpServer())
      .post("/objects")
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Object created without rooms.");
    expect(response.body.data).toMatchObject({
      title: payload.title,
      description: payload.description,
      type: payload.type,
      city: payload.city,
      country: payload.country,
      address: payload.address,
      host: {
        id: testUser.id,
        fullName: testUser.fullName,
        email: testUser.email,
      },
      variants: [],
    });
    expect(response.body.data).toHaveProperty("id");

    const createdObject = await prisma.accommodationObject.findUniqueOrThrow({
      where: { id: response.body.data.id },
    });

    expect(createdObject.hostId).toBe(testUser.id);
    expect(createdObject.title).toBe(payload.title);
  });

  afterAll(async () => {
    await prisma.accommodationObject.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
    await app.close();
  });
});
