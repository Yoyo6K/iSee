isAdmin = async (req, res, next) => {

    try {
        if (req.user.isAdmin == true) {
            next()
          } else {
            return res.status(403).send('You don\'t have permissions')
          }
    } catch (error) {
        return res.status(500).send(error)
    }

};

module.exports = isAdmin;