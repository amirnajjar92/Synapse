"use client";

import { useEffect, useRef, useState } from 'react';

export interface MuscleHighlight {
  muscles: string[]; // array of muscle class names to highlight
  fillColor?: string;
  fillOpacity?: number;
  strokeColor?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
}

interface WomenAnatomyProps {
  view: 'front' | 'back';
  highlights?: MuscleHighlight;
  onMuscleClick?: (muscleGroups: string[]) => void;
  className?: string;
  width?: number | string;
  height?: number | string;
}

export default function WomenAnatomy({
  view,
  highlights,
  onMuscleClick,
  className = '',
  width = '100%',
  height = 'auto'
}: WomenAnatomyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');

  // Load SVG based on view
  useEffect(() => {
    const svgPath = view === 'front' 
      ? '/vectors/anatomy-women-front-tagged.svg'
      : '/vectors/anatomy-women-back-tagged.svg';

    fetch(svgPath)
      .then(response => response.text())
      .then(setSvgContent)
      .catch(error => console.error('Error loading women anatomy SVG:', error));
  }, [view]);

  // Apply highlights
  useEffect(() => {
    if (!svgContent || !containerRef.current || !highlights) return;

    const container = containerRef.current;
    const svgElement = container.querySelector('svg');
    if (!svgElement) return;

    const {
      muscles = [],
      fillColor = '#ff0000',
      fillOpacity = 0.6,
      strokeColor = '#ff0000',
      strokeWidth = 2,
      strokeOpacity = 0.9
    } = highlights;

    // Reset all muscle groups first
    const allGroups = svgElement.querySelectorAll('g[class]');
    allGroups.forEach((group) => {
      const gElement = group as SVGGElement;
      const paths = gElement.querySelectorAll('path');
      paths.forEach((path) => {
        path.style.fill = '';
        path.style.fillOpacity = '';
        path.style.stroke = '';
        path.style.strokeWidth = '';
        path.style.strokeOpacity = '';
      });
    });

    // Apply highlights to selected muscles
    if (muscles.length > 0) {
      allGroups.forEach((group) => {
        const gElement = group as SVGGElement;
        const classList = gElement.getAttribute('class') || '';
        
        // Check if any of the target muscles match this group's classes
        const shouldHighlight = muscles.some(muscle => 
          classList.split(' ').some(cls => cls.toLowerCase() === muscle.toLowerCase())
        );

        if (shouldHighlight) {
          const paths = gElement.querySelectorAll('path');
          paths.forEach((path) => {
            path.style.fill = fillColor;
            path.style.fillOpacity = fillOpacity.toString();
            path.style.stroke = strokeColor;
            path.style.strokeWidth = `${strokeWidth}px`;
            path.style.strokeOpacity = strokeOpacity.toString();
          });
        }
      });
    }
  }, [svgContent, highlights]);

  // Handle clicks
  useEffect(() => {
    if (!svgContent || !containerRef.current || !onMuscleClick) return;

    const container = containerRef.current;
    const svgElement = container.querySelector('svg');
    if (!svgElement) return;

    const handleClick = (event: Event) => {
      const target = event.target as SVGElement;
      
      // Find the parent group with class attribute
      let currentElement: SVGElement | null = target;
      while (currentElement && currentElement.tagName.toLowerCase() !== 'svg') {
        if (currentElement.tagName.toLowerCase() === 'g' && currentElement.hasAttribute('class')) {
          const classList = currentElement.getAttribute('class') || '';
          const muscleGroups = classList.split(' ').filter(c => c.trim().length > 0);
          if (muscleGroups.length > 0) {
            onMuscleClick(muscleGroups);
            return;
          }
        }
        currentElement = currentElement.parentElement as SVGElement;
      }
    };

    svgElement.addEventListener('click', handleClick);

    return () => {
      svgElement.removeEventListener('click', handleClick);
    };
  }, [svgContent, onMuscleClick]);

  return (
    <div 
      ref={containerRef}
      className={className}
      style={{ width, height }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}
