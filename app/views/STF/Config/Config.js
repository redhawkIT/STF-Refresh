import React from 'react'
import PropTypes from 'prop-types'

import { compose, bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { connectRequest } from 'redux-query'

import api from '../../../services'
import { layout } from '../../../util/form'

import { Tabs, Form, Input, Select, Checkbox, Switch, Alert, message } from 'antd'
const TabPane = Tabs.TabPane
const Option = Select.Option
const FormItem = Form.Item
const connectForm = Form.create()

import styles from './Config.css'
// @connect(state => ({ user: state.user }))
@compose(
  connect(
    state => ({
      user: state.user,
      id: state.db.config && state.db.config._id,
      submissions: state.db.config && state.db.config.submissions,
      organizations: state.db.config && state.db.config.organizations,
      announcements: state.db.config && state.db.config.announcements,
      stage: state.db.config && state.db.config.stage
    }),
    dispatch => ({ api: bindActionCreators(api, dispatch) })
  ),
  connectForm
)
class Config extends React.Component {
  componentDidMount () {
    //  Take contacts, make an object with role-to-signature bool, use this to set initial vals.
    const { form, submissions, organizations } = this.props
    if (form) {
      form.setFieldsValue({ submissions, organizations })
    }
  }
  handleSubmissions = (submissions) => {
    const { api, id } = this.props
    const update = {
      config: (prev, next) => Object.assign(prev, { submissions: next.submissions })
    }
    api.patch('config', { submissions }, { id, update })
    .then(message.warning(`Proposal submissions are now ${submissions ? 'open' : 'closed'}!`), 10)
    .catch(err => {
      message.warning(`Failed to update - client error`)
      console.warn(err)
    })
  }
  handleOrganizations = (organizations) => {
    const { api, id } = this.props
    const update = {
      config: (prev, next) => Object.assign(prev, { organizations: next.organizations })
    }
    api.patch('config', { organizations }, { id, update })
    .then(message.warning(`Updated organizations!`), 10)
    .catch(err => {
      message.warning(`Failed to update - client error`)
      console.warn(err)
    })
  }
  render ({ form, organizations } = this.props) {
    return (
      <article className={styles['article']}>
        <h1>Web Configuration</h1>
        <h6>Here be dragons.</h6>
        <p>Here you can update various configuration settings for the website, such as opening/closing proposal submissions, editing announcements, updating the pre-selected list of campus organizations, modifying access permissions for STF members, etc.</p>
        <p>Please be advised that changes go into effect IMMEDIATELY, users will experience the change after refreshing their page.</p>
        <h2>Announcements</h2>
        <FormItem label='Submissions' {...layout} >
          {form.getFieldDecorator('submissions', { valuePropName: 'checked' })(
            <Switch onChange={(checked) => this.handleSubmissions(checked)}
              checkedChildren='Open' unCheckedChildren='Closed'
            />
          )}
        </FormItem>
        <FormItem label='Organizations' {...layout} >
          {form.getFieldDecorator('organizations')(
            <Select mode='tags' placeholder='Type the name of an organization to add'
              onChange={(organizations) => this.handleOrganizations(organizations)}
            >
              {organizations && organizations.map(org => <Option key={org}>{org}</Option>)}
            </Select>
          )}
        </FormItem>
        <h2>Adjust Members</h2>
      </article>
    )
  }
}
Config.propTypes = {
  form: PropTypes.object,
  api: PropTypes.object,
  id: PropTypes.string,
  submissions: PropTypes.array,
  organizations: PropTypes.array,
  announcements: PropTypes.array,
  status: PropTypes.string
}
export default Config
