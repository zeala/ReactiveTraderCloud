import * as AgGrid from 'ag-grid';

export const COLUMN_DEFINITIONS:AgGrid.ColDef[] = [
  {
    colId: 'tradeId',
    headerName: 'Trade ID',
    width: 105
  },
  {
    colId: 'date',
    headerName: 'Date',
    width: 150
  },
  {
    colId: 'direction',
    headerName: 'Direction',
    width: 105
  },
  {
    colId: 'CCY',
    headerName: 'CCYCCY',
    width: 105
  },
  {
    colId: 'notional',
    headerName: 'Notional',
    width: 105
  },
  {
    colId: 'rate',
    headerName: 'Rate',
    width: 105
  },
  {
    colId: 'status',
    headerName: 'Status',
    width: 105
  },
  {
    colId: 'valueDate',
    headerName: 'Value Date',
    width: 105
  },
  {
    colId: 'traderName',
    headerName: 'Trader',
    width: 105
  }
]
