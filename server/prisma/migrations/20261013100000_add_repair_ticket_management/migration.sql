CREATE SEQUENCE repair_ticket_seq START 1;

CREATE FUNCTION next_repair_ticket_number() RETURNS TEXT AS $$
    SELECT 'TK-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('repair_ticket_seq')::TEXT, 4, '0');
$$ LANGUAGE SQL;

CREATE TYPE "RepairTicketStatus" AS ENUM ('ACCEPTED', 'DIAGNOSING', 'IN_REPAIR', 'READY_FOR_PICKUP', 'COMPLETED', 'UNREPAIRABLE', 'CANCELLED');
CREATE TYPE "RepairTicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

CREATE TABLE "RepairTicket" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "technicianId" TEXT,
    "ticketNumber" TEXT NOT NULL DEFAULT next_repair_ticket_number(),
    "priority" "RepairTicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "RepairTicketStatus" NOT NULL DEFAULT 'ACCEPTED',
    "diagnosis" TEXT,
    "repairNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    CONSTRAINT "RepairTicket_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RepairStatusHistory" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "status" "RepairTicketStatus" NOT NULL,
    "notes" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RepairStatusHistory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RepairTicket_requestId_key" ON "RepairTicket"("requestId");
CREATE UNIQUE INDEX "RepairTicket_ticketNumber_key" ON "RepairTicket"("ticketNumber");
CREATE INDEX "RepairTicket_technicianId_idx" ON "RepairTicket"("technicianId");
CREATE INDEX "RepairTicket_status_idx" ON "RepairTicket"("status");
CREATE INDEX "RepairTicket_requestId_idx" ON "RepairTicket"("requestId");
CREATE INDEX "RepairStatusHistory_ticketId_idx" ON "RepairStatusHistory"("ticketId");

ALTER TABLE "RepairTicket" ADD CONSTRAINT "RepairTicket_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "RepairRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RepairTicket" ADD CONSTRAINT "RepairTicket_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "Technician"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "RepairStatusHistory" ADD CONSTRAINT "RepairStatusHistory_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "RepairTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
