import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, MapPin, Calendar, Award, Clock, ArrowRight, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Interface for component props for type safety and reusability

export const ConferenceCard = ({
  conference,
  className,
}) => {
  const [direction, setDirection] = useState(0);

  // Generate tags from conference data
  const generateTags = () => {
    const tags = [];
    if (conference.cpd_accredited) {
      tags.push('CPD Accredited');
    }
    if (conference.cpd_hours) {
      tags.push(`${conference.cpd_hours}hrs`);
    }
    return tags.length > 0 ? tags : ['Professional'];
  };

  // Animation variants for the carousel
  const carouselVariants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  // Animation variants for staggering content
  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
      variants={contentVariants}
      whileHover={{
        scale: 1.03,
        boxShadow: '0px 10px 30px -5px hsl(var(--foreground) / 0.1)',
        transition: { type: 'spring', stiffness: 300, damping: 20 },
      }}
      className={cn(
        'w-full max-w-sm overflow-hidden rounded-2xl border dark:bg-gray-800 text-card-foreground shadow-lg cursor-pointer',
        className
      )}
    >
      {/* Image Section */}
      <div className="relative group h-64 overflow-hidden bg-gray-200 dark:bg-gray-700">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={conference.id}
            custom={direction}
            variants={carouselVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="absolute inset-0"
          >
            <img
              src={conference.img}
              alt={conference.title}
              className="h-full w-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          {generateTags().map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-background/70 backdrop-blur-sm text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* CPD Accreditation Badge */}
        {conference.cpd_accredited && (
          <div className="absolute top-3 right-3">
            <Badge variant="default" className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-700">
              <Award className="h-3 w-3" /> CPD
            </Badge>
          </div>
        )}
      </div>

      {/* Content Section */}
      <motion.div variants={contentVariants} className="p-5 space-y-4">
        {/* Title */}
        <motion.div variants={itemVariants}>
          <h3 className="text-xl font-bold leading-tight text-gray-900 dark:text-white">
            {conference.title}
          </h3>
        </motion.div>

        {/* Location and Date */}
        <motion.div variants={itemVariants} className="flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 flex-shrink-0 text-cyan-600 dark:text-cyan-400" />
            <span>{conference.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 flex-shrink-0 text-cyan-600 dark:text-cyan-400" />
            <span>{conference.date}</span>
          </div>
        </motion.div>

        {/* Short Description */}
        {conference.shortDescription && (
          <motion.p variants={itemVariants} className="text-sm line-clamp-3 text-muted-foreground leading-relaxed">
            {conference.shortDescription}
          </motion.p>
        )}

        {/* Full Description (truncated) */}
        {/* {!conference.shortDescription && conference.description && (
          <motion.p variants={itemVariants} className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {conference.description}
          </motion.p>
        )} */}

        {/* CPD Hours Info */}
        {/* {conference.cpd_hours && (
          <motion.div variants={itemVariants} className="flex items-center gap-2 px-3 py-2 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
            <Clock className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            <span className="text-sm font-medium text-cyan-900 dark:text-cyan-100">
              {conference.cpd_hours} CPD Hours
            </span>
          </motion.div>
        )} */}

        {/* Action Button */}
        <motion.div variants={itemVariants} className="pt-2">
          <a href={conference.websiteUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
            <Button className="w-full group ">
              <Globe className="h-4 w-4 mr-2" />
              Register Now
              <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </a>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
