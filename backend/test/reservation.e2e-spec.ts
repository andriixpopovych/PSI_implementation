import { describe, beforeAll, it, expect, afterAll } from "@jest/globals";
import * as dotenv from "dotenv";
dotenv.config();

import { ExecutionContext, INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";

import { AppModule } from "../src/app.module";
import { AuthenticatedGuard } from "../src/common/auth/authenticated.guard";
import { PrismaService } from "../src/prisma/prisma.service";

describe("Reservation (e2e)", () => {
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

  it("Malo by úspešne vytvoriť rezerváciu (UC 2.3)", async () => {
    testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        passwordHash: "hash",
        fullName: "Test User",
        role: "GUEST",
      },
    });

    const testObject = await prisma.accommodationObject.create({
      data: {
        title: "Test Apartment",
        type: "APARTMENT",
        city: "Bratislava",
        country: "Slovakia",
        address: "Main St 1",
        hostId: testUser.id,
      },
    });

    const payload = {
      propertyId: testObject.id,
      startDate: "2026-05-20",
      endDate: "2026-05-25",
      guestCount: 2,
    };

    const response = await request(app.getHttpServer())
      .post("/reservations")
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.status).toBe("ACTIVE");
    expect(response.body.guests).toBe(payload.guestCount);
  });

  it("Malo by úspešne zrušiť aktívnu rezerváciu", async () => {
    testUser = await prisma.user.create({
      data: {
        email: `cancel-${Date.now()}@example.com`,
        passwordHash: "hash",
        fullName: "Cancel User",
        role: "GUEST",
      },
    });

    const testObject = await prisma.accommodationObject.create({
      data: {
        title: "Cancel Apartment",
        type: "APARTMENT",
        city: "Bratislava",
        country: "Slovakia",
        address: "Cancel St 2",
        hostId: testUser.id,
      },
    });

    const reservation = await prisma.reservation.create({
      data: {
        userId: testUser.id,
        objectId: testObject.id,
        startDate: new Date("2026-06-10"),
        endDate: new Date("2026-06-15"),
        guests: 2,
        status: "ACTIVE",
      },
    });

    const response = await request(app.getHttpServer())
      .patch(`/reservations/${reservation.id}/cancel`)
      .send({ reason: "Change of plans" });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Reservation canceled.");
    expect(response.body.data.id).toBe(reservation.id);
    expect(response.body.data.status).toBe("CANCELED");
    expect(response.body.data.cancelReason).toBe("Change of plans");
    expect(response.body.data.canceledAt).toBeTruthy();

    const updatedReservation = await prisma.reservation.findUniqueOrThrow({
      where: { id: reservation.id },
    });

    expect(updatedReservation.status).toBe("CANCELED");
    expect(updatedReservation.cancelReason).toBe("Change of plans");
    expect(updatedReservation.canceledAt).not.toBeNull();
  });

  afterAll(async () => {
    await prisma.reservation.deleteMany();
    await prisma.accommodationObject.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
    await app.close();
  });
});
