import * as React from 'react'
import * as ReactDOM from 'react-dom'
import './filters.scss'
import { ColDef, Column, GridApi, InMemoryRowModel, RowNode } from 'ag-grid'

interface CurrencyFilterProps {
  api: GridApi
  colDef: ColDef
  column: Column
  rowModel: InMemoryRowModel
  valueGetter: (node) => any
  filterChangedCallback: () => any
}

interface CurrencyFilterState {
  text: string
  selectedFreeText: string
  selectedValueSet: {}
}

export default class CurrencyFilter extends React.Component<CurrencyFilterProps, CurrencyFilterState> {
  constructor(props) {
    super(props)

    this.state = {
      text: '',
      selectedFreeText: '',
      selectedValueSet: {}
    }
  }

  isFilterActive() {

    const uniquOptions = Object.values(this.getUniqueValues())
    const selectedOptions = Object.values(this.state.selectedValueSet)
    return this.state.text !== null
            && this.state.text !== undefined
            && this.state.text !== ''
            && uniquOptions.length !== selectedOptions.length
  }

  doesFilterPass(params) {

    const value = this.props.valueGetter(params.node)
    const doesTextFilterPass = this.state.text.toLowerCase()
      .split(' ')
      .every((filterWord) => {
        return value.toString().toLowerCase().indexOf(filterWord) >= 0
      })

    //
    const doesOptionsFilterPass = !!this.state.selectedValueSet[value]
    return doesTextFilterPass || doesOptionsFilterPass
  }

  getModel() {
    const model = { value: `${this.state.text}` }
    return model
  }

  setModel(model) {
    this.setState({ text: model ? model.value : '' })
  }

  afterGuiAttached(params) {
    this.focus()
  }

  focus() {
    setTimeout(() => {
      const container = ReactDOM.findDOMNode(this.refs.input) as HTMLElement
      if (container) {
        container.focus()
      }
    })
  }

  onTextChange = (event) => {
    const newValue = event.target.value
    this.setState({ selectedFreeText: newValue }, () => this.updateFilter())
  }

  onOptionSelectChange = (event, value: string) => {
    const target:HTMLInputElement = event.target as HTMLInputElement
    const updatedValueSet = { ...this.state.selectedValueSet }
    updatedValueSet[value] = target.checked
    this.setState({ selectedValueSet: updatedValueSet }, () => this.updateFilter())

  }

  updateFilter = () => {
    const freeText = this.state.selectedFreeText
    const options = this.state.selectedValueSet

    const newSelectedValueSet = [freeText]
    for (const key in options) {
      if (options[key] === true) {
        newSelectedValueSet.push(key)
      }
    }
    const newFilterText = newSelectedValueSet.join(' ')

    console.log(' ::: new filterText : ', newFilterText)
    if (this.state.text !== newFilterText) {
      this.setState({
        text: newFilterText
      }, () => {
        console.log(' --- after refresh ,state, text : ', this.state.text)
        this.props.api.refreshView()
        this.props.filterChangedCallback()
      })

    }
  }

  getUniqueValues = ():any[] => {

    const uniqueValuesMap = {}
    const rowModel = this.props.api.getModel()
    if (!rowModel) {
      return []
    }
    rowModel.forEachNode((rowNode:RowNode) => {
      const value = this.props.valueGetter(rowNode)
      uniqueValuesMap[value] = value
    })
    return Object.values(uniqueValuesMap)
  }

  getFilteredValues = ():any => {

    const filterModel = this.props.api.getFilterModel()
    return filterModel[this.props.colDef.colId]
  }

  isOptionSelected = (value:string) => {
    const filteredValues = this.getFilteredValues()
    return filteredValues

  }

  render() {

    console.log(' ********** RENDER, this.state.text : ', this.state.text)
    this.getFilteredValues()
    const uniqueValues = this.getUniqueValues()
    const setOptions = uniqueValues.map((value:string) => {
      return <div>
        <input key={value}
               type="checkbox"
               onChange={(event) => this.onOptionSelectChange(event, value)}/>
          {value}
        </div>
    })
    return (
      <div className="filter-container">
        <div className="filter-container__tab">
          <div className="filter-container__tab-icon"></div>
        </div>
      <div className="filter-container__content-wrapper">
        Filter:
        <input style={{ height: '20px', width: '100px' }}
               ref="input"
               value={this.state.selectedFreeText}
               onChange={this.onTextChange}
               className="form-control"/>

        <div>
          { setOptions }
        </div>
      </div>


      </div>
    )
  }
}
