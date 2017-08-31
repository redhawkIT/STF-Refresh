import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import { compose, bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { connectRequest, requestAsync, mutateAsync } from 'redux-query'

import api from '../../../../services'

import { Link } from 'react-router'
import { Spin, Table, Switch, AutoComplete, message } from 'antd'
const Option = AutoComplete.Option

const addAuth = (body, update) => mutateAsync({
  url: `${api.endpoint}/stf/`,
  options: { method: 'POST' },
  transform: res => ({ users: res }),
  body,
  update
})
const toggle = (id, body, update) => mutateAsync({
  url: `${api.endpoint}/stf/${id}`,
  options: { method: 'PATCH' },
  transform: res => ({ users: res }),
  body,
  update
})

@compose(
  connect(
    //  Committee members vs. potential members to add.
    state => ({
      committee: Array.isArray(state.db.users)
      ? state.db.users.filter(user => user.stf !== null)
      : [],
      users: Array.isArray(state.db.users)
        ? state.db.users.filter(user => user.stf === null)
        : []
    }),
    //  NOTE: Bind custom mutators to deal with plurality constraints for the 'stf' controller.
    dispatch => ({
      api: bindActionCreators({toggle, addAuth, ...api}, dispatch)
    })
),
  connectRequest(() => api.get('users'))
)
class Membership extends React.Component {
  constructor (props) {
    super(props)
    this.columns = [{
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    }, {
      title: 'NetID',
      dataIndex: 'netID',
      key: 'netID',
      width: 100
    }, {
      title: 'Officio',
      dataIndex: 'stf.spectator',
      key: 'stf.spectator',
      render: (text, record, index) => <Switch checked={text} onChange={spectator => this.handleToggle({ spectator }, record, index)} />,
      width: 65
    }, {
      title: 'Member',
      dataIndex: 'stf.member',
      key: 'stf.member',
      render: (text, record, index) => <Switch checked={text} onChange={member => this.handleToggle({ member }, record, index)} />,
      width: 80
    }, {
      title: 'Admin',
      dataIndex: 'stf.admin',
      key: 'stf.admin',
      render: (text, record, index) => <Switch checked={text} onChange={admin => this.handleToggle({ admin }, record, index)} />,
      width: 65
    }
    ]
  }
  handleAddMember = (user) => {
    const { api } = this.props
    const body = { user, spectator: false, member: false, admin: false }
    console.log(body)
    const update = { users: (prev, next) => {
      let newData = prev.slice()
      //  If we got a valid response (contains an STF auth object)
      if (typeof next === 'object') {
        //  Find the user's data within our list of members. Complete the object via merge, add to our user list
        let index = newData.findIndex(member => member._id === next.user)
        Object.assign(newData[index], { stf: next })
      }
      return newData
    }}
    api.addAuth(body, update)
  }
  handleToggle = (change, record, index) => {
    //  Assign the change to a body, send it to the server.
    const { api } = this.props
    const body = Object.assign(record.stf, change)
    const id = body._id
    // // Update the record at the table's index
    const update = { users: (prev, next) => {
      return prev
    }}
    api.toggle(id, body, update)
  }
  render (
    { columns } = this,
    { committee, users } = this.props
  ) {
    return (
      <section>
        <h1>Committee Membership</h1>
        <h6>WARNING: Reviews are tied to author accounts</h6>
        <p>Adjusting membership will alter the visibility of their voting record.</p>
        {!committee
          ? <Spin size='large' tip='Loading...' />
          : <Table dataSource={committee} sort pagination={false}
            size='middle'
            columns={columns}
            footer={() =>
              <div>
                <h6>Add Members:</h6>
                <AutoComplete style={{ width: 250 }}
                  placeholder='Add a user to the STF...'
                  onSelect={this.handleAddMember}
                  >
                  {users.map(user => <Option key={user._id}>{`${user.name} (${user.netID})`}</Option>)}
                </AutoComplete>
                <p>
                  You may add any user to the committee (not necessarily with any auth level), as long as they have logged into the website before. This is irreversible.
                </p>
              </div>
            }
          />
        }
      </section>
    )
  }
}
Membership.propTypes = {
  api: PropTypes.object,
  manifests: PropTypes.array,
  screen: PropTypes.object
}
export default Membership
