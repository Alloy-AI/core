import { usePrivy } from "@privy-io/react-auth";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/src/lib/components/ui/button";
import { UserDropdownButton } from "./UserDropdownButton";

export default function ConnectButton() {
  const { ready, authenticated, login: loginPrivy } = usePrivy();

  // Determine button state for smooth transitions
  const getButtonState = () => {
    if (!ready) return "loading";
    if (!authenticated) return "signin";
    return "dashboard";
  };

  const showUserDropdown = authenticated;

  return (
    <motion.div
      className="flex items-center gap-2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        type: "spring",
        stiffness: 230,
        damping: 30,
        mass: 1.2,
        delay: 0.3,
      }}
    >
      {/* Sign In button - only show when not authenticated */}
      {!authenticated && (
        <Button
          onClick={
            getButtonState() === "signin" ? () => loginPrivy() : undefined
          }
          className="min-w-28"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={getButtonState()}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{
                duration: 0.2,
                ease: "easeInOut",
                layout: { duration: 0.3 },
              }}
              layout
            >
              Sign In
            </motion.span>
          </AnimatePresence>
        </Button>
      )}

      {/* Get started / Dashboard buttons */}
      {getButtonState() === "dashboard" ? (
        <Button asChild className="min-w-28">
          <Link to="/dashboard/agents">
            <AnimatePresence mode="wait">
              <motion.span
                key={getButtonState()}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{
                  duration: 0.2,
                  ease: "easeInOut",
                  layout: { duration: 0.3 },
                }}
                layout
              >
                {getButtonState() === "dashboard" ? "Agents" : "Get started"}
              </motion.span>
            </AnimatePresence>
          </Link>
        </Button>
      ) : null}

      {/* User dropdown with logout - show when authenticated */}
      {showUserDropdown && <UserDropdownButton />}
    </motion.div>
  );
}
