"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteTeamAction } from "@/app/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function TeamDeleteButton({
  teamId,
  teamName,
  redirectToTeams = false,
}: {
  teamId: string;
  teamName: string;
  redirectToTeams?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteTeamAction(teamId);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      if (redirectToTeams) {
        router.push("/teams");
      }
      router.refresh();
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive">Delete team</Button>} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {teamName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes the team and its related employees, projects, updates, blockers, and scores if your database
            foreign keys are active. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isPending}>
            {isPending ? "Deleting..." : "Confirm delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
