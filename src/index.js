// MODULES
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const exphbs = require('express-handlebars');
const session = require('express-session');
const validator = require('express-validator');
const passport = require('passport');
const flash = require('connect-flash');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');

const {database} = require('./keys');

// Inits
const app = express();
require('./lib/passport');

// settings
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
 
app.engine('.hbs', exphbs.engine({ // Engine links
    defaultLayout: 'main', // Default layout in all pages
    layoutsDir: path.join(app.get('views'), 'layouts'), // get views 
    partialsDir: path.join(app.get('views'), 'partials'), // Get partials for views
    extname: '.hbs', // Set views extension 
    helpers: require('./lib/handlebars') // Set helpers functions
}));
app.set('view engine', '.hbs'); // Uses the engine 

// Middlewares
app.use(session({
    secret: 'faztmysqlsession',
    resave: false,
    saveUninitialize: false,
    store: new MySQLStore(database)
}))

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(validator());
app.use(morgan('dev'));
app.use(express.json()); // Parse incoming JSON data
app.use(express.urlencoded({ extended: true })); // Parse form data

// Global variables
app.use((req, res, next) => {
    app.locals.message = req.flash('message');
    app.locals.success = req.flash('success');
    app.locals.user = req.user;
    next();
  });
  

// Routes
app.use(require('./routes'))
app.use(require('./routes/authentication'))
app.use('/links', require('./routes/links'))
//app.use(require('./routes/links'))

// Public
app.use(express.static(path.join(__dirname, 'public')))

// Starting the server
app.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'))
})