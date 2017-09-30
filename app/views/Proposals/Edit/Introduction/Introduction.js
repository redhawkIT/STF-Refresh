import React from 'react'
import PropTypes from 'prop-types'

import { compose, bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { Form, Icon, Input, AutoComplete, Checkbox, Button, Alert, message } from 'antd'
const FormItem = Form.Item
const connectForm = Form.create()

import { layout, feedback, help, rules, disableSubmit } from '../../../../util/form'
import api from '../../../../services'

@compose(
  connect(
    state => ({
      parent: state.db.proposal._id,
      title: state.db.proposal.title,
      category: state.db.proposal.category,
      organization: state.db.proposal.organization,
      categories: state.config
        ? state.config.enums.categories
        : [],
      uac: state.db.proposal.uac
    }),
    dispatch => ({ api: bindActionCreators(api, dispatch) })
  ),
  connectForm
)
class Introduction extends React.Component {
  static propTypes = {
    form: PropTypes.object,
    api: PropTypes.object,
    validate: PropTypes.func,
    parent: PropTypes.string,
    title: PropTypes.string,
    category: PropTypes.string,
    organization: PropTypes.string,
    uac: PropTypes.bool
  }
  componentDidMount () {
    const { form, title, category, organization, uac } = this.props
    if (title) {
      form.setFieldsValue({ title, category, organization, uac })
    }
    form.validateFields()
  }
  handleSubmit = (e) => {
    e.preventDefault()
    let { form, api, parent, validate } = this.props
    form.validateFields((err, values) => {
      if (!err) {
        const update = {
          proposal: (prev, next) => Object.assign({}, prev, values)
        }
        api.patch('proposal',
          { proposal: parent, ...values },
          { id: parent, update }
        )
        .then(message.success('Introduction updated!'))
        .catch(err => {
          message.warning('Introduction failed to update - Unexpected client error')
          console.warn(err)
        })
      }
    })
    validate()
  }

  render ({ form, categories, title, category, organization, uac } = this.props) {
    return (
      <div>
        <Alert type='info' banner
          message='Welcome to the 2017-2018 STF Proposal Application!'
          description={<span>Questions or feedback? We're here to help. E-mail the proposal officer, Katie, at <a href='mailto:STFAgent@uw.edu'>STFAgent@uw.edu</a> with any questions.</span>}
        />
        <h1>Introduction</h1>
        <Form onSubmit={this.handleSubmit}>
          <FormItem label='Title' {...layout} hasFeedback={feedback(form, 'title')} help={help(form, 'title')} >
            {form.getFieldDecorator('title', rules.required)(
              <Input type='textarea' />
            )}
          </FormItem>
          <FormItem label='Category' {...layout} hasFeedback={feedback(form, 'category')} help={help(form, 'category')} >
            {form.getFieldDecorator('category', rules.required)(
              <AutoComplete dataSource={categories} />
            )}
          </FormItem>
          <Alert type='warning'
            message='Tri-Campus Proposals'
            description='
            The Universal Access Committee reviews proposals for tri-campus projects. Select this if your proposal has been reviewed by an officer and approved as a tri-campus service. Please reach out to the Proposal Officer if you have any questions.'
          />
          <FormItem label='Universal Access' {...layout} >
            {form.getFieldDecorator('uac', { valuePropName: 'checked' })(
              // valuePropName is documented in the antd docs, that's a selector for switch vals.
              <Checkbox />
            )}
          </FormItem>
          <FormItem>
            <Button size='large' type='primary'
              htmlType='submit' disabled={disableSubmit(form)}
              style={{ width: '100%' }}
              ><Icon type='cloud-upload-o' />Update</Button>
          </FormItem>
        </Form>
      </div>
    )
  }
}

export default Introduction
