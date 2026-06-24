"use client";

import { useEffect, useRef, useState } from 'react';

export interface MuscleHighlight {
  muscles: string[]; // array of muscle class names to highlight
  fillColor?: string;
  fillOpacity?: number;
  strokeColor?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
  blurInactive?: number; // blur amount for non-highlighted muscles (in pixels)
}

interface MenAnatomyProps {
  view: 'front' | 'back';
  highlights?: MuscleHighlight;
  onMuscleClick?: (muscleGroups: string[]) => void;
  className?: string;
  width?: number | string;
  height?: number | string;
}

export default function MenAnatomy({
  view,
  highlights,
  onMuscleClick,
  className = '',
  width = '100%',
  height = 'auto'
}: MenAnatomyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');

  // Load SVG based on view
  useEffect(() => {
    const svgPath = view === 'front' 
      ? '/vectors/anatomy-men-front-tagged.svg'
      : '/vectors/anatomy-men-back-tagged.svg';

    fetch(svgPath)
      .then(response => response.text())
      .then(setSvgContent)
      .catch(error => console.error('Error loading men anatomy SVG:', error));
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
      strokeOpacity = 0.9,
      blurInactive = 0
    } = highlights;

    // Create or update blur filter if needed
    let defs = svgElement.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      svgElement.insertBefore(defs, svgElement.firstChild);
    }

    let filter = defs.querySelector('#inactive-blur');
    if (blurInactive > 0) {
      if (!filter) {
        filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', 'inactive-blur');
        const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        feGaussianBlur.setAttribute('in', 'SourceGraphic');
        feGaussianBlur.setAttribute('stdDeviation', blurInactive.toString());
        filter.appendChild(feGaussianBlur);
        defs.appendChild(filter);
      } else {
        const feGaussianBlur = filter.querySelector('feGaussianBlur');
        if (feGaussianBlur) {
          feGaussianBlur.setAttribute('stdDeviation', blurInactive.toString());
        }
      }
    }

    // First, apply blur to ALL paths in the SVG (default state)
    const allPaths = svgElement.querySelectorAll('path');
    allPaths.forEach((path) => {
      path.style.fill = '';
      path.style.fillOpacity = '';
      path.style.stroke = '';
      path.style.strokeWidth = '';
      path.style.strokeOpacity = '';
      // Apply blur to everything by default
      path.style.filter = blurInactive > 0 ? 'url(#inactive-blur)' : '';
    });

    // Now, remove blur and apply highlights to selected muscles only
    if (muscles.length > 0) {
      const allGroups = svgElement.querySelectorAll('g[class]');
      allGroups.forEach((group) => {
        const gElement = group as SVGGElement;
        const classList = gElement.getAttribute('class') || '';
        
        // Check if any of the target muscles match this group's classes
        const shouldHighlight = muscles.some(muscle => 
          classList.split(' ').some(cls => cls.toLowerCase() === muscle.toLowerCase())
        );

        if (shouldHighlight) {
          // Highlighted muscles - clear and sharp, no blur
          const paths = gElement.querySelectorAll('path');
          paths.forEach((path) => {
            path.style.fill = fillColor;
            path.style.fillOpacity = fillOpacity.toString();
            path.style.stroke = strokeColor;
            path.style.strokeWidth = `${strokeWidth}px`;
            path.style.strokeOpacity = strokeOpacity.toString();
            path.style.filter = 'none'; // Remove blur from active muscles
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
