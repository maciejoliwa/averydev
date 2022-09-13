import Express from 'express';
import path from 'path';
import { DatabaseResource, DatabaseResourceData } from './db';

const app = Express();
const port = process.env.PORT || 8080;

app.set('view engine', 'pug');
app.use(Express.static(path.join(__dirname, "public")));

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
            let content: string[] | string = results.resourceData.Content.split(' ');
            for (const chars of content) {
                if (chars.includes("**")) {
                    // @ts-ignore
                    results.resourceData.Content = results.resourceData.Content.replace('**', '<b>');
                    // @ts-ignore
                    results.resourceData.Content = results.resourceData.Content.replace('**', '</b>');
                }
            }

            res.render("post", results.resourceData);
        }
    })
    .catch(err => console.log(err));
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

app.listen(port, () => {
    console.log('App listening');
});