const ROOT_PATH = '/organization'

function Organization(server, db) {
  server.get({
    name: 'getOrganization',
    path: `${ROOT_PATH}/:id`
  }, async function (req, res, next) {

    const { id } = req.params

    try {
      res.send(await db.select({
        name: 'getOrganization',
        text: 'SELECT * FROM organization WHERE id=$1',
        values: [ id ]
      }))
      return next()
    } catch (err) {
      return next(err)
    }
  })
}

module.exports = Organization
