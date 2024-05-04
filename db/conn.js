const mongoose = require('mongoose')

return mongoose.connect(process.env.MONGO_URL).then((data)=>{
    console.log('connected')
}).catch((err)=>{
    console.log(err)
})