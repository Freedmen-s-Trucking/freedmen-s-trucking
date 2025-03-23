import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/driver/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/app/driver/dashboard"!</div>
}
