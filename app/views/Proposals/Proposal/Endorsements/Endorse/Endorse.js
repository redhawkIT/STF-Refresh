import React from 'react'
import PropTypes from 'prop-types'

import { compose, bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { Form, Input, Button, message } from 'antd'
const FormItem = Form.Item
const connectForm = Form.create()

import { layout, feedback, help, rules, disableSubmit } from '../../../../../util/form'
import api from '../../../../../services'

// import styles from './Body.css'
@compose(
  connect(
    state => ({
      proposal: state.db.proposal._id,
      user: state.user._id
    }),
    dispatch => ({ api: bindActionCreators(api, dispatch) })
  ),
  connectForm
)
class Endorse extends React.Component {
  // Disable submit button at the beginning by running validation.
  componentDidMount () { this.props.form.validateFields() }
  handleSubmit = (e) => {
    e.preventDefault()
    let { proposal, user, api, form } = this.props
    form.validateFields((err, values) => {
      if (!err) {
        const comment = { proposal, user, ...values }
        //  Immutable update.
        const update = { proposal: (prev, next) =>
            Object.assign({}, prev, { comments: [...prev.comments, comment] })
        }
        api.post('comments', comment, { update })
        .then(message.success('Endorsement posted!'))
        .catch(err => {
          message.error('An error occured - Failed to post endorsement.')
          console.warn(err)
        })
      }
    })
  }

  render ({ form } = this.props) {
    return (
      <div>
        <h1>Endorse this proposal!</h1>
        <Form onSubmit={this.handleSubmit}>
          <FormItem label='Title' {...layout} hasFeedback={feedback(form, 'title')} help={help(form, 'title')} >
            {form.getFieldDecorator('title', rules.required)(
              <Input type='textarea' />
            )}
          </FormItem>
          <FormItem label='Comment' {...layout} hasFeedback={feedback(form, 'body')} help={help(form, 'body')} >
            {form.getFieldDecorator('body', rules.required)(
              <Input type='textarea' rows={6} />
            )}
          </FormItem>
          <FormItem>
            <Button size='large' type='primary'
              htmlType='submit' disabled={disableSubmit(form)}
            >Update</Button>
          </FormItem>
        </Form>
      </div>
    )
  }
}

Endorse.propTypes = {
  proposal: PropTypes.string,
  user: PropTypes.string,
  api: PropTypes.object,
  form: PropTypes.object
}
export default Endorse
// const EndorseForm = Form.create()(Endorse)
// export default EndorseForm
