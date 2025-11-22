import { Button } from "@/src/lib/components/ui/button";
import { motion, type Variants } from "motion/react";

// Consistent orchestration with Navbar
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15, // Matched to Navbar stagger
            delayChildren: 0.4     // Matched to Navbar content reveal
        }
    }
};

// Typing effect for text containers
const typingContainerVariants: Variants = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04, // Slightly faster typing to match overall snappy feel
            delayChildren: 0.0     // Start immediately when container triggers
        }
    }
};

// Individual letter animation - Matched to Navbar item spring
const letterVariants: Variants = {
    hidden: { opacity: 0, y: 20 }, 
    visible: { 
        opacity: 1, 
        y: 0,
        transition: {
            type: "spring",
            stiffness: 300, // Matched Navbar stiffness
            damping: 20     // Matched Navbar damping
        }
    }
};

// Item animation - Matched to Navbar item spring
const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: {
            type: "spring", // Switched to spring for consistency
            stiffness: 300, // Matched Navbar stiffness
            damping: 20     // Matched Navbar damping
        }
    }
};

export default function HomePage() {
    const text1 = "Build Intelligent";
    const text2 = "On-Chain Agents";

    return (
        <div className="h-full relative overflow-hidden flex items-center justify-center">
            {/* Background Video */}
            <motion.div 
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2, ease: "easeInOut" }} // Slightly faster video fade
            >
                <video
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                >
                    <source src="/static/assets/clip_4.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                {/* Overlay */}
                <div className="absolute inset-0 bg-background/80" />
            </motion.div>

            {/* Hero Content */}
            <motion.div 
                className="relative z-10 container mx-auto px-4 text-center text-foreground"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-medium tracking-tighter mb-8 drop-shadow-2xl flex flex-col items-center">
                    {/* First line: Build Intelligent */}
                    <motion.span 
                        className="block mb-4"
                        variants={typingContainerVariants}
                    >
                        {text1.split("").map((char, index) => (
                            <motion.span key={index} variants={letterVariants}>
                                {char}
                            </motion.span>
                        ))}
                    </motion.span>

                    {/* Second line: On-Chain Agents (Gradient) */}
                    <motion.span 
                        className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-chart-2 to-chart-4 inline-block p-4"
                        style={{ backgroundSize: "400% auto" }}
                        variants={typingContainerVariants}
                        animate={{ 
                            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                        }}
                        transition={{ 
                            duration: 6, 
                            repeat: Infinity, 
                            ease: "linear"
                        }}
                    >
                        {text2.split("").map((char, index) => (
                            <motion.span key={index} variants={letterVariants}>
                                {char}
                            </motion.span>
                        ))}
                    </motion.span>
                </h1>
                
                <motion.p 
                    className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-8 leading-relaxed drop-shadow-md"
                    variants={itemVariants}
                >
                    Alloy empowers developers to create, deploy, and orchestrate 
                    autonomous AI agents that live on the blockchain.
                </motion.p>

                <motion.div 
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    variants={itemVariants}
                >
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                        <Button variant="fusion" size="lg" className="text-lg px-8 py-6 min-w-[160px] shadow-[0_0_20px_hsl(var(--primary)/0.5)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)] transition-all duration-300 border border-primary/50">
                            Start Building
                        </Button>
                    </motion.div>
                    
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                        <Button variant="outline" size="lg" className="text-lg px-8 py-6 min-w-[160px] border-foreground/10 bg-foreground/5 hover:bg-foreground/10 text-foreground hover:text-foreground backdrop-blur-md">
                            View Docs
                        </Button>
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    )
}