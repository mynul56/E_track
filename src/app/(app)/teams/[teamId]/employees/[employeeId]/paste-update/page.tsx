import { notFound } from "next/navigation";
import { getEmployeeProfileData } from "@/lib/data";
import { UpdateParserForm } from "@/components/forms/update-parser-form";
import { PageHeader } from "@/components/page-header";

export default async function PasteUpdatePage({
  params,
}: {
  params: Promise<{ teamId: string; employeeId: string }>;
}) {
  const { teamId, employeeId } = await params;
  const data = await getEmployeeProfileData(teamId, employeeId);
  if (!data) notFound();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Telegram Intake"
        title={`Paste update for ${data.employee.full_name}`}
        description="Copy a structured Telegram report, preview extracted fields, review warnings, then save the raw and parsed payload."
      />
      <UpdateParserForm team={data.team} employee={data.employee} />
    </div>
  );
}
