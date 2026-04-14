import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import * as dotenv from "dotenv";
dotenv.config();

import { ExecutionContext, INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";

import { AppModule } from "../src/app.module";
import { AuthenticatedGuard } from "../src/common/auth/authenticated.guard";
import { PrismaService } from "../src/prisma/prisma.service";

describe("Reservation Cancel Conflict (e2e)", () => {
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

  it("Nemalo by byť možné zrušiť už zrušenú rezerváciu", async () => {
    testUser = await prisma.user.create({
      data: {
        email: `cancel-conflict-${Date.now()}@example.com`,
        passwordHash: "hash",
        fullName: "Cancel Conflict User",
        role: "GUEST",
      },
    });

    const host = await prisma.user.create({
      data: {
        email: `host-conflict-${Date.now()}@example.com`,
        passwordHash: "hash",
        fullName: "Conflict Host",
        role: "HOST",
      },
    });

    const object = await prisma.accommodationObject.create({
      data: {
        title: "Conflict Apartment",
        type: "APARTMENT",
        city: "Bratislava",
        country: "Slovakia",
        address: "Conflict St 8",
        hostId: host.id,
      },
    });

    const reservation = await prisma.reservation.create({
      data: {
        userId: testUser.id,
        objectId: object.id,
        startDate: new Date("2026-08-01"),
        endDate: new Date("2026-08-05"),
        guests: 2,
        status: "CANCELED",
        cancelReason: "Already canceled",
        canceledAt: new Date("2026-07-20"),
      },
    });

    const response = await request(app.getHttpServer())
      .patch(`/reservations/${reservation.id}/cancel`)
      .send({ reason: "Second cancel attempt" });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe(
      "Only active reservations can be canceled.",
    );
  });

  afterAll(async () => {
    await prisma.reservation.deleteMany();
    await prisma.accommodationObject.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
    await app.close();
  });
});
