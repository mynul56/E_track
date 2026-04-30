"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { parseUpdateAction, saveParsedUpdateAction } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateParserSchema, type UpdateParserFormValues } from "@/lib/schemas";
import type { Employee, ParsedUpdate, Team } from "@/lib/types";

export function UpdateParserForm({
  team,
  employee,
}: {
  team: Team;
  employee: Employee;
}) {
  const [preview, setPreview] = useState<ParsedUpdate | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<UpdateParserFormValues>({
    resolver: zodResolver(updateParserSchema),
    defaultValues: {
      team_id: team.id,
      employee_id: employee.id,
      raw_text: `Employee: ${employee.full_name}\nE_ID: ${employee.employee_code}\nClient: \nProject: \nOrder ID: \nMilestone: \nProgress: \nDeadline: \nBlockers: \nNext Actions: \nPriority: \nRisk: \nClient Status: `,
    },
  });

  const previewUpdate = (values: UpdateParserFormValues) => {
    startTransition(async () => {
      const result = await parseUpdateAction(values);
      if (!result.ok) return;
      setPreview(result.parsed ?? null);
      toast.success("Preview generated.");
    });
  };

  const saveUpdate = (values: UpdateParserFormValues) => {
    startTransition(async () => {
      const result = await saveParsedUpdateAction(values);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      setPreview(result.parsed ?? null);
      toast.success(result.message);
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <Card className="panel-glow border-white/10 bg-card/80">
        <CardHeader>
          <CardTitle>Paste Telegram Update</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
              Employee binding is enforced from this page. If the pasted `E_ID` does not match `{employee.employee_code}`,
              a warning will appear in the preview.
            </div>
            <div className="space-y-2">
              <Label htmlFor="raw_text">Telegram update text</Label>
              <Textarea id="raw_text" className="min-h-72" {...form.register("raw_text")} />
              <p className="text-xs text-destructive">{form.formState.errors.raw_text?.message}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="button" disabled={isPending} onClick={form.handleSubmit(previewUpdate)}>
                Preview parse
              </Button>
              <Button type="button" variant="secondary" disabled={isPending} onClick={form.handleSubmit(saveUpdate)}>
                Save update
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="panel-glow border-white/10 bg-card/80">
        <CardHeader>
          <CardTitle>Structured Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {preview ? (
            <>
              <PreviewRow label="Employee" value={preview.employee} />
              <PreviewRow label="Employee ID" value={preview.employeeId} />
              <PreviewRow label="Client" value={preview.clientName} />
              <PreviewRow label="Project" value={preview.projectName} />
              <PreviewRow label="Order ID" value={preview.orderId} />
              <PreviewRow label="Milestone" value={preview.milestone} />
              <PreviewRow label="Progress" value={preview.progress?.toString()} />
              <PreviewRow label="Deadline" value={preview.deadline} />
              <PreviewRow label="Priority" value={preview.priority} />
              <PreviewRow label="Risk" value={preview.riskLevel} />
              <PreviewRow label="Client Status" value={preview.clientStatus} />
              <PreviewList label="Blockers" values={preview.blockers} />
              <PreviewList label="Next Actions" values={preview.nextActions} />
              <PreviewList label="Attachments" values={preview.attachments} />
              {preview.warnings?.length ? (
                <div className="space-y-2">
                  <p className="font-medium text-amber-300">Warnings</p>
                  <div className="flex flex-wrap gap-2">
                    {preview.warnings.map((warning) => (
                      <Badge key={warning} variant="secondary" className="border border-amber-400/20 bg-amber-400/10 text-amber-200">
                        {warning}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <p className="text-muted-foreground">Run preview to inspect parsed fields before saving.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-medium text-foreground">{value || "Not detected"}</p>
    </div>
  );
}

function PreviewList({ label, values }: { label: string; values?: string[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {values?.length ? values.map((value) => <Badge key={value} variant="outline">{value}</Badge>) : "None"}
      </div>
    </div>
  );
}
