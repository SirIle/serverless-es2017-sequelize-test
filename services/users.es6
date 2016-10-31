import models from '../models'

export function users(event, context, cb) {
  context.callbackWaitsForEmptyEventLoop = false
  const userid = event.path.userid
  models.user.findOne( { where: { userid: userid },
    include: models.address } ).then( (user) => {
      if ( user ) cb(null, user)
      else cb( "[404] User " + userid + " not found", null)
    })
}
