import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { withPageErrorBoundary } from "@/src/lib/components/errors/PageErrorBoundary";
import { useAnalytics } from "../lib/hooks/use-analytics";
import AgentDetailsPage from "./dashboard/agent/agent-details";
import ChatWithAgentPage from "./dashboard/agent/chat/ChatWithAgent";
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
  beforeLoad: () => {
    throw redirect({
      to: "/dashboard/agents",
    });
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
  path: "/dashboard/agents",
  component: function Agents() {
    return withPageErrorBoundary(AgentsPage)({});
  },
});

const extensionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/extensions",
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

const chatWithAgentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/agent/$agentId/chat",
  component: function ChatWithAgent() {
    return withPageErrorBoundary(ChatWithAgentPage)({});
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
  chatWithAgentRoute,
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
