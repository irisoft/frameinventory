const okta = require('@okta/okta-sdk-nodejs');
const ROOT_PATH = '/organization'

const client = new okta.Client({
  orgUrl: 'https://dev-924982.oktapreview.com/',
  token: '00i3aevIpKbqi0-ZI0swIyWl45t1tQ85gJ9NS8gg4U'
})

function Organization(server, db) {
  server.get({
    name: 'getOrganization',
    path: `${ROOT_PATH}/:id`
  }, async function (req, res, next) {

    const { id } = req.params

    try {
      res.send(await client.getGroup(id))
      return next()
    } catch (err) {
      return next(err)
    }
  })

  server.post({
    name: 'createOrganization',
    path: `${ROOT_PATH}`
  }, async function(req, res, next) {

    const {
      orgName,
      firstName,
      lastName,
      email,
      password
    } = req.params

    const newGroup = {
      profile: {
        name: orgName
      }
    }

    const newUser = {
      profile: {
        firstName,
        lastName,
        email,
        login: email,
      },
      credentials: {
        password : {
          value: password
        }
      }
    }

    try {
      const [ group, user ] = await Promise.all([ client.createGroup(newGroup), client.createUser(newUser) ])
      await user.addToGroup(group.id)

      /*
      {
        "id": "00ub0oNGTSWTBKOLGLNR",
        "status": "STAGED",
        "created": "2013-07-02T21:36:25.344Z",
        "activated": null,
        "statusChanged": null,
        "lastLogin": null,
        "lastUpdated": "2013-07-02T21:36:25.344Z",
        "passwordChanged": null,
        "profile": {
          "firstName": "Isaac",
          "lastName": "Brock",
          "email": "isaac.brock@example.com",
          "login": "isaac.brock@example.com",
          "mobilePhone": "555-415-1337"
        },
        "credentials": {
          "provider": {
            "type": "OKTA",
            "name": "OKTA"
          }
        },
        "_links": {
          "activate": {
            "href": "https://dev-924982.oktapreview.com/api/v1/users/00ub0oNGTSWTBKOLGLNR/lifecycle/activate"
          }
        }
      }
      */

      res.send({ group, user })
      return next()
    } catch(err) {
      return next(err)
    }
  })
}

module.exports = Organization
