export default async function Dashboard() {
  const DashboardScreen = (await import('@/features/dashboard/components/dashboard-screen'))
    .default;

  return <DashboardScreen />;
}
