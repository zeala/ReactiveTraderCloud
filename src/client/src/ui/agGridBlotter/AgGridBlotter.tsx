import * as React from 'react';
import { AgGridReact } from 'ag-grid-react';
import {COLUMN_DEFINITIONS} from "./agGridBlotterUtils";
import './agGridBlotter.scss';
import 'ag-grid/dist/styles/ag-grid.css';
import '../../agGridEnterprise';

interface AgGridBlotterProps {
  rows: any[];
}

export default class AgGridBlotter extends React.Component<AgGridBlotterProps, {}> {

  render () {
    return <div className='agGridBlotter-container'>
      <AgGridReact columnDefs={COLUMN_DEFINITIONS} rowData={[]}/>
    </div>
  }
}
