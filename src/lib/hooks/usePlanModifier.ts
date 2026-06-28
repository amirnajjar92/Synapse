'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { setPlanTypes } from '@/lib/redux/slices/planSlice';

interface PlanModifierState {
  planId: string | null;
  isSaving: boolean;
  lastError: string | null;
}

function getAuthHeaders() {
  const userStr = localStorage.getItem('synapse_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const urlParams = new URLSearchParams();
  if (user?.email) urlParams.set('email', user.email);
  return { urlParams, user };
}

async function patchPlan(planId: string, action: string, payload: Record<string, any>) {
  const { urlParams } = getAuthHeaders();
  const url = `/api/plans/${planId}?${urlParams.toString()}`;

  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `PATCH failed (${res.status})`);
  }

  return res.json();
}

function planApiToReduxTables(tables: any[]) {
  return tables.map((table: any, index: number) => ({
    id: index,
    title: table.title || `Table ${index + 1}`,
    icon: '',
    tableData: (table.rows || []).map((row: any, rowIndex: number) => ({
      id: row.id || rowIndex,
      columns: row.columns || [],
    })),
    columnWidths: table.columnWidths,
    horizontalScroll: table.horizontalScroll || false,
  }));
}

export default function usePlanModifier(planId: string | null) {
  const dispatch = useAppDispatch();
  const planTypes = useAppSelector((state) => state.plan.planTypes);

  const syncRedux = useCallback(
    async (planId: string) => {
      try {
        const { urlParams } = getAuthHeaders();
        const res = await fetch(`/api/plans/${planId}?${urlParams.toString()}`);
        if (!res.ok) return;
        const data = await res.json();
        const tables = planApiToReduxTables(data.plan?.tables || []);
        dispatch(setPlanTypes(tables));
      } catch (e) {
        console.error('Failed to sync plan to Redux:', e);
      }
    },
    [dispatch]
  );

  // Update a single cell value
  const updateCell = useCallback(
    async (tableIndex: number, rowIndex: number, colIndex: number, value: string) => {
      if (!planId) return;

      // Optimistic update
      const updated = planTypes.map((table, ti) => {
        if (ti !== tableIndex) return table;
        return {
          ...table,
          tableData: table.tableData.map((row, ri) => {
            if (ri !== rowIndex) return row;
            const cols = [...row.columns];
            cols[colIndex] = value;
            return { ...row, columns: cols };
          }),
        };
      });
      dispatch(setPlanTypes(updated));

      try {
        await patchPlan(planId, 'updateCell', { tableIndex, rowIndex, colIndex, value });
      } catch (e) {
        console.error('Failed to update cell:', e);
        syncRedux(planId);
      }
    },
    [planId, planTypes, dispatch, syncRedux]
  );

  // Update an entire row
  const updateRow = useCallback(
    async (tableIndex: number, rowIndex: number, columns: string[]) => {
      if (!planId) return;

      const updated = planTypes.map((table, ti) => {
        if (ti !== tableIndex) return table;
        return {
          ...table,
          tableData: table.tableData.map((row, ri) => {
            if (ri !== rowIndex) return row;
            return { ...row, columns };
          }),
        };
      });
      dispatch(setPlanTypes(updated));

      try {
        await patchPlan(planId, 'updateRow', { tableIndex, rowIndex, columns });
      } catch (e) {
        console.error('Failed to update row:', e);
        syncRedux(planId);
      }
    },
    [planId, planTypes, dispatch, syncRedux]
  );

  // Add a new row to a table
  const addRow = useCallback(
    async (tableIndex: number, columns?: string[]) => {
      if (!planId) return;

      const table = planTypes[tableIndex];
      if (!table) return;

      const newCols = columns || table.tableData[0]?.columns.map(() => '') || [];
      const tempId = Date.now();

      const updated = planTypes.map((t, ti) => {
        if (ti !== tableIndex) return t;
        return {
          ...t,
          tableData: [...t.tableData, { id: tempId, columns: newCols }],
        };
      });
      dispatch(setPlanTypes(updated));

      try {
        await patchPlan(planId, 'addRow', { tableIndex, columns: newCols });
        syncRedux(planId);
      } catch (e) {
        console.error('Failed to add row:', e);
        syncRedux(planId);
      }
    },
    [planId, planTypes, dispatch, syncRedux]
  );

  // Remove a row from a table
  const removeRow = useCallback(
    async (tableIndex: number, rowIndex: number) => {
      if (!planId) return;

      const updated = planTypes.map((t, ti) => {
        if (ti !== tableIndex) return t;
        return {
          ...t,
          tableData: t.tableData.filter((_, ri) => ri !== rowIndex),
        };
      });
      dispatch(setPlanTypes(updated));

      try {
        await patchPlan(planId, 'removeRow', { tableIndex, rowIndex });
      } catch (e) {
        console.error('Failed to remove row:', e);
        syncRedux(planId);
      }
    },
    [planId, planTypes, dispatch, syncRedux]
  );

  // Update a table's title
  const updateTableTitle = useCallback(
    async (tableIndex: number, title: string) => {
      if (!planId) return;

      const updated = planTypes.map((t, ti) => {
        if (ti !== tableIndex) return t;
        return { ...t, title };
      });
      dispatch(setPlanTypes(updated));

      try {
        await patchPlan(planId, 'updateTableTitle', { tableIndex, title });
      } catch (e) {
        console.error('Failed to update table title:', e);
        syncRedux(planId);
      }
    },
    [planId, planTypes, dispatch, syncRedux]
  );

  // Batch update all tables at once (for AI modifications)
  const batchUpdateTables = useCallback(
    async (newTables: { title: string; rows: { columns: string[] }[] }[]) => {
      if (!planId) return;

      try {
        const result = await patchPlan(planId, 'batchUpdate', { tables: newTables });
        if (result.plan) {
          const tables = planApiToReduxTables(result.plan.tables);
          dispatch(setPlanTypes(tables));
        }
      } catch (e) {
        console.error('Failed to batch update tables:', e);
        syncRedux(planId);
      }
    },
    [planId, dispatch, syncRedux]
  );

  // Get all tables as serializable data (for AI context)
  const getPlanSnapshot = useCallback(() => {
    return planTypes.map((table) => ({
      title: table.title,
      rows: table.tableData.map((row) => ({
        columns: row.columns,
      })),
    }));
  }, [planTypes]);

  return {
    updateCell,
    updateRow,
    addRow,
    removeRow,
    updateTableTitle,
    batchUpdateTables,
    getPlanSnapshot,
  };
}
