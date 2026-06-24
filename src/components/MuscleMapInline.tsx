"use client";

import { useState, useEffect, useRef } from 'react';

interface MuscleMapInlineProps {
  onMuscleSelect?: (selectedIndices: number[]) => void;
  selectedMuscles?: number[];
  highlightColor?: string;
  interactive?: boolean;
}

/**
 * Alternative implementation that embeds SVG inline for better performance
 * Note: Due to the large size of the SVG (618 groups), this component 
 * dynamically loads the content to avoid bundle size issues
 */
export default function MuscleMapInline({ 
  onMuscleSelect,
  selectedMuscles = [],
  highlightColor = '#00f2fe',
  interactive = true 
}: MuscleMapInlineProps) {
  const [selected, setSelected] = useState<Set<number>>(new Set(selectedMuscles));
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Initialize event handlers
  useEffect(() => {
    if (!svgRef.current) return;

    const gTags = svgRef.current.querySelectorAll('g[fill="gray"]');
    const handlers: Array<{
      element: Element;
      mouseenter: () => void;
      mouseleave: () => void;
      click: () => void;
    }> = [];
    
    gTags.forEach((g, index) => {
      const element = g as SVGGElement;
      
      // Set initial style
      element.style.cursor = interactive ? 'pointer' : 'default';
      element.style.transition = 'all 0.2s ease';
      
      // Apply selected state
      if (selected.has(index)) {
        applyHighlightStyle(element, highlightColor);
      }

      if (!interactive) return;

      const handleMouseEnter = () => {
        setHoveredIndex(index);
        if (!selected.has(index)) {
          applyHoverStyle(element, highlightColor);
        }
      };

      const handleMouseLeave = () => {
        setHoveredIndex(null);
        if (!selected.has(index)) {
          resetStyle(element);
        }
      };

      const handleClick = () => {
        setSelected(prev => {
          const newSelected = new Set(prev);
          if (newSelected.has(index)) {
            newSelected.delete(index);
            resetStyle(element);
          } else {
            newSelected.add(index);
            applyHighlightStyle(element, highlightColor);
          }
          
          onMuscleSelect?.(Array.from(newSelected));
          return newSelected;
        });
      };

      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);
      element.addEventListener('click', handleClick);

      handlers.push({
        element,
        mouseenter: handleMouseEnter,
        mouseleave: handleMouseLeave,
        click: handleClick
      });
    });

    // Cleanup
    return () => {
      handlers.forEach(({ element, mouseenter, mouseleave, click }) => {
        element.removeEventListener('mouseenter', mouseenter);
        element.removeEventListener('mouseleave', mouseleave);
        element.removeEventListener('click', click);
      });
    };
  }, [interactive, highlightColor, selected, onMuscleSelect]);

  const applyHighlightStyle = (element: SVGGElement, color: string) => {
    element.setAttribute('fill', color);
    element.setAttribute('fill-opacity', '0.8');
    element.setAttribute('stroke', color);
    element.setAttribute('stroke-width', '1.5');
    element.style.filter = `drop-shadow(0 0 4px ${color})`;
  };

  const applyHoverStyle = (element: SVGGElement, color: string) => {
    element.setAttribute('fill', color);
    element.setAttribute('fill-opacity', '0.5');
    element.setAttribute('stroke', color);
    element.setAttribute('stroke-width', '1');
    element.style.filter = `drop-shadow(0 0 2px ${color})`;
  };

  const resetStyle = (element: SVGGElement) => {
    element.setAttribute('fill', 'gray');
    element.setAttribute('fill-opacity', '0.0');
    element.setAttribute('stroke', 'black');
    element.setAttribute('stroke-width', '0.3');
    element.style.filter = 'none';
  };

  const clearSelection = () => {
    if (!svgRef.current) return;
    
    const gTags = svgRef.current.querySelectorAll('g[fill]');
    gTags.forEach((g) => {
      resetStyle(g as SVGGElement);
    });

    setSelected(new Set());
    onMuscleSelect?.([]);
  };

  return (
    <div className="w-full max-w-4xl p-6 mx-auto rounded-2xl bg-zinc-950 border border-zinc-800 text-slate-200 shadow-2xl backdrop-blur-md">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h3 className="text-lg font-semibold tracking-wide bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Anatomical Muscle Map
          </h3>
          <p className="text-xs text-zinc-500">
            618 detailed muscle groups • Interactive selection
          </p>
        </div>
        
        <button 
          onClick={clearSelection}
          className="px-3 py-1.5 rounded-md font-medium text-xs bg-zinc-800 hover:bg-zinc-700 text-white transition-all border border-zinc-700"
        >
          Clear All ({selected.size})
        </button>
      </div>

      {/* SVG Container */}
      <div className="w-full flex justify-center items-center bg-gradient-to-b from-zinc-900/30 to-transparent p-4 rounded-xl border border-zinc-900">
        <svg 
          ref={svgRef}
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 552 516" 
          className="w-full max-h-[600px]"
        >
          {/* 
            NOTE: The actual SVG paths from "men sample color 2.html" should be embedded here.
            Due to the large file size (618 groups), we use the fetch approach in MuscleMapAdvanced.tsx
            This inline version is provided as a template for optimization later.
            
            To use this component:
            1. Copy all <g> elements from the HTML file
            2. Paste them here between the <svg> tags
            3. Ensure all paths have proper attributes
          */}
          <text x="276" y="258" textAnchor="middle" fill="#666" fontSize="14">
            SVG content should be embedded here
          </text>
        </svg>
      </div>

      {/* Status Bar */}
      <div className="mt-4 pt-4 border-t border-zinc-900 flex justify-between items-center text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_#00f2fe]" />
          <span>
            Selected: <strong className="text-zinc-200">{selected.size}</strong> groups
            {hoveredIndex !== null && (
              <span className="ml-2">• Hovering: <strong className="text-cyan-400">#{hoveredIndex + 1}</strong></span>
            )}
          </span>
        </div>
        <span className="text-[10px] font-mono text-zinc-600">v3.0-INLINE</span>
      </div>
    </div>
  );
}
