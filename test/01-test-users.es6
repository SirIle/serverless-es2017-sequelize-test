import child_process from 'child_process'
import chai from 'chai'

const should = chai.should()
const COMMAND = 'docker run --rm -v \"$PWD\":/var/task -e NODE_ENV=dockerlambda ' +
  '--network lambda lambci/lambda services/users.users '
const USER1 = '\'{"path":{"userid":"user1"}}\''
const USER3 = '\'{"path":{"userid":"user3"}}\''

describe('if the user exists', () => {
  const user1 = JSON.parse( child_process.execSync(COMMAND + USER1).toString() )
  it('returns a JSON object for the user', (done) => {
    user1.userid.should.equal('user1')
    user1.lastname.should.equal('Lastname1')
    done()
  })
})

describe('if the user does not exist', () => {
  try {
    // As a non-success return code always throws, handle it inside catch
    child_process.execSync(COMMAND + USER3)
  } catch(err) {
    it('returns an error message', (done) => {
      const msg = JSON.parse(err.stdout)
      msg.errorMessage.should.equal('[404] User user3 not found')
      done()
    })
  }
})
