import {
  Outlet,
  createRouter,
  createRoute,
  createRootRoute,
} from '@tanstack/react-router'
import { withPageErrorBoundary } from "@/src/lib/components/errors/PageErrorBoundary";
import HomePage from "./home";
import { useAnalytics } from '../lib/hooks/use-analytics';
import DashboardPage from './dashboard';
import CreateAgentPage from './dashboard/create-agent';
import AgentsPage from './dashboard/agents';

const rootRoute = createRootRoute({
  component: () => {
    useAnalytics();

    return (
      <>
        <Outlet />
      </>
    )
  },
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: function Index() {
    return withPageErrorBoundary(HomePage)({});
  },
})

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: function Dashboard() {
    return withPageErrorBoundary(DashboardPage)({});
  },
})

const createAgentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/create-agent',
  component: function CreateAgent() {
    return withPageErrorBoundary(CreateAgentPage)({});
  },
})

const agentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/agents',
  component: function Agents() {
    return withPageErrorBoundary(AgentsPage)({});
  },
})

const routeTree = rootRoute.addChildren([indexRoute, dashboardRoute, createAgentRoute, agentsRoute])
const router = createRouter({
  routeTree,
})
  
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default router;