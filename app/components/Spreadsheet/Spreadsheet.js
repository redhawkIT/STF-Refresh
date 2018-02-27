import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import ReactDataSheet from 'react-datasheet'
// // Be sure to include styles at some point, probably during your bootstrapping
// import 'react-datasheet/lib/react-datasheet.css'

// const calculateTotal = (price, quantity, tax = 0) =>
//   (price * quantity) * (100 / tax)

class FinancialSpreadsheet extends React.Component {
  // headers = ['Name', 'Description', 'Price', 'Tax', 'Quantity', 'TOTAL']
  header = [
    { value: 'Name', readOnly: true },
    { value: 'Description / Vendor', readOnly: true },
    { value: 'Price', readOnly: true },
    { value: 'Tax', readOnly: true },
    { value: 'Quantity', readOnly: true },
    { value: 'TOTAL', readOnly: true }
  ]
  footer = [{value: 'Grand Total', readOnly: true, colSpan: 5}, {value: 0, readOnly: true}]
  constructor (props) {
    super(props)
    console.error(props)
    const { data, newData } = props
    /*
    serializeManifest:
    Denormalizes items from a manifest to confirm to react-datasheet's data scheme
    Scheme has records that are like [ {value}, {value}, {value}]...
    The final cell is a "summary" cell containing subtotals and item _ids for future ref
    */
    let transformedData = this.serializeManifest(data)
    console.warn('serializeManifest', transformedData)
    this.state = {
      grid: [
        [
          {value: 'Name', readOnly: true},
          {value: 'Description / Vendor', readOnly: true},
          {value: 'Price', readOnly: true},
          {value: 'Tax', readOnly: true},
          {value: 'Quantity', readOnly: true},
          {value: 'TOTAL', readOnly: true}
        ],
        // Final cell = subtotal
        [{value: 'Some Item', TEST: 'uuid'}, {value: 'Description Here'}, {value: 1}, {value: 10.1}, {value: 5}, {value: 0, readOnly: true}],
        [{value: 'Some Item'}, {value: 'Description Here'}, {value: 1}, {value: 10.1}, {value: 5}, {value: 0, readOnly: true}],
        [{value: 'Some Item'}, {value: 'Description Here'}, {value: 1}, {value: 10.1}, {value: 5}, {value: 0, readOnly: true}],
        [{value: 'Some Item'}, {value: 'Description Here'}, {value: 1}, {value: 10.1}, {value: 5}, {value: 0, readOnly: true}],
        [{value: 'Some Item'}, {value: 'Description Here'}, {value: 1}, {value: 10.1}, {value: 5}, {value: 0, readOnly: true}],
        // Final Row = Grand Total
        [{value: 'Grand Total', readOnly: true, colSpan: 5}, {value: 0, readOnly: true}]
      ]
    }
  }
  serializeManifest = (manifest) => {
    let data = []
    for (let item of manifest) {
      const { _id, name, price, tax, description, quantity } = item || {}
      //  Create a record in the order of headers
      const record = [name, description, price, tax, quantity]
        .map(value => ({ value }))
      // Push our "summary" cell, containing subtotals and the _id
      record.push({ _id, value: 0, readOnly: true })
      data.push(record)
    }
    //  Add Header / footer
    data.unshift(this.header)
    data.push(this.footer)
    return data
  }
  deserializeManifest = (data) => {
    console.warn('deserializeManifest - start', data)
    const rows = data.slice(1, data.length - 1)
    let normalizedData = []
    for (let row of rows) {
      const summaryCell = row.length - 1
      const [name, description, price, tax, quantity] = row.map(cell => cell.value)
      const { _id } = row[summaryCell]
      normalizedData.push({ _id, name, description, price, tax, quantity })
    }
    console.log('deserializeManifest - end', normalizedData)
    return data
  }
  onCellsChanged = (changes) => {
    const grid = this.state.grid.map(row => [...row])
    changes.forEach(({cell, row, col, value}) => {
      grid[row][col] = {...grid[row][col], value}
    })
    this.setState({grid})
  }
  calculateDataWithTotals () {
    const { grid } = this.state

    // Make a mutable copy of the grid with values only
    let rows = grid.slice(1, grid.length - 1)
    let footer = grid[grid.length - 1]

    // Update totals, incrementing a grandTotal counter at the same time.
    let grandTotal = 0
    for (let row of rows) {
      const summaryCell = row.length - 1
      const [name, description, price, tax, quantity] = row.map(cell => cell.value)
      const { _id } = row[summaryCell]
      console.error(row, _id)
      console.log({ _id, name, description, price, tax, quantity })
      const value = parseFloat(
          ((price * quantity) * ((tax / 100) + 1))
          .toFixed(2)
        )
      row[summaryCell] = { _id, value, readOnly: true }
      grandTotal += (value || 0)
    }
    // Update Grand Total
    footer[1] = { value: grandTotal, readOnly: true }
    return grid
  }
  render () {
    let data = this.calculateDataWithTotals()
    this.deserializeManifest(data)
    return (
      <div>
        <ReactDataSheet
          // data={this.state.grid}
          data={data}
          valueRenderer={(cell) => (cell.value).toString()}
          onContextMenu={(e, cell, i, j) => cell.readOnly ? e.preventDefault() : null}
          onCellsChanged={changes => {
            const grid = this.state.grid.map(row => [...row])
            changes.forEach(({cell, row, col, value}) => {
              grid[row][col] = {...grid[row][col], value}
            })
            this.setState({grid})
          }}
        />
      </div>
    )
  }
}

export default FinancialSpreadsheet

/*
constructor (props) {
  super(props)
  console.error(props)
  const { data, newData } = props

  function serializeManifest (manifest) {
    let data = []
    for (let item of manifest) {
      const { _id, name, price, tax, description, quantity } = item || {}
      //  Create a record in the order of headers
      const record = [name, description, price, tax, quantity]
        .map(value => ({ value }))
      // Push our "summary" cell, containing subtotals and the _id
      record.push({ _id, value: 0, readOnly: true })
      console.log(record)
      data.push(record)
    }
    // Add Header: [{ value: 'TITLE' }, ... ]
    data.unshift(
      this.headers.map(value => ({ value }))
    )
    // Add Footer w/ proper span
    data.push([
      { value: 'Grand Total', readOnly: true, colSpan: (this.headers.length - 1) },
      { value: 0, readOnly: true }
    ])
  }
  let transformedData = []
  for (let item of data) {
    const { _id, name, price, tax, description, quantity } = item || {}
    //  Create a record in the order of headers
    const record = [name, description, price, tax, quantity]
      .map(value => ({ value }))
    // Push our "summary" cell, containing subtotals and the _id
    record.push({ _id, value: 0, readOnly: true })
    console.log(record)
    transformedData.push(record)
  }
  // Add Header: [{ value: 'TITLE' }, ... ]
  transformedData.unshift(
    this.headers.map(value => ({ value }))
  )
  // Add Footer w/ proper span
  transformedData.push([
    { value: 'Grand Total', readOnly: true, colSpan: (this.headers.length - 1) },
    { value: 0, readOnly: true }
  ])
  console.error(transformedData)
  this.state = {
    grid: [
      [
        {value: 'Name', readOnly: true},
        {value: 'Description / Vendor', readOnly: true},
        {value: 'Price', readOnly: true},
        {value: 'Tax', readOnly: true},
        {value: 'Quantity', readOnly: true},
        {value: 'TOTAL', readOnly: true}
      ],
      // Final cell = subtotal
      [{value: 'Some Item', TEST: 'uuid'}, {value: 'Description Here'}, {value: 1}, {value: 10.1}, {value: 5}, {value: 0, readOnly: true}],
      [{value: 'Some Item'}, {value: 'Description Here'}, {value: 1}, {value: 10.1}, {value: 5}, {value: 0, readOnly: true}],
      [{value: 'Some Item'}, {value: 'Description Here'}, {value: 1}, {value: 10.1}, {value: 5}, {value: 0, readOnly: true}],
      [{value: 'Some Item'}, {value: 'Description Here'}, {value: 1}, {value: 10.1}, {value: 5}, {value: 0, readOnly: true}],
      [{value: 'Some Item'}, {value: 'Description Here'}, {value: 1}, {value: 10.1}, {value: 5}, {value: 0, readOnly: true}],
      // Final Row = Grand Total
      [{value: 'Grand Total', readOnly: true, colSpan: 5}, {value: 0, readOnly: true}]
    ]
  }
}
*/

/*
// const taxes = typeof types['tax'] === 'string'
// for (let row of rows) {
//   const price = row[types['price']]
//   const quantity = row[types['quantity']]
//   const subtotal = taxes
//     ? price * quantity * ((row[types['tax']] / 100) + 1)
//     : price * quantity
// }

// const types = {}
// for (const [index, cell] of grid[0].entries()) {
//   const type = cell.value.toLowerCase()
//   types[type] = index
// }
// console.log('TYPES', types)
// for (let row = 1; row < grid.length, row++) {
//   let subtotal = 0
//   subtotal += (row[types["price"]] * row[types["quantity"]) * (row[types["tax"]])
// }
// let rows = grid.slice()
// let header = rows.shift()
// const types = {}
// for (const [index, cell] of header.entries()) {
//   types[index] = cell.value.toLowerCase()
// }
// console.log('TYPES', types)
// const types = grid[0].map(cell => cell.value)
// Typemap becomes a map of enums to cell indexes for grid rows (e.g. row[1] is price, etc)

// Types - enums for row cells that can be referenced using a cell index
// const types = grid[0].map(cell => cell.value)

// for (let t)
// console.warn('TYPES', types)

// Calculate Subtotals using cell types (Price, Tax, Quantity)
// for (let row of grid) {
//   let subtotal = 0
//   const subtotalCell = row.length - 1
//   for (let cell = 0; cell < subtotalCell; cell++) {
//
//     if types[cell] === 'Tax' {
//
//     }
//     // let value = Number.parseFloat(row[cell].value)
//     // subtotal += (Number.isNaN(value) ? 0 : value)
//   }
//   console.log('SUBTOTAL', subtotal)
//   row[subtotalCell] = { value: subtotal, readOnly: true }
// }
//
// // Calculate Grand Total by reducing subtotals
// let grandTotal = 0
// const totalRowIndex = grid.length - 1
// const totalCellIndex = grid[totalRowIndex].length - 1
// for (let row of grid) {
//   const subtotalCell = row.length - 1
//   let value = Number.parseFloat(row[subtotalCell].value)
//   grandTotal += (Number.isNaN(value) ? 0 : value)
// }
// grid[totalRowIndex][totalCellIndex].value = grandTotal
*/
