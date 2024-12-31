const express = require('express');
const app = express();
//Getting Express

const path = require('path');
// Getting Path

const userModel = require('./models/user');
const postModel = require('./models/post');
// Getting Models

const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
// Getting JWT, Cookie Parser, Bcrypt

const upload = require('./config/multerconfig');
const user = require('./models/user');
// require multer

app.set('view engine', 'ejs');
// Setting up view engine

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Using Mongoose Features

app.use(express.static(path.join(__dirname, 'public')));
// Using Static Files in Path

app.use(cookieParser());
// Using CookieParser

app.get('/', (req, res) => {
    let userData = req.cookies.token;
    res.render('index', { userData });
});

app.get('/edit/:id', async (req, res)=>{
    let user = await postModel.findOne({_id: req.params.id}).populate('user');
    res.render('edit', {user})
})

app.get('/uploadpic', isLoggedIn ,(req, res)=>{
    res.render('uploadpic')
})

app.post('/upload', isLoggedIn, upload.single('image'), async (req, res)=>{
    let user = await userModel.findOne({email: req.user.email})
    user.profilepic = req.file.filename;
    await user.save()
    res.redirect('/profile')
    
})

app.get('/404', (req, res)=>{
    res.render('error');
});

    
    let user = await userModel.findOne({ email: req.user.email }).populate('posts');
    if (!user) {
        return res.redirect('/404'); 
    }
    
    res.render('profile', { user })

app.get('/logout', (req, res)=>{
    res.clearCookie('token');
    res.redirect('/')
})

app.get('/blog', async (req, res)=>{
    let post = await postModel.find()
    res.render('blog', {post})
})

app.get('/delete/:id', async (req, res)=>{
    let deleteduser = await postModel.findOneAndDelete({_id: req.params.id}).populate('user');
    res.redirect('/profile')
})


app.post('/update/:id', async (req, res)=>{
    let updatedPost = await postModel.findOneAndUpdate({_id: req.params.id },{
       text: req.body.text,
       image: req.body.image
    })
    res.redirect('/profile')
})

app.post('/create', async (req, res)=>{
    let {username, email, password} = req.body;

    let user = await userModel.findOne({email});
    if(user) return res.redirect('/404');

    bcrypt.genSalt(10, (err, salt)=>{
        bcrypt.hash(password, salt, async (err, hash)=>{
            let createdUser = await  userModel.create({
                username,
                email,
                password: hash,
            });
            let token = jwt.sign({email, userid: createdUser._id}, 'exponents');
            res.cookie('token', token);
            res.redirect('/profile');
            });
        });
});

app.post('/login', async(req,res)=>{
    let {email, password} = req.body;

    let user = await userModel.findOne({email});

    if(!user) return res.redirect('/404');
    bcrypt.compare(password, user.password, (err, result)=>{

        if(result){
            let token = jwt.sign({email}, 'exponents')
            res.cookie('token', token)

            res.redirect('/profile')
        }
            else{ 
            res.redirect('/404');
        }
    })
})

app.post('/post', isLoggedIn, async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email }); 
    if (!user) {
        return res.redirect('/404');
    }
    let { text, image } = req.body;
    let post = await postModel.create({
        user: user._id,
        username: user.username,
        text,
        image,
    });
    user.posts.push(post._id)
    await user.save()

    res.redirect('/profile');
});

function isLoggedIn(req, res, next){
    if (!req.cookies.token) {
    return res.redirect('/404')
    }
    try {
        let data = jwt.verify(req.cookies.token, 'exponents');
        req.user = data
        next();
    }
    catch(error){
        res.redirect('/404')
    }
}
// Middleware

app.listen(3000);
//Server Starting Port