import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";
import { withPageErrorBoundary } from "@/src/lib/components/errors/PageErrorBoundary";
import { useAnalytics } from "../lib/hooks/use-analytics";
import DashboardPage from "./dashboard";
import AgentDetailsPage from "./dashboard/agent/agent-details";
import AgentsPage from "./dashboard/agents";
import CreateAgentPage from "./dashboard/create-agent";
import CreateExtensionPage from "./dashboard/create-extension";
import ExtensionsPage from "./dashboard/extensions";
import DocsPage from "./docs";
import HomePage from "./home";
import TestPage from "./test";

const rootRoute = createRootRoute({
  component: () => {
    useAnalytics();

    return <Outlet />;
  },
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: function Index() {
    return withPageErrorBoundary(HomePage)({});
  },
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: function Dashboard() {
    return withPageErrorBoundary(DashboardPage)({});
  },
});

const createAgentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/create-agent",
  component: function CreateAgent() {
    return withPageErrorBoundary(CreateAgentPage)({});
  },
});

const agentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/agents",
  component: function Agents() {
    return withPageErrorBoundary(AgentsPage)({});
  },
});

const extensionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/extensions",
  component: function Extensions() {
    return withPageErrorBoundary(ExtensionsPage)({});
  },
});

const createExtensionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/create-extension",
  component: function CreateExtension() {
    return withPageErrorBoundary(CreateExtensionPage)({});
  },
});

const agentDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/agent/$agentId",
  component: function AgentDetails() {
    return withPageErrorBoundary(AgentDetailsPage)({});
  },
});

const docsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/docs",
  component: function Docs() {
    return withPageErrorBoundary(DocsPage)({});
  },
});

const testRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/test",
  component: function Test() {
    return withPageErrorBoundary(TestPage)({});
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  createAgentRoute,
  agentsRoute,
  agentDetailsRoute,
  docsRoute,
  extensionsRoute,
  createExtensionRoute,
  testRoute,
]);
const router = createRouter({
  routeTree,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default router;
