"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createTeamAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { teamSchema, type TeamFormValues } from "@/lib/schemas";

export function TeamForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      team_name: "",
      description: "",
    },
  });

  const onSubmit = (values: TeamFormValues) => {
    startTransition(async () => {
      const result = await createTeamAction(values);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      form.reset();
      router.refresh();
    });
  };

  return (
    <Card className="panel-glow border-white/10 bg-card/80">
      <CardHeader>
        <CardTitle>Create Team</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="team_name">Team name</Label>
            <Input id="team_name" {...form.register("team_name")} placeholder="Alpha Prime" />
            <p className="text-xs text-destructive">{form.formState.errors.team_name?.message}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...form.register("description")} placeholder="Purpose, scope, and delivery focus..." />
            <p className="text-xs text-destructive">{form.formState.errors.description?.message}</p>
          </div>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Saving..." : "Create team"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
