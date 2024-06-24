const express = require('express')
const router = express.Router()

const pool = require('../database');
const { isLoggedIn } =  require('../lib/auth');

router.get('/add', isLoggedIn, (req, res) => {
    res.render('links/add')
})

router.post('/add', isLoggedIn, async (req, res) => {
    const {title, url, description} = req.body;
    const newLink = {
        title,
        url,
        description,
        user_id : req.user.id
    };

    console.log(newLink)

    await pool.query('INSERT INTO links set ?', [newLink]);
    req.flash('success', 'Link saved successfully')
    res.redirect('/links');
})

router.get('/', isLoggedIn, async (req, res) => {
    const links = await pool.query ('SELECT * FROM links WHERE user_id = ?', [req.user.id]);

    console.log(links);
    res.render('links/list', {links:links});
})

router.get('/delete/:id', isLoggedIn, async(req, res) =>{
    const { id } = req.params;
    await pool.query('DELETE FROM links WHERE ID = ?', [id]);


    req.flash('success', isLoggedIn, 'Links Removed Successfully')
    console.log(req.params.id);
    res.redirect('/links');
})

router.get('/edit/:id', isLoggedIn, async(req, res) =>{
    const {id}   = req.params
    const link = await pool.query('SELECT * FROM links WHERE id = ?', [id])

    res.render('links/edit',{link: link[0]})
})

router.post('/edit/:id', isLoggedIn, async(req, res) => {
    const {id} = req.params

    const {title, description, url} = req.body
    const newLink = {
        title,
        description,
        url
    }
    // Corrected UPDATE query
    const query = `UPDATE links SET title = ?, description = ?, url = ? WHERE id = ?`
    const values = [newLink.title, newLink.description, newLink.url, id]

    try {
        await pool.query(query, values)
        req.flash('success', 'Link Updated Successfully')
        res.redirect('/links')
    } catch (error) {
        console.error(error)
        res.status(500).send('Error updating link') // Handle the error appropriately
    }
})

module.exports = router