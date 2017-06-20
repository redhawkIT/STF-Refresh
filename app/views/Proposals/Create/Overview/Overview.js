import React from 'react'
import {Field, reduxForm} from 'redux-form'

import { Input } from '../../../../components/Form/Form'

import { Row, Col } from 'antd'

const impactTypes = [
  {
    title: 'Academic Experience',
    subtitle: 'How will this project enrich a student’s learning environment and experience?',
    field: 'academic'
  }, {
    title: 'Research Involvement',
    subtitle: 'Can this project be used for scholarly research?',
    field: 'research'
  }, {
    title: 'Career Development',
    subtitle: 'Can this technology be used to further a student’s career?',
    field: 'career'
  }
]

import styles from './Overview.css'
@reduxForm({
  form: 'create.body.overview',
  destroyOnUnmount: false,
  validate: (values) => {
    const errors = {}
    return errors
  }
})
class Overview extends React.Component {
  render ({handleSubmit, pristine, reset, submitting} = this.props) {
    return (
      <form onSubmit={handleSubmit}>
        <Row gutter={64}>
          <Col className='gutter-row' xs={24} md={12}>
            <h2>Abstract</h2>
            <p><em>
              A brief summary of the proposal and the technology being made available to students.
            </em></p>
            <Field name='abstract' component={Input} type='textarea' rows={6} autosize />
          </Col>
          <Col className='gutter-row' xs={24} md={12}>
            <h2>Key Objectives</h2>
            <p><em>
              The changes proposed and the desired outcome.
            </em></p>
            <Field name='objectives' component={Input} type='textarea' rows={6} autosize />
          </Col>
        </Row>
        <Row>
          <Col xs={24}>
            <h2>Core Justification</h2>
            <p><em>
              Briefly describe the outstanding student need for this technology and the justification for this project.
            </em></p>
            <Field name='justification' component={Input} type='textarea' rows={4} autosize />
          </Col>
        </Row>
        <Row gutter={32}>
          <Col xs={24}>
            <h2>Student Impact</h2>
            <p><em>
              Describe the impact on the student academic experience in the following areas. Not every proposal will affect all areas.
            </em></p>
          </Col>
          {impactTypes.map((impact, i) => (
            <Col key={i} className='gutter-row' xs={24} md={8}>
              <h3>{impact.title}</h3>
              <p className={styles['subtitle']}><em>{impact.subtitle}</em></p>
              <Field name={`impact.${impact.field}`} component={Input} type='textarea' rows={4} autosize />
            </Col>
          ))}
        </Row>
      </form>
    )
  }
}

export default Overview
