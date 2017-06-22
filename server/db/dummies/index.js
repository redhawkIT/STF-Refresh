import config from 'config'

import dummyContacts from './contact'
import dummyAmendments from './amendment'
import dummyBlocks from './block'
import dummyProjects from './project'
import dummyComments from './comment'
import dummyDecisions from './decision'
import dummyItems from './item'
import dummyUsers from './user'
import dummyReports from './report'
import dummyManifests from './manifest'
import dummyReviews from './review'
import dummyProposals from './proposal'
 // For faking Object ID's. THESE WILL BE RANDOM AND NOT POINT TO REAL DATA.

export default function () {
  const min = config.has('lorem-ipsum') ? config.get('lorem-ipsum') : 5 // default
  console.log(`SEED: Lorem Ipsum Mode enabled. Seeding up to ${min} documents each...`)

  //  Auth and User data
  dummyUsers(min)
  dummyContacts(min)
  //  Community content (mostly endorsements)
  dummyComments(min)
  //  Proposals
  dummyProposals(min)
  dummyProjects(min)
  dummyAmendments(min)
  dummyManifests(min)
  dummyItems(min)
  dummyBlocks(min)
  //  Proposal Meta
  dummyReviews(min)
  dummyDecisions(min)
  dummyReports(min)
}
