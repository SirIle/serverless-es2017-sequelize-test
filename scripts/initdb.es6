import models from '../models'
import fs from 'fs'

insertUsers()

async function insertUsers() {
  await models.sequelize.sync( { force:true } )
  const users = JSON.parse( fs.readFileSync('testdata/users.json','utf-8') )
  for (const user of users) {
    await models.user.create( user, { include: models.address } )
  }
  models.sequelize.close()
}
