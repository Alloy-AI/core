import { Button } from "../../lib/components/ui/button";
import { Link, useLocation } from "@tanstack/react-router";
import { Image } from "../../lib/components/custom/Image";
import ConnectButton from "../../lib/components/app/ConnectButton";
import { motion, type Variants } from "motion/react";

export default function Navbar() {
  const links = [
    { name: "About us", href: "#about" },
    { name: "Pricing", href: "#pricing" },
    { name: "Integration", href: "#integration" },
    { name: "Blog", href: "#blog" },
    { name: "Contact", href: "#contact" },
    { name: "Waitlist", href: "#waitlist" },
  ];

  const navVariants: Variants = {
    hidden: { y: -100, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        duration: 0.8, 
        ease: [0.22, 1, 0.36, 1], // Custom easeOut for smooth landing
        delayChildren: 0.4, // Start revealing content halfway through the drop
        staggerChildren: 0.15 // Stagger the sections
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: -20, filter: "blur(10px)" },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)",
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      }
    }
  };

  const centerVariants: Variants = {
    hidden: { opacity: 0, y: -20, filter: "blur(10px)" },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)",
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 20,
        staggerChildren: 0.1 // Stagger the links inside
      }
    }
  };

  const linkVariants: Variants = {
    hidden: { opacity: 0, y: -10, filter: "blur(5px)" },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)",
      transition: { 
        type: "spring", 
        stiffness: 500, 
        damping: 30 
      }
    }
  };

  return (
    <motion.nav 
      variants={navVariants}
      initial="hidden"
      animate="visible"
      className="fixed top-6 left-0 right-0 mx-auto max-w-5xl z-50 flex items-center justify-between px-6 py-3 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl shadow-[0_0_20px_rgba(0,0,0,0.2)]"
    >
      {/* Left: Logo */}
      <motion.div variants={itemVariants} className="flex gap-3 items-center">
        <div className="relative group cursor-pointer">
          <div className="absolute -inset-2 bg-gradient-to-r from-primary via-chart-2 to-chart-4 rounded-full opacity-20 blur-lg group-hover:opacity-40 transition-opacity duration-500" />
          <Image src="/static/logo.svg" alt="alloy" className="w-10 relative z-10" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">Alloy</span>
      </motion.div>

      {/* Center: Links */}
      <motion.div variants={centerVariants} className="hidden md:flex items-center gap-8">
        {links.map((link) => (
          <motion.a 
            variants={linkVariants}
            key={link.name}
            href={link.href}
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors relative group"
          >
            {link.name}
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-primary to-chart-2 transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100" />
          </motion.a>
        ))}
      </motion.div>

      {/* Right: Actions */}
      <motion.div variants={itemVariants} className="flex gap-4 items-center">
        <ConnectButton />
      </motion.div>
    </motion.nav>
  )
}