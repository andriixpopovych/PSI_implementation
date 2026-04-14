import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import * as dotenv from "dotenv";
dotenv.config();

import { ExecutionContext, INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";

import { AppModule } from "../src/app.module";
import { AuthenticatedGuard } from "../src/common/auth/authenticated.guard";
import { PrismaService } from "../src/prisma/prisma.service";

describe("Reservation List (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testUser: any;
  const createdUserIds: string[] = [];
  const createdObjectIds: string[] = [];
  const createdReservationIds: string[] = [];

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

  it("Malo by vrátiť iba rezervácie prihláseného používateľa", async () => {
    const host = await prisma.user.create({
      data: {
        email: `host-list-${Date.now()}@example.com`,
        passwordHash: "hash",
        fullName: "Host List User",
        role: "HOST",
      },
    });
    createdUserIds.push(host.id);

    testUser = await prisma.user.create({
      data: {
        email: `guest-list-${Date.now()}@example.com`,
        passwordHash: "hash",
        fullName: "Guest List User",
        role: "GUEST",
      },
    });
    createdUserIds.push(testUser.id);

    const anotherUser = await prisma.user.create({
      data: {
        email: `guest-list-other-${Date.now()}@example.com`,
        passwordHash: "hash",
        fullName: "Another Guest",
        role: "GUEST",
      },
    });
    createdUserIds.push(anotherUser.id);

    const object = await prisma.accommodationObject.create({
      data: {
        title: "List Apartment",
        type: "APARTMENT",
        city: "Bratislava",
        country: "Slovakia",
        address: "List St 7",
        hostId: host.id,
      },
    });
    createdObjectIds.push(object.id);

    const ownReservation = await prisma.reservation.create({
      data: {
        userId: testUser.id,
        objectId: object.id,
        startDate: new Date("2026-07-10"),
        endDate: new Date("2026-07-12"),
        guests: 2,
        status: "ACTIVE",
      },
    });
    createdReservationIds.push(ownReservation.id);

    const anotherReservation = await prisma.reservation.create({
      data: {
        userId: anotherUser.id,
        objectId: object.id,
        startDate: new Date("2026-07-15"),
        endDate: new Date("2026-07-18"),
        guests: 1,
        status: "ACTIVE",
      },
    });
    createdReservationIds.push(anotherReservation.id);

    const response = await request(app.getHttpServer()).get("/me/reservations");

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(1);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].id).toBe(ownReservation.id);
    expect(response.body.data[0].status).toBe("ACTIVE");
    expect(response.body.data[0].object.id).toBe(object.id);
  });

  afterAll(async () => {
    if (createdReservationIds.length > 0) {
      await prisma.reservation.deleteMany({
        where: { id: { in: createdReservationIds } },
      });
    }
    if (createdObjectIds.length > 0) {
      await prisma.accommodationObject.deleteMany({
        where: { id: { in: createdObjectIds } },
      });
    }
    if (createdUserIds.length > 0) {
      await prisma.user.deleteMany({
        where: { id: { in: createdUserIds } },
      });
    }
    await prisma.$disconnect();
    await app.close();
  });
});
