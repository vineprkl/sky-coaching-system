import ClientDashboard from '@/components/client/ClientDashboard'

interface ClientDashboardPageProps {
  params: Promise<{
    clientId: string
  }>
}

export default async function ClientDashboardPage({ params }: ClientDashboardPageProps) {
  const { clientId } = await params
  
  return (
    <div className="min-h-screen">
      <ClientDashboard clientId={clientId} />
    </div>
  )
}
