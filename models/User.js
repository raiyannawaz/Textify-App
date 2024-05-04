const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    confirmpassword: {
        type: String,
        required: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    date: {
        type: Date,
        default: Date.now()
    }
})

UserSchema.methods.generateAuthToken = async function(){
    let token = await jwt.sign({_id: this._id.toString()}, process.env.SECRET_KEY, {expiresIn: '30d'})

    this.tokens = this.tokens.concat({token})
    
    await this.save()
    
    return token
}

UserSchema.methods.comparePassword = async function(password){
    let comparePassword = await bcrypt.compare(password, this.password)
    return await comparePassword
}

UserSchema.pre('save', async function(next){
    if(this.isModified('password')){
        let hash = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, hash)
        this.confirmpassword = await bcrypt.hash(this.confirmpassword, hash)
    }
    next()
})

const User = new mongoose.model('user', UserSchema)

module.exports = User;