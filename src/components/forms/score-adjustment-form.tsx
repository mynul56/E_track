"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { adjustEmployeeScoreAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  manualScoreAdjustmentSchema,
  type ManualScoreAdjustmentValues,
} from "@/lib/schemas";
import type { Employee, Team } from "@/lib/types";

export function ScoreAdjustmentForm({ employee, team }: { employee: Employee; team: Team }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<ManualScoreAdjustmentValues>({
    resolver: zodResolver(manualScoreAdjustmentSchema),
    defaultValues: {
      employee_id: employee.id,
      team_id: team.id,
      score_change: 10,
      reason: "",
      adjustment_type: "bonus",
    },
  });

  const onSubmit = (values: ManualScoreAdjustmentValues) => {
    startTransition(async () => {
      const normalized = {
        ...values,
        score_change: values.adjustment_type === "penalty" ? -Math.abs(values.score_change) : Math.abs(values.score_change),
      };
      const result = await adjustEmployeeScoreAction(normalized);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  };

  return (
    <Card className="panel-glow border-white/10 bg-card/80">
      <CardHeader>
        <CardTitle>Manual Score Adjustment</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label>Adjustment type</Label>
            <Select defaultValue="bonus" onValueChange={(value) => form.setValue("adjustment_type", value as "bonus" | "penalty")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bonus">Bonus</SelectItem>
                <SelectItem value="penalty">Penalty</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="score_change">Score change</Label>
            <Input id="score_change" type="number" {...form.register("score_change")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea id="reason" {...form.register("reason")} placeholder="+20 for excellent delivery" />
          </div>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Saving..." : "Apply adjustment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
