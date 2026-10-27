export type ActivityStatus = 'disabled' | 'pending' | 'in_progress' | 'completed';

export interface CellChecklistState {
  completed: string[];
  na: string[];
}

export interface ActivityCell {
  id: string;
  rowId: string;
  rowName: string;
  colId: string;
  colCode: number;
  colName: string;
  initialStatus: ActivityStatus;
  status: ActivityStatus;
  isEditable: boolean;
}

export interface DiagramColumn {
  id: string;
  code: number;
  name: string;
  category: string;
}

export interface DiagramRow {
  id: string;
  name: string;
  group: string;
  order: number;
  page: number;
}

export interface DiagramSummary {
  totalActivities: number;
  disabledActivities: number;
  pendingActivities: number;
  inProgressActivities: number;
  completedActivities: number;
}

export interface DiagramData {
  title: string;
  sourceDocument: string;
  metadata: {
    totalRows: number;
    totalColumns: number;
    summary: DiagramSummary;
  };
  columns: DiagramColumn[];
  rows: DiagramRow[];
  cells: ActivityCell[];
}
