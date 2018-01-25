import * as React from 'react'
import sizeMe from 'react-sizeme'

import { connect } from 'react-redux'
import { blotterRegionsSettings } from './blotterOperations'
import { openWindow, addRegion } from '../../regions/regionsOperations'
//import Blotter from './Blotter'
import AgGridBlotter from '../agGridBlotter/AgGridBlotter';

class BlotterContainer extends React.Component<any, {}> {

  static contextTypes = {
    openFin: React.PropTypes.object,
  }

  public componentDidMount() {
    this.props.onComponentMount()
  }

  public render() {
    const trades = this.props.blotterService.trades
    const openFin = this.context.openFin
    const gridRows =  _.values(trades).reverse()
    return (
      <div className="shell_workspace_blotter">
        <AgGridBlotter
          rows={gridRows}
          onPopoutClick={this.props.onPopoutClick(openFin)}
          canPopout={true}/>
      </div>
    )
  }
}

const mapStateToProps = ({ blotterService, compositeStatusService }) => {
  const isConnected =  compositeStatusService && compositeStatusService.blotter && compositeStatusService.blotter.isConnected || false
  return { blotterService, isConnected }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onPopoutClick: (openFin) => {
      return () => {
        dispatch(openWindow(blotterRegion, openFin))
      }
    },
    onComponentMount: () => {
      dispatch(addRegion(blotterRegion))
    },
  }
}

const ConnectedBlotterContainer = connect(mapStateToProps, mapDispatchToProps)(sizeMe({ monitorHeight: true })(BlotterContainer))

const blotterRegion = {
  id: 'blotter',
  isTearedOff: false,
  container: ConnectedBlotterContainer,
  settings: blotterRegionsSettings,
}

export default ConnectedBlotterContainer
