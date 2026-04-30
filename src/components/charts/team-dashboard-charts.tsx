"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PIE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="panel-glow border-white/10 bg-card/80">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-72">{children}</CardContent>
    </Card>
  );
}

export function TeamDashboardCharts({
  charts,
}: {
  charts: Record<string, Array<Record<string, string | number>>>;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <ChartCard title="Team Progress Over Time">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={charts.progressTimeline}>
            <CartesianGrid stroke="rgb(255 255 255 / 0.08)" vertical={false} />
            <XAxis dataKey="date" stroke="rgb(255 255 255 / 0.4)" />
            <YAxis stroke="rgb(255 255 255 / 0.4)" />
            <Tooltip />
            <Line type="monotone" dataKey="progress" stroke="var(--chart-1)" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Employee-wise Contribution">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={charts.employeeContribution}>
            <CartesianGrid stroke="rgb(255 255 255 / 0.08)" vertical={false} />
            <XAxis dataKey="employee" stroke="rgb(255 255 255 / 0.4)" />
            <YAxis stroke="rgb(255 255 255 / 0.4)" />
            <Tooltip />
            <Legend />
            <Bar dataKey="updates" fill="var(--chart-2)" radius={[8, 8, 0, 0]} />
            <Bar dataKey="progress" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Project Progress Distribution">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={charts.projectDistribution}>
            <CartesianGrid stroke="rgb(255 255 255 / 0.08)" vertical={false} />
            <XAxis dataKey="project" stroke="rgb(255 255 255 / 0.4)" />
            <YAxis stroke="rgb(255 255 255 / 0.4)" />
            <Tooltip />
            <Bar dataKey="progress" fill="var(--chart-3)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Risk Level Distribution">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={charts.riskDistribution} dataKey="value" nameKey="name" innerRadius={48} outerRadius={88}>
              {charts.riskDistribution.map((_, index) => (
                <Cell key={`risk-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Priority Distribution">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={charts.priorityDistribution} dataKey="value" nameKey="name" innerRadius={48} outerRadius={88}>
              {charts.priorityDistribution.map((_, index) => (
                <Cell key={`priority-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Daily Update Activity">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={charts.dailyActivity}>
            <CartesianGrid stroke="rgb(255 255 255 / 0.08)" vertical={false} />
            <XAxis dataKey="date" stroke="rgb(255 255 255 / 0.4)" />
            <YAxis stroke="rgb(255 255 255 / 0.4)" />
            <Tooltip />
            <Bar dataKey="updates" fill="var(--chart-4)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Blockers Trend">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={charts.blockersTrend}>
            <CartesianGrid stroke="rgb(255 255 255 / 0.08)" vertical={false} />
            <XAxis dataKey="date" stroke="rgb(255 255 255 / 0.4)" />
            <YAxis stroke="rgb(255 255 255 / 0.4)" />
            <Tooltip />
            <Line type="monotone" dataKey="blockers" stroke="var(--chart-3)" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Deadline Risk Chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={charts.deadlineRiskChart}>
            <CartesianGrid stroke="rgb(255 255 255 / 0.08)" vertical={false} />
            <XAxis dataKey="project" stroke="rgb(255 255 255 / 0.4)" />
            <YAxis stroke="rgb(255 255 255 / 0.4)" />
            <Tooltip />
            <Legend />
            <Bar dataKey="daysLeft" fill="var(--chart-2)" radius={[8, 8, 0, 0]} />
            <Bar dataKey="progress" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Workload Distribution">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={charts.workloadDistribution}>
            <CartesianGrid stroke="rgb(255 255 255 / 0.08)" vertical={false} />
            <XAxis dataKey="employee" stroke="rgb(255 255 255 / 0.4)" />
            <YAxis stroke="rgb(255 255 255 / 0.4)" />
            <Tooltip />
            <Bar dataKey="projects" fill="var(--chart-5)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Milestone Completion Rate">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={charts.milestoneCompletion}>
            <CartesianGrid stroke="rgb(255 255 255 / 0.08)" vertical={false} />
            <XAxis dataKey="project" stroke="rgb(255 255 255 / 0.4)" />
            <YAxis stroke="rgb(255 255 255 / 0.4)" />
            <Tooltip />
            <Bar dataKey="rate" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
