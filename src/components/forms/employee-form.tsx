"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createEmployeeAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { employeeSchema, type EmployeeFormValues } from "@/lib/schemas";
import type { Team } from "@/lib/types";

export function EmployeeForm({ teams, defaultTeamId }: { teams: Team[]; defaultTeamId?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      full_name: "",
      employee_code: "",
      role: "employee",
      status: "active",
      team_id: defaultTeamId ?? teams[0]?.id ?? "",
    },
  });

  const onSubmit = (values: EmployeeFormValues) => {
    startTransition(async () => {
      const result = await createEmployeeAction(values);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      form.reset({ ...form.getValues(), full_name: "", employee_code: "" });
      router.refresh();
    });
  };

  return (
    <Card className="panel-glow border-white/10 bg-card/80">
      <CardHeader>
        <CardTitle>Add Employee</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input id="full_name" {...form.register("full_name")} placeholder="Jihad Hossain" />
            <p className="text-xs text-destructive">{form.formState.errors.full_name?.message}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="employee_code">Employee code</Label>
            <Input id="employee_code" {...form.register("employee_code")} placeholder="E-101" />
            <p className="text-xs text-destructive">{form.formState.errors.employee_code?.message}</p>
          </div>
          <div className="space-y-2">
            <Label>Team</Label>
            <Select
              defaultValue={form.getValues("team_id") ?? undefined}
              onValueChange={(value) => {
                if (value) form.setValue("team_id", value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.team_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              defaultValue={form.getValues("role")}
              onValueChange={(value) => {
                if (value) form.setValue("role", value as EmployeeFormValues["role"]);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="team_leader">Team Leader</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              defaultValue={form.getValues("status")}
              onValueChange={(value) => {
                if (value) form.setValue("status", value as EmployeeFormValues["status"]);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Saving..." : "Add employee"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
