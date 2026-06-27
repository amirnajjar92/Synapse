import { useState, useEffect } from 'react';

interface PlanTableRow {
  id: string | number;
  columns: string[];
}

interface PlanTable {
  id: string;
  title: string;
  rows: PlanTableRow[];
}

interface Plan {
  id: string;
  title: string;
  prompt: string;
  tables: PlanTable[];
  startDate: string | null;
}

interface TodayTableItem {
  category: string;
  task: string;
  icon?: string;
}

interface GroupedTodayTasks {
  [category: string]: TodayTableItem[];
}

export const useTodayTable = (
  plan: Plan | null,
  getCurrentDay: () => number
) => {
  const [todayTable, setTodayTable] = useState<TodayTableItem[]>([]);
  const [groupedTodayTable, setGroupedTodayTable] = useState<GroupedTodayTasks>({});
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentDayNumber = () => {
    return getCurrentDay();
  };

  const isRowRelevantToToday = (columns: string[]) => {
    const dayNumber = getCurrentDayNumber();
    const dayPatterns = [
      `day ${dayNumber}`,
      `day${dayNumber}`,
      `${dayNumber} day`,
      `day: ${dayNumber}`,
      `day. ${dayNumber}`,
    ];
    const lowerColumns = columns.map(c => c.toLowerCase());
    return lowerColumns.some(c => 
      dayPatterns.some(p => c.includes(p)) ||
      c.includes(`week ${Math.ceil(dayNumber / 7)}`)
    );
  };

  const processTablesWithAI = async (tables: PlanTable[], dayNumber: number) => {
    try {
      // Use analyse route which has OpenRouter fallback
      const apiUrl = '/api/ai/analyse';
      const systemPrompt = `You are a fitness planner assistant. Given plan tables and the current day number, extract ONLY today's relevant tasks and format them as JSON array with "category" (table title) and "task" (relevant cell content) properties. Return ONLY the JSON array, no extra text.`;
      
      const tablesData = tables.map(table => ({
        title: table.title,
        rows: table.rows.map(row => row.columns)
      }));
      
      const userPrompt = `Current day: ${dayNumber}. Plan tables: ${JSON.stringify(tablesData)}. Extract only today's relevant tasks.`;
      
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: `${systemPrompt}\n\n${userPrompt}` })
      });
      
      if (!res.ok) throw new Error('Failed to get today table');
      const data = await res.json();
      
      let tasks: TodayTableItem[] = [];
      try {
        tasks = JSON.parse(data.answer);
        if (!Array.isArray(tasks)) throw new Error('Not an array');
      } catch (parseError) {
        console.error('AI parse error:', parseError);
      }
      return tasks;
    } catch (err) {
      console.error('Error getting today table from AI:', err);
      return [];
    }
  };

  const generateTodayTable = async () => {
    if (!plan) {
      setTodayTable([]);
      return;
    }
    setIsLoading(true);
    try {
      const dayNumber = getCurrentDayNumber();
      
      // First try simple filtering
      let extracted: TodayTableItem[] = [];
      plan.tables.forEach(table => {
        table.rows.forEach(row => {
          if (isRowRelevantToToday(row.columns)) {
            const task = row.columns.find(c => 
              !c.toLowerCase().includes('day') && 
              !c.toLowerCase().includes('week') &&
              c.trim().length > 0
            ) || row.columns.join(' ');
            extracted.push({
              category: table.title,
              task: task.trim()
            });
          }
        });
      });

      // If simple filtering gave nothing, use AI
      if (extracted.length === 0) {
        extracted = await processTablesWithAI(plan.tables, dayNumber);
      }

      // If still nothing, fall back to default tasks
      if (extracted.length === 0) {
        extracted = [
          { category: 'General', task: 'Complete your daily workout' },
          { category: 'Nutrition', task: 'Follow your meal plan' },
          { category: 'Hydration', task: 'Drink enough water' }
        ];
      }

      setTodayTable(extracted);
      
      // Group tasks by category
      const grouped: GroupedTodayTasks = {};
      extracted.forEach(item => {
        if (!grouped[item.category]) {
          grouped[item.category] = [];
        }
        grouped[item.category].push(item);
      });
      setGroupedTodayTable(grouped);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateTodayTable();
  }, [plan]);

  return {
    todayTable,
    groupedTodayTable,
    isLoading,
    regenerate: generateTodayTable
  };
};
