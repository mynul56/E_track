import { Download } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const reportCards = [
  {
    title: "Team report",
    description: "Exports team metrics, employee score table, missing updates, blockers, and project health summary.",
    outputs: ["PDF", "CSV"],
  },
  {
    title: "Employee report",
    description: "Exports update history, score breakdown, missed updates, blockers, and recent manual adjustments.",
    outputs: ["PDF", "CSV"],
  },
  {
    title: "Project report",
    description: "Exports milestone status, update log, blocker trail, deadline risk, and assigned employee map.",
    outputs: ["PDF", "CSV"],
  },
];

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Reports"
        title="Export-ready reporting hub"
        description="The report system is structured for PDF and CSV export routes. Hook these cards to file-generation handlers once Supabase is provisioned."
      />

      <div className="grid gap-6 md:grid-cols-3">
        {reportCards.map((card) => (
          <Card key={card.title} className="panel-glow border-white/10 bg-card/80">
            <CardHeader>
              <CardTitle>{card.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-muted-foreground">{card.description}</p>
              <div className="flex flex-wrap gap-2">
                {card.outputs.map((output) => (
                  <Badge key={output} variant="outline">
                    {output}
                  </Badge>
                ))}
              </div>
              <Button variant="secondary" className="w-full gap-2">
                <Download className="h-4 w-4" />
                Export stub
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
