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

interface WomenAnatomyProps {
  view: 'front' | 'back';
  highlights?: MuscleHighlight;
  onMuscleClick?: (muscleGroups: string[]) => void;
  className?: string;
  width?: number | string;
  height?: number | string;
  defaultStrokeColor?: string;
  defaultStrokeWidth?: number;
}

export default function WomenAnatomy({
  view,
  highlights,
  onMuscleClick,
  className = '',
  width = '100%',
  height = 'auto',
  defaultStrokeColor = '#000000',
  defaultStrokeWidth = 1
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

    // Create glow filter for active muscles
    let glowFilter = defs.querySelector('#active-glow');
    if (!glowFilter) {
      glowFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
      glowFilter.setAttribute('id', 'active-glow');
      glowFilter.setAttribute('height', '300%');
      glowFilter.setAttribute('width', '300%');
      glowFilter.setAttribute('x', '-100%');
      glowFilter.setAttribute('y', '-100%');
      
      // Create the glow effect
      const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
      feGaussianBlur.setAttribute('in', 'SourceGraphic');
      feGaussianBlur.setAttribute('stdDeviation', '2');
      feGaussianBlur.setAttribute('result', 'blur');
      
      const feFlood = document.createElementNS('http://www.w3.org/2000/svg', 'feFlood');
      feFlood.setAttribute('flood-color', fillColor);
      feFlood.setAttribute('flood-opacity', '0.4');
      feFlood.setAttribute('result', 'color');
      
      const feComposite = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
      feComposite.setAttribute('in', 'color');
      feComposite.setAttribute('in2', 'blur');
      feComposite.setAttribute('operator', 'in');
      feComposite.setAttribute('result', 'glow');
      
      const feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
      const feMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
      feMergeNode1.setAttribute('in', 'glow');
      const feMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
      feMergeNode2.setAttribute('in', 'SourceGraphic');
      
      feMerge.appendChild(feMergeNode1);
      feMerge.appendChild(feMergeNode2);
      
      glowFilter.appendChild(feGaussianBlur);
      glowFilter.appendChild(feFlood);
      glowFilter.appendChild(feComposite);
      glowFilter.appendChild(feMerge);
      defs.appendChild(glowFilter);
    }

    // Add CSS animation for pulse effect
    let style = svgElement.querySelector('style');
    if (!style) {
      style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
      style.textContent = `
        @keyframes muscle-pulse {
          0%, 100% {
            filter: url(#active-glow) drop-shadow(0 0 2px rgba(255, 10, 10, 0.3)) drop-shadow(0 0 40px rgba(255, 10, 10, 0.2));
          }
          50% {
            filter: url(#active-glow) drop-shadow(0 0 3px rgba(255, 10, 10, 0.4)) drop-shadow(0 0 60px rgba(255, 10, 10, 0.3));
          }
        }
        .active-muscle {
          animation: muscle-pulse 3s ease-in-out infinite;
        }
      `;
      svgElement.appendChild(style);
    } else {
      // Update existing style with current fill color
      style.textContent = `
        @keyframes muscle-pulse {
          0%, 100% {
            filter: url(#active-glow) drop-shadow(0 0 2px rgba(255, 10, 10, 0.3)) drop-shadow(0 0 40px rgba(255, 10, 10, 0.2));
          }
          50% {
            filter: url(#active-glow) drop-shadow(0 0 3px rgba(255, 10, 10, 0.4)) drop-shadow(0 0 60px rgba(255, 10, 10, 0.3));
          }
        }
        .active-muscle {
          animation: muscle-pulse 3s ease-in-out infinite;
        }
      `;
    }

    // First, apply blur to ALL paths in the SVG (default state)
    const allPaths = svgElement.querySelectorAll('path');
    allPaths.forEach((path) => {
      path.style.fill = '';
      path.style.fillOpacity = '';
      path.style.stroke = defaultStrokeColor;
      path.style.strokeWidth = `${defaultStrokeWidth}px`;
      path.style.strokeOpacity = '';
      // Apply blur to everything by default
      path.style.filter = blurInactive > 0 ? 'url(#inactive-blur)' : '';
      // Remove active muscle class by default
      path.classList.remove('active-muscle');
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
            path.classList.add('active-muscle');
          });
        }
      });
    }
  }, [svgContent, highlights, defaultStrokeColor, defaultStrokeWidth]);

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
        currentElement = currentElement.parentElement as SVGElement | null;
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
