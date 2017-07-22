import React from 'react'
import PropTypes from 'prop-types'

import ReactDOM from 'react-dom'

class EditorBase extends React.Component {
  getStyle () {
    return {
      width: '100%'
    }
  }
  getValue () {
    let updated = {}
    updated[this.props.column.key] = this.getInputNode().value
    return updated
  }
  getInputNode () {
    let domNode = ReactDOM.findDOMNode(this)
    if (domNode.tagName === 'INPUT') {
      return domNode
    }

    return domNode.querySelector('input:not([type=hidden])')
  }

  inheritContainerStyles () {
    return true
  }
}

EditorBase.propTypes = {
  onKeyDown: React.PropTypes.func.isRequired,
  value: React.PropTypes.any.isRequired,
  onBlur: React.PropTypes.func.isRequired,
  // column: React.PropTypes.shape(ExcelColumn).isRequired,
  commit: React.PropTypes.func.isRequired
}

class SimpleTextEditor extends EditorBase {
  render () {
    return (
      <input
        ref={node => this.input = node}
        type='text' onBlur={this.props.onBlur}
        className='form-control'
        defaultValue={this.props.value}
      />
    )
  }
}

export default SimpleTextEditor
