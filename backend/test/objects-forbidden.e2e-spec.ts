import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import * as dotenv from "dotenv";
dotenv.config();

import { ExecutionContext, INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";

import { AppModule } from "../src/app.module";
import { AuthenticatedGuard } from "../src/common/auth/authenticated.guard";
import { PrismaService } from "../src/prisma/prisma.service";

describe("Objects Forbidden (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testUser: any;
  const createdUserIds: string[] = [];

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

  it("Nemalo by dovoliť hosťovi vytvoriť objekt", async () => {
    testUser = await prisma.user.create({
      data: {
        email: `guest-${Date.now()}@example.com`,
        passwordHash: "hash",
        fullName: "Guest User",
        role: "GUEST",
      },
    });
    createdUserIds.push(testUser.id);

    const payload = {
      title: "Guest Apartment",
      description: "Should not be created",
      type: "APARTMENT",
      city: "Bratislava",
      country: "Slovakia",
      address: "Guest St 5",
    };

    const response = await request(app.getHttpServer())
      .post("/objects")
      .send(payload);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      "Only hosts can create accommodation objects.",
    );

    const createdObjects = await prisma.accommodationObject.findMany({
      where: { title: payload.title, hostId: testUser.id },
    });

    expect(createdObjects).toHaveLength(0);
  });

  afterAll(async () => {
    if (createdUserIds.length > 0) {
      await prisma.user.deleteMany({
        where: { id: { in: createdUserIds } },
      });
    }
    await prisma.$disconnect();
    await app.close();
  });
});
