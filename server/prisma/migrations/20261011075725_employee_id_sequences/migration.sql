CREATE SEQUENCE admin_employee_seq START 1;
CREATE SEQUENCE technician_employee_seq START 1;

CREATE FUNCTION next_admin_employee_id() RETURNS TEXT AS $$
    SELECT 'ADM-' || LPAD(NEXTVAL('admin_employee_seq')::TEXT, 3, '0');
$$ LANGUAGE SQL;

CREATE FUNCTION next_technician_employee_id() RETURNS TEXT AS $$
    SELECT 'TECH-' || LPAD(NEXTVAL('technician_employee_seq')::TEXT, 3, '0');
$$ LANGUAGE SQL;

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL DEFAULT next_admin_employee_id(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Technician" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL DEFAULT next_technician_employee_id(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Technician_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_employeeId_key" ON "Admin"("employeeId");

-- CreateIndex
CREATE INDEX "Admin_id_idx" ON "Admin"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Technician_employeeId_key" ON "Technician"("employeeId");

-- CreateIndex
CREATE INDEX "Technician_id_idx" ON "Technician"("id");

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Technician" ADD CONSTRAINT "Technician_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
