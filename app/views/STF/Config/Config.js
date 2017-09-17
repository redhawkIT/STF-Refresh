import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'

import { compose, bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { connectRequest } from 'redux-query'

import api from '../../../services'
import { updateConfig } from '../../../services/config'
import { layout, Label } from '../../../util/form'

import { Spin, Tabs, Form, Icon, Tooltip, Input, Select, Checkbox, Switch, Alert, message } from 'antd'
const TabPane = Tabs.TabPane
const Option = Select.Option
const FormItem = Form.Item
const connectForm = Form.create()

import Membership from './Membership/Membership'

import styles from './Config.css'
// @connect(state => ({ user: state.user }))
@compose(
  connect(
    state => ({
      user: state.user,
      id: state.config && state.config._id,
      enums: state.config && state.config.enums,
      submissions: state.config && state.config.submissions,
      news: state.config && state.config.news,
      timeline: state.config && state.config.timeline
    }),
    /*
    NOTE: state.config exists in an isomorphic context, loads before page render.
    As such, it has its own reducer - it just calls API services and updates itself with the response.
    */
    dispatch => ({ updateConfig: bindActionCreators(updateConfig, dispatch) })
  ),
  connectForm
)
class Config extends React.Component {
  static propTypes = {
    form: PropTypes.object,
    updateConfig: PropTypes.object,
    id: PropTypes.string,
    status: PropTypes.string,
    submissions: PropTypes.bool,
    enums: PropTypes.shape({
      categories: PropTypes.array,
      organizations: PropTypes.object,
      questions: PropTypes.shape({
        review: PropTypes.array
      })
    })
  }
  componentDidMount () {
    const { form, enums, submissions, news, timeline } = this.props
    if (form && enums) {
      const { organizations, categories, questions } = enums
      const orgCodeMap = Object.keys(organizations)
        .map(key => `${key}:${organizations[key]}`)
      form.setFieldsValue({
        submissions,
        news,
        timeline,
        categories,
        reviewQuestions: questions.review,
        organizations: orgCodeMap
      })
    }
  }
  handleSubmissions = (submissions) => {
    const { updateConfig, id } = this.props
    updateConfig({ submissions }, { id })
  }
  handleNews = (news) => {
    const { updateConfig, id } = this.props
    updateConfig({ news }, { id })
  }

  handleTimeline = (timeline) => {
    const { updateConfig, id } = this.props
    updateConfig({ timeline }, { id })
  }

  handleOrganizations = (encodedOrgData) => {
    //  De-encode org data, transform into obj
    const organizations = {}
    for (const encoded of encodedOrgData) {
      const [org, code] = encoded.split(':')
      organizations[org] = code || ''
    }
    const { updateConfig, id } = this.props
    //  Immutability magic
    let enums = Object.assign({}, this.props.enums)
    enums.organizations = organizations
    updateConfig({ enums }, { id })
  }

  handleCategories = (categories) => {
    const { updateConfig, id } = this.props
    //  Immutability magic
    let enums = Object.assign({}, this.props.enums)
    enums.categories = categories
    updateConfig({ enums }, { id })
  }

  handleQuestions = (questions) => {
    const { updateConfig, id } = this.props
    //  Immutability magic
    let enums = Object.assign({}, this.props.enums)
    enums.questions.review = questions
    updateConfig({ enums }, { id })
  }

  render ({ router, form, id, enums } = this.props) {
    return (
      <article className={styles['article']}>
        <Helmet title='Site Config' />
        {!id
          ? <Spin size='large' tip='Loading...' />
          : <div id={id}>
            <h1>Web Configuration</h1>
            <h6>Here be dragons...</h6>
            <h1 className='demo-note' style={{ color: 'goldenrod' }}>BUG</h1>
            <p className='demo-note' style={{ color: 'goldenrod' }}>This page fails to load properly if you go directly to it, because the site loads a ton of configuration pieces over time. I am working on a fix, but the fix I need to put in requires a lot of testing, so I've put that on the back burner.</p>
            <p>Please be advised that changes go into effect IMMEDIATELY, users will experience the change after refreshing their page.</p>
            <hr />
            <FormItem {...layout} label='Submissions'>
              {form.getFieldDecorator('submissions', { valuePropName: 'checked' })(
                <Switch onChange={this.handleSubmissions}
                  checkedChildren='Open' unCheckedChildren='Closed'
                />
              )}
            </FormItem>
            <FormItem {...layout} label='News'>
              {form.getFieldDecorator('news')(
                <Input type='textarea' rows={6} onPressEnter={(e) => this.handleNews(e.target.value)} />
              )}
            </FormItem>
            <FormItem {...layout} label={<Label title='Timeline Points'
              message={'Add or remove timeline points from the frontpage. The last elementa added is shown as the pending or upcoming event..'} />}
            >
              {form.getFieldDecorator('timeline')(
                <Select mode='tags' onChange={this.handleTimeline} />
              )}
            </FormItem>
            <FormItem {...layout} label={<Label title='Organizations'
              message={'This includes budget codes as well, separated by a colon. Format: <name>:<budgetcode>'} />}
            >
              {form.getFieldDecorator('organizations')(
                <Select mode='tags' onChange={this.handleOrganizations}>
                  { //  Organizations are encoded as a string map for ease of use.
                    Object.keys(enums.organizations)
                    .map(key => (
                      <Option key={`${key}:${enums.organizations[key]}`}>
                        {`${key}:${enums.organizations[key]}`}
                      </Option>
                    ))}
                </Select>
              )}
            </FormItem>
            <FormItem {...layout} label={<Label title='Categories'
              message={'Proposal categories. Adding categories is irreversible'} />}
            >
              {form.getFieldDecorator('categories')(
                <Select mode='tags'
                  onChange={this.handleCategories}
                >
                  {enums.categories && enums.categories
                    .map(cat => (
                      <Option disabled key={cat}>{cat}</Option>
                    ))}
                </Select>
              )}
            </FormItem>
            <FormItem {...layout} label={<Label title='Review Questions'
              message={'Add or remove review / metrics questions. These are best kept brief, without symbols.'} />}
            >
              {form.getFieldDecorator('reviewQuestions')(
                <Select mode='tags'
                  onChange={this.handleQuestions}
                >
                  {enums.questions.review && enums.questions.review
                    .map(prompt => (
                      <Option key={prompt}>{prompt}</Option>
                    ))}
                </Select>
              )}
            </FormItem>
            <Membership />
          </div>
          }
      </article>
    )
  }
}
export default Config
