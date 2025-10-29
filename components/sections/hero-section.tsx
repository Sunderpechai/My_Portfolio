"use client";

import { motion } from "framer-motion";
import { getPersonalInfo, getSocialLinks } from "@/lib/config";
import { ArrowDown } from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import * as Icons from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export function HeroSection() {
  const personalInfo = getPersonalInfo();
  const socials = getSocialLinks();

  const scrollToAbout = () => {
    const aboutSection = document.getElementById("about");
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-12">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            <motion.div variants={item}>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
                <span className="inline-block">Hi, I&apos;m</span>
                {' '}
                <span className="inline-block text-primary">{personalInfo.name}</span>
              </h1>
            </motion.div>

            <motion.div variants={item}>
              <h2 className="text-2xl md:text-3xl font-medium text-muted-foreground mb-8">
                {personalInfo.title}
              </h2>
            </motion.div>

            <motion.div variants={item}>
              <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10">
                {personalInfo.bio}
              </p>
            </motion.div>

            <motion.div
              variants={item}
              className="flex flex-wrap gap-4 justify-center"
            >
              <ButtonLink href="/#projects" variant="outline" icon={true}>
                View My Work
              </ButtonLink>
              <ButtonLink href="/#contact" variant="outline">
                Get In Touch
              </ButtonLink>
            </motion.div>

            <motion.div variants={item}>
              <div className="flex gap-6 justify-center mt-4">
                {socials.map((social) => {
                  // const IconComponent = Icons[social.icon as keyof typeof Icons];
                  const IconComponent = Icons[social.icon as keyof typeof Icons] as LucideIcon;
                  return (
                    <motion.a
                      key={social.platform}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.platform}
                      className={cn(
                        "h-14 w-14 flex items-center justify-center rounded-xl",
                        "text-white hover:text-primary transition-all duration-300",
                        "border-2 border-white/40 hover:border-primary",
                        "bg-white/5 hover:bg-primary/10 backdrop-blur-md",
                        "shadow-lg hover:shadow-xl hover:shadow-primary/20"
                      )}
                      whileHover={{ scale: 1.1, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {IconComponent && <IconComponent className="h-7 w-7 stroke-[2.5]" />}
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        onClick={scrollToAbout}
      >
        <ArrowDown className="h-6 w-6 text-primary" />
      </motion.div>
    </section>
  );
}