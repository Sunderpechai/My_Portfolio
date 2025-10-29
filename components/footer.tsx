"use client";

import { getSocialLinks, getPersonalInfo } from "@/lib/config";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import * as Icons from "lucide-react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

export function Footer() {
  const socials = getSocialLinks();
  const personalInfo = getPersonalInfo();
  const currentYear = new Date().getFullYear();

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
    <footer className="bg-card py-12 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center">
          <Link href="/" className="text-xl font-bold mb-6">
            {personalInfo.name.split(' ')[0]} <span className="text-primary">{personalInfo.name.split(' ')[1] || ''}</span>
          </Link>

          <motion.div 
            className="flex gap-6 mb-8"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
          >
            {socials.map((social) => {
              const IconComponent = Icons[social.icon as keyof typeof Icons] as LucideIcon;
              return (
                <motion.a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.platform}
                  className={cn(
                    "h-10 w-10 flex items-center justify-center rounded-full",
                    "text-muted-foreground hover:text-primary transition-colors",
                    "border border-border hover:border-primary"
                  )}
                  variants={item}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {IconComponent && <IconComponent className="h-5 w-5" />}
                </motion.a>
              );
            })}
          </motion.div>

          <motion.div
            className="text-center text-muted-foreground text-sm"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <p className="mb-2 flex items-center justify-center">
              Made with ❤️ by {personalInfo.name}
            </p>
            <p>&copy; {currentYear} All rights reserved.</p>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
