import Express from 'express';
import path from 'path';
import { DatabaseResource, DatabaseResourceData } from './db';
import MarkdownIT from 'markdown-it';
import { json } from 'body-parser';

const md = new MarkdownIT("commonmark", { html: true, breaks: true, typographer: true });

const app = Express();
const port = process.env.PORT || 8080;

app.set('view engine', 'pug');
app.use(Express.static(path.join(__dirname, "public")));
app.use(json());

app.get('/', (req, res) => {
    res.render('index', {});
});

app.get('/contact', (req, res) => {
    res.render('contact', {});
})

app.get('/blog/:slug', (req, res) => {
    DatabaseResource.retrieve("Posts", { Slug: req.params.slug, Status: "Done" }, true).then(results => {
        if (!Array.isArray(results)) {
            // @ts-ignore
            if (typeof results.resourceData.Content === "string") {
                results.resourceData.Content = md.render(results.resourceData.Content);
            }

            DatabaseResource.retrieve("Comments", { ArticleSlug: req.params.slug }, false).then(comments => {  
                res.render("post", { post: results.resourceData, comments: comments });
            });
            return;
        }

    })
    .catch(err => console.log(err))
    .catch(_ => {
        res.send("No article found")
        return;
    });
});

app.get('/blog', (req, res) => {
    DatabaseResource.retrieve("Posts", {}, false).then(results => {
        if (Array.isArray(results)) {
            results = results.filter(r => {
                return r.resourceData.Status === "Done";
            });
            results = results.reverse()
        }
        res.render('posts', { posts: results });
    })
    .catch(err => console.log(err));
});

app.post('/add-comment', (req, res) => {
    const { username, comment, ArticleSlug } = req.body;

    DatabaseResource.upload("Comments", { Username: username, Comment: comment, ArticleSlug });

    res.sendStatus(200);
});

app.get('*', (req, res) => {
    res.render('404', {});
});

app.listen(port, () => {
    console.log('App listening');
});