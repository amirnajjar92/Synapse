"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

type Gender = 'male' | 'female';

interface MuscleMapAdvancedProps {
  onMuscleSelect?: (selectedIndices: number[]) => void;
  selectedMuscles?: number[];
  highlightColor?: string;
  interactive?: boolean;
  defaultGender?: Gender;
}

export default function MuscleMapAdvanced({ 
  onMuscleSelect,
  selectedMuscles = [],
  highlightColor = '#c91515', // Changed to red #c91515
  interactive = true,
  defaultGender = 'male'
}: MuscleMapAdvancedProps) {
  const [selected, setSelected] = useState<Set<number>>(new Set(selectedMuscles));
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [gender, setGender] = useState<Gender>(defaultGender);
  const [totalGroups, setTotalGroups] = useState<number>(618);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const onMuscleSelectRef = useRef(onMuscleSelect);

  // Keep ref updated
  useEffect(() => {
    onMuscleSelectRef.current = onMuscleSelect;
  }, [onMuscleSelect]);

  // Load SVG from HTML file or SVG files
  useEffect(() => {
    // Clear selection when switching gender
    setSelected(new Set());

    if (gender === 'male') {
      // Load new men anatomy SVG file
      fetch('/vectors/new-men-anatomy.svg')
        .then(response => response.text())
        .then(svgText => {
          setSvgContent(svgText);
          setTotalGroups(618);
        })
        .catch(error => console.error('Error loading male anatomy:', error));
    } else {
      // Load new women anatomy SVG file
      fetch('/vectors/new-women-anatomy.svg')
        .then(response => response.text())
        .then(svgText => {
          setSvgContent(svgText);
          setTotalGroups(213);
        })
        .catch(error => console.error('Error loading female anatomy:', error));
    }
  }, [gender]);

  // Notify parent when selection changes
  useEffect(() => {
    onMuscleSelectRef.current?.(Array.from(selected));
  }, [selected]);

  // Clean up any pre-existing inline styles when SVG content changes
  useEffect(() => {
    if (!svgContent || !svgContainerRef.current) return;
    
    const container = svgContainerRef.current;
    const svgElement = container.querySelector('svg');
    if (!svgElement) return;
    
    // Remove all inline styles and normalize fill/stroke attributes from all SVG elements
    const allSvgElements = svgElement.querySelectorAll('*');
    allSvgElements.forEach((el) => {
      const element = el as SVGElement;
      
      // Clear inline styles
      if (element.hasAttribute('style')) {
        element.removeAttribute('style');
      }
      
      // Normalize path and shape fill colors (keep only structural attributes)
      if (element.tagName.toLowerCase() === 'path' || 
          element.tagName.toLowerCase() === 'rect' || 
          element.tagName.toLowerCase() === 'circle' ||
          element.tagName.toLowerCase() === 'ellipse' ||
          element.tagName.toLowerCase() === 'polygon') {
        // Remove any individual fill/stroke that's not part of a group definition
        element.removeAttribute('fill');
        element.removeAttribute('stroke');
        element.removeAttribute('stroke-width');
      }
    });
  }, [svgContent]);

  // Set up click handlers after SVG is loaded - using event delegation
  useEffect(() => {
    if (!svgContent || !svgContainerRef.current) return;

    const container = svgContainerRef.current;
    
    // Helper function to get muscle groups
    const getMuscleGroups = (svgEl: SVGSVGElement): Element[] => {
      if (gender === 'male') {
        // Male anatomy uses g[fill="#ffffff"] structure
        const groups = Array.from(svgEl.querySelectorAll('g[fill="#ffffff"]'));
        console.log('Male groups found:', groups.length);
        return groups;
      } else {
        // Female anatomy uses nested structure: .female-front > g (xmlns g tags)
        const allGroups = Array.from(svgEl.querySelectorAll('.female-front > g, .female-back > g'));
        console.log('Female groups found:', allGroups.length);
        return allGroups;
      }
    };
    
    // Indices to exclude (background elements, not muscles)
    const excludedIndices = new Set([120, 333]);
    
    // Use event delegation on the container
    const handleContainerClick = (e: MouseEvent) => {
      const target = e.target as SVGElement;
      
      // Find the closest <g> element
      let gElement = target.closest('g') as Element | null;
      if (!gElement) return;
      
      const svgElement = container.querySelector('svg');
      if (!svgElement) return;
      
      // Get all muscle groups
      const gTags = getMuscleGroups(svgElement);
      
      // Find the index of clicked element
      let index = gTags.indexOf(gElement);
      
      // If not found directly, check if it's a child and find the parent muscle group
      if (index === -1) {
        for (let i = 0; i < gTags.length; i++) {
          if (gTags[i].contains(gElement)) {
            index = i;
            gElement = gTags[i];
            break;
          }
        }
      }
      
      if (index === -1) return;
      
      // Skip excluded indices (background elements)
      if (excludedIndices.has(index)) {
        console.log(`Skipping excluded group ${index} (background element)`);
        return;
      }
      
      console.log(`Clicked on group ${index} (${gender})`);
      
      // Toggle selection
      setSelected(prev => {
        const newSelected = new Set(prev);
        const element = gElement as SVGGElement;
        
        if (newSelected.has(index)) {
          newSelected.delete(index);
          resetStyle(element);
        } else {
          newSelected.add(index);
          applyHighlightStyle(element, highlightColor);
        }
        
        return newSelected;
      });
    };
    
    const handleContainerMouseMove = (e: MouseEvent) => {
      const target = e.target as SVGElement;
      let gElement = target.closest('g') as Element | null;
      
      if (!gElement) {
        setHoveredIndex(null);
        return;
      }
      
      const svgElement = container.querySelector('svg');
      if (!svgElement) return;
      
      const gTags = getMuscleGroups(svgElement);
      let index = gTags.indexOf(gElement);
      
      // Check if it's a child
      if (index === -1) {
        for (let i = 0; i < gTags.length; i++) {
          if (gTags[i].contains(gElement)) {
            index = i;
            gElement = gTags[i];
            break;
          }
        }
      }
      
      if (index !== -1 && !selected.has(index) && !excludedIndices.has(index)) {
        setHoveredIndex(index);
        applyHoverStyle(gElement as SVGGElement, highlightColor);
      }
    };
    
    const handleContainerMouseLeave = () => {
      if (hoveredIndex !== null) {
        const svgElement = container.querySelector('svg');
        if (!svgElement) return;
        
        const gTags = getMuscleGroups(svgElement);
        const element = gTags[hoveredIndex] as SVGGElement;
        
        if (element && !selected.has(hoveredIndex)) {
          resetStyle(element);
        }
      }
      setHoveredIndex(null);
    };

    container.addEventListener('click', handleContainerClick);
    container.addEventListener('mousemove', handleContainerMouseMove);
    container.addEventListener('mouseleave', handleContainerMouseLeave);
    
    // Set cursor style for all groups (except excluded ones) and apply default styling
    const svgElement = container.querySelector('svg');
    if (svgElement) {
      // First, clean up ALL pre-existing inline styles from paths and groups
      const allElements = svgElement.querySelectorAll('g, path');
      allElements.forEach((el) => {
        (el as SVGElement).style.cssText = '';
      });
      
      const gTags = getMuscleGroups(svgElement);
      console.log(`Found ${gTags.length} muscle groups for ${gender}`);
      gTags.forEach((g, index) => {
        const element = g as SVGGElement;
        if (!excludedIndices.has(index)) {
          element.style.cursor = 'pointer';
          element.style.pointerEvents = 'all';
          // Apply default semi-transparent white styling
          if (!selected.has(index)) {
            resetStyle(element);
          } else {
            applyHighlightStyle(element, highlightColor);
          }
        } else {
          element.style.cursor = 'default';
          element.style.pointerEvents = 'none';
          element.style.opacity = '0.3'; // Make background elements more subtle
        }
      });
    }

    return () => {
      container.removeEventListener('click', handleContainerClick);
      container.removeEventListener('mousemove', handleContainerMouseMove);
      container.removeEventListener('mouseleave', handleContainerMouseLeave);
    };
  }, [svgContent, highlightColor, selected, gender, hoveredIndex]);

  // Style application functions
  const applyHighlightStyle = (element: SVGGElement, color: string) => {
    element.setAttribute('fill', '#c91515'); // Red
    element.setAttribute('fill-opacity', '1');
    element.setAttribute('stroke', '#c91515');
    element.setAttribute('stroke-width', '1.5');
    
    // Apply inline styles
    element.style.fill = '#c91515';
    element.style.cursor = 'pointer';
    element.style.pointerEvents = 'all';
    element.style.filter = 'drop-shadow(0 0 4px #c91515)';
    element.style.transition = 'all 0.2s ease';
  };

  const applyHoverStyle = (element: SVGGElement, color: string) => {
    element.setAttribute('fill', '#c91515'); // Red
    element.setAttribute('fill-opacity', '0.5'); // 50% opacity
    element.setAttribute('stroke', '#c91515');
    element.setAttribute('stroke-width', '1');
    
    // Apply inline styles
    element.style.fill = '#c91515';
    element.style.cursor = 'pointer';
    element.style.pointerEvents = 'all';
    element.style.filter = 'drop-shadow(0 0 2px #c91515)';
    element.style.transition = 'all 0.2s ease';
  };

  const resetStyle = (element: SVGGElement) => {
    // Semi-transparent white for default state
    element.setAttribute('fill', '#ffffff');
    element.setAttribute('fill-opacity', '0.41'); // 69 in hex = 0.41 in decimal
    element.setAttribute('stroke', '#ffffff');
    element.setAttribute('stroke-width', '0.5');
    
    // Clear all inline styles
    element.style.cssText = '';
    element.style.cursor = 'pointer';
    element.style.pointerEvents = 'all';
    element.style.transition = 'all 0.2s ease';
  };

  // Clear all selections
  const clearSelection = useCallback(() => {
    if (!svgContainerRef.current) return;
    
    const svgElement = svgContainerRef.current.querySelector('svg');
    if (!svgElement) return;

    const gTags = svgElement.querySelectorAll('g[fill]');
    gTags.forEach((g) => {
      resetStyle(g as SVGGElement);
    });

    setSelected(new Set());
  }, [gender]);

  return (
    <div className="w-full max-w-4xl p-6 mx-auto rounded-2xl bg-zinc-950 border border-zinc-800 text-slate-200 shadow-2xl backdrop-blur-md">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h3 className="text-lg font-semibold tracking-wide bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Advanced Muscle Activation Map
          </h3>
          <p className="text-xs text-zinc-500">
            {totalGroups} detailed muscle groups • Click to select/deselect
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex gap-2 items-center">
          {/* Gender Toggle */}
          <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs">
            <button 
              onClick={() => setGender('male')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                gender === 'male' 
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/50' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="10" cy="14" r="6"/>
                <line x1="14.5" y1="9.5" x2="20" y2="4"/>
                <line x1="17" y1="4" x2="20" y2="4"/>
                <line x1="20" y1="4" x2="20" y2="7"/>
              </svg>
              Male
            </button>
            <button 
              onClick={() => setGender('female')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                gender === 'female' 
                  ? 'bg-pink-500 text-black shadow-lg shadow-pink-500/50' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="6"/>
                <line x1="12" y1="14" x2="12" y2="22"/>
                <line x1="8" y1="18" x2="16" y2="18"/>
              </svg>
              Female
            </button>
          </div>
          
          <button 
            onClick={clearSelection}
            className="px-3 py-1.5 rounded-md font-medium text-xs bg-zinc-800 hover:bg-zinc-700 text-white transition-all border border-zinc-700"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* SVG Container */}
      <div 
        ref={svgContainerRef}
        className="w-full flex justify-center items-center bg-gradient-to-b from-zinc-900/30 to-transparent p-4 rounded-xl border border-zinc-900 [&_svg]:w-full [&_svg]:max-h-[600px] [&_svg_g]:pointer-events-auto"
        style={{ isolation: 'isolate' }}
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />

      {/* Status Bar */}
      <div className="mt-4 pt-4 border-t border-zinc-900 flex justify-between items-center text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_#ff0000]" />
          <span>
            Selected: <strong className="text-zinc-200">{selected.size}</strong> muscle groups
            {hoveredIndex !== null && (
              <span className="ml-2">
                • Hovering: <strong className="text-red-400">Group {hoveredIndex + 1}</strong>
              </span>
            )}
          </span>
        </div>
        <span className="text-[10px] font-mono text-zinc-600">
          ANATOMICAL v3.0 // {totalGroups} GROUPS // {gender.toUpperCase()}
        </span>
      </div>
    </div>
  );
}
